"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode ?? 500;
    const code = err.code ?? 'INTERNAL_ERROR';
    const message = err.message ?? 'Internal server error';
    console.error('[errorHandler]', code, message, err.stack);
    if (res.headersSent)
        return;
    try {
        res.status(statusCode).json({
            success: false,
            message,
            code,
        });
    }
    catch (e) {
        console.error('[errorHandler] failed to send response', e);
        try {
            res.status(500).end('Internal server error');
        }
        catch {
            // connection may be closed
        }
    }
}
//# sourceMappingURL=errorHandler.js.map