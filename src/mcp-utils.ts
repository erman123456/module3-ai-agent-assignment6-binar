// src/mcp-utils.ts
import config from './config';
import { McpError } from './types';

let logMessages: string[] = [];

/**
 * Mengirim pesan log yang dapat ditangkap oleh MCP Inspector atau DevTools.
 * Dalam simulasi ini, kita menyimpannya di memori dan menampilkannya di konsol.
 * Di lingkungan nyata, ini mungkin mengirim ke log server atau sistem log terpusat.
 * @param message Pesan log.
 * @param level Tingkat log (INFO, WARN, ERROR, DEBUG).
 */
export function sendLogMessage(message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' = 'INFO'): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    console.log(logEntry); // Selalu log ke konsol server

    if (config.DEBUG_MODE) {
        logMessages.push(logEntry); // Simpan untuk ditampilkan di respons MCP jika diperlukan
    }
}

/**
 * Mendapatkan semua pesan log yang terkumpul.
 * Berguna untuk melampirkan log ke respons MCP atau untuk debugging internal.
 */
export function getAndClearLogMessages(): string[] {
    const messages = [...logMessages]; // Buat salinan
    logMessages = []; // Hapus log setelah diambil
    return messages;
}

/**
 * Fungsi placeholder untuk validasi path tool.
 * Dalam skenario nyata, ini akan memeriksa apakah path/action yang diminta valid untuk tool ini.
 * @param path Path yang diminta oleh MCP.
 * @returns true jika path valid, false jika tidak.
 */
export function isValidToolPath(path: string): boolean {
    sendLogMessage(`Validating path: ${path}`, 'DEBUG');
    // Contoh simulasi error: path yang salah
    if (path.includes('wrong-path') || path.includes('invalidAction')) {
        sendLogMessage(`Invalid path detected: ${path}`, 'ERROR');
        return false;
    }
    return true;
}

/**
 * Fungsi placeholder untuk mengeksekusi aksi tool.
 * Anda akan mengganti ini dengan logika bisnis tool Anda (misal, memanggil API cuaca).
 * @param action Aksi yang akan dieksekusi.
 * @param input Input untuk aksi tersebut.
 * @returns Output dari aksi.
 */
export async function executeToolAction(action: string, input: { [key: string]: any }): Promise<any> {
    sendLogMessage(`Executing action: ${action} with input: ${JSON.stringify(input)}`, 'INFO');
    try {
        switch (action) {
            case 'getWeather':
                // Simulasi error: Variabel lingkungan tidak lengkap (missing API key)
                if (!process.env.WEATHER_API_KEY && action === 'getWeather') {
                    throw new McpError('Weather API key is not configured.', 'MISSING_API_KEY');
                }
                // Simulasi logika sukses
                return {
                    location: input.location || 'Default City',
                    temperature: '25°C',
                    conditions: 'Sunny',
                    humidity: '60%'
                };
            case 'getForecast':
                // Simulasi error: Path yang salah dari isValidToolPath
                if (!isValidToolPath(action)) {
                    throw new McpError('Invalid forecast action path.', 'INVALID_ACTION_PATH');
                }
                 // Simulasi logika sukses
                return {
                    location: input.location || 'Default City',
                    forecast: [
                        { day: 'Tomorrow', temp: '26°C' },
                        { day: 'Day after', temp: '24°C' }
                    ]
                };
            default:
                throw new McpError(`Action '${action}' not supported by tool '${config.MCP_TOOL_NAME}'.`, 'UNSUPPORTED_ACTION');
        }
    } catch (error: any) {
        sendLogMessage(`Error during action execution: ${error.message}`, 'ERROR');
        throw error; // Re-throw error untuk ditangani di server.ts
    }
}