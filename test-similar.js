const GEMINI_API_KEY = "AQ.Ab8RN6ITcTRv8JAoW_J3wovLkUzspHrvhZrewpKSkqDoUd_clw";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_MODEL = "gemini-2.5-flash";

async function testSimilarQuestions() {
    const payload = {
        questionText: "ما هي عاصمة مصر؟",
        subject: "الجغرافيا",
        topic: "عواصم",
        correctAnswer: "القاهرة",
        userAnswer: "الإسكندرية",
        options: ["القاهرة", "الإسكندرية", "أسوان", "الأقصر"]
    };
    
    const { questionText, subject, topic, correctAnswer, userAnswer, options } = payload;
    
    try {
        const providerResponse = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: GEMINI_MODEL,
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
                            `المادة: ${subject || "الفيزياء"}`,
                            topic ? `الدرس/الموضوع: ${topic}` : "",
                            `نص السؤال: ${questionText || ""}`,
                            (options && options.length) ? `الاختيارات: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(" | ")}` : "",
                            correctAnswer ? `الإجابة الصحيحة: ${correctAnswer}` : "",
                            userAnswer ? `إجابة الطالب الخاطئة: ${userAnswer}` : "الطالب لم يجب",
                            "اشرح سبب الخطأ في 3 نقاط مختصرة، ثم ولّد 3 أسئلة شبيهة بنفس الفكرة."
                        ].filter(Boolean).join("\n")
                    }
                ]
            })
        });

        const text = await providerResponse.text();
        console.log("Status:", providerResponse.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testSimilarQuestions();
