from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Test each page separately
    pages_to_test = [
        ("Home", "http://localhost:3000/home"),
        ("Login", "http://localhost:3000/login"),
        ("Dashboard (unauth)", "http://localhost:3000/dashboard"),
        ("Question Bank (unauth)", "http://localhost:3000/question-bank"),
    ]
    
    for name, url in pages_to_test:
        print(f"\n=== Testing: {name} ({url}) ===")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        console_errors = []
        failed_requests = []
        responses_400 = []
        
        def handle_console(msg):
            if msg.type == 'error':
                console_errors.append(msg.text)
        
        def handle_request_failed(request):
            failed_requests.append(request.url)
        
        def handle_response(response):
            if response.status == 400:
                responses_400.append(response.url)
        
        page.on("console", handle_console)
        page.on("requestfailed", handle_request_failed)
        page.on("response", handle_response)
        
        page.goto(url)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        
        final_url = page.url
        print(f"Final URL: {final_url}")
        print(f"Console errors: {len(console_errors)}")
        for err in console_errors:
            print(f"  - {err[:80]}")
        print(f"Failed requests: {len(failed_requests)}")
        for req in failed_requests:
            print(f"  - {req}")
        print(f"400 responses: {len(responses_400)}")
        for req in responses_400:
            print(f"  - {req}")
        
        page.close()
    
    browser.close()
    print("\n=== ALL TESTS COMPLETE ===")
