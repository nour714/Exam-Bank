import { handleGenerateSimilar, sendCorsPreflight, sendJson } from "../lib/ai-api.js";

export default async function handler(req, res) {
    if (req.method === "OPTIONS") {
        sendCorsPreflight(res);
        return;
    }

    if (req.method !== "POST") {
        sendJson(res, 405, { error: "Method not allowed" });
        return;
    }

    await handleGenerateSimilar(req, res);
}
