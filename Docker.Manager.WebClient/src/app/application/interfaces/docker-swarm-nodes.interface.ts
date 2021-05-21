export interface IDockerSwarmNode {
  id: string;
  version: any;
  registryName: string;
  logoURL: string;
  imageName: string;
  networkName: string;
  hostName: string;
  hostPortNo: number;
  platform: number;
  tlsInfo: any[];
  description: ISwarmNodeDescription;
  spec: ISwarmNodeSpec;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISwarmNodeDescription {
  hostname: string;
  platform: ISwarmNodePlatform;
  resources: ISwarmNodeResources;
  engine: any[];
  status: ISwarmNodeStatus;
  managerStatus: ISwarmNodeManagerStatus;
}

export interface ISwarmNodePlatform {
  architecture: string;
  os: string;
}

export interface ISwarmNodeSpec {
  name: string;
  labels: any[];
  role: string;
  availability: string;
}

export interface ISwarmNodeStatus {
  state: string;
  message: string;
  addr: string;
}

export interface ISwarmNodeManagerStatus {
  leader: string;
  reachability: string;
  addr: string;
}

export interface ISwarmNodeResources {
  nanoCPUs: number;
  memoryBytes: number;
  genericResources: any;
}
