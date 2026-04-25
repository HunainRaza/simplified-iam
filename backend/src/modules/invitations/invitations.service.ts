import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Invitation } from "./entities/invitation.entity";
import { Repository } from "typeorm";
import { Organization } from "../organizations/entities/organization.entity";
import { CreateInvitationDto } from "./dto/create-invitation.dto";

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async findAll(): Promise<Invitation[]> {
    return this.invitationRepo.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateInvitationDto): Promise<Invitation[]> {
    let org: Organization | null = null;
    if (dto.organizationId) {
      org = await this.orgRepo.findOne({ where: { id: dto.organizationId } });
    }

    // Create one invitation record per email
    const invitations = dto.emails.map((email) =>
      this.invitationRepo.create({
        email,
        organization: org ?? undefined,
      }),
    );

    return this.invitationRepo.save(invitations);
  }
}
