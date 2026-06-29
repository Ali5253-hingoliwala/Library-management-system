import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { User, UserDocument } from "./schemas/user.schema";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException("Email already registered");

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({ ...dto, password: hashed });

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).select("+password");
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return this.signToken(user);
  }

  async createMemberAccount(data: { name: string; email: string; password: string; phone?: string }) {
    const exists = await this.userModel.findOne({ email: data.email.toLowerCase() });
    if (exists) throw new ConflictException("A login already exists for this email");
    return this.userModel.create({ ...data, password: await bcrypt.hash(data.password, 12), role: "user" });
  }

  async profile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    return { id: user._id, name: user.name, email: user.email, phone: user.phone ?? "", role: user.role };
  }

  async updateProfile(userId: string, dto: { name?: string; phone?: string; password?: string }) {
    const update: any = { ...dto };
    if (dto.password) update.password = await bcrypt.hash(dto.password, 12); else delete update.password;
    const user = await this.userModel.findByIdAndUpdate(userId, update, { new: true });
    if (!user) throw new NotFoundException("User not found");
    return { id: user._id, name: user.name, email: user.email, phone: user.phone ?? "", role: user.role };
  }

  private signToken(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }
}
