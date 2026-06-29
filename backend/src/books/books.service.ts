import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Book, BookDocument } from "./schemas/book.schema";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async create(dto: CreateBookDto): Promise<Book> {
    return this.bookModel.create(dto);
  }

  async findAll(query?: { genre?: string; status?: string; search?: string }) {
    const filter: Record<string, any> = {};
    if (query?.genre) filter.genre = query.genre;
    if (query?.status) filter.status = query.status;
    if (query?.search) filter.$text = { $search: query.search };
    return this.bookModel.find(filter).sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id);
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const book = await this.bookModel.findByIdAndUpdate(id, dto, { new: true });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Book ${id} not found`);
  }

  async getStats() {
    const total = await this.bookModel.countDocuments();
    const available = await this.bookModel.countDocuments({ status: "available" });
    const borrowed = await this.bookModel.countDocuments({ status: "borrowed" });
    const genres = await this.bookModel.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return { total, available, borrowed, genres };
  }
}
