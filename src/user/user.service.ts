import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  // 회원 가입
  async create(createUserDto: CreateUserDto) {
    const isExistUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (isExistUser) {
      throw new ConflictException('이미 사용중인 이메일 입니다.');
    }

    if (createUserDto.password !== createUserDto.passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    const hashRound = this.configService.get<number>('PASSWORD_HASH_ROUNDS');
    const hashedPassword = await hash(createUserDto.password, hashRound);
    const newUser = await this.userRepository.save({
      email: createUserDto.email,
      password: hashedPassword,
      nickName: createUserDto.nickName,
    });
    delete newUser.password;

    return this.authService.signIn(newUser.userId);
  }
}
