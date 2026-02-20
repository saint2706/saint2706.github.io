from playwright.sync_api import sync_playwright, expect

def test_minesweeper(page):
    # 1. Navigate to Games page
    page.goto("http://localhost:5173/games")

    # 2. Select Minesweeper game
    # The role is 'tab' because of `role="tab"`
    mines_tab = page.get_by_role("tab", name="Mines")
    mines_tab.click()

    # 3. Wait for Minesweeper to load
    # It has text "Minesweeper ready"
    expect(page.get_by_text("Minesweeper ready")).to_be_visible()

    # 4. Take screenshot of initial state
    page.screenshot(path="/home/jules/verification/minesweeper_initial.png")

    # 5. Click a cell to start game
    # Cells are buttons.
    # We can pick a cell by its aria-label or just by index.
    # aria-label="Row 5, Column 5, hidden. Press F to flag."
    # Use partial match for robustness
    # Wait for the grid to appear
    expect(page.get_by_role("grid", name="Minesweeper game board")).to_be_visible()

    # Click a cell
    # Note: aria-label changes dynamically. Initially "Row X, Column Y, hidden..."
    center_cell = page.locator('button[aria-label*="Row 5, Column 5"]')
    center_cell.click()

    # 6. Verify game started
    # "Playing Minesweeper" in announcement.
    expect(page.get_by_text("Playing Minesweeper", exact=False)).to_be_visible()

    # 7. Wait a bit for timer to update
    page.wait_for_timeout(2000)

    # 9. Take final screenshot
    page.screenshot(path="/home/jules/verification/minesweeper_playing.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_minesweeper(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
