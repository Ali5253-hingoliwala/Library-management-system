import { BorrowingService } from "./borrowing.service";
import { CreateBorrowingDto } from "./dto/create-borrowing.dto";
export declare class BorrowingController {
    private borrowingService;
    constructor(borrowingService: BorrowingService);
    findAll(status?: string, memberId?: string, bookId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/borrowing.schema").BorrowingDocument, {}, {}> & import("./schemas/borrowing.schema").Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findMine(user: {
        email: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/borrowing.schema").BorrowingDocument, {}, {}> & import("./schemas/borrowing.schema").Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    requestBook(bookId: string, user: {
        name: string;
        email: string;
    }): Promise<import("./schemas/borrowing.schema").Borrowing>;
    findOne(id: string): Promise<import("./schemas/borrowing.schema").Borrowing>;
    createLoan(dto: CreateBorrowingDto): Promise<import("./schemas/borrowing.schema").Borrowing>;
    returnBook(id: string): Promise<import("./schemas/borrowing.schema").Borrowing>;
    approve(id: string, days?: number): Promise<import("mongoose").Document<unknown, {}, import("./schemas/borrowing.schema").BorrowingDocument, {}, {}> & import("./schemas/borrowing.schema").Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    pay(id: string, amount: number, user: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/borrowing.schema").BorrowingDocument, {}, {}> & import("./schemas/borrowing.schema").Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    markOverdue(): Promise<number>;
}
