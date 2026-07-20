from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    console_messages = []
    responses_400 = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    def handle_response(response):
        if response.status >= 400:
            responses_400.append({"url": response.url, "status": response.status})
    
    page.on("console", handle_console)
    page.on("response", handle_response)
    
    # Navigate to login page
    page.goto("http://localhost:3000/login", wait_until="networkidle")
    page.wait_for_timeout(3000)
    
    # Take screenshot
    page.screenshot(path=os.path.join(output_dir, "fresh-login2.png"), full_page=True)
    
    # Check if login form is visible
    login_form = page.query_selector('#login-form')
    email_input = page.query_selector('#login-email')
    
    print(f"Login form visible: {login_form is not None}")
    print(f"Email input visible: {email_input is not None}")
    
    print("\n=== Console Messages ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text'][:120]}")
    
    print("\n=== 400 Responses ===")
    for resp in responses_400:
        print(f"[{resp['status']}] {resp['url']}")
    
    context.close()
    browser.close()
