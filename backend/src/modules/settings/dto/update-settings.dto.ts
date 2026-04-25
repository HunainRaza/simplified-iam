import { IsBoolean, IsOptional } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  passkeysEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPasscodesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  mobileNumberEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  totpEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  mfaEmailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  mfaSmsEnabled?: boolean;
}
