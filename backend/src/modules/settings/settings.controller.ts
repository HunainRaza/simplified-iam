import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('settings')
@UseGuards(JwtAuthGuard) // Every route in this controller requires a valid JWT
export class SettingsController {
  // NestJS injects SettingsService automatically — you never call `new SettingsService()`
  constructor(private readonly settingsService: SettingsService) {}

  // GET /api/v1/settings
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // PATCH /api/v1/settings
  // @Body() extracts the request body and validates it against UpdateSettingsDto
  // Django equivalent: request.data in a DRF view
  @Patch()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
