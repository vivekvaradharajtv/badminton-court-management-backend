"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const courts_1 = __importDefault(require("./routes/courts"));
const activities_1 = __importDefault(require("./routes/activities"));
const members_1 = __importDefault(require("./routes/members"));
const bills_1 = __importDefault(require("./routes/bills"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const academy_1 = __importDefault(require("./routes/academy"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check (no auth required)
app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'OK' });
});
app.use('/auth', auth_1.default);
app.use('/courts', courts_1.default);
app.use('/activities', activities_1.default);
app.use('/members', members_1.default);
app.use(bills_1.default); // GET /bills, GET /activities/:id/bills, POST /bills/:id/payments
app.use('/dashboard', dashboard_1.default);
app.use('/academy', academy_1.default);
// Must be last: catch all errors
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map