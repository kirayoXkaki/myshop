

import { IsEmail, MinLength, IsString } from 'class-validator';

export class LoginRegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password!: string;
}


export class RefreshDto {
  @IsString()
  refresh_token!: string;
}


