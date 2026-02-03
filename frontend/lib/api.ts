export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Types ---
export interface UserCreate {
    username: string;
    email: string;
    password: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface PipelineRequest {
    feature_id?: string;
    context_data: Record<string, any>;
}

export interface PipelineResult {
    status: string;
    feature_id?: string;
    run_id?: string;
    [key: string]: any;
}

// --- API Client ---
export const api = {
    auth: {
        register: async (data: UserCreate): Promise<Token> => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ detail: "Registration failed" }));
                throw new Error(err.detail || "Registration failed");
            }
            return response.json();
        },

        login: async (formData: FormData): Promise<Token> => {
            // FastAPI OAuth2PasswordRequestForm expects form data
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ detail: "Login failed" }));
                throw new Error(err.detail || "Login failed");
            }
            return response.json();
        }
    },

    pipeline: {
        runCore: async (data: PipelineRequest, token?: string): Promise<PipelineResult> => {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/run/core`, {
                method: "POST",
                headers,
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return response.json();
        },
        getResults: async (featureId: string, runId: string): Promise<PipelineResult> => {
            const response = await fetch(`${API_BASE_URL}/results/${featureId}/${runId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch results");
            }
            return response.json();
        },
        runAutofix: async (featureId: string, runId: string): Promise<PipelineResult> => {
            const response = await fetch(`${API_BASE_URL}/run/autofix`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feature_id: featureId, run_id: runId }),
            });
            if (!response.ok) {
                throw new Error("Failed to run autofix");
            }
            return response.json();
        }
    }
};