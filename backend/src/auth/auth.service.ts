import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new BadRequestException('Email : format invalide.');
    }
    if (!password || password.length < 8) {
      throw new BadRequestException('Mot de passe : minimum 8 caractères.');
    }
    const user = await this.usersService.create(email, password);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, access_token: token };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
   
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
   
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, access_token: token };
  }
}