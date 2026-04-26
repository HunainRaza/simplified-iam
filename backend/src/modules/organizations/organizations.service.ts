import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization } from "./entities/organization.entity";
import { Repository, IsNull } from "typeorm";
import { CreateOrganizationDto } from "./dto/create-organization.dto";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  // Return all orgs as a flat list — frontend builds the tree
  async findAll(search?: string): Promise<Organization[]> {
    const qb = this.orgRepo.createQueryBuilder('org')
      .leftJoinAndSelect('org.parent', 'parent')
      .leftJoinAndSelect('org.children', 'children')
      .orderBy('org.createdAt', 'ASC');

    if (search) {
      qb.where('org.name ILIKE :search', { search: `%${search}%` });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({
      where: { id },
      relations: ['parent', 'children', 'users'],
    });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const org = this.orgRepo.create({ name: dto.name });

    if (dto.parentId) {
      const parent = await this.findOne(dto.parentId);
      org.parent = parent;
    }

    return this.orgRepo.save(org);
  }

  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);
    await this.orgRepo.remove(org);
  }
}
