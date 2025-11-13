import type { User } from "@prisma/client";

export type AuthResponseDTO = {
    accessToken : string;
    refreshToken : string,
    user: Omit<User, "password">;
}