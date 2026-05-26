/* ==========================================
   Exam Bank - Application logic (SPA & Exam)
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Auth Check
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize Lucide Icons
    function refreshIcons() {
        if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
            lucide.createIcons();
        }
    }

    function setLucideIcon(buttonEl, iconName) {
        if (!buttonEl || !iconName) return;
        const existing = buttonEl.querySelector("[data-lucide], svg.lucide");
        if (existing) existing.remove();
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", iconName);
        buttonEl.appendChild(icon);
        refreshIcons();
    }
    refreshIcons();

    // ==========================================
    // Site-wide Animations
    // ==========================================
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initSiteAnimations() {
        document.body.classList.add("animations-ready");

        if (prefersReducedMotion) return;

        document.querySelectorAll(".stagger-grid").forEach(prepareStaggerGrid);
        document.querySelectorAll(
            ".view-header, .welcome-header, .filters-row, .chart-card, .dashboard-grid > .card"
        ).forEach((el) => el.classList.add("reveal-on-scroll"));

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-revealed");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
        );

        document.querySelectorAll(".reveal-on-scroll").forEach((el) => revealObserver.observe(el));

        const activeView = document.querySelector(".content-view.active");
        if (activeView) playViewAnimations(activeView);
    }

    function prepareStaggerGrid(grid) {
        Array.from(grid.children).forEach((child, index) => {
            child.classList.add("stagger-item");
            child.style.setProperty("--stagger-i", index);
        });
    }

    function playViewAnimations(viewEl) {
        if (!viewEl || prefersReducedMotion) return;

        viewEl.querySelectorAll(".stagger-grid").forEach((grid) => {
            grid.classList.remove("stagger-play");
            void grid.offsetWidth;
            grid.classList.add("stagger-play");
        });

        viewEl.querySelectorAll(".reveal-on-scroll:not(.is-revealed)").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.92) {
                el.classList.add("is-revealed");
            }
        });
    }

    initSiteAnimations();

    // ==========================================
    // Update User Profile UI
    // ==========================================
    function generateInitialAvatar(name) {
        const safeName = (name || 'Student').trim();
        const initial = safeName.charAt(0).toUpperCase() || 'S';
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        if (!ctx) return '';

        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 50, 50);

        return canvas.toDataURL();
    }
    function updateUserProfileUI() {
        const userName = localStorage.getItem('userName') || 'Student';

        // Update name in sidebar
        const usernameEl = document.querySelector('.user-profile-widget .username');
        if (usernameEl) usernameEl.textContent = userName;

        // Update welcome text in dashboard
        const welcomeEl = document.querySelector('#dashboard-view .welcome-text h1');
        if (welcomeEl) {
            welcomeEl.innerHTML = `أهلاً بك مجدداً، ${userName}! 👋`;
        }

        // Update Avatar
        const avatarImg = document.getElementById('user-avatar-img');
        if (avatarImg) avatarImg.src = generateInitialAvatar(userName);
    }
    updateUserProfileUI();

    // ==========================================
    // Custom Dialog & Toast System (Non-blocking)
    // ==========================================
    function showToast(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast-item toast-${type}`;
        
        let iconName = "check-circle";
        if (type === "info") iconName = "info";
        if (type === "warning") iconName = "alert-triangle";
        if (type === "error") iconName = "x-circle";

        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);
        refreshIcons();

        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => { toast.remove(); }, 300);
        }, 3500);
    }

    function showCustomConfirm(title, message, onConfirm, onCancel = null) {
        const modal = document.getElementById("confirm-modal");
        const titleEl = document.getElementById("confirm-modal-title");
        const msgEl = document.getElementById("confirm-modal-message");
        const btnOk = document.getElementById("btn-confirm-ok");
        const btnCancel = document.getElementById("btn-confirm-cancel");
        const btnClose = document.getElementById("btn-close-confirm");

        if (!modal || !titleEl || !msgEl || !btnOk || !btnCancel || !btnClose) {
            if (onConfirm) onConfirm();
            return;
        }

        titleEl.textContent = title;
        msgEl.textContent = message;
        modal.classList.add("active");

        const cleanup = () => {
            modal.classList.remove("active");
            btnOk.replaceWith(btnOk.cloneNode(true));
            btnCancel.replaceWith(btnCancel.cloneNode(true));
            btnClose.replaceWith(btnClose.cloneNode(true));
        };

        const getOkBtn = () => document.getElementById("btn-confirm-ok");
        const getCancelBtn = () => document.getElementById("btn-confirm-cancel");
        const getCloseBtn = () => document.getElementById("btn-close-confirm");

        getOkBtn().addEventListener("click", () => { cleanup(); if (onConfirm) onConfirm(); });
        getCancelBtn().addEventListener("click", () => { cleanup(); if (onCancel) onCancel(); });
        getCloseBtn().addEventListener("click", () => { cleanup(); if (onCancel) onCancel(); });
    }

    // ==========================================
    // State Management
    // ==========================================
    const appState = {
        currentView: "home-view",
        darkMode: false,
        user: {
            name: "",
            email: "",
            notifications: true,
            xp: 0,
            solvedCount: 0,
            streak: 0,
            accuracy: 0,
            avatar: ""
        },
        studyGroups: [],
        exam: {
            subject: "الفيزياء",
            title: "الفيزياء – الثانوية العامة (ثالثة ثانوي)",
            timeLimitMinutes: 45,
            timeRemaining: 45 * 60,
            questions: [],
            currentQuestionIndex: 0,
            answers: Array(50).fill(null),
            flagged: new Set(),
            isActive: false,
            timerInterval: null
        },
        customQuestions: [],
        notes: []
    };

    function resetUserScopedState(name = "", email = "") {
        appState.user = {
            ...appState.user,
            name,
            email,
            notifications: true,
            xp: 0,
            solvedCount: 0,
            streak: 0,
            accuracy: 0,
            avatar: ""
        };
        appState.studyGroups = [];
        appState.customQuestions = [];
        appState.notes = [];
    }

    // ==========================================
    // Real Question Bank — All Subjects
    // ==========================================
    const QUESTION_BANK = {

        "الفيزياء": [
            // الكهرباء والمغناطيسية
            { topic: "الكهرباء والمغناطيسية", text: "في الدائرة الكهربائية، إذا كانت R1 = 5Ω والمقاومة R2 = 10Ω على التوازي ومصدر الجهد 15V. ما التيار الكلي؟", options: ["1.0 أمبير", "1.5 أمبير", "3.0 أمبير", "4.5 أمبير"], correct: "D", hasDiagram: true },
            { topic: "الكهرباء والمغناطيسية", text: "قانون أوم ينص على أن: التيار الكهربائي يتناسب...", options: ["طردياً مع المقاومة وعكسياً مع الجهد", "طردياً مع الجهد وعكسياً مع المقاومة", "عكسياً مع كليهما", "طردياً مع كليهما"], correct: "B", hasDiagram: false },
            { topic: "الكهرباء والمغناطيسية", text: "مقاومتان قيمتهما 6Ω و 3Ω متصلتان على التوازي. ما المقاومة المكافئة؟", options: ["9Ω", "4.5Ω", "2Ω", "1Ω"], correct: "C", hasDiagram: false },
            { topic: "الكهرباء والمغناطيسية", text: "تيار شدته 3A يمر في مقاومة 4Ω لمدة 5 ثوانٍ. ما الشحنة الكهربائية التي مرت؟", options: ["15 كولوم", "12 كولوم", "60 كولوم", "20 كولوم"], correct: "A", hasDiagram: false },
            { topic: "الكهرباء والمغناطيسية", text: "قوة الدوران المؤثرة على ملف يحمل تياراً في مجال مغناطيسي تعتمد على:", options: ["شدة التيار فقط", "عدد لفات الملف فقط", "شدة المجال المغناطيسي فقط", "كل ما سبق"], correct: "D", hasDiagram: false },
            // الميكانيكا
            { topic: "الميكانيكا والكينماتيكا", text: "جسم يتحرك بتسارع منتظم 4 م/ث² انطلق من السكون. ما سرعته بعد 5 ثوانٍ؟", options: ["10 م/ث", "15 م/ث", "20 م/ث", "25 م/ث"], correct: "C", hasDiagram: false },
            { topic: "الميكانيكا والكينماتيكا", text: "كتلة قدرها 5 kg تؤثر فيها قوة محصلة 20N. ما تسارعها؟", options: ["2 م/ث²", "4 م/ث²", "10 م/ث²", "100 م/ث²"], correct: "B", hasDiagram: false },
            { topic: "الميكانيكا والكينماتيكا", text: "ما وحدة الزخم الخطي في النظام الدولي؟", options: ["N·m", "kg·m/s", "J/s", "W"], correct: "B", hasDiagram: false },
            { topic: "الميكانيكا والكينماتيكا", text: "جسم سقط من ارتفاع 80m (g=10 م/ث²). ما سرعته عند الأرض؟", options: ["20 م/ث", "40 م/ث", "60 م/ث", "80 م/ث"], correct: "B", hasDiagram: false },
            // الضوء والأمواج
            { topic: "الضوء والأمواج", text: "سرعة الضوء في الفراغ تقريباً:", options: ["3×10⁶ م/ث", "3×10⁸ م/ث", "3×10¹⁰ م/ث", "3×10⁴ م/ث"], correct: "B", hasDiagram: false },
            { topic: "الضوء والأمواج", text: "موجة ترددها 500 Hz وسرعتها 340 م/ث. ما طولها الموجي؟", options: ["0.34 م", "0.68 م", "1.47 م", "170 م"], correct: "B", hasDiagram: false },
            { topic: "الضوء والأمواج", text: "ظاهرة الانعراج (Diffraction) تحدث عندما تمر الموجات:", options: ["من وسط كثيف لخفيف", "من فتحة أو حول عائق", "من وسط خفيف لكثيف", "في الفراغ فقط"], correct: "B", hasDiagram: false },
            // الحرارة
            { topic: "الحرارة والديناميكا الحرارية", text: "القانون الأول للديناميكا الحرارية يعبر عن:", options: ["مبدأ الإنتروبيا", "مبدأ حفظ الطاقة", "مبدأ الصفر المطلق", "مبدأ البروتونات"], correct: "B", hasDiagram: false },
            { topic: "الحرارة والديناميكا الحرارية", text: "كمية الحرارة اللازمة لرفع درجة حرارة 2 kg من الماء بمقدار 10°C (السعة الحرارية النوعية = 4200 J/kg°C):", options: ["42000 J", "84000 J", "21000 J", "8400 J"], correct: "B", hasDiagram: false },
            // الفيزياء الحديثة
            { topic: "الفيزياء الحديثة", text: "الظاهرة الكهروضوئية أثبتت أن الضوء يتصرف كـ:", options: ["موجة طولية", "موجة مستعرضة", "جسيمات (فوتونات)", "بلازما"], correct: "C", hasDiagram: false },
            { topic: "الفيزياء الحديثة", text: "طاقة الفوتون تتناسب مع:", options: ["طول موجته", "مربع ترددها", "ترددها تناسباً طردياً", "كتلته"], correct: "C", hasDiagram: false },
        ],

        "الكيمياء": [
            // الكيمياء العضوية
            { topic: "الكيمياء العضوية", text: "الاسم الجذري للمركب CH3-CH(CH3)-CH2-CH3؟", options: ["2-ميثيل بيوتان", "3-ميثيل بيوتان", "بينتان", "2-ميثيل بروبان"], correct: "A", hasDiagram: false },
            { topic: "الكيمياء العضوية", text: "الصيغة العامة للألكانات هي:", options: ["CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₊₂", "CₙHₙ"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء العضوية", text: "أي من الهيدروكربونات التالية يحتوي على رابطة ثلاثية؟", options: ["الإيثان", "الإيثيلين (الإيثين)", "الأسيتيلين (الإيثاين)", "البروبان"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء العضوية", text: "ما نوع التفاعل في: CH₄ + Cl₂ → CH₃Cl + HCl (بوجود ضوء)؟", options: ["تفاعل إضافة", "تفاعل إحلال", "تفاعل حذف", "تفاعل تكثيف"], correct: "B", hasDiagram: false },
            { topic: "الكيمياء العضوية", text: "الكحول الإيثيلي (الإيثانول) يحتوي على المجموعة الوظيفية:", options: ["-COOH", "-OH", "-CHO", "-CO-"], correct: "B", hasDiagram: false },
            // الكيمياء التحليلية
            { topic: "الكيمياء التحليلية", text: "محلول pH = 3 هو:", options: ["قاعدي قوي", "قاعدي ضعيف", "حمضي قوي", "حمضي ضعيف"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء التحليلية", text: "تركيز محلول يحتوي على 40g من NaOH (الكتلة المولية=40) في 2 لتر:", options: ["0.25 مول/لتر", "0.5 مول/لتر", "1 مول/لتر", "2 مول/لتر"], correct: "B", hasDiagram: false },
            { topic: "الكيمياء التحليلية", text: "ما الأيون المسؤول عن خاصية الحموضة في المحاليل المائية؟", options: ["OH⁻", "H₃O⁺ (أيون الهيدرونيوم)", "Na⁺", "Cl⁻"], correct: "B", hasDiagram: false },
            // الكيمياء الكهربائية
            { topic: "الكيمياء الكهربية", text: "في خلية التحليل الكهربائي (التحليل الكهربي)، عند الكاثود تحدث عملية:", options: ["الأكسدة", "الاختزال", "التأين", "الترسيب الأيوني"], correct: "B", hasDiagram: false },
            { topic: "الكيمياء الكهربية", text: "في بطارية دانيال، القطب السالب (الأنود) مصنوع من:", options: ["النحاس", "الزنك", "الفضة", "الحديد"], correct: "B", hasDiagram: false },
            // العناصر الانتقالية
            { topic: "العناصر الانتقالية", text: "أي العناصر التالية ينتمي للعناصر الانتقالية؟", options: ["الصوديوم", "الكالسيوم", "الحديد", "الكلور"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء الفيزيائية", text: "قانون هس ينص على أن:", options: ["كمية الحرارة تتناسب مع الضغط", "الإنثالبي الكلي لتفاعل مستقل عن المسار", "الطاقة تتضاعف عند تكرار التفاعل", "درجة الحرارة تؤثر على طبيعة المنتجات فقط"], correct: "B", hasDiagram: false },
            { topic: "الكيمياء الفيزيائية", text: "ما الغاز الناتج عند تفاعل الزنك مع حمض الكلوريدريك؟", options: ["O₂", "Cl₂", "H₂", "CO₂"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء الفيزيائية", text: "حساب الكتلة الجزيئية لـ H₂SO₄ (H=1, S=32, O=16):", options: ["64", "80", "96", "98"], correct: "D", hasDiagram: false },
            { topic: "الكيمياء التحليلية", text: "عند خلط محلول حمضي مع قاعدة يحدث:", options: ["تفاعل أكسدة واختزال", "تفاعل تعادل ويتكون ماء وملح", "تفاعل ترسيب فقط", "لا يحدث تفاعل"], correct: "B", hasDiagram: false },
        ],

        "الأحياء": [
            // الحمض النووي
            { topic: "الحمض النووي DNA", text: "إذا كانت نسبة Adenine في جزيء DNA ثنائي السلسلة 30%، فما نسبة Thymine؟", options: ["15%", "20%", "30%", "40%"], correct: "C", hasDiagram: false },
            { topic: "الحمض النووي DNA", text: "أي من القواعد النيتروجينية التالية موجودة في RNA دون DNA؟", options: ["Adenine", "Guanine", "Uracil", "Cytosine"], correct: "C", hasDiagram: false },
            { topic: "الحمض النووي DNA", text: "الاتجاه الذي تُقرأ فيه القالب DNA أثناء النسخ هو:", options: ["5' → 3'", "3' → 5'", "من المنتصف للطرفين", "بالتساوي في الاتجاهين"], correct: "B", hasDiagram: false },
            // الوراثة
            { topic: "الوراثة وعلم الجينات", text: "وفق قانون مندل الأول، إذا تزاوج نباتان أحدهما نقي طويل (TT) والآخر نقي قصير (tt)، فالجيل الأول F1:", options: ["كله قصير", "نصفه طويل ونصفه قصير", "كله طويل هجين (Tt)", "ثلاثة أرباعه طويلة"], correct: "C", hasDiagram: false },
            { topic: "الوراثة وعلم الجينات", text: "الانعزال الحر (القانون الثاني لمندل) يعني:", options: ["الجينات على نفس الكروموسوم تنعزل معاً", "كل زوج من الجينات ينعزل بصورة مستقلة عن الأزواج الأخرى", "الصفة السائدة دائماً تظهر في الجيل الأول", "الهجين يشبه أحد الوالدين"], correct: "B", hasDiagram: false },
            { topic: "الوراثة وعلم الجينات", text: "المرض الناتج عن وجود كروموسوم 21 إضافي هو:", options: ["مرض الهيموفيليا", "متلازمة داون", "مرض التليف الكيسي", "فصيلة الدم"], correct: "B", hasDiagram: false },
            // التنسيق الهرموني
            { topic: "التنسيق الهرموني", text: "الغدة التي تُسمى 'سيدة الغدد' لأنها تتحكم في إفراز غدد أخرى:", options: ["الغدة الدرقية", "الغدة الكظرية", "الغدة النخامية", "البنكرياس"], correct: "C", hasDiagram: false },
            { topic: "التنسيق الهرموني", text: "هرمون الإنسولين يُنتج من:", options: ["الغدة الدرقية", "خلايا بيتا في جزر لانجرهانز بالبنكرياس", "الغدة الكظرية", "الغدة الدرقية"], correct: "B", hasDiagram: false },
            { topic: "التنسيق الهرموني", text: "نقص هرمون الثيروكسين يؤدي إلى:", options: ["مرض السكري", "مرض الكريتنية (قصور الغدة الدرقية)", "ارتفاع السكر في الدم", "زيادة ضربات القلب المفرطة"], correct: "B", hasDiagram: false },
            // التكاثر
            { topic: "التكاثر في الكائنات الحية", text: "الانقسام المنصف (Meiosis) يُنتج خلايا:", options: ["ثنائية الكروموسومات (2n)", "أحادية الكروموسومات (n)", "رباعية الكروموسومات (4n)", "متماثلة مع الخلية الأم تماماً"], correct: "B", hasDiagram: false },
            { topic: "التكاثر في الكائنات الحية", text: "في البشر، تحديد جنس الجنين يتم عن طريق:", options: ["البويضة فقط", "الحيوان المنوي", "كلا الوالدين بالتساوي", "البيئة المحيطة"], correct: "B", hasDiagram: false },
            // الدعامة والحركة
            { topic: "الدعامة والحركة", text: "ما نوع الغضروف الموجود في الأذن الخارجية والأنف؟", options: ["غضروف زجاجي (هيالي)", "غضروف ليفي", "غضروف مرن", "غضروف كلسي"], correct: "C", hasDiagram: false },
            { topic: "الدعامة والحركة", text: "العضلات الهيكلية تتميز بأنها:", options: ["لاإرادية ومخططة", "إرادية ومخططة", "لاإرادية وغير مخططة", "لا تنقبض إلا بالتحفيز الكيميائي"], correct: "B", hasDiagram: false },
            { topic: "الحمض النووي DNA", text: "بروتين الهيموجلوبين مكون من عدد من سلاسل البولي بيبتيد هو:", options: ["سلسلتين", "ثلاث سلاسل", "أربع سلاسل", "خمس سلاسل"], correct: "C", hasDiagram: false },
            { topic: "الوراثة وعلم الجينات", text: "الطفرة الجينية هي تغير في:", options: ["شكل الكروموسوم", "تسلسل القواعد النيتروجينية في DNA", "عدد الكروموسومات فقط", "حجم الخلية"], correct: "B", hasDiagram: false },
        ],

        "الرياضيات": [
            // التفاضل والتكامل
            { topic: "التفاضل والتكامل", text: "أوجد: lim (x→0) [sin(3x)/x]", options: ["1", "3", "0", "غير معرفة"], correct: "B", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "مشتقة الدالة f(x) = x³ + 5x² - 2x + 1 هي:", options: ["3x² + 10x - 2", "3x² + 5x - 2", "x³ + 10x", "3x + 10"], correct: "A", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "∫ 2x dx = ؟", options: ["x² + C", "2 + C", "x + C", "2x² + C"], correct: "A", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "إذا f(x) = sin(x)، فإن f'(x) = ؟", options: ["-sin(x)", "cos(x)", "-cos(x)", "tan(x)"], correct: "B", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "قيمة ∫₀¹ x² dx = ؟", options: ["1/4", "1/3", "1/2", "1"], correct: "B", hasDiagram: false },
            // الجبر والهندسة الفراغية
            { topic: "الجبر والهندسة الفراغية", text: "معادلة الدائرة المركزها (2, -3) ونصف قطرها 5 هي:", options: ["(x-2)² + (y+3)² = 25", "(x+2)² + (y-3)² = 25", "(x-2)² + (y-3)² = 5", "(x+2)² + (y+3)² = 25"], correct: "A", hasDiagram: false },
            { topic: "الجبر والهندسة الفراغية", text: "حجم الكرة نصف قطرها r هو:", options: ["4πr²", "(4/3)πr³", "(2/3)πr³", "πr³"], correct: "B", hasDiagram: false },
            { topic: "الجبر والهندسة الفراغية", text: "الحل العام للمعادلة التربيعية ax²+bx+c=0 هو:", options: ["x = -b/2a", "x = (-b ± √(b²-4ac)) / 2a", "x = b ± √(b²+4ac)", "x = b/2a"], correct: "B", hasDiagram: false },
            // الاستاتيكا
            { topic: "الاستاتيكا", text: "الجسم في حالة توازن إذا كانت محصلة القوى المؤثرة عليه:", options: ["أكبر من الصفر", "أقل من الصفر", "تساوي صفراً", "تساوي وزنه"], correct: "C", hasDiagram: false },
            { topic: "الاستاتيكا", text: "عزم قوة مقدارها 10N حول نقطة على بُعد 3m من خط عملها:", options: ["30 N·m", "10/3 N·m", "13 N·m", "3.3 N·m"], correct: "A", hasDiagram: false },
            // الاحتمالات
            { topic: "الاحتمالات والإحصاء", text: "رُمي نرد مرة واحدة. احتمال ظهور عدد زوجي:", options: ["1/6", "1/3", "1/2", "2/3"], correct: "C", hasDiagram: false },
            { topic: "الاحتمالات والإحصاء", text: "متوسط الأعداد: 4, 8, 6, 10, 2 هو:", options: ["5", "6", "7", "8"], correct: "B", hasDiagram: false },
            // الديناميكا
            { topic: "الديناميكا", text: "شغل قوة 20N تحرك جسماً مسافة 5m في اتجاهها هو:", options: ["4 J", "25 J", "100 J", "15 J"], correct: "C", hasDiagram: false },
            { topic: "الديناميكا", text: "إذا تضاعفت سرعة جسم ما، فإن طاقته الحركية:", options: ["تتضاعف", "تتربع (تصبح 4 أضعاف)", "تتضاعف ثلاث مرات", "لا تتغير"], correct: "B", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "مشتقة الدالة f(x) = e^x هي:", options: ["e^(x-1)", "x·e^(x-1)", "e^x", "1/e^x"], correct: "C", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "مشتقة الدالة f(x) = ln(x) هي:", options: ["1/x", "1/x²", "ln(x)/x", "x·ln(x)"], correct: "A", hasDiagram: false },
        ],

        "اللغة العربية": [
            // النحو والصرف
            { topic: "النحو والصرف", text: "ما إعراب كلمة 'العلمِ' في جملة 'يا طالب العلمِ اجتهد'؟", options: ["فاعل مرفوع بالضمة", "مفعول به منصوب بالفتحة", "مضاف إليه مجرور بالكسرة", "مبتدأ مؤخر مرفوع"], correct: "C", hasDiagram: false },
            { topic: "النحو والصرف", text: "الجملة الفعلية تبدأ بـ:", options: ["اسم", "فعل", "حرف", "ضمير"], correct: "B", hasDiagram: false },
            { topic: "النحو والصرف", text: "الفاعل في جملة 'نجح الطالبُ' هو:", options: ["نجح", "الطالبُ", "في", "لا يوجد فاعل"], correct: "B", hasDiagram: false },
            { topic: "النحو والصرف", text: "في جملة 'كان الجوُّ صافياً'، كلمة 'صافياً' إعرابها:", options: ["فاعل مرفوع", "مبتدأ", "خبر كان منصوب", "مضاف إليه مجرور"], correct: "C", hasDiagram: false },
            { topic: "النحو والصرف", text: "الفعل المضارع يُرفع بـ:", options: ["الفتحة", "الضمة", "الكسرة", "حذف النون"], correct: "B", hasDiagram: false },
            // البلاغة
            { topic: "البلاغة العربية", text: "في العبارة: 'الوقت كالسيف إن لم تقطعه قطعك' الصورة البلاغية هي:", options: ["استعارة", "تشبيه", "كناية", "مجاز مرسل"], correct: "B", hasDiagram: false },
            { topic: "البلاغة العربية", text: "السجع في النثر يقابله في الشعر:", options: ["الاستعارة", "الجناس", "القافية", "المجاز"], correct: "C", hasDiagram: false },
            { topic: "البلاغة العربية", text: "من أساليب المبالغة في البلاغة العربية:", options: ["التشبيه التمثيلي", "الاستعارة التصريحية", "التهكم والسخرية", "المبالغة (فَعّال، مِفعال، فَعول)"], correct: "D", hasDiagram: false },
            // النصوص الأدبية
            { topic: "النصوص الأدبية", text: "المتنبي شاعر في عصر:", options: ["الجاهلية", "صدر الإسلام", "العباسي", "الأندلسي"], correct: "C", hasDiagram: false },
            { topic: "النصوص الأدبية", text: "رواية 'الأيام' كتبها:", options: ["نجيب محفوظ", "طه حسين", "يوسف إدريس", "عباس العقاد"], correct: "B", hasDiagram: false },
            // تاريخ الأدب
            { topic: "تاريخ الأدب العربي", text: "مدرسة الديوان في الشعر العربي الحديث يمثلها:", options: ["أحمد شوقي وحافظ إبراهيم", "العقاد والمازني وشكري", "إيليا أبو ماضي وجبران خليل جبران", "بدر شاكر السياب ونازك الملائكة"], correct: "B", hasDiagram: false },
            { topic: "تاريخ الأدب العربي", text: "من رواد المسرح العربي المصري:", options: ["توفيق الحكيم", "نجيب محفوظ", "طه حسين", "يحيى حقي"], correct: "A", hasDiagram: false },
            // القراءة والفهم
            { topic: "القراءة والفهم", text: "الفكرة الرئيسية في نص ما هي:", options: ["أول جملة في النص دائماً", "الموضوع المحوري الذي يدور حوله النص", "آخر فقرة في النص", "العنوان فقط"], correct: "B", hasDiagram: false },
            { topic: "النحو والصرف", text: "الاسم الموصول 'الذي' يُستخدم مع:", options: ["المؤنث المفرد", "المذكر المفرد", "المثنى", "الجمع"], correct: "B", hasDiagram: false },
            { topic: "البلاغة العربية", text: "الاستعارة المكنية هي:", options: ["ذكر المشبه والمشبه به معاً", "حذف المشبه به والإشارة إليه بشيء من لوازمه", "تشبيه شيء بشيء آخر بأداة صريحة", "الكلام الذي ليس على ظاهره"], correct: "B", hasDiagram: false },
        ],

        "اللغة الإنجليزية": [
            { topic: "Grammar & Tenses", text: "Choose the correct option: By next year, she ________ her university degree.", options: ["will finish", "will have finished", "has finished", "is finishing"], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "She ________ in Cairo since 2010.", options: ["lived", "has lived", "is living", "was living"], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "If I ________ more time, I would study abroad.", options: ["have", "had", "will have", "would have"], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "The passive form of 'They built the house in 1990' is:", options: ["The house is built in 1990", "The house was built in 1990", "The house has been built in 1990", "The house will be built in 1990"], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "Choose the correct relative pronoun: 'The book ________ I read was amazing.'", options: ["who", "whom", "which", "whose"], correct: "C", hasDiagram: false },
            { topic: "Vocabulary & Idioms", text: "The word 'benevolent' means:", options: ["harmful", "kind and generous", "angry", "indifferent"], correct: "B", hasDiagram: false },
            { topic: "Vocabulary & Idioms", text: "The idiom 'Break a leg' means:", options: ["Get injured", "Good luck", "Stop working", "Run fast"], correct: "B", hasDiagram: false },
            { topic: "Vocabulary & Idioms", text: "Choose the synonym of 'eloquent':", options: ["silent", "articulate", "confused", "slow"], correct: "B", hasDiagram: false },
            { topic: "Translation Skills", text: "Translate: 'اتخذت الحكومة إجراءات صارمة لمكافحة الفساد.'", options: ["The government took strict measures to combat corruption.", "The government took weak steps against corruption.", "The officials fought against the people.", "Laws were broken by the government."], correct: "A", hasDiagram: false },
            { topic: "Reading Comprehension", text: "In a passage, a 'topic sentence' is:", options: ["The last sentence of a paragraph", "The sentence that states the main idea of a paragraph", "A supporting detail", "A concluding remark"], correct: "B", hasDiagram: false },
            { topic: "Writing Mechanics", text: "Which sentence uses correct punctuation?", options: ["She loves reading, however she prefers science.", "She loves reading; however, she prefers science.", "She loves reading however she prefers science.", "She loves reading however, she prefers science."], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "Choose the correct form: 'Neither of the students ________ present.'", options: ["were", "are", "was", "have been"], correct: "C", hasDiagram: false },
            { topic: "Vocabulary & Idioms", text: "The antonym of 'frugal' is:", options: ["thrifty", "extravagant", "careful", "modest"], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "The sentence 'He is used to working late' means:", options: ["He used to work late in the past", "He is accustomed to working late", "He will work late", "He refused to work late"], correct: "B", hasDiagram: false },
            { topic: "Writing Mechanics", text: "A 'thesis statement' in an essay appears:", options: ["In the conclusion", "In the middle of the body", "At the end of the introduction", "In every paragraph"], correct: "C", hasDiagram: false },
        ],

        "الجيولوجيا": [
            { topic: "الصخور النارية والرسوبية", text: "أي من الصخور التالية يصنف كصخر ناري جوفي حامضي؟", options: ["الجرانيت", "البازلت", "الرخام", "الحجر الرملي"], correct: "A", hasDiagram: false },
            { topic: "الصخور النارية والرسوبية", text: "الصخور الرسوبية تتكون بفعل:", options: ["الحرارة الشديدة فقط", "الضغط الشديد فقط", "ترسيب وتراكم المواد على مر الزمن", "الانصهار ثم التجمد"], correct: "C", hasDiagram: false },
            { topic: "الصخور النارية والرسوبية", text: "الرخام صخر متحول أصله:", options: ["حجر رملي", "الجرانيت", "الحجر الجيري", "البازلت"], correct: "C", hasDiagram: false },
            { topic: "المعادن والبلورات", text: "أصلب مادة معدنية طبيعية على مقياس موس هي:", options: ["الكوارتز", "التلق (الطلق)", "الألماس", "الكورندوم"], correct: "C", hasDiagram: false },
            { topic: "المعادن والبلورات", text: "معدن الهاليت (NaCl) يُعرف بـ:", options: ["الجبس", "ملح الطعام", "الفلسبار", "الكالسيت"], correct: "B", hasDiagram: false },
            { topic: "التراكيب الجيولوجية", text: "الحوض الترسيبي الذي تتجه فيه الطبقات للداخل يسمى:", options: ["حوضاً محدباً (Anticline)", "حوضاً مقعراً (Syncline)", "صدعاً عادياً", "صدعاً معكوساً"], correct: "B", hasDiagram: false },
            { topic: "التراكيب الجيولوجية", text: "الزلازل تُقاس باستخدام جهاز يُسمى:", options: ["الباروميتر", "الثيرموميتر", "السيزموغراف", "الكرونوميتر"], correct: "C", hasDiagram: false },
            { topic: "علم الجيولوجيا ومكونات الأرض", text: "الطبقة الأكثر صلابة في الأرض هي:", options: ["الغلاف الجوي", "اللب الصلب الداخلي", "الستار (الوشاح)", "القشرة الأرضية"], correct: "B", hasDiagram: false },
            { topic: "علم الجيولوجيا ومكونات الأرض", text: "نظرية 'ألفريد فيجنر' المشهورة في الجيولوجيا تتعلق بـ:", options: ["نشأة البراكين", "انجراف القارات", "تكوين الجبال فقط", "نظرية الانجراف الجوي"], correct: "B", hasDiagram: false },
            { topic: "الجيولوجيا البيئية", text: "الطاقة الجيوحرارية مصدرها:", options: ["ضوء الشمس", "حرارة باطن الأرض", "حركة الرياح", "أمواج البحار"], correct: "B", hasDiagram: false },
            { topic: "الجيولوجيا البيئية", text: "تلوث طبقة المياه الجوفية يمثل خطراً لأن:", options: ["تجديدها سريع جداً", "تجديدها بطيء جداً ويستغرق مئات السنين", "لا تستخدم إلا في الصناعة", "توجد في المناطق الصحراوية فقط"], correct: "B", hasDiagram: false },
            { topic: "المعادن والبلورات", text: "أي المعادن التالية يُعدّ من مجموعة السيليكات؟", options: ["الكالسيت", "الجبس", "الكوارتز", "الهاليت"], correct: "C", hasDiagram: false },
            { topic: "الصخور النارية والرسوبية", text: "طبقات الصخور الرسوبية تُساعد في تحديد:", options: ["درجة حرارة الأرض الداخلية", "العمر النسبي للطبقات الجيولوجية", "قوة الزلازل", "نوع الجنس البشري القديم"], correct: "B", hasDiagram: false },
            { topic: "التراكيب الجيولوجية", text: "البراكين تنشأ غالباً:", options: ["في وسط القارات البعيدة عن الحدود", "عند تباعد أو تقارب الصفائح التكتونية", "في المناطق القطبية فقط", "على السواحل البحرية فقط"], correct: "B", hasDiagram: false },
        ],

        "التاريخ": [
            { topic: "محمد علي وبناء مصر الحديثة", text: "في أي عام تم توقيع معاهدة لندن التي فرضت شروطاً على محمد علي؟", options: ["1805م", "1840م", "1882م", "1919م"], correct: "B", hasDiagram: false },
            { topic: "الحملة الفرنسية على مصر", text: "بقيت الحملة الفرنسية على مصر في الفترة:", options: ["1789-1800م", "1798-1801م", "1805-1820م", "1820-1840م"], correct: "B", hasDiagram: false },
            { topic: "الحملة الفرنسية على مصر", text: "من هزم الأسطول الفرنسي في معركة أبي قير البحرية؟", options: ["الأسطول العثماني", "الأسطول البريطاني بقيادة نيلسون", "الأسطول الروسي", "الأسطول الأمريكي"], correct: "B", hasDiagram: false },
            { topic: "محمد علي وبناء مصر الحديثة", text: "أحد الأعمال الكبرى التي أنجزها محمد علي في مصر:", options: ["بناء قناة السويس", "إنشاء الجيش المنظم الحديث والبعثات العلمية", "إعلان الجمهورية المصرية", "إلغاء نظام الالتزام فقط"], correct: "B", hasDiagram: false },
            { topic: "الحركة الوطنية والثورة العرابية", text: "قائد الثورة العرابية:", options: ["مصطفى كامل", "أحمد عرابي", "محمد فريد", "سعد زغلول"], correct: "B", hasDiagram: false },
            { topic: "الحركة الوطنية والثورة العرابية", text: "بدأت الاحتلال البريطاني لمصر عام:", options: ["1840م", "1869م", "1882م", "1919م"], correct: "C", hasDiagram: false },
            { topic: "ثورة 1919 والتحول السياسي", text: "قاد ثورة 1919 في مصر:", options: ["مصطفى النحاس", "سعد زغلول", "علي ماهر", "أحمد عرابي"], correct: "B", hasDiagram: false },
            { topic: "ثورة 1919 والتحول السياسي", text: "صدر دستور 1923 المصري في عهد:", options: ["محمد علي", "الخديوي إسماعيل", "الملك فؤاد الأول", "الملك فاروق"], correct: "C", hasDiagram: false },
            { topic: "مصر بعد الحرب العالمية الثانية", text: "قامت ثورة يوليو 1952 في عهد:", options: ["الملك فؤاد", "الملك فاروق", "الخديوي عباس", "الملك أحمد فؤاد الثاني"], correct: "B", hasDiagram: false },
            { topic: "مصر بعد الحرب العالمية الثانية", text: "تأميم قناة السويس أعلنه الرئيس جمال عبدالناصر عام:", options: ["1952م", "1954م", "1956م", "1967م"], correct: "C", hasDiagram: false },
            { topic: "الحملة الفرنسية على مصر", text: "اهتم نابليون باصطحاب علماء في حملته على مصر وأسفر ذلك عن:", options: ["وصف مصر وإصدار موسوعة ضخمة عنها", "ترجمة القرآن الكريم", "بناء الجامعة المصرية", "اكتشاف البترول في مصر"], correct: "A", hasDiagram: false },
            { topic: "محمد علي وبناء مصر الحديثة", text: "الحملات العسكرية التي شنها محمد علي شملت:", options: ["الجزيرة العربية واليونان والشام والسودان", "أوروبا الغربية فقط", "السودان فقط", "إيران والعراق فقط"], correct: "A", hasDiagram: false },
            { topic: "ثورة 1919 والتحول السياسي", text: "حزب الوفد المصري تأسس:", options: ["1907م", "1919م", "1923م", "1930م"], correct: "C", hasDiagram: false },
            { topic: "مصر بعد الحرب العالمية الثانية", text: "حرب أكتوبر 1973 خاضتها مصر لاسترداد:", options: ["قناة السويس", "سيناء والجولان", "قطاع غزة فقط", "الإسكندرية"], correct: "B", hasDiagram: false },
        ],

        "الجغرافيا": [
            { topic: "الجغرافيا السياسية والحدود", text: "مثال نموذجي للدولة الحبيسة (غير الساحلية) في أوروبا:", options: ["مصر", "سويسرا", "إيطاليا", "فرنسا"], correct: "B", hasDiagram: false },
            { topic: "الجغرافيا السياسية والحدود", text: "أكبر دولة في العالم من حيث المساحة:", options: ["الصين", "الولايات المتحدة", "روسيا", "كندا"], correct: "C", hasDiagram: false },
            { topic: "المقومات الطبيعية والبشرية للدولة", text: "المقومات الطبيعية للدولة تشمل:", options: ["اللغة والدين", "المساحة والموقع والسكان والثروات الطبيعية", "الحكومة والقوانين فقط", "الثقافة والتاريخ المشترك"], correct: "B", hasDiagram: false },
            { topic: "المقومات الطبيعية والبشرية للدولة", text: "الموقع الجغرافي لمصر يجعلها:", options: ["دولة عازلة بين قارتين", "حلقة وصل بين قارات ثلاث (آسيا وأفريقيا وأوروبا)", "دولة داخلية بعيدة عن البحار", "دولة جزيرية معزولة"], correct: "B", hasDiagram: false },
            { topic: "الحدود السياسية وأنواعها", text: "الحدود الطبيعية بين الدول تشمل:", options: ["خطوط العرض وخطوط الطول فقط", "الجبال والأنهار والبحار", "الحدود المرسومة بالاتفاقيات فقط", "الاتفاقيات الاقتصادية"], correct: "B", hasDiagram: false },
            { topic: "الحدود السياسية وأنواعها", text: "الحدود الفلكية (الهندسية) هي:", options: ["الحدود التي تتبع معالم طبيعية", "الحدود المرسومة على خطوط الطول والعرض", "الحدود التي تتبع توزيع السكان", "الحدود الاقتصادية البحرية"], correct: "B", hasDiagram: false },
            { topic: "التكتلات الاقتصادية والأحلاف", text: "الاتحاد الأوروبي يهدف في الأساس إلى:", options: ["التعاون العسكري فقط", "التكامل الاقتصادي والسياسي بين الدول الأعضاء", "إزالة الحدود الجغرافية نهائياً", "تأسيس عملة موحدة فقط"], correct: "B", hasDiagram: false },
            { topic: "التكتلات الاقتصادية والأحلاف", text: "تأسست منظمة (أوبك) OPEC لـ:", options: ["تنظيم تجارة الحديد والصلب", "تنسيق سياسات إنتاج البترول بين الدول المنتجة", "تحقيق التكامل العسكري", "إدارة موارد المياه العذبة"], correct: "B", hasDiagram: false },
            { topic: "النظام العالمي الجديد", text: "انتهت الحرب الباردة رسمياً بـ:", options: ["انهيار جدار برلين ثم تفكك الاتحاد السوفيتي عام 1991", "اتفاقية فرساي عام 1919", "أحداث سبتمبر 2001", "انتهاء الحرب العالمية الثانية 1945"], correct: "A", hasDiagram: false },
            { topic: "النظام العالمي الجديد", text: "المنظمة التي تختص بالسلام والأمن الدوليين:", options: ["صندوق النقد الدولي", "منظمة التجارة العالمية", "مجلس الأمن الدولي (الأمم المتحدة)", "البنك الدولي"], correct: "C", hasDiagram: false },
            { topic: "المقومات الطبيعية والبشرية للدولة", text: "الكثافة السكانية تُحسب بقسمة:", options: ["عدد السكان على معدل النمو", "عدد السكان على المساحة الكلية بالكيلومتر المربع", "المساحة على عدد المدن", "الناتج القومي على عدد السكان"], correct: "B", hasDiagram: false },
            { topic: "الجغرافيا السياسية والحدود", text: "دولة الفاتيكان هي المثال الأوضح على:", options: ["الدولة الجزيرية", "الدولة المدينة (city-state)", "الدولة الفيدرالية", "الدولة الكونفدرالية"], correct: "B", hasDiagram: false },
            { topic: "الحدود السياسية وأنواعها", text: "الحدود الإثنية أو الثقافية تستند إلى:", options: ["التضاريس الطبيعية", "الاتفاقيات العسكرية", "اللغة والقومية والدين", "المعايير الاقتصادية فقط"], correct: "C", hasDiagram: false },
            { topic: "النظام العالمي الجديد", text: "تسعى العولمة بصفة عامة إلى:", options: ["عزل الدول عن بعضها", "تعميق التفاوت الاقتصادي دائماً", "تكامل الاقتصادات والثقافات حول العالم", "حصر التجارة في الدول الكبرى فقط"], correct: "C", hasDiagram: false },
        ]
    };

    const EXTRA_REALISTIC_QUESTIONS = {
        "الفيزياء": [
            { topic: "الكهرباء والمغناطيسية", text: "وصلت ثلاث مقاومات 2Ω و 3Ω و 6Ω على التوازي. ما المقاومة المكافئة؟", options: ["1Ω", "2Ω", "3Ω", "11Ω"], correct: "A", hasDiagram: false },
            { topic: "الكهرباء والمغناطيسية", text: "سلك طوله 2m يتحرك عمودياً على مجال مغناطيسي شدته 0.5T بسرعة 4m/s. ما القوة الدافعة الكهربية المستحثة؟", options: ["1V", "2V", "4V", "8V"], correct: "C", hasDiagram: false },
            { topic: "الميكانيكا والكينماتيكا", text: "سيارة سرعتها 20m/s تباطأت بانتظام حتى السكون خلال 5s. ما مقدار عجلة التباطؤ؟", options: ["2m/s²", "4m/s²", "5m/s²", "10m/s²"], correct: "B", hasDiagram: false },
            { topic: "الميكانيكا والكينماتيكا", text: "إذا تضاعفت كتلة جسم وثبتت سرعته، فإن زخمه الخطي:", options: ["ينقص للنصف", "يثبت", "يتضاعف", "يتضاعف أربع مرات"], correct: "C", hasDiagram: false },
            { topic: "الضوء والأمواج", text: "عند انتقال الضوء من الهواء إلى الزجاج فإنه غالباً:", options: ["تزداد سرعته وينكسر مبتعداً عن العمود", "تقل سرعته وينكسر مقترباً من العمود", "تزداد سرعته ولا ينكسر", "تقل سرعته وينكسر مبتعداً عن العمود"], correct: "B", hasDiagram: false },
            { topic: "الحرارة والديناميكا الحرارية", text: "إذا اكتسب غاز حرارة 500J وبذل شغلاً 200J، فما التغير في طاقته الداخلية؟", options: ["300J", "500J", "700J", "-300J"], correct: "A", hasDiagram: false },
            { topic: "الفيزياء الحديثة", text: "إذا زاد تردد الضوء الساقط في الظاهرة الكهروضوئية مع ثبات المعدن، فإن طاقة الإلكترونات المنبعثة:", options: ["تقل", "تزداد", "تنعدم دائماً", "لا تتغير"], correct: "B", hasDiagram: false },
            { topic: "الكهرباء والمغناطيسية", text: "مصباح قدرته 60W يعمل على فرق جهد 220V. ما شدة التيار التقريبية؟", options: ["0.27A", "1.5A", "3.7A", "13.2A"], correct: "A", hasDiagram: false }
        ],
        "الكيمياء": [
            { topic: "الكيمياء العضوية", text: "أي المركبات الآتية يعطي راسباً أبيض مع محلول نترات الفضة الأمونياكية؟", options: ["الإيثان", "الإيثين", "الإيثاين", "البنزين"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء العضوية", text: "أكسدة الإيثانول أكسدة تامة تعطي غالباً:", options: ["إيثان", "إيثين", "حمض إيثانويك", "إيثاين"], correct: "C", hasDiagram: false },
            { topic: "الكيمياء التحليلية", text: "محلول تركيزه 0.01M من حمض قوي أحادي البروتون يكون pH له تقريباً:", options: ["1", "2", "7", "12"], correct: "B", hasDiagram: false },
            { topic: "الكيمياء الكهربية", text: "في الخلية الجلفانية تتحول الطاقة:", options: ["كيميائية إلى كهربائية", "كهربائية إلى كيميائية", "حرارية إلى ضوئية", "نووية إلى حرارية"], correct: "A", hasDiagram: false },
            { topic: "الكيمياء الفيزيائية", text: "العامل الحفاز يزيد سرعة التفاعل لأنه:", options: ["يزيد حرارة النواتج", "يقلل طاقة التنشيط", "يزيد كتلة المتفاعلات", "يغير قيمة ثابت الاتزان دائماً"], correct: "B", hasDiagram: false },
            { topic: "العناصر الانتقالية", text: "تتميز العناصر الانتقالية غالباً بأنها تكون:", options: ["أملاحاً عديمة اللون دائماً", "أيونات ومركبات ملونة", "غازات خاملة", "لافلزات ضعيفة التوصيل"], correct: "B", hasDiagram: false },
            { topic: "الكيمياء التحليلية", text: "عند إضافة محلول كلوريد الباريوم إلى محلول يحتوي على أيون الكبريتات يتكون راسب:", options: ["أبيض من BaSO₄", "أسود من BaS", "أصفر من BaCl₂", "أحمر من SO₂"], correct: "A", hasDiagram: false },
            { topic: "الكيمياء الفيزيائية", text: "إذا كان التفاعل طارداً للحرارة فإن إشارة ΔH تكون:", options: ["موجبة", "سالبة", "تساوي صفراً دائماً", "غير معرفة"], correct: "B", hasDiagram: false }
        ],
        "الأحياء": [
            { topic: "الخلية", text: "العضية المسؤولة أساساً عن إنتاج الطاقة في الخلية هي:", options: ["الريبوسوم", "الميتوكوندريا", "الجسم المركزي", "جهاز جولجي"], correct: "B", hasDiagram: false },
            { topic: "الخلية", text: "تتم عملية البناء الضوئي في النبات داخل:", options: ["الميتوكوندريا", "البلاستيدات الخضراء", "النواة", "الفجوة العصارية"], correct: "B", hasDiagram: false },
            { topic: "الوراثة وعلم الجينات", text: "إذا كان الطراز الجيني لفرد Aa، فإنه يسمى:", options: ["نقي سائد", "نقي متنحٍ", "هجين", "عديم الصفة"], correct: "C", hasDiagram: false },
            { topic: "الحمض النووي DNA", text: "الوحدة البنائية للحمض النووي DNA هي:", options: ["الحمض الأميني", "النيوكليوتيدة", "الجلوكوز", "الجليسرول"], correct: "B", hasDiagram: false },
            { topic: "التنسيق الهرموني", text: "ارتفاع نسبة الجلوكوز في الدم يحفز إفراز:", options: ["الجلوكاجون", "الإنسولين", "الأدرينالين", "الثيروكسين"], correct: "B", hasDiagram: false },
            { topic: "الدعامة والحركة", text: "العلاقة بين العضلة ذات الرأسين والعضلة ثلاثية الرؤوس في الذراع علاقة:", options: ["تآزر فقط", "تضاد", "تماثل", "لا علاقة"], correct: "B", hasDiagram: false },
            { topic: "التكاثر في الكائنات الحية", text: "يحدث الإخصاب في الإنسان غالباً داخل:", options: ["المبيض", "قناة فالوب", "الرحم", "عنق الرحم"], correct: "B", hasDiagram: false },
            { topic: "المناعة", text: "الخلايا الليمفاوية B مسؤولة أساساً عن إنتاج:", options: ["الإنزيمات الهاضمة", "الأجسام المضادة", "الهيموجلوبين", "الأنسولين"], correct: "B", hasDiagram: false }
        ],
        "الرياضيات": [
            { topic: "التفاضل والتكامل", text: "إذا f(x)=3x²-4x+1، فإن f'(2) تساوي:", options: ["4", "8", "12", "16"], correct: "B", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "قيمة ∫₀² 3x² dx تساوي:", options: ["4", "6", "8", "12"], correct: "C", hasDiagram: false },
            { topic: "الجبر والهندسة الفراغية", text: "إذا كان مجموع جذري المعادلة x²-5x+6=0 هو:", options: ["2", "3", "5", "6"], correct: "C", hasDiagram: false },
            { topic: "الجبر والهندسة الفراغية", text: "المسافة بين النقطتين (1,2) و(4,6) تساوي:", options: ["3", "4", "5", "7"], correct: "C", hasDiagram: false },
            { topic: "الاستاتيكا", text: "إذا أثرت قوتان متساويتان ومتضادتان وعلى نفس خط العمل، فإن محصلتهما:", options: ["تساوي إحداهما", "تساوي ضعف إحداهما", "تساوي صفراً", "لا يمكن تحديدها"], correct: "C", hasDiagram: false },
            { topic: "الديناميكا", text: "جسم كتلته 2kg يتحرك بسرعة 3m/s. طاقته الحركية تساوي:", options: ["3J", "6J", "9J", "18J"], correct: "C", hasDiagram: false },
            { topic: "الاحتمالات والإحصاء", text: "إذا كان احتمال وقوع حدث 0.25، فإن احتمال عدم وقوعه:", options: ["0.25", "0.50", "0.75", "1.25"], correct: "C", hasDiagram: false },
            { topic: "التفاضل والتكامل", text: "نقطة السكون للدالة f(x)=x²-6x+5 تحدث عند x =", options: ["1", "2", "3", "6"], correct: "C", hasDiagram: false }
        ],
        "اللغة العربية": [
            { topic: "النحو والصرف", text: "نوع لا في جملة: لا طالبَ علمٍ مهملٌ هو:", options: ["ناهية", "نافية للجنس", "عاطفة", "زائدة"], correct: "B", hasDiagram: false },
            { topic: "النحو والصرف", text: "كلمة 'مجتهدون' جمع:", options: ["تكسير", "مذكر سالم", "مؤنث سالم", "اسم جمع"], correct: "B", hasDiagram: false },
            { topic: "البلاغة العربية", text: "في قولنا: 'العلم نور' الصورة البلاغية هي:", options: ["كناية", "تشبيه بليغ", "طباق", "جناس"], correct: "B", hasDiagram: false },
            { topic: "البلاغة العربية", text: "الجمع بين كلمتين متضادتين مثل 'الليل والنهار' يسمى:", options: ["طباق", "سجع", "استعارة", "مجاز مرسل"], correct: "A", hasDiagram: false },
            { topic: "النصوص الأدبية", text: "الغرض الشعري الذي يغلب عليه ذكر محاسن المتوفى يسمى:", options: ["المدح", "الرثاء", "الهجاء", "الغزل"], correct: "B", hasDiagram: false },
            { topic: "القراءة والفهم", text: "الفكرة الرئيسة للنص تُستخلص غالباً من:", options: ["تفصيل واحد فقط", "مجموع الأفكار والعنوان والسياق", "علامات الترقيم فقط", "عدد الكلمات"], correct: "B", hasDiagram: false },
            { topic: "النحو والصرف", text: "الفعل 'استخرج' مزيد بحروف عددها:", options: ["حرف واحد", "حرفان", "ثلاثة أحرف", "أربعة أحرف"], correct: "C", hasDiagram: false },
            { topic: "الأدب العربي", text: "من سمات مدرسة الإحياء والبعث:", options: ["هدم الوزن والقافية تماماً", "محاكاة التراث مع تجديد محدود", "الاعتماد على الرمز الغامض فقط", "كتابة الشعر العامي فقط"], correct: "B", hasDiagram: false }
        ],
        "اللغة الإنجليزية": [
            { topic: "Grammar & Tenses", text: "Choose the correct answer: By next Friday, she ________ the report.", options: ["finishes", "will have finished", "finished", "has finished"], correct: "B", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "If he had studied harder, he ________ the exam.", options: ["passes", "would pass", "would have passed", "will pass"], correct: "C", hasDiagram: false },
            { topic: "Grammar & Tenses", text: "Choose the correct passive form: 'People speak English worldwide.'", options: ["English speaks worldwide.", "English is spoken worldwide.", "English was spoken worldwide.", "English has spoken worldwide."], correct: "B", hasDiagram: false },
            { topic: "Vocabulary & Idioms", text: "The word 'scarce' is closest in meaning to:", options: ["rare", "common", "cheap", "clear"], correct: "A", hasDiagram: false },
            { topic: "Vocabulary & Idioms", text: "Choose the correct phrasal verb: 'Please ________ the form before submission.'", options: ["fill in", "look after", "give up", "turn off"], correct: "A", hasDiagram: false },
            { topic: "Writing Mechanics", text: "Which sentence is grammatically correct?", options: ["Every student have a book.", "Every student has a book.", "Every students has a book.", "Every student are ready."], correct: "B", hasDiagram: false },
            { topic: "Translation Skills", text: "Translate: 'يجب أن نحافظ على البيئة للأجيال القادمة.'", options: ["We must protect the environment for future generations.", "We should destroy the environment soon.", "The environment protects future generations.", "Generations must avoid the environment."], correct: "A", hasDiagram: false },
            { topic: "Reading Comprehension", text: "The writer's purpose in a persuasive text is usually to:", options: ["tell a story only", "convince the reader of an opinion", "list dates only", "describe a place without opinion"], correct: "B", hasDiagram: false }
        ],
        "الجيولوجيا": [
            { topic: "الصخور النارية والرسوبية", text: "الصخر الناري السطحي الذي يقابل الجرانيت في التركيب تقريباً هو:", options: ["الريوليت", "البازلت", "الرخام", "الطفلة"], correct: "A", hasDiagram: false },
            { topic: "المعادن والبلورات", text: "الخاصية التي تعبر عن مقاومة المعدن للخدش تسمى:", options: ["المخدش", "الصلادة", "البريق", "الكثافة"], correct: "B", hasDiagram: false },
            { topic: "التراكيب الجيولوجية", text: "الصدع العادي ينتج غالباً عن قوى:", options: ["شد", "ضغط", "قص فقط", "دوران فقط"], correct: "A", hasDiagram: false },
            { topic: "التراكيب الجيولوجية", text: "الطية المحدبة يكون أقدم الصخور غالباً في:", options: ["الأطراف", "المركز", "السطح فقط", "لا تظهر طبقات قديمة"], correct: "B", hasDiagram: false },
            { topic: "علم الجيولوجيا ومكونات الأرض", text: "الغلاف الصخري يتكون من:", options: ["القشرة فقط", "القشرة والجزء العلوي الصلب من الوشاح", "اللب الخارجي فقط", "الغلاف المائي"], correct: "B", hasDiagram: false },
            { topic: "الجيولوجيا البيئية", text: "من أخطار التعدين غير المنظم:", options: ["زيادة خصوبة التربة دائماً", "تلوث المياه والتربة", "انخفاض النشاط الزلزالي", "منع الانهيارات الأرضية"], correct: "B", hasDiagram: false },
            { topic: "الصخور النارية والرسوبية", text: "وجود حفريات في صخر ما يدل غالباً على أنه:", options: ["ناري جوفي", "رسوبي", "متحول عالي الدرجة", "معدني نقي"], correct: "B", hasDiagram: false },
            { topic: "المعادن والبلورات", text: "انفصام المعدن يعني:", options: ["كسره في اتجاهات غير منتظمة", "انفصاله على مستويات ضعف منتظمة", "تغير لونه بالحرارة", "ذوبانه في الماء"], correct: "B", hasDiagram: false }
        ],
        "التاريخ": [
            { topic: "الحملة الفرنسية على مصر", text: "كان من نتائج الحملة الفرنسية العلمية:", options: ["إصدار كتاب وصف مصر", "إلغاء الحكم العثماني فوراً", "إنشاء جامعة القاهرة", "تأميم قناة السويس"], correct: "A", hasDiagram: false },
            { topic: "محمد علي وبناء مصر الحديثة", text: "اعتمد محمد علي في بناء جيشه الحديث على:", options: ["نظام الالتزام فقط", "التجنيد والتعليم العسكري", "القوات البريطانية", "إلغاء المدارس"], correct: "B", hasDiagram: false },
            { topic: "الحركة الوطنية والثورة العرابية", text: "كان من مطالب العرابيين الأساسية:", options: ["زيادة التدخل الأجنبي", "إقالة وزارة رياض وتشكيل مجلس نواب", "إلغاء الجيش المصري", "عودة الحملة الفرنسية"], correct: "B", hasDiagram: false },
            { topic: "ثورة 1919 والتحول السياسي", text: "ارتبطت ثورة 1919 بمطلب رئيسي هو:", options: ["الاستقلال والدستور", "إلغاء التعليم", "الانضمام للدولة العثمانية", "تأسيس قناة السويس"], correct: "A", hasDiagram: false },
            { topic: "مصر بعد الحرب العالمية الثانية", text: "الجلاء البريطاني عن مصر تم توقيع اتفاقيته عام:", options: ["1923م", "1936م", "1954م", "1973م"], correct: "C", hasDiagram: false },
            { topic: "مصر بعد الحرب العالمية الثانية", text: "من نتائج تأميم قناة السويس:", options: ["العدوان الثلاثي على مصر", "ثورة 1919", "الحملة الفرنسية", "معاهدة لندن"], correct: "A", hasDiagram: false },
            { topic: "محمد علي وبناء مصر الحديثة", text: "اهتم محمد علي بإرسال البعثات إلى أوروبا بهدف:", options: ["السياحة فقط", "نقل العلوم والخبرات الحديثة", "تقليل عدد السكان", "إلغاء الصناعة"], correct: "B", hasDiagram: false },
            { topic: "ثورة 1919 والتحول السياسي", text: "تصريح 28 فبراير 1922 كان متعلقاً بـ:", options: ["استقلال مصر المشروط", "تأميم قناة السويس", "معاهدة لندن", "ثورة يوليو"], correct: "A", hasDiagram: false }
        ],
        "الجغرافيا": [
            { topic: "الجغرافيا السياسية والحدود", text: "الدولة الجزرية هي التي:", options: ["لا تطل على بحار", "تحيط بها المياه من جميع الجهات", "تقع داخل دولة أخرى", "ليس لها حدود سياسية"], correct: "B", hasDiagram: false },
            { topic: "الحدود السياسية وأنواعها", text: "الحدود التي ترسم قبل تعمير المنطقة تسمى:", options: ["حدود لاحقة", "حدود سابقة", "حدود طبيعية", "حدود دينية"], correct: "B", hasDiagram: false },
            { topic: "المقومات الطبيعية والبشرية للدولة", text: "من المقومات البشرية لقوة الدولة:", options: ["المناخ", "الموقع", "حجم السكان ومستوى التعليم", "الموارد المعدنية فقط"], correct: "C", hasDiagram: false },
            { topic: "التكتلات الاقتصادية والأحلاف", text: "اتفاقية التجارة الحرة تهدف غالباً إلى:", options: ["زيادة الرسوم الجمركية", "تقليل القيود على تبادل السلع", "منع الاستثمار", "إغلاق الحدود السياسية"], correct: "B", hasDiagram: false },
            { topic: "النظام العالمي الجديد", text: "تعدد الأقطاب في النظام الدولي يعني:", options: ["وجود قوة واحدة فقط", "وجود عدة قوى مؤثرة عالمياً", "غياب المنظمات الدولية", "عدم وجود اقتصاد عالمي"], correct: "B", hasDiagram: false },
            { topic: "الجغرافيا السياسية والحدود", text: "العاصمة السياسية للدولة تؤدي وظيفة أساسية هي:", options: ["إدارة شؤون الحكم", "استخراج المعادن فقط", "إنتاج الغذاء فقط", "إلغاء الحدود"], correct: "A", hasDiagram: false },
            { topic: "المقومات الطبيعية والبشرية للدولة", text: "كلما زادت مساحة الدولة دون إدارة فعالة قد يؤدي ذلك إلى:", options: ["سهولة السيطرة دائماً", "صعوبات في الإدارة والاتصال", "انعدام الموارد", "اختفاء الحدود"], correct: "B", hasDiagram: false },
            { topic: "النظام العالمي الجديد", text: "من آثار العولمة الاقتصادية:", options: ["زيادة الترابط بين الأسواق", "إغلاق التجارة الدولية", "إلغاء التكنولوجيا", "منع انتقال رؤوس الأموال"], correct: "A", hasDiagram: false }
        ]
    };

    Object.entries(EXTRA_REALISTIC_QUESTIONS).forEach(([subject, questions]) => {
        if (!QUESTION_BANK[subject]) QUESTION_BANK[subject] = [];
        QUESTION_BANK[subject].push(...questions);
    });

    // ==========================================
    // Seed Questions Function (uses real bank)
    // ==========================================
    function seedQuestions(subjectName = "الفيزياء") {
        const bank = QUESTION_BANK[subjectName];
        
        if (bank && bank.length > 0) {
            // Shuffle and use all real questions, padding to 50 if needed
            const shuffled = [...bank].sort(() => Math.random() - 0.5);
            const qList = [];
            for (let i = 0; i < 50; i++) {
                const q = shuffled[i % shuffled.length];
                qList.push({
                    index: i,
                    topic: q.topic,
                    text: q.text,
                    options: [...q.options],
                    correct: q.correct,
                    hasDiagram: q.hasDiagram || false
                });
            }
            appState.exam.questions = qList;
        } else {
            // Fallback generic questions
            const topicsMap = {
                "الفيزياء": ["الكهرباء والمغناطيسية", "الفيزياء الحديثة", "الميكانيكا والكينماتيكا", "الضوء والأمواج", "الحرارة والديناميكا الحرارية"],
                "الكيمياء": ["الكيمياء العضوية", "الكيمياء التحليلية", "الكيمياء الكهربية", "الكيمياء الفيزيائية", "العناصر الانتقالية"]
            };
            const topics = topicsMap[subjectName] || ["عام"];
            const qList = [];
            for (let i = 0; i < 50; i++) {
                qList.push({
                    index: i,
                    topic: topics[i % topics.length],
                    text: `سؤال رقم ${i + 1} في مادة ${subjectName} – الموضوع: ${topics[i % topics.length]}`,
                    options: ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
                    correct: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                    hasDiagram: false
                });
            }
            appState.exam.questions = qList;
        }
    }

    seedQuestions();

    // ==========================================
    // LocalStorage State Handlers
    // ==========================================
    function safeParseJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            console.warn(`تعذر قراءة ${key} من التخزين المحلي:`, err);
            localStorage.removeItem(key);
            return fallback;
        }
    }

    function loadStateFromLocalStorage() {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode !== null) {
            appState.darkMode = savedDarkMode === "true";
            if (darkToggle) darkToggle.checked = appState.darkMode;
            if (appState.darkMode) {
                document.body.classList.add("dark-theme");
            } else {
                document.body.classList.remove("dark-theme");
            }
        }

        const savedUser = safeParseJSON("userStats", null);
        if (savedUser) {
            appState.user = savedUser;
            updateUserStatsUI();
        }

        const savedGroups = safeParseJSON("studyGroups", null);
        if (savedGroups) {
            appState.studyGroups = savedGroups;
        }

        const savedNotes = safeParseJSON("studyNotes", null);
        if (savedNotes) {
            appState.notes = savedNotes;
        }
        // تم حذف الملاحظات التجريبية

        const savedCustomQuestions = safeParseJSON("customQuestions", null);
        if (Array.isArray(savedCustomQuestions)) {
            appState.customQuestions = savedCustomQuestions;
        }
    }

    function applyPersistedState(savedState) {
        if (!savedState || typeof savedState !== "object") return;

        if (typeof savedState.darkMode === "boolean") {
            appState.darkMode = savedState.darkMode;
            if (darkToggle) darkToggle.checked = appState.darkMode;
            document.body.classList.toggle("dark-theme", appState.darkMode);
        }

        if (savedState.user && typeof savedState.user === "object") {
            appState.user = { ...appState.user, ...savedState.user };
        }

        if (Array.isArray(savedState.studyGroups)) {
            appState.studyGroups = savedState.studyGroups;
        }

        if (Array.isArray(savedState.notes)) {
            appState.notes = savedState.notes;
        }

        if (Array.isArray(savedState.customQuestions)) {
            appState.customQuestions = savedState.customQuestions;
        }

        updateUserStatsUI();
        if (typeof renderGroups === "function") renderGroups();
        if (typeof renderNotes === "function") renderNotes();
        saveStateToLocalStorage(false);
    }

    function getPersistableState() {
        return {
            darkMode: appState.darkMode,
            user: appState.user,
            studyGroups: appState.studyGroups,
            notes: appState.notes,
            customQuestions: appState.customQuestions
        };
    }

    let firebaseSaveTimer = null;

    async function getFirebaseBackend() {
        try {
            if (window.examBankFirebase) return window.examBankFirebase;
            if (window.examBankFirebaseReady) return await window.examBankFirebaseReady;
        } catch (error) {
            console.warn("تعذر الاتصال بـ Firebase:", error);
        }
        return null;
    }

    async function loadStateFromFirebase() {
        const firebaseBackend = await getFirebaseBackend();
        if (!firebaseBackend || typeof firebaseBackend.loadUserState !== "function") return;

        try {
            const cloudState = await firebaseBackend.loadUserState();
            if (cloudState) {
                applyPersistedState(cloudState);
                showToast("تم تحميل بياناتك من Firebase", "success");
            }
        } catch (error) {
            console.warn("تعذر تحميل البيانات من Firebase:", error);
            showToast("Firebase غير متاح حاليًا، نستخدم التخزين المحلي.", "info");
        }
    }

    function queueFirebaseSave() {
        clearTimeout(firebaseSaveTimer);
        firebaseSaveTimer = setTimeout(async () => {
            const firebaseBackend = await getFirebaseBackend();
            if (!firebaseBackend || typeof firebaseBackend.saveUserState !== "function") return;

            try {
                await firebaseBackend.saveUserState(getPersistableState());
            } catch (error) {
                console.warn("تعذر حفظ البيانات في Firebase:", error);
            }
        }, 600);
    }

    function saveStateToLocalStorage(syncFirebase = true) {
        localStorage.setItem("darkMode", appState.darkMode);
        localStorage.setItem("userStats", JSON.stringify(appState.user));
        localStorage.setItem("studyGroups", JSON.stringify(appState.studyGroups));
        localStorage.setItem("studyNotes", JSON.stringify(appState.notes));
        localStorage.setItem("customQuestions", JSON.stringify(appState.customQuestions));
        if (syncFirebase) queueFirebaseSave();
    }

    // تحديث صورة المستخدم بناءً على الاسم
    function updateUserAvatar() {
        const userAvatarImg = document.getElementById("user-avatar-img");
        if (!userAvatarImg) return;
        
        // استخدام DiceBear API لتوليد avatar فريد لكل مستخدم
        if (appState.user.name) {
            const avatarUrl = generateInitialAvatar(appState.user.name);
            appState.user.avatar = avatarUrl;
            userAvatarImg.src = avatarUrl;
            userAvatarImg.alt = appState.user.name;
        } else {
            // صورة افتراضية عند عدم وجود اسم
            const defaultAvatar = generateInitialAvatar("Student");
            appState.user.avatar = defaultAvatar;
            userAvatarImg.src = defaultAvatar;
            userAvatarImg.alt = "Student";
        }
    }

    function updateUserStatsUI() {
        updateUserAvatar(); // تحديث الصورة أولاً
        if (usernameHeader) usernameHeader.textContent = appState.user.name || "Ø·Ø§Ù„Ø¨";
        if (settingsNameInput) settingsNameInput.value = appState.user.name || "";
        
        const settingsEmail = document.getElementById("settings-email");
        if (settingsEmail) settingsEmail.value = appState.user.email || "";
        
        const settingsNotifications = document.getElementById("settings-notifications");
        if (settingsNotifications && appState.user.notifications !== undefined) {
            settingsNotifications.checked = appState.user.notifications;
        }

        const xpEl = document.getElementById("dashboard-xp");
        if (xpEl) xpEl.textContent = Number(appState.user.xp).toLocaleString();

        const solvedEl = document.getElementById("dashboard-solved");
        if (solvedEl) solvedEl.textContent = Number(appState.user.solvedCount).toLocaleString();

        const streakEl = document.getElementById("dashboard-streak");
        if (streakEl) streakEl.textContent = `${appState.user.streak} يومًا 🔥`;

        const accuracyRing = document.getElementById("dashboard-accuracy-ring");
        const accuracyVal = document.getElementById("dashboard-accuracy-value");
        if (accuracyRing && accuracyVal) {
            accuracyRing.setAttribute("data-percentage", appState.user.accuracy);
            accuracyVal.textContent = `${appState.user.accuracy}%`;
            const circleBar = accuracyRing.querySelector(".progress-ring-bar");
            if (circleBar) {
                const radius = circleBar.r.baseVal.value;
                const circumference = 2 * Math.PI * radius;
                circleBar.style.strokeDasharray = `${circumference} ${circumference}`;
                const offset = circumference - (appState.user.accuracy / 100) * circumference;
                circleBar.style.strokeDashoffset = offset;
            }
        }
    }

    // ==========================================
    // DOM Element Selectors
    // ==========================================
    const sidebar = document.querySelector(".sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const menuToggle = document.getElementById("menu-toggle");
    const menuItems = document.querySelectorAll(".menu-item");
    const contentViews = document.querySelectorAll(".content-view");
    const globalSearch = document.getElementById("global-search");
    
    const bellTrigger = document.getElementById("bell-trigger");
    const notificationDropdown = document.getElementById("notification-dropdown");
    
    const proModalTrigger = document.getElementById("btn-pro-trigger");
    const proModal = document.getElementById("pro-modal");
    
    const openCreateGroupBtn = document.getElementById("btn-open-create-group");
    const createGroupModal = document.getElementById("create-group-modal");
    const createGroupForm = document.getElementById("create-group-form");
    const groupsCardsContainer = document.getElementById("groups-cards-container");
    const groupTagsContainer = document.getElementById("group-tags-container");
    const groupSearchInput = document.getElementById("group-search-input");
    
    const subjectSearchInput = document.getElementById("subject-search-input");
    const startStudyBtn = document.querySelector(".btn-start-study");
    const startTestQuickBtn = document.querySelector(".btn-start-test-quick");
    const viewAllSubjectsBtn = document.querySelector(".btn-view-all-subjects");
    
    const darkToggle = document.getElementById("dark-mode-toggle");
    const settingsNameInput = document.getElementById("settings-name");
    const saveSettingsBtn = document.getElementById("btn-save-settings");
    const usernameHeader = document.querySelector(".username");
    
    const examView = document.getElementById("exam-view");
    const questionsGridMap = document.getElementById("questions-grid-map");
    const questionIndexTag = document.getElementById("question-index-tag");
    const questionTopicBadge = document.getElementById("question-topic");
    const questionTextContent = document.getElementById("question-text-content");
    const circuitDiagramContainer = document.getElementById("circuit-diagram");
    const originalCircuitDiagramMarkup = circuitDiagramContainer ? circuitDiagramContainer.innerHTML : "";
    const examOptionsContainer = document.getElementById("exam-options-container");
    const btnPrevQuestion = document.getElementById("btn-prev-question");
    const btnNextQuestion = document.getElementById("btn-next-question");
    const btnFlagQuestion = document.getElementById("btn-flag-question");
    const examTimerDisplay = document.getElementById("exam-timer");
    const btnExitExam = document.getElementById("btn-exit-exam");
    const examProgressBar = document.getElementById("exam-progress-bar");
    const progressPercentageDisplay = document.getElementById("progress-percentage-display");
    const answeredCountDisplay = document.getElementById("answered-count-display");
    
    const examResultsModal = document.getElementById("exam-results-modal");
    const examScoreText = document.getElementById("exam-score-text");
    const examFeedbackText = document.getElementById("exam-feedback-text");
    const resultCorrectCount = document.getElementById("result-correct-count");
    const resultWrongCount = document.getElementById("result-wrong-count");
    const resultTimeSpent = document.getElementById("result-time-spent");
    const btnReviewAnswers = document.getElementById("btn-review-answers");
    const btnReturnHome = document.getElementById("btn-return-home");
    const mainFooter = document.getElementById("main-footer");
    const closeModalButtons = document.querySelectorAll(".btn-close-modal, .btn-close-modal-btn");

    // Load state after DOM selectors
    loadStateFromLocalStorage();
    loadStateFromFirebase();

    // تحميل اسم المستخدم من صفحة اللوجن إذا لم يكن محفوظاً في الحالة
    (function syncLoginName() {
        const loginName = localStorage.getItem('userName');
        const loginEmail = localStorage.getItem('userEmail');
        const stateOwnerEmail = localStorage.getItem('appStateOwnerEmail') || "";
        const nameChanged = Boolean(loginName) && appState.user.name !== loginName;
        const emailChanged = (loginEmail || "") !== (appState.user.email || "");

        if (!loginName && !loginEmail) return;

        if (loginEmail && stateOwnerEmail && stateOwnerEmail !== loginEmail) {
            resetUserScopedState(loginName || "", loginEmail);
        }

        if (loginName) appState.user.name = loginName;
        appState.user.email = loginEmail || "";
        if (loginEmail) localStorage.setItem('appStateOwnerEmail', loginEmail);

        if (nameChanged || emailChanged) {
            saveStateToLocalStorage(false);
        }

        updateUserStatsUI();
    })();

    // ==========================================
    // Core SPA View Switcher
    // ==========================================
    function switchView(targetViewId) {
        if (targetViewId !== "exam-view" && appState.exam.isActive) {
            showCustomConfirm(
                "إنهاء الاختبار؟",
                "هل أنت متأكد من رغبتك في إنهاء الاختبار وتصحيح إجاباتك؟",
                () => {
                    submitExam();
                    appState.exam.isActive = false;
                    switchView(targetViewId);
                }
            );
            return;
        }

        appState.currentView = targetViewId;

        contentViews.forEach(view => { view.classList.remove("active"); });
        
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.add("active");
            playViewAnimations(targetView);
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        }

        menuItems.forEach(item => {
            if (item.getAttribute("data-target") === targetViewId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        if (targetViewId === "exam-view") {
            document.body.classList.add("exam-mode-active");
            if (sidebar) sidebar.classList.add("sidebar-exam-hidden");
        } else {
            document.body.classList.remove("exam-mode-active");
            if (sidebar) sidebar.classList.remove("sidebar-exam-hidden");
        }

        if (targetViewId === "home-view") {
            if (mainFooter) mainFooter.style.display = "flex";
        } else {
            if (mainFooter) mainFooter.style.display = "none";
        }

        if (window.innerWidth <= 992) {
            if (typeof closeMobileSidebar === "function") {
                closeMobileSidebar();
            } else if (sidebar) {
                sidebar.classList.remove("active");
            }
        } else if (sidebar) {
            sidebar.classList.remove("active");
        }
        refreshIcons();
    }

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            switchView(target);
        });
    });

    if (startStudyBtn) startStudyBtn.addEventListener("click", () => switchView("qbank-view"));
    if (viewAllSubjectsBtn) viewAllSubjectsBtn.addEventListener("click", () => switchView("qbank-view"));
    if (startTestQuickBtn) startTestQuickBtn.addEventListener("click", () => startExam("الفيزياء"));

    // ==========================================
    // Sidebar open/close helpers (mobile)
    // ==========================================
    function openMobileSidebar() {
        sidebar.classList.add("active");
        if (sidebarOverlay) {
            sidebarOverlay.classList.add("active");
            sidebarOverlay.setAttribute("aria-hidden", "false");
        }
        document.body.style.overflow = "hidden";
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("active");
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
            sidebarOverlay.setAttribute("aria-hidden", "true");
        }
        document.body.style.overflow = "";
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.innerWidth <= 992) {
                if (sidebar.classList.contains("active")) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
            } else {
                document.body.classList.toggle("sidebar-hidden");
            }
        });
    }

    // Close sidebar when overlay is clicked
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            closeMobileSidebar();
        });
    }

    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && e.target !== menuToggle) {
                closeMobileSidebar();
            }
        }
    });


    // ==========================================
    // Dropdown and Modal Handling
    // ==========================================
    if (bellTrigger) {
        bellTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle("active");
        });
    }

    document.addEventListener("click", () => {
        if (notificationDropdown) notificationDropdown.classList.remove("active");
    });

    function openModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add("active");
        const content = modalEl.querySelector(".modal-content");
        if (content && !prefersReducedMotion) {
            content.classList.remove("modal-pop");
            void content.offsetWidth;
            content.classList.add("modal-pop");
        }
    }

    function closeModal(modalEl) {
        if (modalEl) modalEl.classList.remove("active");
    }

    function closeAllModals() {
        document.querySelectorAll(".modal-overlay.active").forEach((overlay) => {
            overlay.classList.remove("active");
        });
    }

    if (proModalTrigger) proModalTrigger.addEventListener("click", () => openModal(proModal));
    if (openCreateGroupBtn) openCreateGroupBtn.addEventListener("click", () => openModal(createGroupModal));

    closeModalButtons.forEach(btn => {
        btn.addEventListener("click", () => closeAllModals());
    });

    document.querySelectorAll(".modal-content").forEach((content) => {
        content.addEventListener("click", (e) => e.stopPropagation());
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal(overlay);
        });
    });

    const btnSubscribePro = document.querySelector(".btn-subscribe-pro");
    if (btnSubscribePro) {
        btnSubscribePro.addEventListener("click", () => {
            showToast("تم تفعيل اشتراك Pro التجريبي بنجاح! 💎", "success");
            closeModal(proModal);
            const proTriggerSpan = document.querySelector("#btn-pro-trigger span");
            if (proTriggerSpan) proTriggerSpan.textContent = "عضو Pro 💎";
            proModalTrigger.classList.remove("btn-gold");
            proModalTrigger.classList.add("btn-secondary");
        });
    }

    // ==========================================
    // Dashboard Interactions
    // ==========================================
    document.querySelectorAll(".chart-bar-wrapper").forEach(bar => {
        bar.addEventListener("click", () => {
            document.querySelectorAll(".chart-bar-wrapper").forEach(b => b.classList.remove("active"));
            bar.classList.add("active");
            const hours = bar.querySelector(".bar-tooltip").textContent;
            const legend = document.querySelector(".chart-legend");
            if (legend) {
                legend.innerHTML = `نشاط يوم <b>${bar.querySelector(".bar-label").textContent}</b>: <b>${hours}</b>`;
            }
        });
    });

    const progressRings = document.querySelectorAll(".circular-progress");
    progressRings.forEach(ring => {
        const percent = parseInt(ring.getAttribute("data-percentage"));
        const circleBar = ring.querySelector(".progress-ring-bar");
        if (circleBar) {
            const radius = circleBar.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            circleBar.style.strokeDasharray = `${circumference} ${circumference}`;
            const offset = circumference - (percent / 100) * circumference;
            circleBar.style.strokeDashoffset = offset;
        }
    });

    document.querySelectorAll(".action-card").forEach(card => {
        card.addEventListener("click", () => {
            const action = card.getAttribute("data-action");
            if (action === "analytics") {
                switchView("dashboard-view");
            } else if (action === "notes") {
                openModal(document.getElementById("notes-modal"));
                renderNotes();
            } else if (action === "exams") {
                switchView("qbank-view");
            }
        });
    });

    // ==========================================
    // Subject Search and Filters
    // ==========================================
    const GRADE_LEVEL = "level3"; // المنصة مخصصة للصف الثالث الثانوي فقط

    function filterSubjects() {
        const categoryFilter = document.getElementById("filter-category") ? document.getElementById("filter-category").value : "all";
        const searchQuery = subjectSearchInput ? subjectSearchInput.value.toLowerCase().trim() : "";
        
        document.querySelectorAll(".subject-large-card").forEach(card => {
            const cardLevels = card.getAttribute("data-level") ? card.getAttribute("data-level").split(" ") : [];
            const cardCategories = card.getAttribute("data-category") ? card.getAttribute("data-category").split(" ") : [];
            const title = card.querySelector("h3") ? card.querySelector("h3").textContent.toLowerCase() : "";
            const desc = card.querySelector(".subject-description") ? card.querySelector(".subject-description").textContent.toLowerCase() : "";
            
            const matchesLevel = cardLevels.includes(GRADE_LEVEL);
            const matchesCategory = categoryFilter === "all" || cardCategories.includes(categoryFilter);
            const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);
            
            if (matchesLevel && matchesCategory && matchesSearch) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    if (subjectSearchInput) subjectSearchInput.addEventListener("input", filterSubjects);
    
    const filterCategoryEl = document.getElementById("filter-category");
    if (filterCategoryEl) filterCategoryEl.addEventListener("change", filterSubjects);
    filterSubjects();

    // ==========================================
    // Custom Questions Feature
    // ==========================================
    const customQuestionsModal = document.getElementById("custom-questions-modal");
    const customQuestionsForm = document.getElementById("custom-questions-form");
    const btnCreateCustomQuestion = document.getElementById("btn-create-custom-question");
    const customQuestionImageInput = document.getElementById("custom-question-image");
    const customQuestionImagePreview = document.getElementById("custom-question-image-preview");
    const btnAnalyzeQuestionImage = document.getElementById("btn-analyze-question-image");
    let pendingQuestionImageDataUrl = "";

    if (btnCreateCustomQuestion) {
        btnCreateCustomQuestion.addEventListener("click", () => {
            openModal(customQuestionsModal);
            refreshIcons();
        });
    }

    function validateCustomQuestionForm() {
        const fields = [
            { el: document.getElementById("custom-question-text"), msg: "يرجى كتابة نص السؤال" },
            { el: document.getElementById("custom-question-subject"), msg: "يرجى اختيار المادة الدراسية" },
            { el: document.getElementById("custom-question-topic"), msg: "يرجى كتابة الموضوع/الدرس" },
            { el: document.getElementById("custom-option-a"), msg: "يرجى كتابة الخيار الأول (أ)" },
            { el: document.getElementById("custom-option-b"), msg: "يرجى كتابة الخيار الثاني (ب)" },
            { el: document.getElementById("custom-option-c"), msg: "يرجى كتابة الخيار الثالث (ج)" },
            { el: document.getElementById("custom-option-d"), msg: "يرجى كتابة الخيار الرابع (د)" },
            { el: document.getElementById("custom-question-correct"), msg: "يرجى اختيار الإجابة الصحيحة" }
        ];

        for (const { el, msg } of fields) {
            if (!el) continue;
            const value = (el.value || "").trim();
            if (!value) {
                el.classList.add("field-error");
                el.focus();
                showToast(msg, "error");
                return false;
            }
            el.classList.remove("field-error");
        }
        return true;
    }

    function getQuestionImageEndpoints() {
        return getApiEndpoints("/api/extract-question-image");
    }

    function getApiEndpoints(pathname) {
        const endpoints = [];
        const isLocalFile = window.location.protocol === "file:";
        const host = window.location.hostname;
        const port = window.location.port;
        const isLocalHost = ["localhost", "127.0.0.1"].includes(host);

        if (!isLocalFile) {
            endpoints.push(pathname);
        }

        if (isLocalFile || !isLocalHost || (port && port !== "3000")) {
            endpoints.push(`http://localhost:3000${pathname}`);
        }

        return [...new Set(endpoints)];
    }

    async function readApiError(response, fallbackMessage) {
        try {
            const data = await response.json();
            return data?.error || fallbackMessage;
        } catch {
            return fallbackMessage;
        }
    }

    function fileToCompressedDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const maxSide = 1200;
                    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(img.width * scale));
                    canvas.height = Math.max(1, Math.round(img.height * scale));
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.78));
                };
                img.onerror = () => reject(new Error("تعذر قراءة الصورة"));
                img.src = reader.result;
            };
            reader.onerror = () => reject(new Error("تعذر تحميل الصورة"));
            reader.readAsDataURL(file);
        });
    }

    function renderCustomQuestionImagePreview(dataUrl) {
        if (!customQuestionImagePreview) return;
        if (!dataUrl) {
            customQuestionImagePreview.hidden = true;
            customQuestionImagePreview.innerHTML = "";
            return;
        }
        customQuestionImagePreview.hidden = false;
        customQuestionImagePreview.innerHTML = `<img src="${dataUrl}" alt="صورة السؤال المرفوعة">`;
    }

    async function extractQuestionFromImage(imageDataUrl) {
        let response;
        let lastError;
        for (const endpoint of getQuestionImageEndpoints()) {
            try {
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageDataUrl })
                });
                if (response.ok) break;
                lastError = new Error(await readApiError(response, `Image extraction failed: ${response.status}`));
            } catch (error) {
                lastError = error;
            }
        }
        if (!response || !response.ok) {
            throw lastError || new Error("Image extraction failed");
        }
        return response.json();
    }

    function fillCustomQuestionForm(question) {
        const subjectEl = document.getElementById("custom-question-subject");
        const topicEl = document.getElementById("custom-question-topic");
        const textEl = document.getElementById("custom-question-text");
        const correctEl = document.getElementById("custom-question-correct");
        const optionEls = [
            document.getElementById("custom-option-a"),
            document.getElementById("custom-option-b"),
            document.getElementById("custom-option-c"),
            document.getElementById("custom-option-d")
        ];

        if (subjectEl && question.subject) subjectEl.value = question.subject;
        if (topicEl && question.topic) topicEl.value = question.topic;
        if (textEl && question.text) textEl.value = question.text;
        if (correctEl && question.correct) correctEl.value = question.correct;
        if (Array.isArray(question.options)) {
            optionEls.forEach((el, idx) => {
                if (el && question.options[idx]) el.value = question.options[idx];
            });
        }
    }

    function submitCustomQuestion() {
        if (!validateCustomQuestionForm()) return;

        const questionText = document.getElementById("custom-question-text").value.trim();
        const subject = document.getElementById("custom-question-subject").value;
        const topic = document.getElementById("custom-question-topic").value.trim();
        const optionA = document.getElementById("custom-option-a").value.trim();
        const optionB = document.getElementById("custom-option-b").value.trim();
        const optionC = document.getElementById("custom-option-c").value.trim();
        const optionD = document.getElementById("custom-option-d").value.trim();
        const correctAnswer = document.getElementById("custom-question-correct").value;

        if (!Array.isArray(appState.customQuestions)) {
            appState.customQuestions = [];
        }

        const newQuestion = {
            id: "custom-" + Date.now(),
            text: questionText,
            subject: subject,
            topic: topic,
            options: [optionA, optionB, optionC, optionD],
            correct: correctAnswer,
            hasDiagram: false,
            imageDataUrl: pendingQuestionImageDataUrl || "",
            isCustom: true,
            createdDate: new Date().toLocaleDateString("ar-EG")
        };

        appState.customQuestions.push(newQuestion);
        saveStateToLocalStorage();
        closeModal(customQuestionsModal);
        customQuestionsForm.reset();
        pendingQuestionImageDataUrl = "";
        renderCustomQuestionImagePreview("");
        showToast(`تم إضافة السؤال بنجاح! ✅ اضغط «ابدأ الحل» لنفس المادة لحله`, "success");
    }

    if (customQuestionsForm) {
        customQuestionsForm.setAttribute("novalidate", "novalidate");
        customQuestionsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            submitCustomQuestion();
        });

        const btnSubmitCustom = customQuestionsForm.querySelector('button[type="submit"]');
        if (btnSubmitCustom) {
            btnSubmitCustom.addEventListener("click", (e) => {
                e.preventDefault();
                submitCustomQuestion();
            });
        }

        customQuestionsForm.querySelectorAll("input, textarea, select").forEach((field) => {
            field.addEventListener("input", () => field.classList.remove("field-error"));
            field.addEventListener("change", () => field.classList.remove("field-error"));
        });
    }

    if (customQuestionImageInput) {
        customQuestionImageInput.addEventListener("change", async () => {
            const file = customQuestionImageInput.files?.[0];
            if (!file) {
                pendingQuestionImageDataUrl = "";
                renderCustomQuestionImagePreview("");
                return;
            }

            if (!file.type.startsWith("image/")) {
                showToast("ارفع ملف صورة فقط.", "error");
                customQuestionImageInput.value = "";
                return;
            }

            try {
                pendingQuestionImageDataUrl = await fileToCompressedDataUrl(file);
                renderCustomQuestionImagePreview(pendingQuestionImageDataUrl);
                showToast("تم تحميل الصورة. اضغط استخراج السؤال من الصورة.", "info");
            } catch (error) {
                console.warn(error);
                showToast("تعذر قراءة الصورة.", "error");
            }
        });
    }

    if (btnAnalyzeQuestionImage) {
        btnAnalyzeQuestionImage.addEventListener("click", async () => {
            if (!pendingQuestionImageDataUrl) {
                showToast("ارفع صورة السؤال أولاً.", "error");
                return;
            }

            btnAnalyzeQuestionImage.disabled = true;
            const label = btnAnalyzeQuestionImage.querySelector("span");
            const previousLabel = label ? label.textContent : "";
            if (label) label.textContent = "جارِ تحليل الصورة...";

            try {
                const extractedQuestion = await extractQuestionFromImage(pendingQuestionImageDataUrl);
                fillCustomQuestionForm(extractedQuestion);
                showToast("تم استخراج السؤال وتحديد المادة تلقائيًا.", "success");
            } catch (error) {
                console.warn(error);
                showToast("تعذر تحليل الصورة. تأكد أن السيرفر شغال والصورة واضحة.", "error");
            } finally {
                btnAnalyzeQuestionImage.disabled = false;
                if (label) label.textContent = previousLabel;
            }
        });
    }

    // ==========================================
    // Study Groups Operations
    // ==========================================
    function renderGroups(filter = "all", searchQuery = "") {
        if (!groupsCardsContainer) return;
        groupsCardsContainer.innerHTML = "";
        
        const filtered = appState.studyGroups.filter(group => {
            const matchesCategory = filter === "all" || group.category === filter;
            const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  group.subject.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            groupsCardsContainer.innerHTML = `
                <div class="empty-state-card" style="grid-column: 1/-1; text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                    <i data-lucide="users-round" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <h3>لا يوجد مجموعات دراسية مطابقة</h3>
                    <p style="color: var(--text-muted); font-size: 14px; margin-top: 6px;">جرب تعديل خيارات البحث أو قم بإنشاء مجموعة جديدة!</p>
                </div>
            `;
            refreshIcons();
            return;
        }

        filtered.forEach(group => {
            const card = document.createElement("div");
            card.className = `group-card ${group.joined ? 'joined' : ''}`;
            card.id = group.id;
            card.setAttribute("data-category", group.category);

            let borderClass = "bg-blue";
            if (group.category === "physics") borderClass = "bg-orange";
            if (group.category === "chemistry") borderClass = "bg-green";
            if (group.category === "programming") borderClass = "bg-purple";

            let avatarsMarkup = "";
            if (group.joined) {
                avatarsMarkup = `<span class="active-pulse"></span><span class="active-status-text">3 أعضاء نشطين الآن</span>`;
            } else {
                let imgMarkup = "";
                group.avatars.forEach(av => { imgMarkup += `<img src="${av}" class="avatar-mini" alt="User">`; });
                avatarsMarkup = `<div class="members-avatars">${imgMarkup}<span class="avatars-more">+${group.members - group.avatars.length}</span></div>`;
            }

            card.innerHTML = `
                <div class="group-card-border-line ${borderClass}"></div>
                <div class="group-card-header">
                    <span class="group-members-badge ${group.joined ? 'active-users' : ''}">
                        <i data-lucide="${group.joined ? 'user-check' : 'users'}"></i>
                        <span class="member-count">${group.joined ? 'عضو' : group.members}</span>
                    </span>
                    <span class="group-subject-tag subject-${group.category}">${group.subject}</span>
                    <div class="group-icon-wrapper"><i data-lucide="${group.icon}"></i></div>
                </div>
                <div class="group-card-body">
                    <h3>${group.name}</h3>
                    <p>${group.description}</p>
                </div>
                <div class="group-card-footer">
                    ${avatarsMarkup}
                    <button class="btn ${group.joined ? 'btn-primary' : 'btn-secondary'} btn-join-group" data-group-id="${group.id}">
                        ${group.joined ? 'دخول' : 'انضمام'}
                    </button>
                </div>
            `;
            groupsCardsContainer.appendChild(card);
        });

        document.querySelectorAll(".btn-join-group").forEach(btn => {
            btn.addEventListener("click", () => {
                const groupId = btn.getAttribute("data-group-id");
                toggleJoinGroup(groupId);
            });
        });

        refreshIcons();
        prepareStaggerGrid(groupsCardsContainer);
        const groupsView = document.getElementById("groups-view");
        if (groupsView && groupsView.classList.contains("active")) {
            groupsCardsContainer.classList.remove("stagger-play");
            void groupsCardsContainer.offsetWidth;
            groupsCardsContainer.classList.add("stagger-play");
        }
    }

    function toggleJoinGroup(groupId) {
        const groupIndex = appState.studyGroups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
            const group = appState.studyGroups[groupIndex];
            if (!group.joined) {
                group.joined = true;
                group.members += 1;
                showToast(`انضممت بنجاح إلى مجموعة "${group.name}"! 👥`, "success");
            } else {
                showToast(`جاري الدخول إلى مجموعة "${group.name}"... 🗣️`, "info");
            }
            saveStateToLocalStorage();
            renderGroups(getActiveGroupFilter(), groupSearchInput ? groupSearchInput.value : "");
        }
    }

    function getActiveGroupFilter() {
        const activeBtn = document.querySelector(".tag-btn.active");
        return activeBtn ? activeBtn.getAttribute("data-filter") : "all";
    }

    if (groupTagsContainer) {
        groupTagsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("tag-btn")) {
                document.querySelectorAll(".tag-btn").forEach(btn => btn.classList.remove("active"));
                e.target.classList.add("active");
                renderGroups(e.target.getAttribute("data-filter"), groupSearchInput ? groupSearchInput.value : "");
            }
        });
    }

    if (groupSearchInput) {
        groupSearchInput.addEventListener("input", (e) => {
            renderGroups(getActiveGroupFilter(), e.target.value);
        });
    }

    if (createGroupForm) {
        createGroupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("group-name-input").value;
            const description = document.getElementById("group-desc-input").value;
            const subjectVal = document.getElementById("group-subject-select").value;
            
            const subjectLabels = { math: "رياضيات متقدمة", physics: "فيزياء", chemistry: "كيمياء عضوية", programming: "برمجة", biology: "أحياء" };
            const iconsMap = { math: "binary", physics: "atom", chemistry: "flask-conical", programming: "code", biology: "dna" };

            const newGroup = {
                id: "group-" + Date.now(), name, description,
                members: 1, subject: subjectLabels[subjectVal] || "عام",
                category: subjectVal, joined: true, color: "bg-blue",
                icon: iconsMap[subjectVal] || "users", avatars: []
            };

            appState.studyGroups.unshift(newGroup);
            saveStateToLocalStorage();
            closeModal(createGroupModal);
            createGroupForm.reset();
            switchView("groups-view");
            renderGroups("all");
            showToast(`تم إنشاء مجموعة "${name}" بنجاح! 🆕`, "success");
        });
    }

    renderGroups("all");

    // ==========================================
    // Settings Operations
    // ==========================================
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", () => {
            const newName = settingsNameInput.value.trim();
            const emailInput = document.getElementById("settings-email");
            const notifyInput = document.getElementById("settings-notifications");
            
            if (newName) {
                appState.user.name = newName;
                if (emailInput) appState.user.email = emailInput.value.trim();
                if (notifyInput) appState.user.notifications = notifyInput.checked;
                localStorage.setItem("userName", appState.user.name);
                localStorage.setItem("userEmail", appState.user.email || "");
                saveStateToLocalStorage();
                updateUserStatsUI();
                showToast("تم حفظ التعديلات بنجاح! 💾", "success");
            }
        });
    }

    if (darkToggle) {
        darkToggle.addEventListener("change", () => {
            appState.darkMode = darkToggle.checked;
            document.body.classList.toggle("dark-theme", appState.darkMode);
            saveStateToLocalStorage();
        });
    }

    // ==========================================
    // Interactive Exam Engine
    // ==========================================
    function startExam(subjectName, qbankMode = true) {
        if (!subjectName) return;

        if (!Array.isArray(appState.customQuestions)) {
            appState.customQuestions = [];
        }

        appState.exam.subject = subjectName;
        appState.exam.qbankMode = qbankMode; // true = بنك الأسئلة (بدون تايمر، تصحيح فوري)
        appState.exam.timeRemaining = 45 * 60;
        appState.exam.answers = Array(50).fill(null);
        appState.exam.flagged = new Set();
        appState.exam.currentQuestionIndex = 0;
        appState.exam.isActive = true;

        seedQuestions(subjectName);

        // Add custom questions for this subject if any exist
        const customQuestionsForSubject = appState.customQuestions.filter(q => q.subject === subjectName);
        if (customQuestionsForSubject.length > 0) {
            const customQuestionsFormatted = customQuestionsForSubject.map((q, idx) => ({
                index: appState.exam.questions.length + idx,
                topic: q.topic,
                text: q.text,
                options: q.options,
                correct: q.correct,
                hasDiagram: q.hasDiagram,
                imageDataUrl: q.imageDataUrl || "",
                isCustom: true
            }));
            appState.exam.questions = appState.exam.questions.concat(customQuestionsFormatted);
            while (appState.exam.answers.length < appState.exam.questions.length) {
                appState.exam.answers.push(null);
            }
        }

        const totalQuestions = appState.exam.questions.length;
        appState.exam.title = `${subjectName} – بنك الأسئلة (${totalQuestions} سؤال)`;
        const examTitleDisplay = document.getElementById("exam-title-display");
        if (examTitleDisplay) examTitleDisplay.textContent = appState.exam.title;

        const subIndicator = document.querySelector(".subject-indicator");
        if (subIndicator) {
            const iconsMap = {
                "الفيزياء": "atom", "الكيمياء": "flask-conical", "الأحياء": "dna",
                "الرياضيات": "calculator", "اللغة العربية": "book-open", "اللغة الإنجليزية": "languages",
                "الجيولوجيا": "mountain", "التاريخ": "landmark", "الجغرافيا": "globe"
            };
            const icon = iconsMap[subjectName] || "book";
            subIndicator.innerHTML = `<i data-lucide="${icon}"></i> ${subjectName}`;
        }

        // إخفاء/إظهار التايمر حسب الوضع
        const examTimerWidget = document.querySelector(".exam-timer-widget");
        const examTimerEl = document.getElementById("exam-timer");
        if (qbankMode) {
            // إخفاء التايمر تماماً في وضع بنك الأسئلة
            if (examTimerWidget) examTimerWidget.style.display = "none";
            if (examTimerEl) examTimerEl.style.display = "none";
        } else {
            // إظهار التايمر في وضع الامتحان الحقيقي
            if (examTimerWidget) examTimerWidget.style.display = "";
            if (examTimerEl) examTimerEl.style.display = "";
        }

        renderQuestionsMap();
        loadQuestion(0);
        updateExamProgress();
        switchView("exam-view");

        // تشغيل التايمر فقط في وضع الامتحان الحقيقي
        if (appState.exam.timerInterval) clearInterval(appState.exam.timerInterval);
        if (!qbankMode) {
            appState.exam.timerInterval = setInterval(updateTimer, 1000);
        }
    }

    function updateTimer() {
        if (!appState.exam.isActive) return;
        appState.exam.timeRemaining--;
        if (appState.exam.timeRemaining <= 0) {
            clearInterval(appState.exam.timerInterval);
            if (examTimerDisplay) examTimerDisplay.textContent = "00:00";
            showToast("انتهى وقت الامتحان! يتم تقديم إجاباتك تلقائياً...", "warning");
            submitExam();
            return;
        }
        const minutes = Math.floor(appState.exam.timeRemaining / 60);
        const seconds = appState.exam.timeRemaining % 60;
        if (examTimerDisplay) {
            examTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    function renderQuestionsMap() {
        if (!questionsGridMap) return;
        questionsGridMap.innerHTML = "";
        const totalQuestions = appState.exam.questions.length;
        for (let i = 0; i < totalQuestions; i++) {
            const btn = document.createElement("button");
            btn.className = "q-map-btn";
            btn.textContent = i + 1;
            btn.setAttribute("data-q-index", i);

            if (i === appState.exam.currentQuestionIndex) btn.classList.add("current");
            else if (appState.exam.flagged.has(i)) btn.classList.add("flagged");
            else if (appState.exam.answers[i] !== null) btn.classList.add("answered");

            btn.addEventListener("click", () => {
                saveSelectedAnswer();
                appState.exam.currentQuestionIndex = i;
                loadQuestion(i);
                renderQuestionsMap();
            });
            questionsGridMap.appendChild(btn);
        }
    }

    function loadQuestion(index) {
        const question = appState.exam.questions[index];
        if (!question) return;

        const totalQuestions = appState.exam.questions.length;
        if (questionIndexTag) questionIndexTag.textContent = `سؤال ${index + 1} من ${totalQuestions}`;
        if (questionTopicBadge) questionTopicBadge.innerHTML = `<i data-lucide="zap"></i> ${question.topic}`;
        if (questionTextContent) questionTextContent.textContent = question.text;

        if (circuitDiagramContainer) {
            if (question.imageDataUrl) {
                circuitDiagramContainer.style.display = "flex";
                circuitDiagramContainer.innerHTML = `<img class="exam-question-image" src="${question.imageDataUrl}" alt="صورة السؤال">`;
            } else {
                circuitDiagramContainer.style.display = question.hasDiagram ? "flex" : "none";
                circuitDiagramContainer.innerHTML = question.hasDiagram ? originalCircuitDiagramMarkup : "";
            }
        }

        if (!examOptionsContainer) return;
        examOptionsContainer.innerHTML = "";
        const optionLetters = ["أ", "ب", "ج", "د"];
        const optionKeys = ["A", "B", "C", "D"];

        const alreadyAnswered = appState.exam.qbankMode && appState.exam.answers[index] !== null;

        question.options.forEach((optText, optIdx) => {
            const optDiv = document.createElement("div");
            optDiv.className = "option-item";
            optDiv.setAttribute("data-option", optionKeys[optIdx]);

            const userAnswer = appState.exam.answers[index];
            const isCorrectOption = optionKeys[optIdx] === question.correct;

            if (userAnswer === optionKeys[optIdx]) {
                optDiv.classList.add("selected");
            }

            // إذا كان بنك الأسئلة وتم الإجابة: أظهر الصح والغلط
            if (alreadyAnswered) {
                if (isCorrectOption) {
                    optDiv.classList.add("option-correct");
                } else if (userAnswer === optionKeys[optIdx]) {
                    optDiv.classList.add("option-wrong");
                }
                optDiv.style.pointerEvents = "none"; // منع إعادة الاختيار
            }

            optDiv.innerHTML = `
                <span class="option-letter">${optionLetters[optIdx]}</span>
                <span class="option-text">${optText}</span>
                ${alreadyAnswered && isCorrectOption ? '<span class="option-result-icon">✓</span>' : ''}
                ${alreadyAnswered && userAnswer === optionKeys[optIdx] && !isCorrectOption ? '<span class="option-result-icon">✗</span>' : ''}
            `;

            optDiv.addEventListener("click", () => {
                if (appState.exam.qbankMode && appState.exam.answers[index] !== null) return; // لا يسمح بتغيير الإجابة

                document.querySelectorAll(".option-item").forEach(item => item.classList.remove("selected"));
                optDiv.classList.add("selected");
                saveSelectedAnswer();
                updateExamProgress();
                renderQuestionsMap();

                // في وضع بنك الأسئلة: أظهر الفيدباك الفوري
                if (appState.exam.qbankMode) {
                    showQbankFeedback(index, optionKeys[optIdx]);
                }
            });

            examOptionsContainer.appendChild(optDiv);
        });

        // إذا كان السؤال مجابًا مسبقًا في بنك الأسئلة: أظهر الفيدباك تلقائيًا
        if (alreadyAnswered) {
            const userAnswer = appState.exam.answers[index];
            showQbankFeedbackBanner(index, userAnswer, true);
        } else {
            removeQbankFeedbackBanner();
        }

        if (btnFlagQuestion) {
            const flagLabel = btnFlagQuestion.querySelector("span");
            if (appState.exam.flagged.has(index)) {
                btnFlagQuestion.classList.add("flagged");
                if (flagLabel) flagLabel.textContent = "ملحوظ بعلم للمراجعة";
            } else {
                btnFlagQuestion.classList.remove("flagged");
                if (flagLabel) flagLabel.textContent = "تعليم للمراجعة لاحقاً";
            }
        }

        if (btnPrevQuestion) btnPrevQuestion.disabled = (index === 0);
        
        if (btnNextQuestion) {
            const nextLabel = btnNextQuestion.querySelector("span");
            if (index === totalQuestions - 1) {
                if (nextLabel) nextLabel.textContent = appState.exam.qbankMode ? "إنهاء المراجعة" : "إنهاء الاختبار";
                setLucideIcon(btnNextQuestion, "check-circle");
            } else {
                if (nextLabel) nextLabel.textContent = "التالي";
                setLucideIcon(btnNextQuestion, "arrow-left");
            }
        }

        refreshIcons();
    }

    // === تصحيح فوري في بنك الأسئلة ===
    function showQbankFeedback(questionIndex, selectedKey) {
        const question = appState.exam.questions[questionIndex];
        if (!question) return;
        const isCorrect = selectedKey === question.correct;
        const optionKeys = ["A", "B", "C", "D"];
        const optionLetters = ["أ", "ب", "ج", "د"];

        // Play sound effect based on answer correctness
        if (typeof soundEffects !== 'undefined') {
            if (isCorrect) {
                soundEffects.playCorrect(); // Ding sound for correct answer
            } else {
                soundEffects.playIncorrect(); // Buzzer sound for wrong answer
            }
        }

        // لون الخيارات
        document.querySelectorAll(".option-item").forEach(item => {
            const key = item.getAttribute("data-option");
            const isCorrectOpt = key === question.correct;
            const isSelected = key === selectedKey;
            item.style.pointerEvents = "none";
            if (isCorrectOpt) {
                item.classList.add("option-correct");
                item.innerHTML += '<span class="option-result-icon">✓</span>';
            } else if (isSelected && !isCorrectOpt) {
                item.classList.add("option-wrong");
                item.innerHTML += '<span class="option-result-icon">✗</span>';
            }
        });

        const correctIdx = optionKeys.indexOf(question.correct);
        const correctLetterAr = optionLetters[correctIdx] || question.correct;
        showQbankFeedbackBanner(questionIndex, selectedKey, false);
    }

    // === قاموس شرح الإجابات لبنك الأسئلة ===
    const qbankExplanations = {
        // الإجابة الصحيحة: لماذا هي صحيحة (مُضاف حسب الموضوع)
        // يتم توليد الشرح ديناميكياً بناءً على نص السؤال والإجابة الصحيحة
    };

    function generateSimpleExplanation(question, correctKey) {
        const optionKeys = ["A", "B", "C", "D"];
        const optionLetters = ["أ", "ب", "ج", "د"];
        const correctIdx = optionKeys.indexOf(correctKey);
        const correctText = question.options[correctIdx] || "";
        const correctLetter = optionLetters[correctIdx] || correctKey;

        // شرح مبسط بناءً على الموضوع
        const topicExplanations = {
            "الكهرباء": `الإجابة (${correctLetter}) صحيحة لأنها تتوافق مع قوانين الكهرباء الأساسية المقررة.`,
            "الميكانيكا": `الإجابة (${correctLetter}) صحيحة لأنها تطبق قوانين نيوتن للحركة بشكل صحيح.`,
            "الكيمياء": `الإجابة (${correctLetter}) صحيحة وفقاً لقواعد الكيمياء والتفاعلات الكيميائية.`,
            "الوراثة": `الإجابة (${correctLetter}) صحيحة وفقاً لقوانين مندل للوراثة.`,
            "DNA": `الإجابة (${correctLetter}) صحيحة وفقاً لآليات تركيب الحمض النووي وعمله.`,
            "التفاضل": `الإجابة (${correctLetter}) صحيحة بتطبيق قواعد التفاضل والتكامل.`,
            "النحو": `الإجابة (${correctLetter}) صحيحة وفقاً لقواعد النحو العربي.`,
            "البلاغة": `الإجابة (${correctLetter}) صحيحة وفقاً لمصطلحات وقواعد البلاغة العربية.`,
        };

        let explanation = null;
        for (const [key, val] of Object.entries(topicExplanations)) {
            if (question.topic && question.topic.includes(key)) {
                explanation = val;
                break;
            }
        }

        if (!explanation) {
            explanation = `الإجابة الصحيحة هي (${correctLetter}) — "${correctText}". راجع الشرح في الكتاب المدرسي للمزيد من التفاصيل.`;
        }

        return explanation;
    }

    function showQbankFeedbackBanner(questionIndex, selectedKey, isReload) {
        removeQbankFeedbackBanner();
        const question = appState.exam.questions[questionIndex];
        if (!question || !examOptionsContainer) return;
        const isCorrect = selectedKey === question.correct;
        const optionKeys = ["A", "B", "C", "D"];
        const optionLetters = ["أ", "ب", "ج", "د"];
        const correctIdx = optionKeys.indexOf(question.correct);
        const correctLetterAr = optionLetters[correctIdx] || question.correct;
        const correctText = question.options[correctIdx] || "";
        const selectedIdx = optionKeys.indexOf(selectedKey);
        const selectedLetterAr = optionLetters[selectedIdx] || selectedKey;
        const selectedText = question.options[selectedIdx] || "";
        const explanation = generateSimpleExplanation(question, question.correct);

        const banner = document.createElement("div");
        banner.id = "qbank-feedback-banner";
        banner.className = `qbank-feedback-banner ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
        banner.innerHTML = `
            <div class="feedback-icon">${isCorrect ? '🎉' : '❌'}</div>
            <div class="feedback-content">
                <div class="feedback-title">${isCorrect ? 'إجابة صحيحة! 👍' : 'إجابة خاطئة!'}</div>
                ${!isCorrect ? `<div class="feedback-correct-ans">✅ الإجابة الصحيحة: <strong>${correctLetterAr}. ${correctText}</strong></div>` : ''}
                ${!isCorrect ? `<div class="feedback-wrong-ans">❌ إجابتك: <strong>${selectedLetterAr}. ${selectedText}</strong></div>` : ''}
                <div class="feedback-explanation"><span class="feedback-why-label">💡 لماذا؟</span> ${explanation}</div>
            </div>
        `;
        examOptionsContainer.insertAdjacentElement("afterend", banner);
    }

    function removeQbankFeedbackBanner() {
        const existing = document.getElementById("qbank-feedback-banner");
        if (existing) existing.remove();
    }

    function saveSelectedAnswer() {
        if (!examOptionsContainer) return;
        const selectedOptionEl = examOptionsContainer.querySelector(".option-item.selected");
        const currentIndex = appState.exam.currentQuestionIndex;
        if (selectedOptionEl) {
            appState.exam.answers[currentIndex] = selectedOptionEl.getAttribute("data-option");
        }
    }

    function updateExamProgress() {
        const total = appState.exam.questions.length;
        const answeredCount = appState.exam.answers.filter(ans => ans !== null).length;
        const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
        if (examProgressBar) examProgressBar.style.width = `${percent}%`;
        if (progressPercentageDisplay) progressPercentageDisplay.textContent = `${percent}%`;
        if (answeredCountDisplay) answeredCountDisplay.textContent = `${answeredCount} مجاب / ${total - answeredCount} متبقي`;
    }

    if (btnFlagQuestion) {
        btnFlagQuestion.addEventListener("click", () => {
            const index = appState.exam.currentQuestionIndex;
            const flagLabel = btnFlagQuestion.querySelector("span");
            if (appState.exam.flagged.has(index)) {
                appState.exam.flagged.delete(index);
                btnFlagQuestion.classList.remove("flagged");
                if (flagLabel) flagLabel.textContent = "تعليم للمراجعة لاحقاً";
            } else {
                appState.exam.flagged.add(index);
                btnFlagQuestion.classList.add("flagged");
                if (flagLabel) flagLabel.textContent = "ملحوظ بعلم للمراجعة";
            }
            renderQuestionsMap();
        });
    }

    if (btnPrevQuestion) {
        btnPrevQuestion.addEventListener("click", () => {
            saveSelectedAnswer();
            if (appState.exam.currentQuestionIndex > 0) {
                appState.exam.currentQuestionIndex--;
                loadQuestion(appState.exam.currentQuestionIndex);
                renderQuestionsMap();
            }
        });
    }

    if (btnNextQuestion) {
        btnNextQuestion.addEventListener("click", () => {
            saveSelectedAnswer();
            const lastQuestionIndex = appState.exam.questions.length - 1;
            if (appState.exam.currentQuestionIndex < lastQuestionIndex) {
                appState.exam.currentQuestionIndex++;
                loadQuestion(appState.exam.currentQuestionIndex);
                renderQuestionsMap();
            } else {
                submitExam();
            }
        });
    }

    if (btnExitExam) btnExitExam.addEventListener("click", confirmExitExam);

    function confirmExitExam() {
        showCustomConfirm(
            "إنهاء الاختبار؟",
            "هل أنت متأكد من رغبتك في إنهاء الاختبار وتصحيح إجاباتك؟",
            () => submitExam()
        );
    }

    function submitExam() {
        saveSelectedAnswer();
        clearInterval(appState.exam.timerInterval);
        appState.exam.isActive = false;

        let score = 0;
        appState.exam.questions.forEach((q, idx) => {
            if (appState.exam.answers[idx] === q.correct) score++;
        });

        const totalQuestions = appState.exam.questions.length;
        const scorePercentage = totalQuestions > 0 ? (score / totalQuestions * 100) : 0;

        const xpGained = (score * 10) + (scorePercentage >= 90 ? 100 : (scorePercentage >= 50 ? 50 : 0));
        appState.user.xp += xpGained;
        appState.user.solvedCount += appState.exam.answers.filter(ans => ans !== null).length;
        appState.user.accuracy = Math.round((appState.user.accuracy * 3 + scorePercentage) / 4);
        
        saveStateToLocalStorage();
        updateUserStatsUI();
        
        // Play sound effects for exam completion
        if (typeof soundEffects !== 'undefined') {
            soundEffects.playXPGain(); // XP gain sound
            
            // Level up celebration sound if score is excellent
            if (scorePercentage >= 90) {
                setTimeout(() => soundEffects.playLevelUp(), 300);
            }
        }
        
        showToast(`أحسنت! حصلت على +${xpGained} نقطة خبرة (XP) 🏆`, "success");

        let feedback = "";
        if (scorePercentage >= 90) {
            feedback = "ممتاز جداً! درجة استثنائية تؤهلك للحصول على الدرجات النهائية بامتياز. استمر في التدرب وحافظ على هذا المستوى.";
        } else if (scorePercentage >= 70) {
            feedback = "أداء رائع! لقد تجاوزت متوسط درجات الطلاب في هذا الاختبار. احرص على مراجعة الأسئلة الخاطئة لتدعيم معلوماتك.";
        } else if (scorePercentage >= 50) {
            feedback = "أداء جيد. أمامك بعض النقاط التي تحتاج لمزيد من المراجعة والتدقيق. ننصحك بالرجوع لمذكرات المادة المتاحة بالمنصة.";
        } else {
            feedback = "ننصح بإعادة دراسة الفصول التي اشتملت على إجابات خاطئة، والتواصل مع المعلم الذكي لحل المسائل الصعبة خطوة بخطوة.";
        }

        if (examScoreText) examScoreText.textContent = `${score} / ${totalQuestions}`;
        if (examFeedbackText) examFeedbackText.textContent = feedback;
        if (resultCorrectCount) resultCorrectCount.textContent = score;
        if (resultWrongCount) resultWrongCount.textContent = totalQuestions - score;

        const secondsSpent = (45 * 60) - appState.exam.timeRemaining;
        const minutes = Math.floor(secondsSpent / 60);
        const seconds = secondsSpent % 60;
        if (resultTimeSpent) resultTimeSpent.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        try { renderWrongAnswersList(); } catch (e) { console.error('renderWrongAnswersList failed', e); }
        openModal(examResultsModal);
    }

    if (btnReviewAnswers) {
        btnReviewAnswers.addEventListener("click", () => {
            closeModal(examResultsModal);
            switchView("home-view");
        });
    }

    if (btnReturnHome) {
        btnReturnHome.addEventListener("click", () => {
            closeModal(examResultsModal);
            switchView("home-view");
        });
    }

    // ==========================================
    // Notes System
    // ==========================================
    function renderNotes() {
        const container = document.getElementById("notes-list-container");
        if (!container) return;
        container.innerHTML = "";

        const subjectColors = {
            physics: "bg-orange", chemistry: "bg-green", math: "bg-blue",
            biology: "bg-purple", arabic: "bg-red", english: "bg-teal", general: "bg-gray"
        };

        const subjectLabels = {
            physics: "فيزياء", chemistry: "كيمياء", math: "رياضيات",
            biology: "أحياء", arabic: "عربي", english: "إنجليزي", general: "عام"
        };

        if (appState.notes.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted)">لا توجد ملاحظات بعد. أضف أول ملاحظة!</div>`;
            return;
        }

        appState.notes.forEach(note => {
            const card = document.createElement("div");
            card.className = "note-card";
            card.innerHTML = `
                <div class="note-card-header">
                    <span class="note-subject-badge ${subjectColors[note.subject] || 'bg-gray'}">${subjectLabels[note.subject] || note.subject}</span>
                    <div class="note-actions">
                        <button class="btn-icon btn-edit-note" data-note-id="${note.id}"><i data-lucide="edit-2"></i></button>
                        <button class="btn-icon btn-delete-note" data-note-id="${note.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                <h4 class="note-title">${note.title}</h4>
                <p class="note-content">${note.content.replace(/\n/g, '<br>')}</p>
                <span class="note-date">${note.date}</span>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll(".btn-edit-note").forEach(btn => {
            btn.addEventListener("click", () => {
                const noteId = btn.getAttribute("data-note-id");
                const note = appState.notes.find(n => n.id === noteId);
                if (note) openNoteEditor(note);
            });
        });

        document.querySelectorAll(".btn-delete-note").forEach(btn => {
            btn.addEventListener("click", () => {
                const noteId = btn.getAttribute("data-note-id");
                showCustomConfirm("حذف الملاحظة", "هل تريد حذف هذه الملاحظة نهائياً؟", () => {
                    appState.notes = appState.notes.filter(n => n.id !== noteId);
                    saveStateToLocalStorage();
                    renderNotes();
                    showToast("تم حذف الملاحظة", "info");
                });
            });
        });

        refreshIcons();
    }

    function openNoteEditor(note = null) {
        const editor = document.getElementById("note-editor");
        const editorTitle = document.getElementById("editor-title");
        const noteIdInput = document.getElementById("edit-note-id");
        const titleInput = document.getElementById("note-title-input");
        const subjectSelect = document.getElementById("note-subject-select");
        const contentInput = document.getElementById("note-content-input");

        if (!editor) return;

        if (note) {
            editorTitle.textContent = "تعديل الملاحظة";
            noteIdInput.value = note.id;
            titleInput.value = note.title;
            subjectSelect.value = note.subject;
            contentInput.value = note.content;
        } else {
            editorTitle.textContent = "إضافة ملاحظة جديدة";
            noteIdInput.value = "";
            titleInput.value = "";
            subjectSelect.value = "physics";
            contentInput.value = "";
        }

        editor.style.display = "block";
    }

    const btnAddNote = document.getElementById("btn-add-note");
    if (btnAddNote) btnAddNote.addEventListener("click", () => openNoteEditor());

    const btnCancelNote = document.getElementById("btn-cancel-note");
    if (btnCancelNote) {
        btnCancelNote.addEventListener("click", () => {
            const editor = document.getElementById("note-editor");
            if (editor) editor.style.display = "none";
        });
    }

    const btnSaveNote = document.getElementById("btn-save-note");
    if (btnSaveNote) {
        btnSaveNote.addEventListener("click", () => {
            const noteIdInput = document.getElementById("edit-note-id");
            const titleInput = document.getElementById("note-title-input");
            const subjectSelect = document.getElementById("note-subject-select");
            const contentInput = document.getElementById("note-content-input");

            const title = titleInput.value.trim();
            const subject = subjectSelect.value;
            const content = contentInput.value.trim();

            if (!title || !content) {
                showToast("يرجى ملء العنوان والمحتوى", "error");
                return;
            }

            const existingId = noteIdInput.value;
            if (existingId) {
                const noteIdx = appState.notes.findIndex(n => n.id === existingId);
                if (noteIdx !== -1) {
                    appState.notes[noteIdx] = { ...appState.notes[noteIdx], title, subject, content, date: new Date().toLocaleDateString("ar-EG") };
                    showToast("تم تعديل الملاحظة بنجاح ✏️", "success");
                }
            } else {
                const newNote = { id: "note-" + Date.now(), title, subject, content, date: new Date().toLocaleDateString("ar-EG") };
                appState.notes.unshift(newNote);
                showToast("تمت إضافة الملاحظة بنجاح ✅", "success");
            }

            saveStateToLocalStorage();
            const editor = document.getElementById("note-editor");
            if (editor) editor.style.display = "none";
            renderNotes();
        });
    }

    const notesModal = document.getElementById("notes-modal");
    if (notesModal) {
        const closeNotesBtn = notesModal.querySelector(".btn-close-modal");
        if (closeNotesBtn) closeNotesBtn.addEventListener("click", () => closeModal(notesModal));
    }

    // Open notes from home quick action
    document.querySelectorAll(".btn-open-notes").forEach(btn => {
        btn.addEventListener("click", () => {
            openModal(document.getElementById("notes-modal"));
            renderNotes();
        });
    });

    // ==========================================
    // AI Mentor Chat Modal
    // ==========================================
    const aiMentorModal = document.getElementById("ai-mentor-modal");
    const aiMessagesContainer = document.getElementById("ai-messages-container");
    const aiSendForm = document.getElementById("ai-send-form");
    const aiMessageInput = document.getElementById("ai-message-input");
    const btnCloseAi = document.getElementById("btn-close-ai");

    function normalizeArabicText(text) {
        return (text || "")
            .toLowerCase()
            .replace(/[أإآ]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ة/g, "ه")
            .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function detectSubjectFromQuery(query) {
        const normalized = normalizeArabicText(query);
        const subjectMap = [
            { subject: "الفيزياء", keys: ["فيزياء", "كهرباء", "تيار", "مقاومه", "موجات", "نيوتن", "حراره"] },
            { subject: "الكيمياء", keys: ["كيمياء", "حمض", "قاعده", "ph", "تفاعل", "مول"] },
            { subject: "الأحياء", keys: ["احياء", "وراثه", "مندل", "جين", "خلية", "خليه"] },
            { subject: "الرياضيات", keys: ["رياضيات", "تفاضل", "تكامل", "مشتقه", "داله"] },
            { subject: "التاريخ", keys: ["تاريخ", "محمد علي", "ثوره", "احتلال"] },
        ];
        const match = subjectMap.find((item) => item.keys.some((key) => normalized.includes(normalizeArabicText(key))));
        return match ? match.subject : "الفيزياء";
    }

    async function requestAiProviderResponse(query) {
        const subject = detectSubjectFromQuery(query);
        const endpoints = getApiEndpoints("/api/ai-mentor");
        let response;
        let lastError;

        for (const endpoint of endpoints) {
            try {
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: query, subject })
                });
                if (response.ok) break;
                lastError = new Error(await readApiError(response, `AI provider request failed: ${response.status}`));
            } catch (error) {
                lastError = error;
            }
        }

        if (!response || !response.ok) {
            throw lastError || new Error("AI provider request failed");
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.explain) || !data.followUp) {
            throw new Error("AI provider returned an invalid mentor response");
        }

        return {
            type: "lesson",
            subject: data.subject || subject,
            topic: data.topic || query,
            explain: data.explain,
            followUp: data.followUp,
            practicePrompt: data.practicePrompt || `ابدأ امتحان ${data.subject || subject} على نفس الفكرة`
        };
    }

    function appendAiBubble(text, isUser) {
        if (!aiMessagesContainer) return;
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${isUser ? "user-bubble" : "ai-bubble"}`;
        bubble.innerHTML = `<p>${escapeHTML(text).replace(/\n/g, "<br>")}</p>`;
        aiMessagesContainer.appendChild(bubble);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
    }

    function appendAiMentorResponse(response) {
        if (!aiMessagesContainer) return;
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble ai-bubble ai-mentor-response";
        bubble.innerHTML = `
            <div class="ai-lesson-chip">${escapeHTML(response.subject)} · ${escapeHTML(response.topic)}</div>
            <div class="ai-lesson-section">
                <strong>الشرح المختصر</strong>
                <ol>
                    ${response.explain.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}
                </ol>
            </div>
            <div class="ai-lesson-section ai-follow-up">
                <strong>سؤال متابعة</strong>
                <p>${escapeHTML(response.followUp)}</p>
            </div>
            <div class="ai-mentor-actions">
                <button type="button" class="ai-action-btn ai-action-reply" data-follow-up="${escapeHTML(response.followUp)}">
                    اكتب إجابتي
                </button>
                <button type="button" class="ai-action-btn ai-action-practice" data-subject="${escapeHTML(response.subject)}">
                    ${escapeHTML(response.practicePrompt)}
                </button>
            </div>
        `;
        aiMessagesContainer.appendChild(bubble);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
        refreshIcons();
    }

    function showAiTyping() {
        if (!aiMessagesContainer) return;
        const ind = document.createElement("div");
        ind.className = "chat-bubble ai-bubble";
        ind.id = "ai-typing-indicator";
        ind.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">المعلم الذكي يكتب...</p>`;
        aiMessagesContainer.appendChild(ind);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
    }

    function removeAiTyping() {
        const ind = document.getElementById("ai-typing-indicator");
        if (ind) ind.remove();
    }

    if (aiSendForm) {
        aiSendForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = aiMessageInput.value.trim();
            if (!text) return;
            appendAiBubble(text, true);
            aiMessageInput.value = "";
            showAiTyping();
            requestAiProviderResponse(text)
                .then((response) => {
                    removeAiTyping();
                    appendAiMentorResponse(response);
                })
                .catch(() => {
                    removeAiTyping();
                    appendAiBubble("تعذر الاتصال بالذكاء الاصطناعي الآن. تأكد أن السيرفر شغال وأن مفتاح Gemini صحيح، ثم حاول مرة أخرى.", false);
                    showToast("تعذر الاتصال بالذكاء الاصطناعي.", "error");
                });
        });
    }

    if (aiMessagesContainer) {
        aiMessagesContainer.addEventListener("click", (e) => {
            const replyBtn = e.target.closest(".ai-action-reply");
            if (replyBtn && aiMessageInput) {
                aiMessageInput.value = "إجابتي: ";
                aiMessageInput.placeholder = replyBtn.getAttribute("data-follow-up") || "اكتب إجابتك هنا...";
                aiMessageInput.focus();
                return;
            }

            const practiceBtn = e.target.closest(".ai-action-practice");
            if (practiceBtn) {
                const subject = practiceBtn.getAttribute("data-subject") || "الفيزياء";
                closeModal(aiMentorModal);
                startExam(subject);
            }
        });
    }

    document.querySelectorAll(".ai-suggest-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const query = btn.getAttribute("data-query");
            if (aiMessageInput && aiSendForm) {
                aiMessageInput.value = query;
                aiSendForm.dispatchEvent(new Event("submit", { cancelable: true }));
            }
        });
    });

    if (btnCloseAi) btnCloseAi.addEventListener("click", () => closeModal(aiMentorModal));
    if (aiMentorModal) {
        aiMentorModal.addEventListener("click", (e) => { if (e.target === aiMentorModal) closeModal(aiMentorModal); });
    }

    // ==========================================
    // Study Group Chat Modal
    // ==========================================
    const groupChatModal = document.getElementById("group-chat-modal");
    const chatMessagesContainer = document.getElementById("chat-messages-container");
    const chatGroupNameEl = document.getElementById("chat-group-name");
    const chatGroupStatusEl = document.getElementById("chat-group-status");
    const chatSendForm = document.getElementById("chat-send-form");
    const chatMessageInput = document.getElementById("chat-message-input");
    const btnCloseChat = document.getElementById("btn-close-chat");

    const mockGroupMessages = {
        "group-calc": [
            { sender: "محمد علي", text: "هل حللتم مسألة التفاضل رقم 5 من الكتاب؟", isUser: false },
            { sender: "سارة أحمد", text: "نعم! المشتقة تساوي 3x² + 2x - 1 ✅", isUser: false },
        ],
        "group-quantum": [
            { sender: "خالد محمود", text: "هل يعرف أحد شرح مبدأ عدم اليقين لهايزنبرغ؟", isUser: false },
        ],
        "group-carbon": [
            { sender: "نورا سامي", text: "تفاعلات الإضافة الكهرباء مهمة جداً للامتحان! 🧪", isUser: false },
            { sender: "يوسف عادل", text: "شكراً! هذا ما كنت أبحث عنه", isUser: false },
        ],
        "group-python": [
            { sender: "ريم عمر", text: "هل يمكن مشاركة حل تمرين for loop؟", isUser: false },
        ],
    };

    const groupChatReplies = ["فكرة رائعة! 👍", "شكراً على المشاركة الرائعة!", "هذا صحيح تماماً 💡", "سأراجع هذه النقطة وأخبركم لاحقاً.", "ممتاز! هل يمكنك شرح المزيد؟ 😊", "أعتقد هناك طريقة أبسط، سأشاركها قريباً!"];

    function appendGroupBubble(text, isUser, sender) {
        if (!chatMessagesContainer) return;
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${isUser ? "user-bubble" : "mock-bubble"}`;
        bubble.innerHTML = `<span class="sender-name">${sender}</span><p>${text}</p>`;
        chatMessagesContainer.appendChild(bubble);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function openGroupChat(group) {
        if (!groupChatModal) return;
        chatGroupNameEl.textContent = group.name;
        chatGroupStatusEl.textContent = "3 أعضاء نشطين الآن";
        chatMessagesContainer.innerHTML = "";
        const msgs = mockGroupMessages[group.id] || [];
        if (msgs.length === 0) {
            appendGroupBubble("مرحباً بك في المجموعة! 👋 ابدأ المحادثة الآن.", false, group.name);
        } else {
            msgs.forEach(m => appendGroupBubble(m.text, m.isUser, m.sender));
        }
        openModal(groupChatModal);
        if (chatMessageInput) chatMessageInput.focus();
    }

    if (chatSendForm) {
        chatSendForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = chatMessageInput.value.trim();
            if (!text) return;
            appendGroupBubble(text, true, "أنت");
            chatMessageInput.value = "";
            const randomReply = groupChatReplies[Math.floor(Math.random() * groupChatReplies.length)];
            setTimeout(() => appendGroupBubble(randomReply, false, "عضو المجموعة"), 1000);
        });
    }

    if (btnCloseChat) btnCloseChat.addEventListener("click", () => closeModal(groupChatModal));
    if (groupChatModal) {
        groupChatModal.addEventListener("click", (e) => { if (e.target === groupChatModal) closeModal(groupChatModal); });
    }

    document.addEventListener("click", (e) => {
        const joinBtn = e.target.closest(".btn-join-group");
        if (!joinBtn) return;
        const groupId = joinBtn.getAttribute("data-group-id");
        const group = appState.studyGroups.find(g => g.id === groupId);
        if (group && group.joined) {
            e.stopImmediatePropagation();
            openGroupChat(group);
        }
    }, true);

    document.querySelectorAll(".btn-ask-ai").forEach(btn => {
        btn.addEventListener("click", () => openModal(aiMentorModal));
    });

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            try {
                const firebaseBackend = await getFirebaseBackend();
                if (firebaseBackend && firebaseBackend.auth) {
                    await firebaseBackend.auth.signOut();
                }
            } catch (err) {
                console.error("Firebase signout error:", err);
            }
            localStorage.removeItem("isLoggedIn");
            window.location.replace('login.html');
        });
    }

    // Initial stats update
    updateUserStatsUI();

    // Bind "ابدأ الحل" after exam engine is fully defined
    function bindStartSolvingButtons() {
        const runExam = (subject) => {
            try {
                startExam(subject);
            } catch (err) {
                console.error("startExam failed:", err);
                showToast("تعذر بدء الاختبار. حدّث الصفحة وحاول مرة أخرى.", "error");
            }
        };

        document.querySelectorAll(".btn-start-solving").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const subject = btn.getAttribute("data-subject");
                if (subject) runExam(subject);
            });
        });

        // أزرار بدء الامتحان الحقيقي (من قسم الامتحانات)
        document.querySelectorAll(".btn-start-exam").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const subject = btn.getAttribute("data-subject");
                if (subject) startExam(subject, false); // false = وضع الامتحان الحقيقي مع التايمر
            });
        });
    }



    // ==========================================
    // AI Review: Wrong Answers + Similar Questions
    // ==========================================
    const aiReviewModal = document.getElementById("ai-review-modal");
    const aiReviewBody = document.getElementById("ai-review-body");
    const aiReviewSubtitle = document.getElementById("ai-review-subtitle");
    const btnCloseAiReview = document.getElementById("btn-close-ai-review");
    if (btnCloseAiReview && aiReviewModal) {
        btnCloseAiReview.addEventListener("click", () => closeModal(aiReviewModal));
        aiReviewModal.addEventListener("click", (e) => { if (e.target === aiReviewModal) closeModal(aiReviewModal); });
    }

    function getSimilarQuestionsEndpoints() {
        return getApiEndpoints("/api/generate-similar-questions");
    }

    async function requestSimilarQuestions(payload) {
        let response, lastError;
        for (const endpoint of getSimilarQuestionsEndpoints()) {
            try {
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (response.ok) break;
                lastError = new Error(await readApiError(response, `AI request failed: ${response.status}`));
            } catch (error) { lastError = error; }
        }
        if (!response || !response.ok) throw lastError || new Error("AI request failed");
        return response.json();
    }

    function renderWrongAnswersList() {
        const section = document.getElementById("wrong-answers-section");
        const list = document.getElementById("wrong-answers-list");
        if (!section || !list || !appState.exam || !Array.isArray(appState.exam.questions)) return;

        const wrong = [];
        appState.exam.questions.forEach((q, idx) => {
            const userAns = appState.exam.answers[idx];
            if (userAns !== q.correct) {
                wrong.push({ q, idx, userAns });
            }
        });

        if (wrong.length === 0) {
            section.style.display = "none";
            return;
        }
        section.style.display = "block";
        list.innerHTML = "";

        wrong.forEach(({ q, idx, userAns }) => {
            const card = document.createElement("div");
            card.className = "wrong-answer-card";
            const userLabel = userAns ? `إجابتك: ${userAns}` : "لم تجب";
            const correctLabel = `الصحيح: ${q.correct}`;
            const optsStr = Array.isArray(q.options) ? q.options : [];
            card.innerHTML = `
                <div class="wa-meta">
                    <span class="wa-chip">سؤال ${idx + 1}</span>
                    <span class="wa-chip">${escapeHTML(q.topic || "")}</span>
                    <span class="wa-chip wa-wrong">${escapeHTML(userLabel)}</span>
                    <span class="wa-chip wa-correct">${escapeHTML(correctLabel)}</span>
                </div>
                <p class="wa-text">${escapeHTML(q.text || "")}</p>
                <button type="button" class="wa-explain-btn">
                    <i data-lucide="sparkles"></i>
                    <span>اشرح + جرّب أسئلة شبيهة</span>
                </button>
            `;
            const btn = card.querySelector(".wa-explain-btn");
            btn.addEventListener("click", async () => {
                btn.disabled = true;
                btn.innerHTML = '<i data-lucide="loader"></i><span>جارٍ التحليل...</span>';
                refreshIcons();
                try {
                    await openAiReviewForQuestion({
                        questionText: q.text || "",
                        subject: detectSubjectFromExamQuestion(q),
                        topic: q.topic || "",
                        options: optsStr,
                        correctAnswer: q.correct || "",
                        userAnswer: userAns || ""
                    });
                } catch (err) {
                    console.error(err);
                    showToast("تعذر الاتصال بالمعلم الذكي. حاول لاحقًا.", "error");
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i data-lucide="sparkles"></i><span>اشرح + جرّب أسئلة شبيهة</span>';
                    refreshIcons();
                }
            });
            list.appendChild(card);
        });
        refreshIcons();
    }

    function detectSubjectFromExamQuestion(q) {
        if (q && q.subject) return q.subject;
        if (appState.exam && appState.exam.subject) {
            const map = {
                physics: "الفيزياء", chemistry: "الكيمياء", math: "الرياضيات",
                biology: "الأحياء", arabic: "اللغة العربية", english: "اللغة الإنجليزية",
                geology: "الجيولوجيا", history: "التاريخ", geography: "الجغرافيا"
            };
            return map[appState.exam.subject] || appState.exam.subject;
        }
        return "عام";
    }

    async function openAiReviewForQuestion(payload) {
        if (!aiReviewModal || !aiReviewBody) return;
        openModal(aiReviewModal);
        if (aiReviewSubtitle) aiReviewSubtitle.textContent = "يحلل سؤالك بالذكاء الاصطناعي...";
        aiReviewBody.innerHTML = `
            <div class="ai-review-loading">
                <div class="ai-spinner"></div>
                <p>المعلم الذكي بيحلل السؤال ويجهز أسئلة شبيهة...</p>
            </div>
        `;
        try {
            const data = await requestSimilarQuestions(payload);
            renderAiReviewResult(data, payload);
        } catch (err) {
            console.error(err);
            const errorMessage = err?.message || "???? ??????? ??????? ?????.";
            aiReviewBody.innerHTML = `
                <div class="ai-review-error">
                    <p>???? ??????? ??????? ?????.</p>
                    <p style="font-size:0.85rem;color:var(--text-muted);">${escapeHTML(errorMessage)}</p>
                </div>
            `;
        }
    }

    function renderAiReviewResult(data, payload) {
        if (!aiReviewBody) return;
        if (aiReviewSubtitle) aiReviewSubtitle.textContent = `${payload.subject}${payload.topic ? " · " + payload.topic : ""}`;
        const explainHtml = Array.isArray(data.explanation) && data.explanation.length
            ? `<div class="ai-review-section">
                  <h4><i data-lucide="lightbulb"></i> سبب الخطأ + الفهم الصح</h4>
                  <div class="ai-review-explain">
                      <ol>${data.explanation.map(line => `<li>${escapeHTML(line)}</li>`).join("")}</ol>
                  </div>
               </div>`
            : "";

        const sims = Array.isArray(data.similarQuestions) ? data.similarQuestions : [];
        const simsHtml = sims.length
            ? `<div class="ai-review-section">
                  <h4><i data-lucide="repeat"></i> 3 أسئلة شبيهة جرّبها</h4>
                  ${sims.map((q, i) => `
                      <div class="similar-question-card" data-correct="${escapeHTML(q.correct)}">
                          <p class="sq-text"><span class="sq-num">${i+1}</span>${escapeHTML(q.text)}</p>
                          <div class="sq-options">
                              ${q.options.map((opt, j) => `
                                  <button type="button" class="sq-option" data-letter="${String.fromCharCode(65+j)}">
                                      <strong>${String.fromCharCode(65+j)})</strong> ${escapeHTML(opt)}
                                  </button>
                              `).join("")}
                          </div>
                          ${q.hint ? `<div class="sq-hint">💡 ${escapeHTML(q.hint)}</div>` : ""}
                      </div>
                  `).join("")}
               </div>`
            : `<div class="ai-review-section"><p style="color:var(--text-muted);text-align:center;">لم يتم توليد أسئلة شبيهة هذه المرة.</p></div>`;

        aiReviewBody.innerHTML = explainHtml + simsHtml;

        // Wire option clicks
        aiReviewBody.querySelectorAll(".similar-question-card").forEach(card => {
            const correct = card.getAttribute("data-correct");
            card.querySelectorAll(".sq-option").forEach(opt => {
                opt.addEventListener("click", () => {
                    if (card.dataset.answered === "1") return;
                    card.dataset.answered = "1";
                    const chosen = opt.getAttribute("data-letter");
                    card.querySelectorAll(".sq-option").forEach(o => {
                        const letter = o.getAttribute("data-letter");
                        if (letter === correct) o.classList.add("sq-correct");
                        else if (letter === chosen) o.classList.add("sq-wrong");
                        o.style.pointerEvents = "none";
                    });
                    const hint = card.querySelector(".sq-hint");
                    if (hint) hint.classList.add("show");
                    if (chosen === correct) {
                        showToast("إجابة صحيحة! 🎉", "success");
                    } else {
                        showToast("غلط — شوف الإجابة الصحيحة والشرح", "info");
                    }
                });
            });
        });
        refreshIcons();
    }

    bindStartSolvingButtons();
    refreshIcons();
});


