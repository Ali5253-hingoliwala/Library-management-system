import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, Min } from "class-validator";
import { BookStatus } from "../schemas/book.schema";

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsInt()
  @Min(1000)
  @Max(2100)
  publishedYear: number;

  @IsInt()
  @Min(1)
  totalCopies: number;

  @IsInt()
  @Min(0)
  availableCopies: number;

  @IsEnum(BookStatus)
  @IsOptional()
  status?: BookStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  coverUrl?: string;
}
