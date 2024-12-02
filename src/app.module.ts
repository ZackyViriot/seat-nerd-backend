
import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { MoviesModule } from "./movie/movie.module";
import { ShowtimeModule } from "./showtime/showtime.module";

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  })
    , MongooseModule.forRoot('mongodb+srv://zackyviriot987:Zana1954!@cluster0.jfh6i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),AuthModule,UserModule,MoviesModule,ShowtimeModule],
  controllers: [AppController],
  providers: [AppService]
})


export class AppModule { }