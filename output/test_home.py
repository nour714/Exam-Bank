from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    console_messages = []
    
    def handle_console(msg):
        console_messages.append({"type": msg.type, "text": msg.text})
    
    page.on("console", handle_console)
    
    # Navigate to home page
    page.goto("http://localhost:3000/home", wait_until="networkidle")
    page.wait_for_timeout(3000)
    
    # Take screenshot
    page.screenshot(path=os.path.join(output_dir, "test-home.png"), full_page=True)
    
    # Check if home page elements are visible
    hero_title = page.query_selector('.hero-title')
    hero_subtitle = page.query_selector('.hero-subtitle')
    features_section = page.query_selector('.features-section')
    subjects_section = page.query_selector('.subjects-section')
    
    print(f"Hero title visible: {hero_title is not None}")
    print(f"Hero subtitle visible: {hero_subtitle is not None}")
    print(f"Features section visible: {features_section is not None}")
    print(f"Subjects section visible: {subjects_section is not None}")
    
    print("\n=== Console Messages ===")
    for msg in console_messages:
        print(f"[{msg['type']}] {msg['text'][:100]}")
    
    context.close()
    browser.close()
