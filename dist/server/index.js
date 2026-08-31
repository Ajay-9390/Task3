"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
const grievances_1 = __importDefault(require("./routes/grievances"));
const zones_1 = __importDefault(require("./routes/zones"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const ai_1 = __importDefault(require("./routes/ai"));
const websocket_1 = require("./websocket");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Middleware
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'ghmc_session_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // http
        maxAge: 24 * 3600 * 1000 // 24 hours
    }
}));
// API Routes (matching Spring Boot API paths)
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/grievances', grievances_1.default);
app.use('/api/v1/zones', zones_1.default);
app.use('/api/v1/notifications', notifications_1.default);
app.use('/api/v1/analytics', analytics_1.default);
app.use('/api/v1/ai', ai_1.default);
// Static file serving for Frontend UI (/src/main/resources/static)
const staticPath = path_1.default.join(__dirname, '../../src/main/resources/static');
app.use(express_1.default.static(staticPath));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(staticPath, 'index.html'));
});
// Create HTTP server & initialize WebSocket
const server = http_1.default.createServer(app);
(0, websocket_1.initWebSocket)(server);
server.listen(PORT, () => {
    console.log(`🚀 GHMC Governance Portal (Node.js + Prisma ORM) running on http://localhost:${PORT}`);
    console.log(`📂 Static Frontend served from: ${staticPath}`);
});
