import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SignInDto } from './dto/sign-in.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 로그인
   * @param req
   * @param signInDto
   * @returns
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('/sign-in')
  async signIn(@Request() req, @Body() signInDto: SignInDto) {
    const data = this.authService.signIn(req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: '로그인 성공',
      data,
    };
  }

  // 엑세스토큰 재발급
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: '액세스 토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponse({ status: 401, description: '리프레시 토큰 유효하지 않음' })
  @Post('/refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshAccessToken(@Req() req) {
    const user = req.user;
    const currentTime = Math.floor(Date.now() / 1000);

    // if (user.exp < currentTime) {
    const refreshToken = await this.userRepository.findOne({
      where: { userId: user.userId },
      select: ['refreshToken'],
    });

    const refreshTokenVerify = await this.jwtService.verify(
      refreshToken.refreshToken,
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      },
    );
    console.log('래프래쉬검증', refreshTokenVerify);
    if (refreshTokenVerify.exp < currentTime) {
      throw new UnauthorizedException('재 로그인이 필요합니다.');
    }
    const newAccessToken =
      await this.authService.generateAccessToken(refreshTokenVerify);
    return {
      HttpStatus: 200,
      newAccessToken,
      // };
    };

    return { message: '엑세스토큰이 아직 유효합니다.' };
  }
}
