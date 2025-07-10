// src/server.ts
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import config from './config';
import { MvpContextRequest, MvpContextResponse, McpError } from './types';
import { sendLogMessage, getAndClearLogMessages, isValidToolPath, executeToolAction } from './mcp-utils';

const app = express();
app.use(express.json()); // Middleware untuk parsing JSON body

// Middleware untuk mencatat setiap permintaan masuk
app.use((req: Request, res: Response, next: NextFunction) => {
    sendLogMessage(`Incoming request: ${req.method} ${req.url} from ${req.ip}`, 'INFO');
    next();
});

// Endpoint utama untuk menerima permintaan MCP
app.post('/mcp-tool-endpoint', async (req: Request, res: Response) => {
    const requestPayload: MvpContextRequest = req.body;
    let responsePayload: MvpContextResponse;
    const initialLogCount = getAndClearLogMessages().length; // Bersihkan log sebelumnya
    
    sendLogMessage(`Processing MCP request for tool: ${requestPayload.toolName}, action: ${requestPayload.action}`, 'DEBUG');

    // -----------------------------------------------------
    // SIMULASI ERROR 1: Nama Tool yang Salah / Tidak Cocok
    // -----------------------------------------------------
    if (requestPayload.toolName !== config.MCP_TOOL_NAME) {
        const errorMessage = `Tool name mismatch. Expected '${config.MCP_TOOL_NAME}', received '${requestPayload.toolName}'.`;
        sendLogMessage(errorMessage, 'ERROR');
        responsePayload = {
            status: 'error',
            error: { message: errorMessage, code: 'TOOL_NAME_MISMATCH' },
            log: getAndClearLogMessages() // Kirim log yang terkumpul
        };
        return res.status(400).json(responsePayload);
    }

    // -----------------------------------------------------
    // SIMULASI ERROR 2: Path/Aksi Tidak Valid
    // Ini juga dicover dalam executeToolAction, tapi bisa ditangani lebih awal.
    // -----------------------------------------------------
    if (!isValidToolPath(requestPayload.action)) {
        const errorMessage = `Invalid or unsupported action path for tool '${config.MCP_TOOL_NAME}': ${requestPayload.action}`;
        sendLogMessage(errorMessage, 'ERROR');
        responsePayload = {
            status: 'error',
            error: { message: errorMessage, code: 'INVALID_ACTION_PATH' },
            log: getAndClearLogMessages()
        };
        return res.status(400).json(responsePayload);
    }

    try {
        // Eksekusi aksi tool yang diminta
        const output = await executeToolAction(requestPayload.action, requestPayload.input);
        
        responsePayload = {
            status: 'success',
            output: output,
            log: getAndClearLogMessages() // Kirim log yang terkumpul
        };
        sendLogMessage(`MCP request processed successfully for action: ${requestPayload.action}`, 'INFO');
        res.status(200).json(responsePayload);

    } catch (error: any) {
        // Tangani error yang terjadi selama eksekusi aksi
        let errorMessage = 'An unexpected error occurred.';
        let errorCode = 'UNKNOWN_ERROR';

        if (error instanceof McpError) {
            errorMessage = error.message;
            errorCode = error.code;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        sendLogMessage(`Failed to process MCP request for action ${requestPayload.action}: ${errorMessage}`, 'ERROR');
        responsePayload = {
            status: 'error',
            error: { message: errorMessage, code: errorCode },
            log: getAndClearLogMessages() // Kirim log yang terkumpul
        };
        res.status(500).json(responsePayload); // Umumnya 500 untuk error internal server
    }
});

// Menjalankan server
app.listen(config.PORT, () => {
    sendLogMessage(`MCP Server for '${config.MCP_TOOL_NAME}' listening on port ${config.PORT}`, 'INFO');
    sendLogMessage(`Debug mode is ${config.DEBUG_MODE ? 'ON' : 'OFF'}`, 'INFO');

    // Contoh simulasi error startup:
    if (config.MCP_TOOL_NAME === 'INVALID_STARTUP_TOOL_NAME') {
        sendLogMessage('SIMULATION: Startup error due to invalid tool name in config.', 'ERROR');
        // process.exit(1); // Ini akan menghentikan server jika benar-benar terjadi
    }
});