export interface IVolume {
  name: string;
  driver: string;
  mountpoint: string;
  scope: string;
  labels: any[];
  options: any[];
  createdAt: Date;
  usageData: any;

}
