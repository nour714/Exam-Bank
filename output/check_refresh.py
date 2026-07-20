from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    all_requests = []
    all_responses = []
    
    def handle_request(request):
        all_requests.append({
            "url": request.url,
            "method": request.method
        })
    
    def handle_response(response):
        all_responses.append({
            "url": response.url,
            "status": response.status
        })
    
    page.on("request", handle_request)
    page.on("response", handle_response)
    
    # Navigate to Home
    page.goto("http://localhost:3000/home")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    
    # Check all 400 responses
    print("=== 400 Responses ===")
    for resp in all_responses:
        if resp['status'] == 400:
            print(f"[400] {resp['url']}")
    
    # Check if any login module requests failed
    print("\n=== Login Module Requests ===")
    for req in all_requests:
        if 'login' in req['url'].lower():
            print(f"[{req['method']}] {req['url']}")
    
    for resp in all_responses:
        if 'login' in resp['url'].lower():
            print(f"[{resp['status']}] {resp['url']}")
    
    browser.close()
