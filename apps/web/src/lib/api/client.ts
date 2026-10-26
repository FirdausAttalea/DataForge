import type { components } from "./schema";

export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type UserOut = components["schemas"]["UserOut"];

/** Thrown for every non-2xx response. Carries the backend's error envelope. */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string,
        public readonly requestId: string | null,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });

    if (res.status === 204) return undefined as T;

    const body = await res.json().catch(() => null);
    if (!res.ok) {
        const err = body?.error;
        throw new ApiError(
            res.status,
            err?.code ?? "INTERNAL_ERROR",
            err?.message ?? "Request failed.",
            err?.request_id ?? null,
        );
    }
    return body as T;
}

/** Reads a non-HttpOnly cookie. Used only for the CSRF token. */
export function readCookie(name: string): string | null {
    const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export const api = {
    register: (body: RegisterRequest) =>
        request<UserOut>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(body) }),

    login: (body: LoginRequest) =>
        request<UserOut>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),

    logout: () =>
        request<void>("/api/v1/auth/logout", {
            method: "POST",
            headers: { "X-CSRF-Token": readCookie("df_csrf") ?? "" },
        }),

    me: () => request<UserOut>("/api/v1/auth/me"),
};