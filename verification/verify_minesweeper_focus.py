from playwright.sync_api import sync_playwright, expect

def test_minesweeper_focus():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Games page
        print("Navigating to Games page...")
        page.goto("http://localhost:5173/games")

        # Wait for game tabs to appear
        expect(page.get_by_role("tab", name="Mines")).to_be_visible()

        # Click "Mines" tab
        print("Selecting Minesweeper...")
        page.get_by_role("tab", name="Mines").click()

        # Wait for Minesweeper grid to appear
        # The grid has role="grid" and label="Minesweeper game board"
        grid = page.get_by_role("grid", name="Minesweeper game board")
        expect(grid).to_be_visible(timeout=10000)

        print("Minesweeper loaded.")

        # Find cell (0,0) - Row 1, Column 1
        # The label starts with "Row 1, Column 1"
        cell_0_0 = page.get_by_role("button", name="Row 1, Column 1").first

        # Click to focus and start game (if idle)
        print("Clicking cell (0,0)...")
        cell_0_0.click()

        # Verify cell (0,0) is focused
        expect(cell_0_0).to_be_focused()
        print("Cell (0,0) focused.")

        # Press ArrowRight
        print("Pressing ArrowRight...")
        page.keyboard.press("ArrowRight")

        # Verify cell (0,1) is focused - Row 1, Column 2
        cell_0_1 = page.get_by_role("button", name="Row 1, Column 2").first
        expect(cell_0_1).to_be_focused()
        print("Cell (0,1) focused successfully!")

        # Take screenshot
        page.screenshot(path="verification/minesweeper_focus.png")
        print("Screenshot saved to verification/minesweeper_focus.png")

        browser.close()

if __name__ == "__main__":
    try:
        test_minesweeper_focus()
        print("Verification successful!")
    except Exception as e:
        print(f"Verification failed: {e}")
        exit(1)
