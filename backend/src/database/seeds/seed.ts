import { config } from "dotenv";
import * as bcrypt from 'bcryptjs';
import { Organization } from "src/modules/organizations/entities/organization.entity";
import { AuthSettings } from "src/modules/settings/entities/auth-settings.entity";
import { User } from "src/modules/users/entities/user.entity";
import { DataSource } from "typeorm";

config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, AuthSettings, Organization],
    synchronize: true,
});

async function seed() {
    await AppDataSource.initialize();
    console.log('Connected to DB');

    const userRepo = AppDataSource.getRepository(User);
    const settingsRepo = AppDataSource.getRepository(AuthSettings);
    const orgRepo = AppDataSource.getRepository(Organization);

    let rootOrg = await orgRepo.findOne({ where: { name: 'Kunden' }});
    if (!rootOrg) {
        rootOrg = orgRepo.create({ name: 'Kunden'});
        await orgRepo.save(rootOrg);
        console.log('Created root organization: Kunden');
    }

    const existing = await userRepo.findOne({ where: { username: 'admin' }});
    if (!existing) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = userRepo.create({
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            isActive: true,
            isSystemAdmin: true,
        });
        await userRepo.save(admin);
        console.log('Created admin user: admin / admin123');
    }

    const settingsCount = await settingsRepo.count();
    if (settingsCount === 0) {
        const settings = settingsRepo.create({ passwordEnabled: true });
        await settingsRepo.save(settings);
        console.log('Created default auth settings');
    }

    await AppDataSource.destroy();
    console.log('Seeding complete.');
}
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
