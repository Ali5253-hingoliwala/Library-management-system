import { Model } from "mongoose";
import { Borrowing, BorrowingDocument } from "./schemas/borrowing.schema";
import { CreateBorrowingDto } from "./dto/create-borrowing.dto";
import { BooksService } from "../books/books.service";
import { MembersService } from "../members/members.service";
export declare class BorrowingService {
    private borrowingModel;
    private booksService;
    private membersService;
    constructor(borrowingModel: Model<BorrowingDocument>, booksService: BooksService, membersService: MembersService);
    createLoan(dto: CreateBorrowingDto): Promise<Borrowing>;
    requestLoanForUser(bookId: string, user: {
        name: string;
        email: string;
    }): Promise<Borrowing>;
    approveRequest(id: string, days?: number): Promise<import("mongoose").Document<unknown, {}, BorrowingDocument, {}, {}> & Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private refreshFines;
    returnBook(loanId: string): Promise<Borrowing>;
    findAll(query?: {
        status?: string;
        memberId?: string;
        bookId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, BorrowingDocument, {}, {}> & Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findForUser(user: {
        email: string;
    }): Promise<(import("mongoose").Document<unknown, {}, BorrowingDocument, {}, {}> & Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    payFine(id: string, amount: number, user?: {
        email: string;
    }, manager?: boolean): Promise<import("mongoose").Document<unknown, {}, BorrowingDocument, {}, {}> & Borrowing & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findOne(id: string): Promise<Borrowing>;
    markOverdue(): Promise<number>;
}
