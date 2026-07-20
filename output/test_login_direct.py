from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    console_messages = []
    responses = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    def handle_response(response):
        responses.append({"url": response.url, "status": response.status, "content_type": response.headers.get('content-type', '')})
    
    page.on("console", handle_console)
    page.on("response", handle_response)
    
    # Navigate directly to login page
    page.goto("http://localhost:3000/login", wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    # Take screenshot
    page.screenshot(path=os.path.join(output_dir, "test-login-direct.png"), full_page=True)
    
    # Check page content
    content = page.content()
    has_login_form = '#login-form' in content
    has_email_input = '#login-email' in content
    
    print(f"Page has login form: {has_login_form}")
    print(f"Page has email input: {has_email_input}")
    print(f"Page URL: {page.url}")
    
    print("\n=== Console Messages ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text'][:120]}")
    
    print("\n=== Script Responses ===")
    for resp in responses:
        if 'login' in resp['url'].lower() or 'auth' in resp['url'].lower():
            print(f"[{resp['status']}] {resp['url']} (Content-Type: {resp['content_type'][:50]})")
    
    context.close()
    browser.close()
