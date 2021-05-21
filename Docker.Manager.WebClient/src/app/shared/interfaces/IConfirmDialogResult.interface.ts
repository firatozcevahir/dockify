export interface IConfirmDialogResult {
    type: ConfirmDialogType;
    message: string;
}

export enum ConfirmDialogType {
    OperationSuccess,
    OperationFailed,
    Canceled
}

export enum ConfirmServiceType {
    PruneContainer,
    PruneVolume,
    PruneImage,
    PruneNetwork
}
