import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function loadLocalEnv(rootDir) {
    if (!rootDir) return;
    const envPath = join(rootDir, ".env");
    if (!existsSync(envPath)) return;

    const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
    }
}

export async function handleAiMentor(req, res) {
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
        sendJson(res, 501, { error: "AI_API_KEY is not configured" });
        return;
    }

    const body = await readJsonBody(req);
    const message = String(body.message || "").trim();
    const subject = String(body.subject || "الفيزياء").trim();

    if (!message) {
        sendJson(res, 400, { error: "message is required" });
        return;
    }

    const providerResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            temperature: 0.45,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: [
                        "أنت AI Mentor داخل منصة Exam Bank لطلاب ثالثة ثانوي.",
                        "رد دائمًا بالعربية المصرية الواضحة وبأسلوب مدرس هادئ.",
                        "لا تطوّل. اشرح في 3 نقاط عملية، ثم اسأل سؤال متابعة واحد، ثم اقترح امتحانًا مناسبًا.",
                        "أعد JSON فقط بدون Markdown بالمفاتيح: subject, topic, explain, followUp, practicePrompt.",
                        "explain يجب أن تكون array من 3 strings."
                    ].join(" ")
                },
                {
                    role: "user",
                    content: `المادة المتوقعة: ${subject}\nسؤال الطالب: ${message}`
                }
            ]
        })
    });

    const data = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
        sendJson(res, providerResponse.status, {
            error: data.error?.message || "AI provider request failed"
        });
        return;
    }

    const content = data.choices?.[0]?.message?.content || "";
    sendJson(res, 200, parseMentorResponse(content, subject, message));
}

export async function handleQuestionImageExtraction(req, res) {
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/, "");
    const model = process.env.AI_VISION_MODEL || process.env.AI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
        sendJson(res, 501, { error: "AI_API_KEY is not configured" });
        return;
    }

    const body = await readJsonBody(req, 2_500_000);
    const imageDataUrl = String(body.imageDataUrl || "").trim();

    if (!imageDataUrl.startsWith("data:image/")) {
        sendJson(res, 400, { error: "imageDataUrl is required" });
        return;
    }

    const providerResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: [
                        "استخرج سؤال اختيار من متعدد من الصورة.",
                        "حدد المادة الأنسب من: الفيزياء، الكيمياء، الأحياء، الرياضيات، اللغة العربية، اللغة الإنجليزية، الجيولوجيا، التاريخ، الجغرافيا.",
                        "أعد JSON فقط بالمفاتيح: subject, topic, text, options, correct.",
                        "options يجب أن تكون array من 4 strings.",
                        "correct يجب أن يكون A أو B أو C أو D. إذا لم تكن الإجابة واضحة اختر أفضل تقدير منطقي."
                    ].join(" ")
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "حلل الصورة واستخرج السؤال والاختيارات والمادة المناسبة." },
                        { type: "image_url", image_url: { url: imageDataUrl } }
                    ]
                }
            ]
        })
    });

    const data = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
        sendJson(res, providerResponse.status, {
            error: data.error?.message || "AI provider request failed"
        });
        return;
    }

    const content = data.choices?.[0]?.message?.content || "";
    sendJson(res, 200, parseExtractedQuestion(content));
}

export async function handleGenerateSimilar(req, res) {
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/, "");
    const model = process.env.AI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
        sendJson(res, 501, { error: "AI_API_KEY is not configured" });
        return;
    }

    const body = await readJsonBody(req);
    const questionText = String(body.questionText || "").trim();
    const subject = String(body.subject || "الفيزياء").trim();
    const topic = String(body.topic || "").trim();
    const correctAnswer = String(body.correctAnswer || "").trim();
    const userAnswer = String(body.userAnswer || "").trim();
    const options = Array.isArray(body.options) ? body.options.slice(0, 4).map(String) : [];

    if (!questionText) {
        sendJson(res, 400, { error: "questionText is required" });
        return;
    }

    const providerResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            temperature: 0.6,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: [
                        "أنت معلم خبير لطلاب الثانوية العامة المصرية.",
                        "مهمتك: شرح سبب الخطأ في سؤال ثم توليد 3 أسئلة اختيار من متعدد مشابهة بنفس الفكرة ومستوى الصعوبة.",
                        "رد دائمًا بالعربية المصرية الواضحة.",
                        "أعد JSON فقط بدون Markdown بالمفاتيح: explanation (array من 3 strings), similarQuestions (array من 3 objects).",
                        "كل object في similarQuestions يحتوي على: text (string), options (array من 4 strings), correct (A/B/C/D), hint (string قصير)."
                    ].join(" ")
                },
                {
                    role: "user",
                    content: [
                        `المادة: ${subject}`,
                        topic ? `الدرس/الموضوع: ${topic}` : "",
                        `نص السؤال: ${questionText}`,
                        options.length ? `الاختيارات: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(" | ")}` : "",
                        correctAnswer ? `الإجابة الصحيحة: ${correctAnswer}` : "",
                        userAnswer ? `إجابة الطالب الخاطئة: ${userAnswer}` : "الطالب لم يجب",
                        "اشرح سبب الخطأ في 3 نقاط مختصرة، ثم ولّد 3 أسئلة شبيهة بنفس الفكرة."
                    ].filter(Boolean).join("\n")
                }
            ]
        })
    });

    const data = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
        sendJson(res, providerResponse.status, {
            error: data.error?.message || "AI provider request failed"
        });
        return;
    }

    const content = data.choices?.[0]?.message?.content || "";
    sendJson(res, 200, parseSimilarResponse(content));
}

