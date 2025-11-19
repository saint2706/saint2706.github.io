# Python Game Development: Create a Basic 2D Game with Pygame

If you’ve ever looked at a game and thought, *“How hard can it be?”*—the answer is: not as hard as you think, especially for simple 2D games.

Python isn’t just for data science, automation, or web backends. With the help of a library called **Pygame**, you can build fun 2D games, learn core game-dev concepts, and get that sweet feeling of controlling something on-screen with your own code.

In this post, we’ll build a **basic 2D game** using Pygame:  
you control a little player rectangle that must dodge falling enemies. Survive as long as you can, and your score increases over time.

We’ll cover:

- Installing and setting up Pygame  
- Creating a window and game loop  
- Drawing and moving a player  
- Spawning and moving enemies  
- Detecting collisions  
- Tracking score and ending the game  
- Ideas to level up the game

---

## 1. What is Pygame?

**Pygame** is a Python library designed for writing video games. It wraps SDL (Simple DirectMedia Layer) and gives you:

- A window to draw your game in  
- Functions for drawing shapes and images  
- Keyboard and mouse input handling  
- Sounds and basic timing

It’s perfect for beginners who want to learn game-dev concepts without fighting complex engines.

---

## 2. Setting Up Your Environment

First, make sure you have Python installed (3.x recommended).

Then install Pygame:

    pip install pygame

Create a new file:

    game.py

We’ll put all our code in this file for now.

---

## 3. Basic Pygame Template

Every Pygame project starts with a few core pieces:

- Initialize Pygame  
- Create a game window  
- Run a game loop that:
  - Handles events (like keypresses, quit button)
  - Updates game state
  - Draws everything on the screen

Let’s write the skeleton:

    import pygame
    import sys

    # Initialize Pygame
    pygame.init()

    # Screen settings
    WIDTH, HEIGHT = 800, 600
    SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Dodge the Blocks!")

    # Clock to control FPS
    clock = pygame.time.Clock()

    # Main game loop
    running = True
    while running:
        # 1. Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # 2. Update game state
        # (We'll add this soon)

        # 3. Draw everything
        SCREEN.fill((30, 30, 30))  # Dark background

        pygame.display.flip()       # Update the full display
        clock.tick(60)              # Limit to 60 FPS

    pygame.quit()
    sys.exit()

Run this file:

    python game.py

You should see a plain window with a dark background. No game yet, but the heart is beating.

---

## 4. Adding a Player

We’ll represent the player as a simple rectangle that the user moves left and right with the arrow keys (or A/D).

Let’s define some player variables **above** the game loop:

    # Player settings
    PLAYER_WIDTH, PLAYER_HEIGHT = 50, 50
    player_x = WIDTH // 2 - PLAYER_WIDTH // 2
    player_y = HEIGHT - PLAYER_HEIGHT - 10
    player_speed = 7
    player_color = (0, 200, 255)

Now handle keyboard input inside the game loop, just before the drawing part:

    # 2. Update game state
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        player_x -= player_speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        player_x += player_speed

    # Keep player inside the screen
    if player_x < 0:
        player_x = 0
    if player_x + PLAYER_WIDTH > WIDTH:
        player_x = WIDTH - PLAYER_WIDTH

Then draw the player in the drawing section:

    # 3. Draw everything
    SCREEN.fill((30, 30, 30))

    player_rect = pygame.Rect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT)
    pygame.draw.rect(SCREEN, player_color, player_rect)

    pygame.display.flip()

Now you have a movable player rectangle. Tiny step for Python, big step for your inner game dev.

---

## 5. Spawning Enemies

Our enemies will also be rectangles, but:

- They’ll spawn at random x-positions at the top.  
- They’ll fall down at a constant speed.  
- When they leave the screen, they respawn at the top.

Let’s import `random` and set up enemy parameters:

    import random

Above the main loop:

    # Enemy settings
    ENEMY_WIDTH, ENEMY_HEIGHT = 50, 50
    enemy_color = (255, 50, 50)
    enemy_speed = 5

    # Start with a few enemies
    enemies = []

    def spawn_enemy():
        x = random.randint(0, WIDTH - ENEMY_WIDTH)
        y = random.randint(-150, -ENEMY_HEIGHT)
        rect = pygame.Rect(x, y, ENEMY_WIDTH, ENEMY_HEIGHT)
        return rect

    for _ in range(5):
        enemies.append(spawn_enemy())

Now update enemies inside the game loop, in the “update game state” section:

    # Move enemies
    for enemy in enemies:
        enemy.y += enemy_speed
        # If enemy goes off screen, respawn it at top
        if enemy.y > HEIGHT:
            enemies.remove(enemy)
            enemies.append(spawn_enemy())

And draw the enemies in the drawing section:

    # 3. Draw everything
    SCREEN.fill((30, 30, 30))

    player_rect = pygame.Rect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT)
    pygame.draw.rect(SCREEN, player_color, player_rect)

    for enemy in enemies:
        pygame.draw.rect(SCREEN, enemy_color, enemy)

    pygame.display.flip()

Now you should see some enemies falling from the top while you dodge them.

---

## 6. Collision Detection

Next step: if the player collides with any enemy, the game should end.

Pygame’s `Rect` objects make collision detection very easy with `.colliderect()`.

Add this inside the game loop after updating positions:

    # Collision detection
    for enemy in enemies:
        if player_rect.colliderect(enemy):
            running = False
            break

Right now that’ll just close the window. We can do better by showing a “Game Over” state, but let’s first add scoring.

