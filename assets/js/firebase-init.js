import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
    doc,
    getDoc,
    getFirestore,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAtxAc6b0MwXy2u0F3ef_douT-WmI61k3c",
    authDomain: "protifol-36f7d.firebaseapp.com",
    projectId: "protifol-36f7d",
    storageBucket: "protifol-36f7d.firebasestorage.app",
    messagingSenderId: "40419608031",
    appId: "1:40419608031:web:5fe660cd4cc98039a9306a",
    measurementId: "G-4VEPH5LH6R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let analytics = null;
isSupported()
    .then((supported) => {
        if (supported) analytics = getAnalytics(app);
    })
    .catch(() => {
        analytics = null;
    });

// ── Device ID fallback (no anonymous auth) ────────────────────
function getDeviceId() {
    const key = "examBankDeviceId";
    const current = localStorage.getItem(key);
    if (current) return current;
    const id = `device-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    localStorage.setItem(key, id);
    return id;
}

function getUserId() {
    // Use Firebase Auth UID if signed in
    const currentUser = auth.currentUser;
    if (currentUser?.uid) return currentUser.uid;
    
    // Fallback to local login email if available
    const localEmail = localStorage.getItem('userEmail');
    if (localEmail) {
        // Use email as ID, replacing invalid characters if any
        return localEmail.replace(/[^a-zA-Z0-9@.-]/g, '_');
    }
    
    // Otherwise fallback to device id
    return getDeviceId();
}

function getUserStateRef() {
    return doc(db, "examBankUsers", getUserId());
}

async function waitForAuthState() {
    if (typeof auth.authStateReady === "function") {
        await auth.authStateReady();
        return auth.currentUser;
    }

    return await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                unsubscribe();
                resolve(user);
            },
            () => resolve(auth.currentUser)
        );
    });
}

async function loadUserState() {
    const snapshot = await getDoc(getUserStateRef());
    return snapshot.exists() ? snapshot.data() : null;
}

async function saveUserState(state) {
    await setDoc(
        getUserStateRef(),
        {
            ...state,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );

    if (analytics) {
        logEvent(analytics, "exam_bank_state_saved");
    }
}

window.examBankFirebase = {
    app,
    db,
    auth,
    analytics,
    getDeviceId,
    getUserId,
    waitForAuthState,
    loadUserState,
    saveUserState
};

export default window.examBankFirebase;
