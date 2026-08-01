/**
 * Legacy & SPA Compatibility Application Script
 * Handles navigation, view switching, sidebar toggle, button actions, and UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Exam Bank UI Interactive Controller initialized');

    // Re-initialize Lucide icons
    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            try {
                window.lucide.createIcons();
            } catch (e) {
                console.warn('Lucide icon refresh warning:', e);
            }
        }
    }
    refreshIcons();

    // 1. Hide Skeleton Loader
    const skeletonLoader = document.getElementById('app-skeleton-loader');
    if (skeletonLoader) {
        setTimeout(() => {
            skeletonLoader.classList.add('hidden');
            setTimeout(() => { skeletonLoader.style.display = 'none'; }, 400);
        }, 200);
    }

    // 2. Route Map for SPA & View IDs
    const routeMap = {
        'home-view': '/home',
        'dashboard-view': '/dashboard',
        'qbank-view': '/question-bank',
        'exams-view': '/exams',
        'groups-view': '/study-groups',
        'settings-view': '/settings'
    };

    // 3. View Switcher function
    function switchView(targetId) {
        if (!targetId) return;

        // Hide all view-content elements, show target view
        const views = document.querySelectorAll('.view-content');
        views.forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });

        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'block';
        }

        // Update active class on menu items
        document.querySelectorAll('[data-target]').forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Push URL history state
        if (routeMap[targetId] && window.location.pathname !== routeMap[targetId]) {
            window.history.pushState(null, '', routeMap[targetId]);
        }

        // Close mobile sidebar / dropdown if open
        document.body.classList.remove('sidebar-open');
        const moreMobileMenu = document.getElementById('more-mobile-menu');
        if (moreMobileMenu) moreMobileMenu.style.display = 'none';

        // Refresh icons
        refreshIcons();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 4. Global Click Listener for all Interactive Elements
    document.addEventListener('click', (e) => {
        // Navigation items with data-target
        const navItem = e.target.closest('[data-target]');
        if (navItem) {
            e.preventDefault();
            const targetId = navItem.getAttribute('data-target');
            switchView(targetId);
            return;
        }

        // Hero Start Study Button
        const btnStartStudy = e.target.closest('#btn-start-study, .btn-start-study');
        if (btnStartStudy) {
            e.preventDefault();
            if (window.router) window.router.navigate('/question-bank');
            else switchView('qbank-view');
            return;
        }

        // Hero Start Test / Exam Button
        const btnStartTest = e.target.closest('#btn-start-test, .btn-start-test');
        if (btnStartTest) {
            e.preventDefault();
            if (window.router) window.router.navigate('/dashboard');
            else switchView('dashboard-view');
            return;
        }

        // Subject Cards
        const subjectCard = e.target.closest('.subject-card, .subject-minimal-card');
        if (subjectCard) {
            e.preventDefault();
            const subjectId = subjectCard.dataset.subject || 'physics';
            if (window.router) window.router.navigate(`/question-bank/subjects/${subjectId}/units`);
            else switchView('qbank-view');
            return;
        }

        // Sidebar Toggle Button
        const menuToggle = e.target.closest('#menu-toggle, .btn-menu-toggle');
        if (menuToggle) {
            e.preventDefault();
            document.body.classList.toggle('sidebar-open');
            return;
        }

        // Header Login Button
        const btnLoginHdr = e.target.closest('#btn-login-hdr');
        if (btnLoginHdr) {
            e.preventDefault();
            if (window.router) window.router.navigate('/login');
            else window.location.href = 'login.html';
            return;
        }

        // Logout Buttons
        const btnLogout = e.target.closest('#btn-logout, #btn-logout-mobile-menu, .btn-logout');
        if (btnLogout) {
            e.preventDefault();
            if (window.authService) {
                window.authService.logout();
            } else {
                localStorage.clear();
                if (window.router) window.router.navigate('/login');
                else window.location.href = 'login.html';
            }
            return;
        }

        // Modal Close Buttons
        const closeBtn = e.target.closest('.btn-close-modal, .modal-close');
        if (closeBtn) {
            const modal = closeBtn.closest('.modal-overlay, .modal');
            if (modal) modal.style.display = 'none';
            return;
        }

        // Modal Overlay backdrop click to close
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
            return;
        }
    });

    // 5. Initial path sync if URL has direct view or route
    const path = window.location.pathname;
    if (path === '/dashboard') switchView('dashboard-view');
    else if (path === '/question-bank') switchView('qbank-view');
    else if (path === '/exams') switchView('exams-view');
    else if (path === '/study-groups') switchView('groups-view');
    else if (path === '/settings') switchView('settings-view');
    else if (path === '/home' || path === '/') switchView('home-view');
});
