export interface IPagination {
    count: number;
    page: number;
    pageSize: number;
    data: any
}

export interface IQueryParams {
    limit: number;
    page: number;
    query: string;
    categrory?: string;
    level?: string;
    price?: number;
    rating?: number;
    type_code?: string;
    column?: string;
    sort?: 'ASC' | 'DESC';
}