from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    all_requests = []
    all_responses = []
    
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
            "resource_type": response.request.resource_type
        })
    
    page.on("request", handle_request)
    page.on("response", handle_response)
    
    # Navigate to login page
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    print("=== All Script Requests ===")
    for req in all_requests:
        if req['resource_type'] == 'script':
            print(f"[{req['method']}] {req['url']}")
    
    print("\n=== All Script Responses ===")
    for resp in all_responses:
        if resp['resource_type'] == 'script':
            status_icon = "✅" if resp['status'] < 400 else "❌"
            print(f"{status_icon} [{resp['status']}] {resp['url']}")
    
    print("\n=== 400 Responses ===")
    for resp in all_responses:
        if resp['status'] == 400:
            print(f"[400] {resp['url']}")
    
    browser.close()
