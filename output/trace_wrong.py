from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    wrong_requests = []
    
    def handle_request(request):
        url = request.url
        if '/core/' in url and '/src/core/' not in url:
            wrong_requests.append({
                "url": url,
                "initiator": request.initiator_type,
                "stack": ""
            })
    
    page.on("request", handle_request)
    
    page.goto("http://localhost:3000/login", wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    print("=== Requests to /core/ without /src/ prefix ===")
    for req in wrong_requests:
        print(f"[{req['initiator']}] {req['url']}")
    
    context.close()
    browser.close()
