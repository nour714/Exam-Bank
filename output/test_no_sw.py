from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
    )
    page = context.new_page()
    
    # Block service worker registration
    page.route("**/service-worker.js", lambda route: route.abort())
    
    # Also block any cached responses by adding no-cache headers
    console_messages = []
    responses_html = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    def handle_response(response):
        ct = response.headers.get('content-type', '')
        if 'text/html' in ct and 'login' not in response.url:
            responses_html.append({"url": response.url, "status": response.status, "ct": ct})
    
    page.on("console", handle_console)
    page.on("response", handle_response)
    
    # Navigate to login page
    page.goto("http://localhost:3000/login", wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    # Take screenshot
    page.screenshot(path=os.path.join(output_dir, "test-no-sw.png"), full_page=True)
    
    # Check if login form is visible
    login_form = page.query_selector('#login-form')
    email_input = page.query_selector('#login-email')
    
    print(f"Login form visible: {login_form is not None}")
    print(f"Email input visible: {email_input is not None}")
    
    print("\n=== Console Messages ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text'][:120]}")
    
    print("\n=== HTML responses (non-login) ===")
    for resp in responses_html:
        print(f"[{resp['status']}] {resp['url']}")
    
    context.close()
    browser.close()
