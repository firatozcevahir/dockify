export interface IContainerStat{
    id: string;
    isRunning: boolean;
    cpuUsage: number;
    memoryUsage: number;
    diskRead: number;
    diskWrite: number;
    networkIO: number[];
}
