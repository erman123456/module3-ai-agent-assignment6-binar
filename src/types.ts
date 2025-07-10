// src/types.ts

// Contoh sederhana tipe untuk payload request dan response MCP
export interface MvpContextRequest {
    toolName: string;
    action: string;
    input: { [key: string]: any };
    // Tambahkan properti lain sesuai spesifikasi MCP
}

export interface MvpContextResponse {
    status: 'success' | 'error';
    output?: { [key: string]: any };
    error?: { message: string; code?: string };
    log?: string[]; // Untuk send_log_message
}

// Tipe untuk error kustom
export class McpError extends Error {
    code: string;
    constructor(message: string, code: string = 'MCP_ERROR') {
        super(message);
        this.name = 'McpError';
        this.code = code;
        Object.setPrototypeOf(this, McpError.prototype); // Penting untuk inheritance
    }
}

// Contoh tipe konfigurasi
export interface ServerConfig {
    PORT: number;
    MCP_TOOL_NAME: string;
    API_KEY?: string; // Jika ada otentikasi API
    DEBUG_MODE: boolean;
    // Tambahkan konfigurasi lain yang relevan
}