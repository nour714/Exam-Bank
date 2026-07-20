from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    console_messages = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text, "location": msg.location})
    
    page.on("console", handle_console)
    
    # Navigate to login page
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    print("=== All Console Messages ===")
    for msg in console_messages:
        loc = msg.get('location', {})
        print(f"[{msg['type']}] {msg['text'][:100]}")
        if loc:
            print(f"  Location: {loc.get('url', 'N/A')}:{loc.get('lineNumber', 'N/A')}")
    
    # Check if there are any uncaught exceptions
    page_errors = page.evaluate("window.__errors || []")
    print(f"\n=== Window Errors: {page_errors} ===")
    
    browser.close()
