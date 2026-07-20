from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Desktop viewport
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    console_messages = []
    failed_requests = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    def handle_request_failed(request):
        failed_requests.append({"url": request.url, "failure": request.failure})
    
    page.on("console", handle_console)
    page.on("requestfailed", handle_request_failed)
    
    # Test 1: Home Page
    print("=== Test 1: Home Page ===")
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(output_dir, "verify-home.png"), full_page=True)
    print("Home page loaded successfully")
    
    # Test 2: Login Page
    print("\n=== Test 2: Login Page ===")
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(output_dir, "verify-login.png"), full_page=True)
    print("Login page loaded successfully")
    
    # Test 3: Dashboard (should redirect to login if not authenticated)
    print("\n=== Test 3: Dashboard (unauthenticated) ===")
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    current_url = page.url
    page.screenshot(path=os.path.join(output_dir, "verify-dashboard-unauth.png"), full_page=True)
    print(f"Dashboard redirected to: {current_url}")
    
    # Test 4: Question Bank (should redirect to login if not authenticated)
    print("\n=== Test 4: Question Bank (unauthenticated) ===")
    page.goto("http://localhost:3000/question-bank")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    current_url = page.url
    page.screenshot(path=os.path.join(output_dir, "verify-qbank-unauth.png"), full_page=True)
    print(f"Question Bank redirected to: {current_url}")
    
    # Test 5: Navigation from Home to Login
    print("\n=== Test 5: Navigation Home -> Login ===")
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    # Click login button if exists
    login_btn = page.query_selector('text=تسجيل الدخول')
    if login_btn:
        login_btn.click()
        page.wait_for_timeout(2000)
        print(f"Navigated to: {page.url}")
    else:
        print("No login button found on home page")
    
    # Test 6: Browser Back/Forward
    print("\n=== Test 6: Browser Back/Forward ===")
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.go_back()
    page.wait_for_timeout(1000)
    print(f"After back: {page.url}")
    page.go_forward()
    page.wait_for_timeout(1000)
    print(f"After forward: {page.url}")
    
    # Test 7: Browser Refresh
    print("\n=== Test 7: Browser Refresh ===")
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(output_dir, "verify-refresh.png"), full_page=True)
    print(f"After refresh: {page.url}")
    
    # Summary
    print("\n=== SUMMARY ===")
    print(f"Console errors: {len([m for m in console_messages if m['type'] == 'error'])}")
    for msg in console_messages:
        if msg['type'] == 'error':
            print(f"  - {msg['text'][:100]}")
    
    print(f"\nFailed requests: {len(failed_requests)}")
    for req in failed_requests:
        print(f"  - {req['url']}")
    
    browser.close()
    print("\n=== VERIFICATION COMPLETE ===")
