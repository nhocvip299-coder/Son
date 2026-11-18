import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {GelexiaOverlay,type Project} from './GelexiaOverlay';
import project from '../public/project.json';
const Root=()=> <Composition id="GelexiaOverlay" component={GelexiaOverlay} width={project.width} height={project.height} fps={project.fps} durationInFrames={Math.ceil(project.durationSeconds*project.fps)} defaultProps={{project:project as Project}}/>;
registerRoot(Root);
