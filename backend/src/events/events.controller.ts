import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../auth/schemas/user.schema";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("events")
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(@Query("upcoming") upcoming?: string) {
    const filter = upcoming === undefined ? undefined : upcoming === "true";
    return this.eventsService.findAll(filter);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  update(@Param("id") id: string, @Body() dto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id/register")
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STAFF, UserRole.USER)
  registerForEvent(@Param("id") id: string, @CurrentUser() user: any) {
    return this.eventsService.registerForEvent(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  async remove(@Param("id") id: string) {
    await this.eventsService.remove(id);
  }
}
