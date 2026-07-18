/* ==========================================
   Sound Effects Module - Audio Notifications
   ========================================== */

class SoundEffects {
    constructor() {
        this.isEnabled = true;
        this.volume = 0.3; // 30% default volume (subtle)
        this.audioContext = null;
        this.initialized = false;
        
        // Load user preference
        this.loadPreference();
        this.initAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.initialized = true;
                console.log('✅ Web Audio API initialized');
            }
        } catch (err) {
            console.warn('⚠️  Web Audio API not supported:', err);
            this.initialized = false;
        }
    }

    /**
     * Load sound preferences from localStorage
     */
    loadPreference() {
        const stored = localStorage.getItem('soundEffects');
        if (stored !== null) {
            this.isEnabled = stored === 'true';
        }
    }

    /**
     * Save sound preferences to localStorage
     */
    savePreference() {
        localStorage.setItem('soundEffects', this.isEnabled.toString());
    }

    /**
     * Toggle sound effects on/off
     */
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        this.savePreference();
        return this.isEnabled;
    }

    /**
     * Play a Ding sound (correct answer) - uplifting, short, cheerful
     */
    playCorrect() {
        if (!this.isEnabled || !this.initialized) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 0.25;

            // Create three ascending beeps for a "ding" effect
            const notes = [
                { freq: 523.25, time: 0 },      // C5
                { freq: 659.25, time: 0.08 },   // E5
                { freq: 783.99, time: 0.12 }    // G5
            ];

            notes.forEach(({ freq, time }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(this.volume, now + time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + time + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + time);
                osc.stop(now + time + duration);
            });

            console.log('✨ Correct answer sound played');
        } catch (err) {
            console.warn('⚠️  Error playing correct sound:', err);
        }
    }

    /**
     * Play a Buzzer sound (wrong answer) - error, descending beep
     */
    playIncorrect() {
        if (!this.isEnabled || !this.initialized) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 0.2;

            // Create two descending beeps for a "buzzer" effect
            const notes = [
                { freq: 350, time: 0 },         // Lower tone
                { freq: 200, time: 0.1 }        // Even lower tone
            ];

            notes.forEach(({ freq, time }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.value = freq;
                osc.type = 'square'; // Square wave for buzzer effect

                gain.gain.setValueAtTime(this.volume * 0.7, now + time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + time + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + time);
                osc.stop(now + time + duration);
            });

            console.log('❌ Wrong answer sound played');
        } catch (err) {
            console.warn('⚠️  Error playing incorrect sound:', err);
        }
    }

    /**
     * Play a Level Up sound - celebratory and uplifting
     */
    playLevelUp() {
        if (!this.isEnabled || !this.initialized) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 0.15;

            // Create ascending scale for "level up" effect
            const notes = [
                { freq: 523.25, time: 0 },      // C5
                { freq: 659.25, time: 0.1 },   // E5
                { freq: 783.99, time: 0.2 },   // G5
                { freq: 1046.50, time: 0.3 }   // C6
            ];

            notes.forEach(({ freq, time }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(this.volume, now + time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + time + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + time);
                osc.stop(now + time + duration);
            });

            console.log('🚀 Level up sound played');
        } catch (err) {
            console.warn('⚠️  Error playing level up sound:', err);
        }
    }

    /**
     * Play XP Gain sound - quick and satisfying "pop"
     */
    playXPGain() {
        if (!this.isEnabled || !this.initialized) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 0.1;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + duration);
            osc.type = 'sine';

            gain.gain.setValueAtTime(this.volume * 0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + duration);

            console.log('⭐ XP gain sound played');
        } catch (err) {
            console.warn('⚠️  Error playing XP gain sound:', err);
        }
    }

    /**
     * Play a notification/alert sound
     */
    playNotification() {
        if (!this.isEnabled || !this.initialized) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 0.15;

            // Short bell-like sound
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(1046.50, now); // C6
            osc.type = 'sine';

            gain.gain.setValueAtTime(this.volume * 0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + duration);

            console.log('🔔 Notification sound played');
        } catch (err) {
            console.warn('⚠️  Error playing notification sound:', err);
        }
    }

    /**
     * Play timer warning sound (when time is running out)
     */
    playTimerWarning() {
        if (!this.isEnabled || !this.initialized) return;
        
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 0.08;

            // Repeated rapid beeps
            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const time = now + (i * 0.1);

                osc.frequency.value = 800;
                osc.type = 'sine';

                gain.gain.setValueAtTime(this.volume * 0.5, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(time);
                osc.stop(time + duration);
            }

            console.log('⏰ Timer warning sound played');
        } catch (err) {
            console.warn('⚠️  Error playing timer warning sound:', err);
        }
    }

    /**
     * Set volume level (0 to 1)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        localStorage.setItem('soundVolume', this.volume.toString());
    }

    /**
     * Get current volume level
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Resume audio context if suspended (required for user interaction in some browsers)
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('🔊 Audio context resumed');
            });
        }
    }
}

// Create global instance
const soundEffects = new SoundEffects();

// Resume audio context on first user interaction
document.addEventListener('click', () => {
    soundEffects.resumeAudioContext();
}, { once: true });

document.addEventListener('touchstart', () => {
    soundEffects.resumeAudioContext();
}, { once: true });

console.log('✅ Sound Effects module loaded');
