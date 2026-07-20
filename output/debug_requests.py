from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    all_requests = []
    all_responses = []
    console_messages = []
    
    def handle_request(request):
        all_requests.append({
            "url": request.url,
            "method": request.method,
            "resource_type": request.resource_type
        })
    
    def handle_response(response):
        all_responses.append({
            "url": response.url,
            "status": response.status,
            "status_text": response.status_text
        })
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    page.on("request", handle_request)
    page.on("response", handle_response)
    page.on("console", handle_console)
    
    # Navigate to SPA Home
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    print("=== ALL REQUESTS ===")
    for req in all_requests:
        print(f"[{req['method']}] {req['url']} ({req['resource_type']})")
    
    print("\n=== ALL RESPONSES ===")
    for resp in all_responses:
        status_icon = "✅" if resp['status'] < 400 else "❌"
        print(f"{status_icon} [{resp['status']}] {resp['url']}")
    
    print("\n=== FAILED RESPONSES (4xx/5xx) ===")
    for resp in all_responses:
        if resp['status'] >= 400:
            print(f"❌ [{resp['status']}] {resp['url']}")
    
    print("\n=== CONSOLE MESSAGES ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text']}")
    
    browser.close()
