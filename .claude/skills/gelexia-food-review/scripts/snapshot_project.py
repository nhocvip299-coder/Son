#!/usr/bin/env python3
"""Archive portable production code/assets; retain recovery IDs for large media."""
import argparse,datetime,json,os,tempfile,zipfile
from pathlib import Path

SKIP={'node_modules','.git','frames','dist','build','out','output','qa','__pycache__','.cache','.remotion'}
ROOT_SUFFIX={'.json','.ts','.tsx','.js','.jsx','.cjs','.mjs','.py','.yaml','.yml'}

def snapshot(project,output,limit):
    project=project.resolve();output=output.resolve()
    if output.exists():raise ValueError('Output exists; choose a new checkpoint filename')
    manifest_path=project/'episode.json'
    if not manifest_path.is_file():raise ValueError('Record real sources and rebuild decisions in episode.json first')
    manifest=json.loads(manifest_path.read_text())
    inputs=manifest.get('inputs',[]);derived=manifest.get('derived',[])
    if not isinstance(inputs,list) or not isinstance(derived,list):raise ValueError('inputs and derived must be arrays')
    job=project/'public/project.json'
    if job.is_file() and json.loads(job.read_text()).get('mode')=='production' and not inputs:
        raise ValueError('A production episode needs real input Library IDs before checkpointing')
    recovery={};candidates={};omitted=[]
    def local_path(value):
        if not isinstance(value,str) or not value:raise ValueError('Media paths must be nonempty strings')
        p=Path(value);return (p if p.is_absolute() else project/p).resolve()
    for item in inputs:
        if not isinstance(item,dict) or not item.get('library_file_id'):raise ValueError('Every input needs its real Library ID')
        p=local_path(item.get('path'));recovery[p]={'library_file_id':item['library_file_id']}
        if p.is_file() and p.is_relative_to(project):candidates[p.relative_to(project).as_posix()]=p
    for item in derived:
        if not isinstance(item,dict):raise ValueError('Invalid derived media entry')
        script=local_path(item.get('rebuild_script'))
        if not script.is_file() or not script.is_relative_to(project):raise ValueError('Each derived asset needs an included local rebuild script')
        p=local_path(item.get('path'));recovery[p]={'rebuild_script':script.relative_to(project).as_posix()}
        candidates[script.relative_to(project).as_posix()]=script
    outputs={local_path(x) for x in manifest.get('outputs',[]) if isinstance(x,str)}
    for directory,dirs,names in os.walk(project,followlinks=False):
        dirs[:]=[d for d in dirs if d not in SKIP and not d.startswith('.')]
        for name in names:
            p=Path(directory)/name;rel=p.relative_to(project)
            if name.startswith('.') or p.resolve() in outputs:continue
            if not p.is_file():continue
            if len(rel.parts)==1 and p.suffix not in ROOT_SUFFIX:continue
            if p.is_symlink() and not p.resolve().is_relative_to(project):
                if p.resolve() not in recovery:raise ValueError('External symlink has no recovery source: '+str(rel))
                continue
            candidates[rel.as_posix()]=p
    files={}
    for name,p in sorted(candidates.items()):
        if p.stat().st_size>limit:
            source=recovery.get(p.resolve())
            if not source:raise ValueError('Large asset has no recovery ID/script: '+name)
            omitted.append({'path':name,'size_bytes':p.stat().st_size,**source})
        else:files[name]=p
    checkpoint={'schema_version':1,'saved_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'episode':manifest,'omitted_large_assets':omitted,'included_files':list(files)}
    output.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(dir=output.parent,suffix='.zip');os.close(fd)
    try:
        with zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED) as z:
            for name,p in files.items():z.write(p,name)
            z.writestr('checkpoint.json',json.dumps(checkpoint,ensure_ascii=False,indent=2))
        os.replace(tmp,output)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
    return {'path':str(output),'included_files':len(files),'omitted_large_assets':len(omitted)}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('project',type=Path);p.add_argument('output',type=Path)
    p.add_argument('--max-embed-mib',type=float,default=16);a=p.parse_args()
    if a.max_embed_mib<=0:p.error('max-embed-mib must be positive')
    try:print(json.dumps(snapshot(a.project,a.output,round(a.max_embed_mib*1024*1024)),ensure_ascii=False))
    except (OSError,ValueError,KeyError) as e:p.error(str(e))
if __name__=='__main__':main()
