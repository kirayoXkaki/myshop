export declare class UsersService {
    findAll(): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
    }[]>;
    create(input: {
        email: string;
        password: string;
    }): Promise<{
        id: string;
        email: string;
        createdAt: Date;
    }>;
}
