import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Member, MemberDocument } from "./schemas/member.schema";
import { CreateMemberDto } from "./dto/create-member.dto";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class MembersService {
  constructor(@InjectModel(Member.name) private memberModel: Model<MemberDocument>, private authService: AuthService) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    const exists = await this.memberModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException("Email already registered");
    const { password, ...member } = dto;
    if (!password) throw new ConflictException("Set a password so the member can log in");
    await this.authService.createMemberAccount({ name: dto.name, email: dto.email, password, phone: dto.phone });
    return this.memberModel.create(member);
  }

  async findAll(query?: { status?: string; type?: string; search?: string }) {
    const filter: Record<string, any> = {};
    if (query?.status) filter.status = query.status;
    if (query?.type) filter.membershipType = query.type;
    if (query?.search) filter.$text = { $search: query.search };
    return this.memberModel.find(filter).sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberModel.findById(id);
    if (!member) throw new NotFoundException(`Member ${id} not found`);
    return member;
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.memberModel.findOne({ email: email.toLowerCase() });
  }

  async findOrCreateForUser(user: { name: string; email: string }): Promise<Member> {
    const existing = await this.findByEmail(user.email);
    if (existing) return existing;

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    return this.memberModel.create({
      name: user.name,
      email: user.email,
      membershipType: "standard",
      expiryDate: nextYear,
      status: "active",
    });
  }

  async update(id: string, dto: Partial<CreateMemberDto>): Promise<Member> {
    const member = await this.memberModel.findByIdAndUpdate(id, dto, { new: true });
    if (!member) throw new NotFoundException(`Member ${id} not found`);
    return member;
  }

  async remove(id: string): Promise<void> {
    const result = await this.memberModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Member ${id} not found`);
  }

  async incrementBorrowCount(id: string): Promise<void> {
    await this.memberModel.findByIdAndUpdate(id, { $inc: { borrowedCount: 1 } });
  }
}
