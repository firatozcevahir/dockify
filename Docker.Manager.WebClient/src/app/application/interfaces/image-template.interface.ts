export interface IImageTemplate {
  id: string;
  templateTitle: string;
  description: string;
  logoURL: string;
  platform: number;
  env: string;
  ports: string[];
  binds: string[];
  entryPoint: string;
  cmd: string;
  autoUpdate: boolean;
  startContainer: boolean;
  publishAllPorts: boolean;
  isProtected: boolean;
  alwaysPullImage: boolean;
  createdOn: Date;
}
