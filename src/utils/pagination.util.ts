import { Injectable } from "@nestjs/common";
import { IPagination } from "src/interfaces/database.interface";

@Injectable()
export class PaginationUtil {
    public generatePagination(params: IPagination): object {
        const totalPage: number = Math.ceil(params.count / params.pageSize);
        const nextPage: number | null = params.page < totalPage ? params.page + 1 : null;
        const previousPage: number | null = params.page > 1 ? params.page - 1 : null;

        return {
            rows: params.data,
            totalData: params.count,
            page: params.page,
            limit: params.pageSize,
            totalPage,
            nextPage,
            previousPage,
        }
    }
}