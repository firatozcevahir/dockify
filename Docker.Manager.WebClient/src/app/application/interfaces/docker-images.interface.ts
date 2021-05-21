export interface IDockerImages {
  id: string;
  labels: any[];
  repoTags: any[];
  created: Date;
  size: number;
  parentId: string;
  containers: number;
  SharedSize: number;
  virtualSize: number;
}
