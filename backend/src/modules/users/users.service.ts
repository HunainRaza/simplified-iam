import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async findAll(search?: string): Promise<User[]> {
    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.organizations', 'organizations')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      qb.where(
        'user.username ILIKE :s OR user.email ILIKE :s OR user.firstName ILIKE :s OR user.lastName ILIKE :s',
        { s: `%${search}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['organizations'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  // Used by Auth module to verify login — needs the password field explicitly
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.userRepo.createQueryBuilder('user')
      .addSelect('user.password') // password has select:false, must opt-in
      .where('user.username = :username OR user.email = :username', { username })
      .getOne();
  }

  async create(dto: CreateUserDto): Promise<User> {
    // Check for duplicate username/email — like Django's IntegrityError handling
    const existing = await this.userRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) throw new ConflictException('Username or email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });

    if (dto.organizationId) {
      const org = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
      if (org) user.organizations = [org];
    }

    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.organizationId !== undefined) {
      if (dto.organizationId) {
        const org = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
        user.organizations = org ? [org] : [];
      } else {
        user.organizations = [];
      }
      delete dto.organizationId;
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  async toggleActive(id: string, isActive: boolean): Promise<User> {
    await this.userRepo.update(id, { isActive });
    return this.findOne(id);
  }
}
