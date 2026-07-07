import http from "http";
import app from "./src/app.js";
import config from "./src/config/index.js";
import { setupSocketIO } from "./src/sockets/index.js";

const server = http.createServer(app);

// Initialize Socket.IO
setupSocketIO(server);

server.listen(config.port, () => {
    console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
});
