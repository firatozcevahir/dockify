export interface IRequestData {
    indexFrom: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: any;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
