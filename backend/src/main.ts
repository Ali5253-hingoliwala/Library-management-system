import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,        // auto-cast primitives from DTOs
    })
  );

  app.enableCors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
  });

  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Bibliotheca API running on http://localhost:${port}/api`);
}

bootstrap();
