export interface IAuthUserPayload {
    uuid: string;
    name: string;
    email: string;
    phone_number?: string | null;
    role?: string;
    photo?: string | null;
}