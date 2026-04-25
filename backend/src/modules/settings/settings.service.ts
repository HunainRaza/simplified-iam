import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { AuthSettings } from "./entities/auth-settings.entity";

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    // @InjectRepository is how you get the ORM handle for a table
    // Django equivalent: self.model = AuthSettings (in a manager)
    @InjectRepository(AuthSettings)
    private readonly settingsRepo: Repository<AuthSettings>,
  ) {}

  // Runs once on app boot — ensures the singleton settings row always exists
  async onModuleInit() {
    const count = await this.settingsRepo.count();
    if (count === 0) {
      await this.settingsRepo.save(this.settingsRepo.create({ passwordEnabled: true }));
    }
  }

  // Always return row id=1 — this is a singleton config table
  async getSettings(): Promise<AuthSettings> {
    return this.settingsRepo.findOneOrFail({ where: { id: 1 } });
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<AuthSettings> {
    // TypeORM's update() + findOne() pattern
    // Django equivalent: AuthSettings.objects.filter(id=1).update(**dto)
    await this.settingsRepo.update(1, dto);
    return this.getSettings();
  }
}
