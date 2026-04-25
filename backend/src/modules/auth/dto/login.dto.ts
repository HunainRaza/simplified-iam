import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string; // accepts username OR email — service handles both

  @IsString()
  @IsNotEmpty()
  password: string;
}
