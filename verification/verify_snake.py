from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Navigate to games page
        print("Navigating to /games...")
        page.goto("http://localhost:5173/games")

        # Wait for page to load
        page.wait_for_load_state("networkidle")

        # Click on Snake tab
        print("Clicking Snake tab...")
        snake_tab = page.get_by_role("tab", name="Snake")
        snake_tab.click()

        # Wait for Snake game to load (it's lazy loaded)
        print("Waiting for Snake game to load...")
        page.wait_for_selector("text=Snake Game") # Title in overlay

        # Click Start Game
        print("Starting game...")
        start_button = page.get_by_role("button", name="Start Game")
        start_button.click()

        # Wait a bit for game to run
        time.sleep(1)

        # Verify canvas is present
        canvas = page.get_by_role("img", name="Snake game board")
        expect(canvas).to_be_visible()

        print("Taking screenshot...")
        page.screenshot(path="verification/snake_game.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
