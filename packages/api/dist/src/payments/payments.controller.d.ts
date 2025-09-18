import { CreateSessionDto } from './dto/create-session.dto';
export declare class PaymentsController {
    create(dto: CreateSessionDto): Promise<{
        id: string;
        url: string | null;
    }>;
    webhook(req: any, sig: string): Promise<{
        received: boolean;
        error: string;
        duplicate?: undefined;
        idempotent?: undefined;
    } | {
        received: boolean;
        error?: undefined;
        duplicate?: undefined;
        idempotent?: undefined;
    } | {
        received: boolean;
        duplicate: boolean;
        error?: undefined;
        idempotent?: undefined;
    } | {
        received: boolean;
        idempotent: boolean;
        error?: undefined;
        duplicate?: undefined;
    }>;
}
