import { Body, Controller, Post } from '@nestjs/common';

class RegisterDto { email!: string; password!: string; }
class LoginDto { email!: string; password!: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: any) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }
}