export function sendCorsPreflight(res) {
    res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
    });
    res.end();
}

export function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end(JSON.stringify(payload));
}

async function readJsonBody(req, maxBytes = 100_000) {
    if (req.body && typeof req.body === "object") return req.body;

    return new Promise((resolve, reject) => {
        let raw = "";
        req.on("data", (chunk) => {
            raw += chunk;
            if (raw.length > maxBytes) {
                req.destroy();
                reject(new Error("Request body is too large"));
            }
        });
        req.on("end", () => {
            try {
                resolve(raw ? JSON.parse(raw) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

function parseMentorResponse(content, subject, message) {
    try {
        const parsed = JSON.parse(content);
        return {
            subject: sanitizeText(parsed.subject) || subject,
            topic: sanitizeText(parsed.topic) || message,
            explain: normalizeExplain(parsed.explain),
            followUp: sanitizeText(parsed.followUp) || "تحب تحاول تحل خطوة وتبعتها لي؟",
            practicePrompt: sanitizeText(parsed.practicePrompt) || `ابدأ امتحان ${subject} على نفس الفكرة`
        };
    } catch {
        return {
            subject,
            topic: message,
            explain: [
                "وصلني رد من مزود الذكاء الاصطناعي، لكن تنسيقه لم يكن مناسبًا للعرض.",
                "اكتب السؤال مرة أخرى بصيغة أوضح أو حدد المادة والدرس.",
                "سأقسمه لك إلى معطيات ومطلوب وقانون وخطوات حل."
            ],
            followUp: "ما أول خطوة حاولت تعملها في السؤال؟",
            practicePrompt: `ابدأ امتحان ${subject} على نفس الفكرة`
        };
    }
}

function normalizeExplain(value) {
    if (!Array.isArray(value)) {
        return ["حدد الفكرة الأساسية.", "اكتب المعطيات والمطلوب.", "طبق القانون خطوة بخطوة."];
    }
    return value.map(sanitizeText).filter(Boolean).slice(0, 3);
}

function parseExtractedQuestion(content) {
    const allowedSubjects = new Set(["الفيزياء", "الكيمياء", "الأحياء", "الرياضيات", "اللغة العربية", "اللغة الإنجليزية", "الجيولوجيا", "التاريخ", "الجغرافيا"]);
    const parsed = JSON.parse(content);
    const options = Array.isArray(parsed.options) ? parsed.options.map(sanitizeText).filter(Boolean).slice(0, 4) : [];

    while (options.length < 4) {
        options.push(`اختيار ${options.length + 1}`);
    }

    const correct = ["A", "B", "C", "D"].includes(String(parsed.correct || "").toUpperCase())
        ? String(parsed.correct).toUpperCase()
        : "A";
    const subject = allowedSubjects.has(sanitizeText(parsed.subject)) ? sanitizeText(parsed.subject) : "الفيزياء";

    return {
        subject,
        topic: sanitizeText(parsed.topic) || "سؤال من صورة",
        text: sanitizeText(parsed.text) || "راجع صورة السؤال المرفقة واختر الإجابة الصحيحة.",
        options,
        correct
    };
}

function parseSimilarResponse(content) {
    try {
        const parsed = JSON.parse(content);
        const explanation = Array.isArray(parsed.explanation)
            ? parsed.explanation.map(sanitizeText).filter(Boolean).slice(0, 3)
            : ["لم نتمكن من توليد شرح واضح. حاول مرة أخرى."];
        while (explanation.length < 3) explanation.push("راجع الفكرة الأساسية للسؤال.");
        const similarQuestions = Array.isArray(parsed.similarQuestions)
            ? parsed.similarQuestions.slice(0, 3).map(normalizeSimilarQuestion)
            : [];
        return { explanation, similarQuestions };
    } catch {
        return {
            explanation: ["تعذر تحليل رد الذكاء الاصطناعي.", "حاول مرة أخرى بعد لحظات.", "تأكد من اتصالك بالإنترنت."],
            similarQuestions: []
        };
    }
}

function normalizeSimilarQuestion(q) {
    const options = Array.isArray(q?.options) ? q.options.map(sanitizeText).filter(Boolean).slice(0, 4) : [];
    while (options.length < 4) options.push(`اختيار ${options.length + 1}`);
    const correct = ["A", "B", "C", "D"].includes(String(q?.correct || "").toUpperCase()) ? String(q.correct).toUpperCase() : "A";
    return {
        text: sanitizeText(q?.text) || "سؤال جديد",
        options,
        correct,
        hint: sanitizeText(q?.hint) || ""
    };
}

function sanitizeText(value) {
    return String(value || "").replace(/[<>]/g, "").trim();
}
