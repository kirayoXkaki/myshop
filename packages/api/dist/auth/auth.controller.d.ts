import { AuthService } from './auth.service';
import { LoginRegisterDto, RefreshDto } from './dto/login.register';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: LoginRegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    login(dto: LoginRegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    logout(dto: RefreshDto): Promise<{
        ok: boolean;
    }>;
}
