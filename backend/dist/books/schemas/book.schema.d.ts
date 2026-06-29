import { Document } from "mongoose";
export type BookDocument = Book & Document;
export declare enum BookStatus {
    AVAILABLE = "available",
    BORROWED = "borrowed",
    RESERVED = "reserved",
    DAMAGED = "damaged"
}
export declare class Book {
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publishedYear: number;
    totalCopies: number;
    availableCopies: number;
    status: BookStatus;
    description?: string;
    coverUrl?: string;
}
export declare const BookSchema: import("mongoose").Schema<Book, import("mongoose").Model<Book, any, any, any, Document<unknown, any, Book, any, {}> & Book & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Book, Document<unknown, {}, import("mongoose").FlatRecord<Book>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Book> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