---

## 7. Scoring System

We’ll track how long the player survives and show it as a score on screen.

At the top, after initializing Pygame:

    # Font for text
    font = pygame.font.SysFont(None, 36)

    score = 0

In the game loop, we’ll increase score over time. A simple way: add a small amount each frame:

    # 2. Update game state
    score += 1  # Higher FPS = score increases faster; you can tune this

Now draw the score in the drawing section:

    # Draw score
    score_surf = font.render(f"Score: {score}", True, (255, 255, 255))
    SCREEN.blit(score_surf, (10, 10))

Now you’re getting live feedback on how well you’re dodging.

---

## 8. Game Over Screen

Instead of instantly quitting, let’s show “Game Over” and the final score, and wait for the user to close the window or press a key.

We’ll refactor slightly: once collision happens, we’ll break out of the main loop and go to a simple game-over loop.

Full code below includes this behavior.

---

## 9. Full Game Code

Here’s the full script with everything tied together:

    import pygame
    import sys
    import random

    # Initialize Pygame
    pygame.init()

    # Screen settings
    WIDTH, HEIGHT = 800, 600
    SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Dodge the Blocks!")

    clock = pygame.time.Clock()

    # Player settings
    PLAYER_WIDTH, PLAYER_HEIGHT = 50, 50
    player_x = WIDTH // 2 - PLAYER_WIDTH // 2
    player_y = HEIGHT - PLAYER_HEIGHT - 10
    player_speed = 7
    player_color = (0, 200, 255)

    # Enemy settings
    ENEMY_WIDTH, ENEMY_HEIGHT = 50, 50
    enemy_color = (255, 50, 50)
    enemy_speed = 5

    enemies = []

    def spawn_enemy():
        x = random.randint(0, WIDTH - ENEMY_WIDTH)
        y = random.randint(-200, -ENEMY_HEIGHT)
        rect = pygame.Rect(x, y, ENEMY_WIDTH, ENEMY_HEIGHT)
        return rect

    for _ in range(5):
        enemies.append(spawn_enemy())

    # Font & score
    font = pygame.font.SysFont(None, 36)
    big_font = pygame.font.SysFont(None, 72)
    score = 0

    running = True
    game_over = False

    while running:
        # 1. Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        if game_over:
            # Just draw game over screen and wait for quit
            SCREEN.fill((0, 0, 0))
            game_over_surf = big_font.render("GAME OVER", True, (255, 0, 0))
            final_score_surf = font.render(f"Final Score: {score}", True, (255, 255, 255))

            SCREEN.blit(
                game_over_surf,
                (
                    WIDTH // 2 - game_over_surf.get_width() // 2,
                    HEIGHT // 2 - game_over_surf.get_height() // 2 - 40,
                ),
            )
            SCREEN.blit(
                final_score_surf,
                (
                    WIDTH // 2 - final_score_surf.get_width() // 2,
                    HEIGHT // 2 + 10,
                ),
            )

            pygame.display.flip()
            clock.tick(30)
            continue

        # 2. Update game state
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player_x -= player_speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player_x += player_speed

        # Keep player on screen
        if player_x < 0:
            player_x = 0
        if player_x + PLAYER_WIDTH > WIDTH:
            player_x = WIDTH - PLAYER_WIDTH

        # Move enemies
        for enemy in enemies:
            enemy.y += enemy_speed
            if enemy.y > HEIGHT:
                enemies.remove(enemy)
                enemies.append(spawn_enemy())

        # Player rect (needed for collision)
        player_rect = pygame.Rect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT)

        # Collision detection
        for enemy in enemies:
            if player_rect.colliderect(enemy):
                game_over = True
                break

        # Increase score
        score += 1

        # 3. Draw everything
        SCREEN.fill((30, 30, 30))

        # Draw player
        pygame.draw.rect(SCREEN, player_color, player_rect)

        # Draw enemies
        for enemy in enemies:
            pygame.draw.rect(SCREEN, enemy_color, enemy)

        # Draw score
        score_surf = font.render(f"Score: {score}", True, (255, 255, 255))
        SCREEN.blit(score_surf, (10, 10))

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

You now have:

- A controllable player  
- Falling enemies  
- Collision-based game over  
- A score that rises the longer you survive  

It’s simple, but it’s a real game, powered entirely by your Python code.

---

## 10. Where to Go from Here

This is the “hello world” of Pygame, but you can evolve it in many fun directions:

- **Add Levels**  
  Increase enemy speed as the score grows. More difficulty, more tension.

- **Multiple Enemy Types**  
  Different colors, sizes, or behaviors (e.g., zig-zag, faster, slower).

- **Power-Ups**  
  Temporary shields, slow-motion, score multipliers.

- **Sprites and Images**  
  Replace rectangles with PNG images for the player and enemies.

- **Sound Effects & Music**  
  Use `pygame.mixer` to add background music and collision sounds.

- **Menus & Restart**  
  Add a main menu, pause screen, and restart on key press instead of quitting completely.

Each little enhancement forces you to learn new game-dev concepts: state machines, physics approximations, basic UI, etc.

---

## Wrapping Up

Pygame is a great way to dip your toes into game development using Python. You don’t need a massive engine or 3D math to start learning game loops, collision detection, and input handling.

You wrote code.  
The code controls objects.  
Those objects move, react, and crash into each other.

That’s game development in its purest form. From here, the rabbit hole goes as deep as you want: platformers, shoot ’em ups, puzzle games, roguelikes, you name it.