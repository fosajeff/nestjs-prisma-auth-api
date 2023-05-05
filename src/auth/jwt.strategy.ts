import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { constants } from '../utils/constants';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        // ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: constants.jwtSecret,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && constants.token_key in req.cookies) {
      return req.cookies.access_token;
    }

    return null;
  }

  async validate(payload: { id: string; email: string }) {
    return payload;
  }
}
