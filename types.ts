export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface GeneratedFile {
  path: string;
  content: string;
  language?: string;
}

export interface GeneratedProject {
  projectName: string;
  description: string;
  files: GeneratedFile[];
}

export interface GenerationConfig {
  model: string;
  includeTests: boolean;
  includeDocker: boolean;
}