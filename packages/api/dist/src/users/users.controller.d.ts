import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
    }[]>;
    create(body: {
        email: string;
        password: string;
    }): Promise<{
        id: string;
        email: string;
        createdAt: Date;
    } | {
        error: string;
    }>;
}
