#!/usr/bin/env python3
"""Copy the portable overlay starter and exact fonts into a new project."""
import argparse,shutil
from pathlib import Path
def main():
 p=argparse.ArgumentParser();p.add_argument('destination',type=Path);a=p.parse_args()
 dst=a.destination.resolve();skill=Path(__file__).resolve().parents[1]
 if dst.exists() and (not dst.is_dir() or any(dst.iterdir())):p.error('Destination is not an empty directory; choose a new project directory.')
 shutil.copytree(skill/'assets/remotion-template',dst,dirs_exist_ok=True)
 shutil.copytree(skill/'assets/fonts',dst/'public/fonts',dirs_exist_ok=True)
 print(f'Created {dst}. Fill public/project.json and episode.json with real inputs/cuts; npm install; npm run studio. Run check_project.py and check_style.py before rendering; snapshot_project.py before handoff.')
if __name__=='__main__':main()
