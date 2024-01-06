import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { User } from '../entities/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class CreateUserDto extends PickType(User, [
  'email',
  'password',
  'nickName',
]) {
  /**
   * 비밀번호 확인
   * @example "aaa123!"
   */
  @IsNotEmpty({ message: '비밀번호 확인란을 입력해주세요.' })
  @IsStrongPassword(
    { minLength: 6 },
    {
      message:
        '비밀번호는 최소 6자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.',
    },
  )
  passwordConfirm: string;
}
