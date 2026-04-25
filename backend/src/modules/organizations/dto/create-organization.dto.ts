import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Optional parent for hierarchy — matches the "Übergeordnete Organisation" dropdown
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
