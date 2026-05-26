import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
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
const analytics = await isSupported().then((supported) => supported ? getAnalytics(app) : null);

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
    // Use Firebase Auth UID if signed in, else fallback to device id
    const currentUser = auth.currentUser;
    return currentUser?.uid || getDeviceId();
}

function getUserStateRef() {
    return doc(db, "examBankUsers", getUserId());
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
    loadUserState,
    saveUserState
};

export default window.examBankFirebase;
