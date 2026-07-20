from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    all_responses = []
    
    def handle_response(response):
        ct = response.headers.get('content-type', 'NONE')
        all_responses.append({
            "url": response.url,
            "status": response.status,
            "content_type": ct,
            "resource_type": response.request.resource_type
        })
    
    page.on("response", handle_response)
    
    page.goto("http://localhost:3000/login", wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    print("=== ALL RESPONSES ===")
    for resp in all_responses:
        ct_short = resp['content_type'][:40] if resp['content_type'] else 'EMPTY'
        print(f"[{resp['status']}] {resp['resource_type']:10} | {ct_short:40} | {resp['url']}")
    
    print(f"\n=== RESPONSES WITH EMPTY/MISSING CONTENT-TYPE ===")
    for resp in all_responses:
        if not resp['content_type'] or resp['content_type'] == 'NONE':
            print(f"[{resp['status']}] {resp['url']}")
    
    print(f"\n=== RESPONSES WITH HTML CONTENT-TYPE (potential SPA fallback) ===")
    for resp in all_responses:
        if 'text/html' in (resp['content_type'] or ''):
            print(f"[{resp['status']}] {resp['url']}")
    
    context.close()
    browser.close()
