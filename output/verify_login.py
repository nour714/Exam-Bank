from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # Navigate to login page
    page.goto("http://localhost:3000/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    
    # Take screenshot
    page.screenshot(path=os.path.join(output_dir, "verify-login-final.png"), full_page=True)
    
    # Check if login form is visible
    login_form = page.query_selector('#login-form')
    email_input = page.query_selector('#login-email')
    password_input = page.query_selector('#login-password')
    
    print(f"Login form visible: {login_form is not None}")
    print(f"Email input visible: {email_input is not None}")
    print(f"Password input visible: {password_input is not None}")
    
    # Check page content
    content = page.content()
    print(f"\nPage contains 'تسجيل الدخول': {'تسجيل الدخول' in content}")
    print(f"Page contains 'Exam Bank': {'Exam Bank' in content}")
    
    browser.close()
