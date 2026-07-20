from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    # Use incognito-like context
    browser = p.chromium.launch(headless=True, args=['--incognito', '--disable-web-security'])
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        storage_state=None,
    )
    page = context.new_page()
    
    # Block ALL service workers and caches
    page.route("**/service-worker.js", lambda route: route.abort())
    
    responses_with_html = []
    
    def handle_response(response):
        ct = response.headers.get('content-type', '')
        url = response.url
        if 'text/html' in ct and '/login' not in url and '/home' not in url:
            responses_with_html.append(url)
    
    page.on("response", handle_response)
    
    # Navigate with cache-busting
    page.goto("http://localhost:3000/login?_=" + str(hash(os.urandom(8))), wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    page.screenshot(path=os.path.join(output_dir, "test-incognito.png"), full_page=True)
    
    login_form = page.query_selector('#login-form')
    print(f"Login form visible: {login_form is not None}")
    
    print("\n=== Non-page HTML responses ===")
    for url in responses_with_html:
        print(f"  {url}")
    
    context.close()
    browser.close()
