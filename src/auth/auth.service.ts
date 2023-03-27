import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginInput } from './dto/inputs';
import { SignUpInput } from './dto/inputs/signup.input';
import { AuthResponse } from './dto/types/auth-response.type';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersServices: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }
  async signup(signUpInput: SignUpInput): Promise<AuthResponse> {
    const user = await this.usersServices.create(signUpInput);
    const token = this.getJwtToken(user.id);
    return {
      user,
      token,
    };
  }
  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    const user = await this.usersServices.findOneByEmail(email);
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Email / Password do not match');
    }
    return {
      user,
      token: this.getJwtToken(user.id),
    };
  }
  async validateUser(id: string): Promise<User> {
    const user = await this.usersServices.findOneById(id);
    if (!user.isActive) throw new UnauthorizedException('User is not activa');
    delete user.password;
    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);
    return {
      user,
      token,
    };
  }
}
