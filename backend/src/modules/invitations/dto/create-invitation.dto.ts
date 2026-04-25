import { IsArray, IsEmail, IsOptional, IsUUID } from "class-validator";

export class CreateInvitationDto {
  // Accepts multiple emails at once — matches the textarea in screenshot 3
  @IsArray()
  @IsEmail({}, { each: true }) // Validate EACH item in the array as an email
  emails: string[];

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
