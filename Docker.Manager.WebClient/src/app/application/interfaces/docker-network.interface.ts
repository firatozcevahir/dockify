export interface IDockerNetwork {
  id: string;
  name: string;
  created: Date;
  driver: string;
  scope: string;
  enableIPv6: boolean;
  attachable: boolean;
  ipam: any[];
}
