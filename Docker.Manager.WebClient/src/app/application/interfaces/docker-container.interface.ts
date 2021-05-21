export interface IDockerContainer {
  id: string;
  names: string[];
  created: Date;
  state: string;
  status: string;
  command: string;
  image: string;
  ports: any[];
  networkSettings: any[];
  mounts: any[];
  labels: any[];
}
