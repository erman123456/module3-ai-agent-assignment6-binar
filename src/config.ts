// src/config.ts
import dotenv from 'dotenv';
import { ServerConfig } from './types';

dotenv.config(); // Muat variabel lingkungan dari .env

const config: ServerConfig = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    MCP_TOOL_NAME: process.env.MCP_TOOL_NAME || 'WeatherTool', // Ganti dengan nama tool Anda
    API_KEY: process.env.API_KEY, // Opsional
    DEBUG_MODE: process.env.DEBUG_MODE === 'true',
};

// Validasi konfigurasi esensial
if (!config.MCP_TOOL_NAME) {
    console.error('ERROR: MCP_TOOL_NAME is not defined in environment variables.');
    process.exit(1);
}

export default config;