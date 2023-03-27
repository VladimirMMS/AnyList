import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(signupInput: SignUpInput): Promise<User> {
    try {
      const newUser = await this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) return this.userRepository.find();
    return this.userRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneByEmail(email: string) {
    try {
      const emailFound = await this.userRepository.findOneByOrFail({ email });
      return emailFound;
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        datail: `${email} not found`,
      });
    }
  }
  async findOneById(userId: string) {
    try {
      const emailFound = await this.userRepository.findOneByOrFail({
        id: userId,
      });
      return emailFound;
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        datail: `${userId} not found`,
      });
    }
  }

  async block(id: string): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    return this.userRepository.save(userToBlock);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }
    if (error.code === 'error-001') {
      throw new NotFoundException(`${error.datail}`);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Problem with the serve contact with admins',
    );
  }
}
