import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isSystemAdmin?: boolean;
  @IsOptional() @IsBoolean() isGlobalUserAdmin?: boolean;
  @IsOptional() @IsBoolean() isGlobal3rdLevelUser?: boolean;
  @IsOptional() @IsString() organizationId?: string;

  // Password reset — optional
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
