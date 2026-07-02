import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { MembersService } from "./members.service";
import { CreateMemberDto } from "./dto/create-member.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../auth/schemas/user.schema";

@UseGuards(JwtAuthGuard)
@Controller("members")
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  findAll(@Query("status") status?: string, @Query("type") type?: string, @Query("search") search?: string) {
    return this.membersService.findAll({ status, type, search });
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  findOne(@Param("id") id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(@Param("id") id: string, @Body() dto: Partial<CreateMemberDto>) {
    return this.membersService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  async remove(@Param("id") id: string) {
    await this.membersService.remove(id);
  }
}
