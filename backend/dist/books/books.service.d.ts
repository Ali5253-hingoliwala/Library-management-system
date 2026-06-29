import { Model } from "mongoose";
import { Book, BookDocument } from "./schemas/book.schema";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
export declare class BooksService {
    private bookModel;
    constructor(bookModel: Model<BookDocument>);
    create(dto: CreateBookDto): Promise<Book>;
    findAll(query?: {
        genre?: string;
        status?: string;
        search?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, BookDocument, {}, {}> & Book & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<Book>;
    update(id: string, dto: UpdateBookDto): Promise<Book>;
    remove(id: string): Promise<void>;
    getStats(): Promise<{
        total: number;
        available: number;
        borrowed: number;
        genres: any[];
    }>;
}
