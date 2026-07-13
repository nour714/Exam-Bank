/* ==========================================
   Exam Bank - Application logic (SPA & Exam)
   ========================================== */

document.addEventListener("DOMContentLoaded", async () => {
    // قائمة الإيميلات التي يحق لها رؤية زر "لوحة المطور" (أضف إيميلك هنا)
    const ADMIN_EMAILS = ["noureg122@gmail.com"];

    const queryParams = new URLSearchParams(window.location.search);
    const launchSource = queryParams.get("source") || "";

    function clearPersistedAuthState() {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        localStorage.removeItem("authUser");
        localStorage.removeItem("userStats");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authMode");
        localStorage.removeItem("appStateOwnerEmail");
    }

    function hasLocalOfflineSession() {
        return localStorage.getItem("isLoggedIn") === "true" && (
            localStorage.getItem("authMode") === "demo" ||
            localStorage.getItem("allowOfflineAccess") === "true"
        );
    }

    async function ensureAuthenticatedSession() {
        if (hasLocalOfflineSession() && (launchSource === "demo" || launchSource === "offline" || !navigator.onLine)) {
            return true;
        }

        try {
            const firebaseBackend = await getFirebaseBackend();
            if (!firebaseBackend || !firebaseBackend.auth) {
                if (hasLocalOfflineSession()) return true;
                clearPersistedAuthState();
                window.location.replace("login.html");
                return false;
            }

            if (typeof firebaseBackend.waitForAuthState === "function") {
                await firebaseBackend.waitForAuthState();
            }

            const currentUser = firebaseBackend.auth.currentUser;
            if (!currentUser) {
                if (localStorage.getItem("authMode") === "demo") return true;
                if (hasLocalOfflineSession() && !navigator.onLine) return true;
                if (!navigator.onLine) {
                    localStorage.setItem('authMode', 'demo');
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', 'Offline User');
                    return true;
                }
                
                clearPersistedAuthState();
                window.location.replace("login.html");
                return false;
            }

            const email = currentUser.email || localStorage.getItem("userEmail") || "";
            const resolvedName =
                (currentUser.displayName || "").trim() ||
                localStorage.getItem("userName") ||
                (email ? email.split("@")[0] : "") ||
                "Student";

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", resolvedName);
            if (email) localStorage.setItem("userEmail", email);
            localStorage.setItem("authMode", "firebase");
            localStorage.setItem("allowOfflineAccess", "true");

            if (currentUser.photoURL) {
                localStorage.setItem("userPhoto", currentUser.photoURL);
            } else {
                localStorage.removeItem("userPhoto");
            }

            return true;
        } catch (error) {
            console.warn("تعذر التحقق من جلسة المستخدم:", error);
            if (hasLocalOfflineSession()) return true;
            clearPersistedAuthState();
            window.location.replace("login.html");
            return false;
        }
    }

    if (!(await ensureAuthenticatedSession())) {
        return;
    }

    // Initialize Lucide Icons
    let lucideRefreshPending = false;
    function refreshIcons() {
        if (lucideRefreshPending) return;
        lucideRefreshPending = true;

        requestAnimationFrame(() => {
            lucideRefreshPending = false;
            if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
                lucide.createIcons();
            }
        });
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
        const savedUser = safeParseJSON("userStats", null);
        const savedAvatar = savedUser?.avatar || "";

        // Update name in sidebar
        const usernameEl = document.querySelector('.user-profile-widget .username');
        if (usernameEl) usernameEl.textContent = userName;

        // Update welcome text in dashboard
        const welcomeEl = document.querySelector('#dashboard-view .welcome-text h1');
        if (welcomeEl) {
            welcomeEl.innerHTML = `أهلاً بك مجدداً، <bdi class="username">${userName}</bdi> 👋`;
        }

        // Update Avatar
        const avatarImg = document.getElementById('user-avatar-img');
        if (avatarImg) avatarImg.src = savedAvatar || generateInitialAvatar(userName);
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
        let iconColor = "bg-green";
        if (type === "info") { iconName = "info"; iconColor = "bg-blue"; }
        if (type === "warning") { iconName = "alert-triangle"; iconColor = "bg-orange"; }
        if (type === "error") { iconName = "x-circle"; iconColor = "bg-red"; }

        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Add to notifications dropdown
        const notificationBody = document.getElementById("notification-body");
        const bellBadge = document.querySelector(".bell-badge");
        if (notificationBody) {
            // Remove the "No new notifications" message if it exists
            const emptyMsg = notificationBody.querySelector("p");
            if (emptyMsg && emptyMsg.textContent === "لا توجد تنبيهات جديدة") {
                notificationBody.innerHTML = "";
            }

            const notifItem = document.createElement("div");
            notifItem.className = "notification-item unread";
            notifItem.innerHTML = `
                <div class="item-icon ${iconColor}"><i data-lucide="${iconName}"></i></div>
                <div class="item-content">
                    <p>${message}</p>
                    <span class="time">الآن</span>
                </div>
            `;
            notificationBody.insertBefore(notifItem, notificationBody.firstChild);
            if (bellBadge) {
                bellBadge.style.display = "block";
            }
            
            localStorage.setItem("notificationsHTML", notificationBody.innerHTML);
            localStorage.setItem("bellBadgeDisplay", bellBadge ? bellBadge.style.display : "block");
        }

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
    const DEFAULT_STUDY_GROUPS = [];

    function cloneDefaultStudyGroups() {
        return DEFAULT_STUDY_GROUPS.map((group) => ({
            ...group,
            avatars: [...group.avatars]
        }));
    }

    const appState = {
        currentView: "home-view",
        darkMode: true,
        user: {
            name: "",
            email: "",
            notifications: true,
            xp: 0,
            solvedCount: 0,
            streak: 0,
            accuracy: 0,
            avatar: "",
            lastActiveDate: "",
            grade: "3",
            pathway: null
        },
        studyGroups: cloneDefaultStudyGroups(),
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
        notes: [],
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0] // السبت -> الجمعة (7 أيام)
    };

    function recordTodayActivity(questionsCount) {
        if (questionsCount <= 0) return;

        const jsDay = new Date().getDay();
        const todayIdx = (jsDay + 1) % 7;
        if (!Array.isArray(appState.weeklyActivity) || appState.weeklyActivity.length !== 7) {
            appState.weeklyActivity = [0,0,0,0,0,0,0];
        }
        appState.weeklyActivity[todayIdx] = (appState.weeklyActivity[todayIdx] || 0) + questionsCount;

        // تحديث الـ Streak
        const todayStr = new Date().toISOString().split('T')[0];
        const lastDateStr = appState.user.lastActiveDate;

        if (lastDateStr !== todayStr) {
            if (lastDateStr) {
                const today = new Date(todayStr);
                const lastDate = new Date(lastDateStr);
                const diffTime = today - lastDate;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    appState.user.streak += 1;
                } else if (diffDays > 1) {
                    appState.user.streak = 1;
                }
            } else {
                appState.user.streak = 1;
            }
            appState.user.lastActiveDate = todayStr;
        }
    }

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
            avatar: "",
            lastActiveDate: "",
            grade: "3",
            pathway: null
        };
        appState.studyGroups = cloneDefaultStudyGroups();
        appState.customQuestions = [];
        appState.notes = [];
        appState.weeklyActivity = [0,0,0,0,0,0,0];
    }

    // ==========================================
    // Subjects Logic
    // ==========================================
    const SUBJECTS_MAP = {
        "1": ["physics", "chemistry", "biology", "math", "arabic", "english", "history", "geography"],
        "2": {
            "Medicine & Life Sciences": ["physics", "chemistry", "biology", "arabic", "english"],
            "Engineering & Computer Science": ["physics", "chemistry", "math", "arabic", "english"],
            "Business": ["math", "arabic", "english", "history", "geography"],
            "Arts & Humanities": ["arabic", "english", "history", "geography"]
        },
        "3": {
            "Medicine & Life Sciences": ["physics", "chemistry", "biology", "geology", "arabic", "english"],
            "Engineering & Computer Science": ["physics", "chemistry", "math", "arabic", "english"],
            "Business": ["math", "arabic", "english", "history", "geography"],
            "Arts & Humanities": ["arabic", "english", "history", "geography"]
        }
    };

    function getUserSubjects() {
        const g = appState.user.grade || "3";
        const p = appState.user.pathway;
        if (g === "1") return SUBJECTS_MAP["1"];
        if (!p) return ["physics", "chemistry", "biology", "math", "arabic", "english", "geology", "history", "geography"]; // Show all if pathway not set
        return SUBJECTS_MAP[g][p] || SUBJECTS_MAP["3"]["Medicine & Life Sciences"];
    }

    function renderSubjectsVisibility() {
        const allowed = getUserSubjects();
        const allSubjectCards = document.querySelectorAll('.subject-minimal-card, .subject-large-card');
        allSubjectCards.forEach(card => {
            const id = card.getAttribute('data-subject') || card.getAttribute('data-subject-id');
            if (allowed.includes(id)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    }

    // ==========================================
    // Real Question Bank — All Subjects
    // ==========================================
    const QUESTION_BANK = {
        "الفيزياء": [],
        "الكيمياء": [],
        "الأحياء": [],
        "الرياضيات": [],
        "اللغة العربية": [],
        "اللغة الإنجليزية": [],
        "الجيولوجيا": [],
        "التاريخ": [],
        "الجغرافيا": []
    };

    const EXTRA_REALISTIC_QUESTIONS = {
        "الفيزياء": [],
        "الكيمياء": [],
        "الأحياء": [],
        "الرياضيات": [],
        "اللغة العربية": [],
        "اللغة الإنجليزية": [],
        "الجيولوجيا": [],
        "التاريخ": [],
        "الجغرافيا": []
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
            // No questions available from Firebase yet
            appState.exam.questions = [];
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
        }

        if (darkToggle) darkToggle.checked = appState.darkMode;
        document.body.classList.toggle("dark-theme", appState.darkMode);

        const savedUser = safeParseJSON("userStats", null);
        if (savedUser) {
            appState.user = savedUser;
            updateUserStatsUI();
        }

        const savedGroups = safeParseJSON("studyGroups", null);
        if (savedGroups) {
            appState.studyGroups = savedGroups;
        }
        if (!Array.isArray(appState.studyGroups) || appState.studyGroups.length === 0) {
            appState.studyGroups = cloneDefaultStudyGroups();
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

        const savedWeeklyActivity = safeParseJSON("weeklyActivity", null);
        if (Array.isArray(savedWeeklyActivity) && savedWeeklyActivity.length === 7) {
            appState.weeklyActivity = savedWeeklyActivity;
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
        if (!Array.isArray(appState.studyGroups) || appState.studyGroups.length === 0) {
            appState.studyGroups = cloneDefaultStudyGroups();
        }

        if (Array.isArray(savedState.notes)) {
            appState.notes = savedState.notes;
        }

        if (Array.isArray(savedState.customQuestions)) {
            // دمج أسئلة Firebase مع الأسئلة المحلية (من لوحة الأدمن) بدون تكرار
            const localQs = Array.isArray(appState.customQuestions) ? appState.customQuestions : [];
            const cloudQs = savedState.customQuestions;
            const allIds  = new Set(cloudQs.map(q => q.id));
            const merged  = [...cloudQs, ...localQs.filter(q => !allIds.has(q.id))];
            appState.customQuestions = merged;
        }

        if (Array.isArray(savedState.weeklyActivity) && savedState.weeklyActivity.length === 7) {
            appState.weeklyActivity = savedState.weeklyActivity;
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
            customQuestions: appState.customQuestions,
            weeklyActivity: appState.weeklyActivity
        };
    }

    let firebaseSaveTimer = null;

    async function getFirebaseBackend() {
        try {
            if (window.examBankFirebase) return window.examBankFirebase;
            if (!window.examBankFirebaseReady) {
                window.examBankFirebaseReady = import("./api-client.js").catch((error) => {
                    console.warn("تعذر تحميل الخادم:", error);
                    return null;
                });
            }
            if (window.examBankFirebaseReady) {
                await window.examBankFirebaseReady;
                return window.examBankFirebase;
            }
        } catch (error) {
            console.warn("تعذر الاتصال بالخادم:", error);
        }
        return null;
    }

    async function loadStateFromFirebase() {
        const firebaseBackend = await getFirebaseBackend();
        if (!firebaseBackend) return;

        try {
            // تحميل بيانات الملف الشخصي من الخادم (الاسم، الصورة، الإعدادات)
            try {
                const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
                if (authUser) {
                    if (authUser.name) {
                        appState.user.name = authUser.name;
                        localStorage.setItem('userName', authUser.name);
                    }
                    if (authUser.avatar) {
                        appState.user.avatar = authUser.avatar;
                    }
                    if (authUser.notifications !== undefined) {
                        appState.user.notifications = authUser.notifications;
                    }
                }
            } catch (e) { /* ignore */ }

            if (typeof firebaseBackend.loadUserState === "function") {
                const cloudState = await firebaseBackend.loadUserState();
                if (cloudState) {
                    applyPersistedState(cloudState);
                }
            }
            
            // تحميل الأسئلة العامة من قاعدة البيانات — Firebase هو المصدر الوحيد للحقيقة
            if (typeof firebaseBackend.loadGlobalQuestions === "function") {
                const globalQs = await firebaseBackend.loadGlobalQuestions();
                const localQs = Array.isArray(appState.customQuestions) ? appState.customQuestions : [];
                const userOwnQs = localQs.filter(q => q.source === "custom" || q.source === "user");
                const globalIds = new Set(globalQs.map(q => q.id));
                const merged = [...globalQs, ...userOwnQs.filter(q => !globalIds.has(q.id))];
                appState.customQuestions = merged;
                saveStateToLocalStorage(false);
                updateUserStatsUI();
            }
        } catch (error) {
            console.warn("تعذر تحميل البيانات من Firebase:", error);
            showToast("Firebase غير متاح حاليًا، نستخدم التخزين المحلي.", "info");
        } finally {
            // إخفاء شاشة التحميل
            const skeletonLoader = document.getElementById("app-skeleton-loader");
            if (skeletonLoader) {
                skeletonLoader.classList.add("hidden");
                setTimeout(() => {
                    skeletonLoader.style.display = "none";
                }, 600); // Wait for transition
            }
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
        }, 900);
    }

    function saveStateToLocalStorage(syncFirebase = true) {
        localStorage.setItem("darkMode", String(appState.darkMode));
        localStorage.setItem("userStats", JSON.stringify(appState.user));
        localStorage.setItem("studyGroups", JSON.stringify(appState.studyGroups));
        localStorage.setItem("studyNotes", JSON.stringify(appState.notes));
        localStorage.setItem("customQuestions", JSON.stringify(appState.customQuestions));
        localStorage.setItem("weeklyActivity", JSON.stringify(appState.weeklyActivity));
        if (syncFirebase) queueFirebaseSave();
    }

    // تحديث صورة المستخدم بناءً على الاسم
    function updateUserAvatar() {
        const userAvatarImg = document.getElementById("user-avatar-img");
        if (!userAvatarImg) return;
        
        if (appState.user.avatar) {
            userAvatarImg.src = appState.user.avatar;
            userAvatarImg.alt = appState.user.name || "Student";
        } else if (appState.user.name) {
            const avatarUrl = generateInitialAvatar(appState.user.name);
            userAvatarImg.src = avatarUrl;
            userAvatarImg.alt = appState.user.name;
        } else {
            const defaultAvatar = generateInitialAvatar("Student");
            userAvatarImg.src = defaultAvatar;
            userAvatarImg.alt = "Student";
        }
    }

    function updateSettingsAvatarPreview() {
        const settingsAvatarPreview = document.getElementById("settings-avatar-preview");
        if (!settingsAvatarPreview) return;

        settingsAvatarPreview.src = appState.user.avatar || generateInitialAvatar(appState.user.name || "Student");
    }

    function updateUserStatsUI() {
        updateUserAvatar(); // تحديث الصورة أولاً
        updateSettingsAvatarPreview();
        if (usernameHeader) usernameHeader.textContent = appState.user.name || "طالب";
        const sidebarUserBadge = document.getElementById("sidebar-user-badge");
        if (sidebarUserBadge) {
            const gradesMap = { "1": "الصف الأول الثانوي", "2": "الصف الثاني الثانوي", "3": "الصف الثالث الثانوي" };
            sidebarUserBadge.textContent = gradesMap[appState.user.grade] || "طالب ثانوي";
        }
        
        if (settingsNameInput) settingsNameInput.value = appState.user.name || "";
        
        const settingsEmail = document.getElementById("settings-email");
        if (settingsEmail) settingsEmail.value = appState.user.email || "";

        const settingsGrade = document.getElementById("settings-grade");
        if (settingsGrade) settingsGrade.value = appState.user.grade || "3";

        const settingsPathway = document.getElementById("settings-pathway");
        if (settingsPathway) settingsPathway.value = appState.user.pathway || "";

        // Trigger pathway visibility toggle
        if (settingsGrade) {
            settingsGrade.dispatchEvent(new Event('change'));
        }
        
        const adminMenuLink = document.getElementById("admin-menu-link");
        if (adminMenuLink) {
            const currentEmail = appState.user.email || localStorage.getItem("userEmail") || "";
            if (currentEmail && ADMIN_EMAILS.includes(currentEmail)) {
                adminMenuLink.style.display = "flex";
            } else {
                adminMenuLink.style.display = "none";
            }
        }
        
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
        renderWeeklyChart();
        renderSubjectsVisibility();
    }

    function renderWeeklyChart() {
        const chart = document.getElementById("weekly-bar-chart");
        const legend = document.getElementById("chart-legend-today");
        if (!chart) return;

        const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
        // اليوم الحالي من الأسبوع (0=السبت في الحساب العربي، نحول من JS)
        const jsDay = new Date().getDay(); // 0=Sunday..6=Saturday
        const todayIdx = (jsDay + 1) % 7;  // 0=Sat,1=Sun,...6=Fri

        const data = [...(appState.weeklyActivity || [0,0,0,0,0,0,0])];
        const maxVal = Math.max(...data, 1);
        const todayCount = data[todayIdx];

        if (legend) {
            legend.textContent = todayCount > 0
                ? `${todayCount} سؤال اليوم ✅`
                : 'لا يوجد نشاط اليوم';
        }

        chart.innerHTML = "";
        days.forEach((dayName, idx) => {
            const val = data[idx] || 0;
            const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
            const isToday = (idx === todayIdx);

            const wrapper = document.createElement("div");
            wrapper.className = "chart-bar-wrapper" + (isToday ? " active" : "");
            wrapper.title = `${dayName}: ${val} سؤال`;

            const fill = document.createElement("div");
            fill.className = "bar-fill";
            fill.style.height = "0%";
            fill.style.transition = "height 0.6s cubic-bezier(0.34,1.56,0.64,1)";

            const tooltip = document.createElement("span");
            tooltip.className = "bar-tooltip";
            tooltip.textContent = val > 0 ? `${val} سؤال` : "لا يوجد";
            fill.appendChild(tooltip);

            const label = document.createElement("span");
            label.className = "bar-label";
            label.textContent = dayName;

            wrapper.appendChild(fill);
            wrapper.appendChild(label);

            // تأثير النقر: تبديل الـ active
            wrapper.addEventListener("click", () => {
                chart.querySelectorAll(".chart-bar-wrapper").forEach(w => w.classList.remove("active"));
                wrapper.classList.add("active");
                if (legend) {
                    legend.textContent = val > 0 ? `${val} سؤال — ${dayName}` : `لا يوجد نشاط — ${dayName}`;
                }
            });

            chart.appendChild(wrapper);

            // Animation: تأخير ظهور العمود
            requestAnimationFrame(() => {
                setTimeout(() => {
                    fill.style.height = `${heightPct}%`;
                }, idx * 60);
            });
        });
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
    const settingsAvatarInput = document.getElementById("settings-avatar-input");
    const removeAvatarBtn = document.getElementById("btn-remove-avatar");
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
    const examHistoryModal = document.getElementById("exam-history-modal");
    const btnCloseExamHistory = document.getElementById("btn-close-exam-history");
    const examHistoryList = document.getElementById("exam-history-list");

    if (btnCloseExamHistory) {
        btnCloseExamHistory.addEventListener("click", () => {
            if (examHistoryModal) examHistoryModal.classList.remove("active");
        });
    }

    const actionCardExams = document.querySelector('.action-card[data-action="exams"]');
    if (actionCardExams) {
        actionCardExams.addEventListener("click", async () => {
            if (examHistoryModal) examHistoryModal.classList.add("active");
            if (examHistoryList) {
                examHistoryList.innerHTML = '<tr><td colspan="3" style="text-align: center;">جار التحميل...</td></tr>';
                try {
                    const token = localStorage.getItem("token");
                    if (token) {
                        const response = await fetch("/api/exams/attempts", {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        const data = await response.json();
                        if (data.success && data.data && data.data.length > 0) {
                            examHistoryList.innerHTML = "";
                            data.data.forEach(attempt => {
                                const tr = document.createElement("tr");
                                tr.style.borderBottom = "1px solid #e2e8f0";
                                
                                const dateStr = new Date(attempt.createdAt).toLocaleDateString("ar-EG");
                                const tdDate = document.createElement("td");
                                tdDate.style.padding = "10px";
                                tdDate.textContent = dateStr;
                                
                                const gradeText = attempt.grade === "1" ? "الأول" : attempt.grade === "2" ? "الثاني" : "الثالث";
                                const pathwayText = attempt.pathway ? attempt.pathway : "غير محدد";
                                const tdInfo = document.createElement("td");
                                tdInfo.style.padding = "10px";
                                tdInfo.textContent = `الصف ${gradeText} - ${pathwayText}`;
                                
                                const scorePct = Math.round((attempt.score / attempt.total) * 100);
                                const tdScore = document.createElement("td");
                                tdScore.style.padding = "10px";
                                tdScore.innerHTML = `<span style="color: ${scorePct >= 50 ? 'var(--color-success)' : 'var(--color-danger)'}">${attempt.score}/${attempt.total} (${scorePct}%)</span>`;
                                
                                tr.appendChild(tdDate);
                                tr.appendChild(tdInfo);
                                tr.appendChild(tdScore);
                                examHistoryList.appendChild(tr);
                            });
                        } else {
                            examHistoryList.innerHTML = '<tr><td colspan="3" style="text-align: center;">لا توجد اختبارات سابقة</td></tr>';
                        }
                    } else {
                        examHistoryList.innerHTML = '<tr><td colspan="3" style="text-align: center;">يرجى تسجيل الدخول لعرض السجل</td></tr>';
                    }
                } catch (e) {
                    examHistoryList.innerHTML = '<tr><td colspan="3" style="text-align: center;">حدث خطأ أثناء تحميل السجل</td></tr>';
                }
            }
        });
    }
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
    const scheduleBackgroundTask = (task) => {
        if (typeof window.requestIdleCallback === "function") {
            window.requestIdleCallback(task, { timeout: 1200 });
        } else {
            setTimeout(task, 350);
        }
    };
    scheduleBackgroundTask(() => loadStateFromFirebase());

    // تحميل بيانات المستخدم من الخادم (authUser) إذا كانت متوفرة
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

        // تحميل بيانات الملف الشخصي من الخادم (avatar, notifications, darkMode)
        try {
            const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
            if (authUser) {
                // تحميل الصورة من الخادم إذا كانت موجودة ولم يكن هناك صورة محلية بالفعل
                if (authUser.avatar && !appState.user.avatar) {
                    appState.user.avatar = authUser.avatar;
                }
                // تحميل إعدادات الإشعارات
                if (authUser.notifications !== undefined) {
                    appState.user.notifications = authUser.notifications;
                }
                // تحميل الاسم من الخادم (الاسم المسجل عند التسجيل)
                if (authUser.name) {
                    appState.user.name = authUser.name;
                    localStorage.setItem('userName', authUser.name);
                }
            }
        } catch (e) {
            console.warn("تعذر تحميل بيانات الملف الشخصي:", e);
        }

        if (nameChanged || emailChanged) {
            saveStateToLocalStorage(false);
        }

        updateUserStatsUI();

        // Check if grade/pathway need setup
        const isGrade1 = appState.user.grade === "1";
        if (!appState.user.pathway && !isGrade1 && localStorage.getItem("authUser")) {
            const setupModal = document.getElementById("setup-grade-modal");
            if (setupModal) {
                setupModal.classList.add("active");
            }
        }
    })();

    if (settingsAvatarInput) {
        settingsAvatarInput.addEventListener("change", () => {
            const file = settingsAvatarInput.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                showToast("اختر ملف صورة صالح.", "error");
                settingsAvatarInput.value = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast("حجم الصورة يجب أن يكون أقل من 2MB.", "warning");
                settingsAvatarInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                const result = typeof reader.result === "string" ? reader.result : "";
                if (!result) {
                    showToast("تعذر تحميل الصورة.", "error");
                    return;
                }

                appState.user.avatar = result;
                updateUserStatsUI();
                saveStateToLocalStorage();
                settingsAvatarInput.value = "";

                // حفظ الصورة في الخادم لتكون متاحة من أي جهاز
                try {
                    const firebaseBackend = await getFirebaseBackend();
                    if (firebaseBackend && typeof firebaseBackend.updateProfile === "function") {
                        await firebaseBackend.updateProfile({ avatar: result });
                    }
                    showToast("تم تحديث صورة الملف الشخصي وحفظها. ✅", "success");
                } catch (e) {
                    console.warn("تعذر حفظ الصورة في الخادم:", e);
                    showToast("تم تحديث الصورة محلياً فقط.", "warning");
                }
            };
            reader.onerror = () => {
                showToast("تعذر تحميل الصورة.", "error");
                settingsAvatarInput.value = "";
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener("click", async () => {
            appState.user.avatar = "";
            updateUserStatsUI();
            saveStateToLocalStorage();

            // حذف الصورة من الخادم أيضاً
            try {
                const firebaseBackend = await getFirebaseBackend();
                if (firebaseBackend && typeof firebaseBackend.updateProfile === "function") {
                    await firebaseBackend.updateProfile({ avatar: null });
                }
            } catch (e) {
                console.warn("تعذر حذف الصورة من الخادم:", e);
            }
            showToast("تم حذف صورة الملف الشخصي.", "info");
        });
    }


    const setupGradeForm = document.getElementById("setup-grade-form");
    if (setupGradeForm) {
        setupGradeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const gradeVal = document.getElementById("setup-grade-select").value;
            const pathwayVal = document.getElementById("setup-pathway-select").value;

            if (gradeVal !== "1" && !pathwayVal) {
                showToast("الرجاء اختيار المسار الدراسي", "warning");
                return;
            }

            appState.user.grade = gradeVal;
            appState.user.pathway = pathwayVal || null;

            updateUserStatsUI();
            saveStateToLocalStorage();

            const setupModal = document.getElementById("setup-grade-modal");
            if (setupModal) setupModal.classList.remove("active");

            try {
                const firebaseBackend = await getFirebaseBackend();
                if (firebaseBackend && typeof firebaseBackend.updateProfile === "function") {
                    await firebaseBackend.updateProfile({
                        grade: appState.user.grade,
                        pathway: appState.user.pathway
                    });
                }
            } catch (err) {
                console.warn("تعذر حفظ الإعدادات في الخادم:", err);
            }
            showToast("تم إعداد الملف الشخصي بنجاح. ✅", "success");
        });
        
        const setupGradeSelect = document.getElementById("setup-grade-select");
        const setupPathwaySelect = document.getElementById("setup-pathway-select");
        if (setupGradeSelect && setupPathwaySelect) {
            setupGradeSelect.addEventListener("change", () => {
                if (setupGradeSelect.value === "1") {
                    setupPathwaySelect.parentElement.parentElement.style.display = "none";
                    setupPathwaySelect.required = false;
                } else {
                    setupPathwaySelect.parentElement.parentElement.style.display = "block";
                    setupPathwaySelect.required = true;
                }
            });
            // Initial trigger
            setupGradeSelect.dispatchEvent(new Event('change'));
        }
    }

    const settingsGradeSelect = document.getElementById("settings-grade");
    const settingsPathwaySelect = document.getElementById("settings-pathway");
    if (settingsGradeSelect && settingsPathwaySelect) {
        settingsGradeSelect.addEventListener("change", () => {
            if (settingsGradeSelect.value === "1") {
                settingsPathwaySelect.parentElement.parentElement.style.display = "none";
            } else {
                settingsPathwaySelect.parentElement.parentElement.style.display = "block";
            }
        });
    }

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
            if (target) {
                switchView(target);
            }
        });
    });

    function resolveSubjectNameFromCard(card) {
        if (!card) return "";
        const directSubject = card.querySelector("[data-subject]")?.getAttribute("data-subject");
        if (directSubject) return directSubject;

        const subjectId = card.getAttribute("data-subject-id") || card.getAttribute("data-subject");
        const subjectMap = {
            physics: "الفيزياء",
            chemistry: "الكيمياء",
            biology: "الأحياء",
            math: "الرياضيات",
            arabic: "اللغة العربية",
            english: "اللغة الإنجليزية",
            geology: "الجيولوجيا",
            history: "التاريخ",
            geography: "الجغرافيا"
        };

        return subjectMap[subjectId] || "";
    }

    function bindSubjectCardNavigation() {
        document.querySelectorAll(".subject-minimal-card, .subject-large-card:not(.exam-card)").forEach((card) => {
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            const activateCard = (event) => {
                if (event.target.closest("button")) return;
                const subjectName = resolveSubjectNameFromCard(card);
                if (!subjectName) return;
                startExam(subjectName);
            };

            card.addEventListener("click", activateCard);
            card.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                activateCard(event);
            });
        });
    }

    if (startStudyBtn) startStudyBtn.addEventListener("click", () => switchView("qbank-view"));
    if (viewAllSubjectsBtn) viewAllSubjectsBtn.addEventListener("click", () => switchView("qbank-view"));
    if (startTestQuickBtn) startTestQuickBtn.addEventListener("click", () => startExam("الفيزياء"));
    bindSubjectCardNavigation();

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

    function applyLaunchRoute() {
        const requestedView = queryParams.get("view");
        const routeMap = {
            dashboard: "dashboard-view",
            qbank: "qbank-view",
            groups: "groups-view",
            settings: "settings-view",
            home: "home-view",
            exams: "qbank-view"
        };

        const targetView = routeMap[requestedView];
        if (targetView) {
            switchView(targetView);
        }

        if (launchSource === "offline") {
            showToast("أنت تستخدم النسخة المحلية المخزنة للعمل دون اتصال.", "info");
        } else if (launchSource === "demo") {
            showToast("تم فتح التطبيق بالحساب التجريبي بنجاح.", "success");
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
        return getApiEndpoints("/api/ai/extract-question-image");
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
        const endpoints = getQuestionImageEndpoints();
        let lastError = new Error("جميع خوادم الاستخراج غير متاحة");

        for (const endpoint of endpoints) {
            try {
                const providerResponse = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageDataUrl })
                });

                const data = await providerResponse.json().catch(() => ({}));
                if (!providerResponse.ok) {
                    lastError = new Error(data.error || "فشل استخراج السؤال من الصورة");
                    continue;
                }
                return data;
            } catch (err) {
                lastError = err;
            }
        }

        throw lastError;
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
        saveSettingsBtn.addEventListener("click", async () => {
            const newName = settingsNameInput.value.trim();
            const emailInput = document.getElementById("settings-email");
            const notifyInput = document.getElementById("settings-notifications");
            const settingsGrade = document.getElementById("settings-grade");
            const settingsPathway = document.getElementById("settings-pathway");
            
            if (newName) {
                appState.user.name = newName;
                if (emailInput) appState.user.email = emailInput.value.trim();
                if (notifyInput) appState.user.notifications = notifyInput.checked;
                if (settingsGrade) appState.user.grade = settingsGrade.value;
                if (settingsPathway) appState.user.pathway = settingsPathway.value || null;
                localStorage.setItem("userName", appState.user.name);
                localStorage.setItem("userEmail", appState.user.email || "");
                saveStateToLocalStorage();
                updateUserStatsUI();

                // حفظ البيانات في الخادم لتكون متاحة من أي جهاز
                try {
                    const firebaseBackend = await getFirebaseBackend();
                    if (firebaseBackend && typeof firebaseBackend.updateProfile === "function") {
                        await firebaseBackend.updateProfile({
                            name: appState.user.name,
                            avatar: appState.user.avatar || null,
                            notifications: appState.user.notifications,
                            grade: appState.user.grade,
                            pathway: appState.user.pathway,
                        });
                    }
                } catch (e) {
                    console.warn("تعذر حفظ الملف الشخصي في الخادم:", e);
                }
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
        if (totalQuestions === 0) {
            showToast("لا توجد أسئلة حالياً في هذه المادة! 📭", "warning");
            appState.exam.isActive = false;
            return;
        }

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
                <button type="button" class="wa-explain-btn" style="margin-top: 15px; width: fit-content; padding: 10px 20px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-color); cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;">
                    <i data-lucide="sparkles" style="color: var(--primary-color);"></i>
                    <span>اشرح + جرّب أسئلة شبيهة</span>
                </button>
            </div>
        `;
        examOptionsContainer.insertAdjacentElement("afterend", banner);

        const explainBtn = banner.querySelector(".wa-explain-btn");
        if (explainBtn) {
            explainBtn.addEventListener("click", async () => {
                explainBtn.disabled = true;
                explainBtn.innerHTML = '<i data-lucide="loader"></i><span>جارٍ التحليل...</span>';
                refreshIcons();
                try {
                    await openAiReviewForQuestion({
                        questionText: question.text || "",
                        subject: detectSubjectFromExamQuestion(question),
                        topic: question.topic || "",
                        options: question.options || [],
                        correctAnswer: question.correct || "",
                        userAnswer: selectedKey || ""
                    });
                } catch (err) {
                    console.error(err);
                    showToast("تعذر الاتصال بالمعلم الذكي. حاول لاحقًا.", "error");
                } finally {
                    explainBtn.disabled = false;
                    explainBtn.innerHTML = '<i data-lucide="sparkles" style="color: var(--primary-color);"></i><span>اشرح + جرّب أسئلة شبيهة</span>';
                    refreshIcons();
                }
            });
        }

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
        const answeredInExam = appState.exam.answers.filter(ans => ans !== null).length;
        appState.user.solvedCount += answeredInExam;
        appState.user.accuracy = Math.round((appState.user.accuracy * 3 + scorePercentage) / 4);

        // تسجيل نشاط اليوم في الرسم البياني
        recordTodayActivity(answeredInExam);

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

        // حفظ محاولة الامتحان في قاعدة البيانات
        const secondsSpent = (45 * 60) - appState.exam.timeRemaining;
        try {
            const token = localStorage.getItem("token");
            if (token) {
                fetch("/api/exams/attempts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        score,
                        total: totalQuestions,
                        duration: secondsSpent,
                        grade: appState.user.grade,
                        pathway: appState.user.pathway
                    })
                }).catch(err => console.warn("Failed to save exam attempt", err));
            }
        } catch(e) {}

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

        const minutes = Math.floor(secondsSpent / 60);
        const seconds = secondsSpent % 60;
        if (resultTimeSpent) resultTimeSpent.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;


        openModal(examResultsModal);
    }

    if (btnReviewAnswers) {
        btnReviewAnswers.addEventListener("click", () => {
            closeModal(examResultsModal);
            appState.exam.qbankMode = true; // تحويل لوضع المراجعة لإظهار الصح والخطأ
            appState.exam.currentQuestionIndex = 0; // العودة للسؤال الأول
            loadQuestion(0);
            renderQuestionsMap();
            switchView("exam-view");
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
        const endpoints = getApiEndpoints("/api/ai/mentor");
        let lastError = new Error("خدمة AI Mentor غير متاحة حالياً");

        for (const endpoint of endpoints) {
            try {
                const providerResponse = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: query, subject })
                });

                const data = await providerResponse.json().catch(() => ({}));
                if (!providerResponse.ok) {
                    lastError = new Error(data.error || "فشل الاتصال بـ AI Mentor");
                    continue;
                }

                return {
                    type: "lesson",
                    subject: data.subject || subject,
                    topic: data.topic || query,
                    explain: Array.isArray(data.explain) ? data.explain : ["تعذر توليد شرح", "حاول مرة أخرى"],
                    followUp: data.followUp || "ما رأيك؟",
                    practicePrompt: data.practicePrompt || "ابدأ الاختبار"
                };
            } catch (err) {
                lastError = err;
            }
        }

        throw lastError;
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
    // Study Group Chat Modal (Socket.IO)
    // ==========================================
    const groupChatModal = document.getElementById("group-chat-modal");
    const chatMessagesContainer = document.getElementById("chat-messages-container");
    const chatGroupNameEl = document.getElementById("chat-group-name");
    const chatGroupStatusEl = document.getElementById("chat-group-status");
    const chatSendForm = document.getElementById("chat-send-form");
    const chatMessageInput = document.getElementById("chat-message-input");
    const btnCloseChat = document.getElementById("btn-close-chat");

    let currentChatGroup = null;
    let socket = null;

    if (window.io) {
        socket = io({
            auth: {
                token: localStorage.getItem("accessToken")
            }
        });

        socket.on("connect_error", (err) => {
            console.warn("Socket connection error:", err.message);
        });

        socket.on("receiveMessage", (message) => {
            if (currentChatGroup && message.groupId === currentChatGroup.id) {
                const isUser = message.userId === appState.user.id;
                const senderName = isUser ? "أنت" : (message.user ? message.user.name : "عضو المجموعة");
                appendGroupBubble(message.content, isUser, senderName);
            }
        });
    }

    function appendGroupBubble(text, isUser, sender) {
        if (!chatMessagesContainer) return;
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${isUser ? "user-bubble" : "mock-bubble"}`; // Reusing mock-bubble styling for incoming
        bubble.innerHTML = `<span class="sender-name">${sender}</span><p>${text}</p>`;
        chatMessagesContainer.appendChild(bubble);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function openGroupChat(group) {
        if (!groupChatModal) return;
        currentChatGroup = group;
        chatGroupNameEl.textContent = group.name;
        chatGroupStatusEl.textContent = "متصل بالمجموعة";
        chatMessagesContainer.innerHTML = "";
        
        if (socket) {
            socket.emit("joinGroup", group.id);
            // Optionally load message history here via REST API or emit
        }

        appendGroupBubble(`مرحباً بك في مجموعة: ${group.name}! 👋`, false, "النظام");
        
        openModal(groupChatModal);
        if (chatMessageInput) chatMessageInput.focus();
    }

    if (chatSendForm) {
        chatSendForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = chatMessageInput.value.trim();
            if (!text || !currentChatGroup) return;
            
            // Append instantly for optimism
            appendGroupBubble(text, true, "أنت");
            chatMessageInput.value = "";
            
            if (socket) {
                socket.emit("sendMessage", {
                    groupId: currentChatGroup.id,
                    content: text
                });
            }
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
                    if (typeof firebaseBackend.waitForAuthState === "function") {
                        await firebaseBackend.waitForAuthState();
                    }
                    await firebaseBackend.auth.signOut();
                }
            } catch (err) {
                console.error("Firebase signout error:", err);
            }
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userName");
            localStorage.removeItem("userPhoto");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("authMode");
            localStorage.removeItem("allowOfflineAccess");
            window.location.replace('login.html');
        });
    }

    // Initial stats update
    updateUserStatsUI();
    applyLaunchRoute();

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
        return getApiEndpoints("/api/ai/generate-similar");
    }

    async function requestSimilarQuestions(payload) {
        const { questionText, subject, topic, correctAnswer, userAnswer, options } = payload;
        const endpoints = getSimilarQuestionsEndpoints();
        let lastError = new Error("خدمة الأسئلة المشابهة غير متاحة حالياً");

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ questionText, subject, topic, correctAnswer, userAnswer, options })
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    lastError = new Error(data.error || "فشل توليد الأسئلة المشابهة");
                    continue;
                }
                return data;
            } catch (err) {
                lastError = err;
            }
        }

        throw lastError;
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
            const errorMessage = err?.message || "تعذر الاتصال بالمعلم الذكي. حاول لاحقاً.";
            aiReviewBody.innerHTML = `
                <div class="ai-review-error">
                    <p>تعذر الاتصال بالمعلم الذكي. حاول لاحقاً.</p>
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

    // Notification Clear All Logic
    const btnClearNotifications = document.getElementById("btn-clear-notifications");
    const notificationBody = document.getElementById("notification-body");
    const bellBadge = document.querySelector(".bell-badge");
    // Load saved notifications
    const savedNotificationsHTML = localStorage.getItem("notificationsHTML");
    const savedBadgeDisplay = localStorage.getItem("bellBadgeDisplay");
    
    if (savedNotificationsHTML !== null && notificationBody) {
        notificationBody.innerHTML = savedNotificationsHTML;
    }
    if (savedBadgeDisplay !== null && bellBadge) {
        bellBadge.style.display = savedBadgeDisplay;
    }

    if (btnClearNotifications) {
        btnClearNotifications.addEventListener("click", (e) => {
            e.stopPropagation();
            if (notificationBody) {
                notificationBody.innerHTML = `
                    <div class="notification-item" style="justify-content: center; opacity: 0.7; pointer-events: none;">
                        <div class="item-content" style="text-align: center; width: 100%;">
                            <p>لا توجد تنبيهات جديدة</p>
                        </div>
                    </div>
                `;
            }
            if (bellBadge) {
                bellBadge.style.display = "none";
            }
            localStorage.setItem("notificationsHTML", notificationBody ? notificationBody.innerHTML : "");
            localStorage.setItem("bellBadgeDisplay", "none");
        });
    }


    function sanitizeText(value) {
        return String(value || "").replace(/[<>]/g, "").trim();
    }

    function normalizeExplain(value) {
        if (!Array.isArray(value)) {
            return ["حدد الفكرة الأساسية.", "اكتب المعطيات والمطلوب.", "طبق القانون خطوة بخطوة."];
        }
        return value.map(sanitizeText).filter(Boolean).slice(0, 3);
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
                ? parsed.similarQuestions.slice(0, 3).map(q => {
                    const options = Array.isArray(q?.options) ? q.options.map(sanitizeText).filter(Boolean).slice(0, 4) : [];
                    while (options.length < 4) options.push(`اختيار ${options.length + 1}`);
                    const correct = ["A", "B", "C", "D"].includes(String(q?.correct || "").toUpperCase()) ? String(q.correct).toUpperCase() : "A";
                    return {
                        text: sanitizeText(q?.text) || "سؤال جديد",
                        options,
                        correct,
                        hint: sanitizeText(q?.hint) || ""
                    };
                })
                : [];
            return { explanation, similarQuestions };
        } catch {
            return {
                explanation: ["تعذر تحليل رد الذكاء الاصطناعي.", "حاول مرة أخرى بعد لحظات.", "تأكد من اتصالك بالإنترنت."],
                similarQuestions: []
            };
        }
    }

    bindStartSolvingButtons();
    refreshIcons();
});


