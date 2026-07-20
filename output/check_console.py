from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    console_messages = []
    failed_requests = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    def handle_request_failed(request):
        failed_requests.append({"url": request.url, "failure": request.failure})
    
    page.on("console", handle_console)
    page.on("requestfailed", handle_request_failed)
    
    # Navigate to SPA Home
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    print("=== Console Messages ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text']}")
    
    print("\n=== Failed Requests ===")
    for req in failed_requests:
        print(f"URL: {req['url']}")
        print(f"Failure: {req['failure']}")
    
    # Check for error toasts
    toasts = page.query_selector_all('.toast-error, [class*="error"]')
    print(f"\n=== Error Elements Found: {len(toasts)} ===")
    for toast in toasts:
        print(f"Text: {toast.inner_text()}")
    
    browser.close()
