import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('회원가입')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 회원가입
   * @param createUserDto
   * @returns
   */
  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    const data = this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '회원가입 성공',
      data,
    };
  }
}
