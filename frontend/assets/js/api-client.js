// API Client to replace Firebase SDK

const API_BASE = "/api";

async function fetchAPI(endpoint, options = {}) {
    const defaultHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    // Use JWT from localStorage if we are passing it in headers, though HTTP-Only cookies are preferred
    // For now, assume cookies are handled automatically if credentials: 'include' is set or we use headers.
    const token = localStorage.getItem("accessToken");
    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || "حدث خطأ أثناء الاتصال بالخادم");
        }
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Emulate Firebase Device/User ID logic for local-only fallbacks
function getDeviceId() {
    const key = "examBankDeviceId";
    let current = localStorage.getItem(key);
    if (!current) {
        current = `device-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
        localStorage.setItem(key, current);
    }
    return current;
}

function getUserId() {
    const user = JSON.parse(localStorage.getItem("authUser") || "null");
    if (user && user.id) return user.id;
    return getDeviceId();
}

async function loadUserState() {
    try {
        const res = await fetchAPI("/users/stats", { method: "GET" });
        if (res && res.success) {
            return res.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function saveUserState(state) {
    try {
        // We only send the stats properties to the backend
        const { xp, solvedCount, streak, accuracy, lastActiveDate, weeklyActivity } = state.user || state;
        await fetchAPI("/users/stats", {
            method: "PUT",
            body: JSON.stringify({ xp, solvedCount, streak, accuracy, lastActiveDate, weeklyActivity }),
        });
    } catch (error) {
        console.warn("Failed to sync state to server, using local storage only");
    }
}

async function loadGlobalQuestions() {
    try {
        const res = await fetchAPI("/questions/global?limit=1000", { method: "GET" });
        if (res && res.success) {
            return res.data; // The backend returns an array inside data or data is the array
        }
        return [];
    } catch (error) {
        console.error("Error loading global questions:", error);
        return [];
    }
}

async function waitForAuthState() {
    const localUser = localStorage.getItem("authUser");
    const token = localStorage.getItem("accessToken");

    const verifyAndRefresh = async () => {
        try {
            const res = await fetchAPI("/auth/me", { method: "GET" });
            if (res && res.success) {
                const userData = res.data.user || res.data;
                localStorage.setItem("authUser", JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            try {
                const refreshRes = await fetchAPI("/auth/refresh", { method: "POST" });
                if (refreshRes && refreshRes.success) {
                    localStorage.setItem("accessToken", refreshRes.data.accessToken);
                    const meRes = await fetchAPI("/auth/me", { method: "GET" });
                    if (meRes && meRes.success) {
                        const userData = meRes.data.user || meRes.data;
                        localStorage.setItem("authUser", JSON.stringify(userData));
                        return userData;
                    }
                }
            } catch (e) {
                localStorage.removeItem("authUser");
                localStorage.removeItem("accessToken");
                if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
                    window.location.replace("login.html");
                }
            }
        }
        return null;
    };

    if (localUser && token) {
        verifyAndRefresh(); // Run in background
        return JSON.parse(localUser); // Return immediately
    }

    return await verifyAndRefresh();
}

// Update user profile (name, avatar, notifications, darkMode) — persists to database
async function updateProfile(profileData) {
    try {
        const res = await fetchAPI("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
        if (res && res.success) {
            // Update the local authUser cache with the new data
            const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
            Object.assign(authUser, res.data);
            localStorage.setItem("authUser", JSON.stringify(authUser));
            return res.data;
        }
        return null;
    } catch (error) {
        console.warn("Failed to update profile on server:", error);
        return null;
    }
}

// Export a mock firebase object for app.js backwards compatibility
window.examBankFirebase = {
    app: {},
    db: {},
    auth: {
        get currentUser() {
            return JSON.parse(localStorage.getItem("authUser") || "null");
        }
    },
    analytics: null,
    getDeviceId,
    getUserId,
    waitForAuthState,
    loadUserState,
    saveUserState,
    loadGlobalQuestions,
    updateProfile,
    fetchAPI // Export fetchAPI for other uses
};

export default window.examBankFirebase;
export { fetchAPI, updateProfile };
