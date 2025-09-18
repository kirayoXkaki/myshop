declare class RegisterDto {
    email: string;
    password: string;
}
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly auth;
    constructor(auth: any);
    register(dto: RegisterDto): any;
    login(dto: LoginDto): any;
}
export {};
