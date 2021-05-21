export interface IDockerContainerInspect {
    state: {
        status: string,
        startedAt: Date,
        finishedAt: Date,
        running: boolean,
        exitCode: number,
        error: string
    };
    created: Date;
    id: string;
    name: string;
    config: {
        cmd: string[],
        entrypoint: string[],
        env: string[],
        labels: any,
        image: string
    };
    networkSettings: {
        networks: any
    };
    image: string;
    mounts: [{
        type: string,
        name: string,
        source: string,
        destination: string,
        driver: string,
        mode: string,
        rw: boolean,
        propagation: string
    }];
}
