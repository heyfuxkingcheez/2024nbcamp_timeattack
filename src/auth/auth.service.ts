import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { compare } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 로그인
  async signIn(userId: number) {
    const payload = { id: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    await this.userRepository.update({ userId }, { refreshToken });

    console.log('엑세스토큰', accessToken);
    console.log('리프래쉬토큰', refreshToken);

    return { accessToken };
  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { userId: true, password: true },
    });

    const isPasswordMathched = await compare(password, user?.password ?? '');

    if (!user || !isPasswordMathched) {
      return null;
    }

    return { userId: user.userId };
  }

  generateAccessToken(user: any) {
    const payload = { userId: user.userId };

    return this.jwtService.signAsync(payload);
  }
}
