import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthSettings } from "./entities/auth-settings.entity";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  imports: [TypeOrmModule.forFeature([AuthSettings])], // "I own this table"
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService], // Other modules can inject SettingsService if needed
})
export class SettingsModule {}
