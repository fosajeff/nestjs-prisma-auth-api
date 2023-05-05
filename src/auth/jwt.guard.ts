import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { constants } from 'src/utils/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(constants.authGuardType) {}
