import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MembersController } from "./members.controller";
import { MembersService } from "./members.service";
import { Member, MemberSchema } from "./schemas/member.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]), AuthModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
