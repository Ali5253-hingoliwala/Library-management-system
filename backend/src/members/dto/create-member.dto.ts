import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { MembershipType, MemberStatus } from "../schemas/member.schema";

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(MembershipType)
  @IsOptional()
  membershipType?: MembershipType;

  @IsDateString()
  expiryDate: string;

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;
}
