import { Document, Types } from "mongoose";
export type BorrowingDocument = Borrowing & Document;
export declare enum LoanStatus {
    REQUESTED = "requested",
    ACTIVE = "active",
    RETURNED = "returned",
    OVERDUE = "overdue"
}
export declare class Borrowing {
    bookId: Types.ObjectId;
    memberId: Types.ObjectId;
    borrowDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: LoanStatus;
    fine: number;
    paidAmount: number;
    notes?: string;
}
export declare const BorrowingSchema: import("mongoose").Schema<Borrowing, import("mongoose").Model<Borrowing, any, any, any, Document<unknown, any, Borrowing, any, {}> & Borrowing & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Borrowing, Document<unknown, {}, import("mongoose").FlatRecord<Borrowing>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Borrowing> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
