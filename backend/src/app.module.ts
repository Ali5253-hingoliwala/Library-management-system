import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { BooksModule } from "./books/books.module";
import { MembersModule } from "./members/members.module";
import { BorrowingModule } from "./borrowing/borrowing.module";
import { EventsModule } from "./events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>("MONGODB_URI", "mongodb://localhost:27017/bibliotheca"),
      }),
    }),

    AuthModule,
    BooksModule,
    MembersModule,
    BorrowingModule,
    EventsModule,
  ],
})
export class AppModule {}
