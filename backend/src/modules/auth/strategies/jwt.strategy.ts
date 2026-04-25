import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Extract token from "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Called after token signature is verified — return value becomes request.user
  // Django equivalent: the user object attached to request after authentication
  async validate(payload: { sub: string; username: string; isSystemAdmin: boolean }) {
    return {
      id: payload.sub,
      username: payload.username,
      isSystemAdmin: payload.isSystemAdmin,
    };
  }
}
