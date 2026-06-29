import { BookStatus } from "../schemas/book.schema";
export declare class CreateBookDto {
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publishedYear: number;
    totalCopies: number;
    availableCopies: number;
    status?: BookStatus;
    description?: string;
    coverUrl?: string;
}
