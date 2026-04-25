import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Find user by username or email (with password field)
    const user = await this.usersService.findByUsernameWithPassword(dto.username);

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    // 2. Compare submitted password against bcrypt hash
    // Django equivalent: user.check_password(password)
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. Sign JWT — the payload is what gets embedded in the token
    const payload = {
      sub: user.id, // "sub" is JWT standard for subject (user id)
      username: user.username,
      isSystemAdmin: user.isSystemAdmin,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    // Return token + safe user object (no password)
    const { password, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  // Returns the currently authenticated user's full profile
  async getMe(userId: string) {
    return this.usersService.findOne(userId);
  }
  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
        ...dto,
        password: dto.password,
    });
    // Auto-login after registration — return token immediately
    const payload = {
        sub: user.id,
        username: user.username,
        isSystemAdmin: user.isSystemAdmin,
    };
    const accessToken = this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    return { accessToken, user };
    }
}
