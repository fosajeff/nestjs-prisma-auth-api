import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async whoami(id: string, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User with id not found');
    }
    const decodedUser = req.user as { id: string; email: string };

    if (user.id !== decodedUser.id) {
      throw new ForbiddenException('You are not allowed to view this resource');
    }

    delete user.hashedPassword;

    return { user };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        hashedPassword: false,
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
