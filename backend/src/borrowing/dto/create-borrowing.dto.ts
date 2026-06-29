import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBorrowingDto {
  @IsMongoId()
  bookId: string;

  @IsMongoId()
  memberId: string;

  @IsDateString()
  dueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
