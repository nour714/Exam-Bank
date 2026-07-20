from playwright.sync_api import sync_playwright
import os

output_dir = r"E:\project_fixed\output"
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Desktop viewport
    desktop = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # SPA Home - Desktop
    desktop.goto("http://localhost:3000/home")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(1000)
    desktop.screenshot(path=os.path.join(output_dir, "spa-home-desktop.png"), full_page=True)
    print("SPA Home Desktop captured")
    
    # SPA Login - Desktop (for comparison)
    desktop.goto("http://localhost:3000/login")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(1000)
    desktop.screenshot(path=os.path.join(output_dir, "spa-login-desktop.png"), full_page=True)
    print("SPA Login Desktop captured")
    
    # SPA Dashboard - Desktop
    desktop.goto("http://localhost:3000/dashboard")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(1000)
    desktop.screenshot(path=os.path.join(output_dir, "spa-dashboard-desktop.png"), full_page=True)
    print("SPA Dashboard Desktop captured")
    
    desktop.close()
    
    # Mobile viewport (iPhone 14)
    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    
    # SPA Home - Mobile
    mobile.goto("http://localhost:3000/home")
    mobile.wait_for_load_state("networkidle")
    mobile.wait_for_timeout(1000)
    mobile.screenshot(path=os.path.join(output_dir, "spa-home-mobile.png"), full_page=True)
    print("SPA Home Mobile captured")
    
    mobile.close()
    
    # Tablet viewport (iPad)
    tablet = browser.new_page(viewport={"width": 768, "height": 1024})
    
    # SPA Home - Tablet
    tablet.goto("http://localhost:3000/home")
    tablet.wait_for_load_state("networkidle")
    tablet.wait_for_timeout(1000)
    tablet.screenshot(path=os.path.join(output_dir, "spa-home-tablet.png"), full_page=True)
    print("SPA Home Tablet captured")
    
    tablet.close()
    
    # Legacy Home - Desktop (direct HTML file)
    legacy = browser.new_page(viewport={"width": 1440, "height": 900})
    legacy.goto("file:///E:/project_fixed/frontend/legacy-ui/index.html")
    legacy.wait_for_load_state("networkidle")
    legacy.wait_for_timeout(2000)
    legacy.screenshot(path=os.path.join(output_dir, "legacy-home-desktop.png"), full_page=True)
    print("Legacy Home Desktop captured")
    
    legacy.close()
    
    browser.close()
    print("All screenshots captured successfully!")
