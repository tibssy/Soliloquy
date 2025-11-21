export type Role = "system" | "user" | "assistant";

export type Message = {
    id: string;
    role: Role;
    content: string;
};
