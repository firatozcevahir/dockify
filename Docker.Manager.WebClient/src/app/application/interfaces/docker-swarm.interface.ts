export interface IDockerSwarm {
  listenAddr: string;
  advertiseAddr: string;
  dataPathAddr: string;
  dataPathPort: number;
  forceNewCluster: boolean;
  autoLockManagers: boolean;
  availability: boolean;
  defaultAddrPool: any[];
  subnetSize: number;
}
