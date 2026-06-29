import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { EventType } from "../schemas/event.schema";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(EventType)
  type: EventType;

  @IsInt()
  @Min(1)
  capacity: number;
}
