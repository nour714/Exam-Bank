from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    all_requests = []
    
    def handle_request(request):
        all_requests.append({
            "url": request.url,
            "method": request.method,
            "resource_type": request.resource_type,
            "stack": request.frame.url if hasattr(request, 'frame') else 'N/A'
        })
    
    page.on("request", handle_request)
    
    # Navigate to login page
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    # Find requests to /core/ without /src/ prefix
    print("=== Requests to /core/ without /src/ prefix ===")
    for req in all_requests:
        if '/core/' in req['url'] and '/src/core/' not in req['url']:
            print(f"[{req['method']}] {req['url']}")
    
    # Find all requests with /core/ in URL
    print("\n=== All /core/ requests ===")
    for req in all_requests:
        if '/core/' in req['url']:
            print(f"[{req['method']}] {req['url']}")
    
    browser.close()
