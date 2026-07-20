from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Test Login page with fresh context (no cache)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    console_messages = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    page.on("console", handle_console)
    
    # Navigate to login page
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    # Take screenshot
    page.screenshot(path=os.path.join(output_dir, "final-login.png"), full_page=True)
    
    # Check if login form is visible
    login_form = page.query_selector('#login-form')
    email_input = page.query_selector('#login-email')
    password_input = page.query_selector('#login-password')
    
    print(f"Login form visible: {login_form is not None}")
    print(f"Email input visible: {email_input is not None}")
    print(f"Password input visible: {password_input is not None}")
    
    print("\n=== Console Messages ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text'][:100]}")
    
    context.close()
    browser.close()
