import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  userId: number;

  /**
   * 이메일
   * @example "example@gmail.com"
   */
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsString()
  @Column({ length: 255, unique: true })
  email: string;

  /**
   * 닉네임
   * @example "욱기정"
   */
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @IsString()
  @Column({ length: 255, name: 'nick_name' })
  nickName: string;

  /**
   * 비밀번호
   * @example "aaa123!"
   */
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsStrongPassword(
    { minLength: 6 },
    {
      message:
        '비밀번호는 최소 6자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.',
    },
  )
  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 255, name: 'refresh_token', nullable: true })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAT: Timestamp;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Timestamp;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Timestamp;
}
