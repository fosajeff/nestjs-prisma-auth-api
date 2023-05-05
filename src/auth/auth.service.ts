import { Request, Response } from 'express';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { constants } from 'src/utils/constants';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(authDto: AuthDto, req: Request, res: Response) {
    const { email, password } = authDto;

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const User = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });

    const access_token = await this.signToken({
      id: User.id,
      email: User.email,
    });

    if (!access_token) {
      throw new UnauthorizedException('Invalid token');
    }

    res.cookie(constants.token_key, access_token);

    return res.send({
      status: true,
      message: 'Logged in successfully',
    });
  }

  async signin(authDto: AuthDto, req: Request, res: Response) {
    const { email, password } = authDto;

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!foundUser) {
      throw new UnauthorizedException('Wrong credentials');
    }
    const isMatch = await this.comparePassword({
      password,
      hash: foundUser.hashedPassword,
    });

    if (!isMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const access_token = await this.signToken({
      id: foundUser.id,
      email: foundUser.email,
    });

    if (!access_token) {
      throw new UnauthorizedException('Invalid token');
    }

    res.cookie(constants.token_key, access_token);

    return res.send({
      status: true,
      message: 'Logged in successfully',
    });
  }

  async signout(req: Request, res: Response) {
    res.clearCookie(constants.token_key);
    return res.send({ status: true, message: 'Logged out successsfully' });
  }

  private async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }

  private async comparePassword(args: { password: string; hash: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  private async signToken(args: { id: string; email: string }) {
    return await this.jwtService.signAsync({ id: args.id, email: args.email });
  }
}
