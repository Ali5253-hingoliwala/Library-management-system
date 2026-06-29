import { BooksService } from "./books.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
export declare class BooksController {
    private booksService;
    constructor(booksService: BooksService);
    findAll(genre?: string, status?: string, search?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/book.schema").BookDocument, {}, {}> & import("./schemas/book.schema").Book & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getStats(): Promise<{
        total: number;
        available: number;
        borrowed: number;
        genres: any[];
    }>;
    findOne(id: string): Promise<import("./schemas/book.schema").Book>;
    create(dto: CreateBookDto): Promise<import("./schemas/book.schema").Book>;
    update(id: string, dto: UpdateBookDto): Promise<import("./schemas/book.schema").Book>;
    remove(id: string): Promise<void>;
}
