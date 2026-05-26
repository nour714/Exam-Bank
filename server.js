import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import {
    handleAiMentor,
    handleGenerateSimilar,
    handleQuestionImageExtraction,
    loadLocalEnv,
    sendCorsPreflight,
    sendJson
} from "./lib/ai-api.js";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);

loadLocalEnv(rootDir);

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

const server = createServer(async (req, res) => {
    try {
        if (req.method === "OPTIONS") {
            sendCorsPreflight(res);
            return;
        }

        if (req.method === "POST" && req.url === "/api/ai-mentor") {
            await handleAiMentor(req, res);
            return;
        }

        if (req.method === "POST" && req.url === "/api/extract-question-image") {
            await handleQuestionImageExtraction(req, res);
            return;
        }

        if (req.method === "POST" && req.url === "/api/generate-similar-questions") {
            await handleGenerateSimilar(req, res);
            return;
        }

        if (req.method === "GET" || req.method === "HEAD") {
            serveStatic(req, res);
            return;
        }

        sendJson(res, 405, { error: "Method not allowed" });
    } catch (error) {
        console.error(error);
        sendJson(res, 500, { error: "Server error" });
    }
});

server.listen(port, () => {
    console.log(`Exam Bank is running on http://localhost:${port}`);
});

function serveStatic(req, res) {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(rootDir, safePath);

    if (!filePath.startsWith(rootDir) || !existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
    }

    res.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    if (req.method === "HEAD") {
        res.end();
        return;
    }

    createReadStream(filePath).pipe(res);
}
