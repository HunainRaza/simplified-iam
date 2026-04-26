import { IsArray, IsEmail, IsOptional, IsUUID } from "class-validator";

export class CreateInvitationDto {
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
