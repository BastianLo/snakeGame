# Space Invaders Game Documentation

## Table of Contents
1. [Introduction](#1-introduction)
2. [Game Overview](#2-game-overview)
3. [Core Game Logic](#3-core-game-logic)
    - [Player Controls](#player-controls)
    - [Enemy Movement and Behavior](#enemy-movement-and-behavior)
    - [Shooting Mechanics](#shooting-mechanics)
    - [Collision Detection](#collision-detection)
    - [Scoring](#scoring)
    - [Game Over Conditions](#game-over-conditions)
4. [New Features](#4-new-features)
    - [Endless Mode](#endless-mode)
    - [Dynamic Difficulty Scaling](#dynamic-difficulty-scaling)
    - [Limited Fire Rate](#limited-fire-rate)
    - [Upgrade System](#upgrade-system)
        - [Double Shot](#double-shot)
        - [Increased Fire Rate](#increased-fire-rate)
5. [User Interactions](#5-user-interactions)
    - [Main Menu](#main-menu)
    - [In-Game Controls](#in-game-controls)
    - [Pause Menu](#pause-menu)
    - [Upgrade Selection](#upgrade-selection)
6. [Game Flow](#6-game-flow)
    - [Starting a New Game](#starting-a-new-game)
    - [Gameplay Loop](#gameplay-loop)
    - [Level Progression](#level-progression)
    - [Game End](#game-end)
7. [Technical Documentation (For Developers)](#7-technical-documentation-for-developers)
    - [Project Structure](#project-structure)
    - [Key Game Components/Classes](#key-game-componentsclasses)
    - [Dependency Management (if applicable)](#dependency-management-if-applicable)
    - [Build and Run Instructions](#build-and-run-instructions)
    - [Extensibility/Modding (if applicable)](#extensibilitymodding-if-applicable)
8. [Troubleshooting](#8-troubleshooting)
9. [Future Enhancements](#9-future-enhancements)
10. [Credits and Acknowledgements](#10-credits-and-acknowledgements)
11. [License](#11-license)

---

## 1. Introduction
A brief introduction to the Space Invaders game, its purpose, and what makes it unique.

## 2. Game Overview
Provide a high-level summary of the game, including its objective, visual style, and overall player experience.

## 3. Core Game Logic
### Player Controls
Detail how the player controls their spaceship (e.g., left/right movement, firing).
*   **Movement:** [Specify keys/controls for left/right]
*   **Fire:** [Specify key/control for firing]

### Enemy Movement and Behavior
Describe how the alien invaders move, their attack patterns, and how their behavior changes over time.

### Shooting Mechanics
Explain how projectiles are fired, their speed, and how they interact with enemies and the player.
*   **Player Projectiles:** [Details about player shots]
*   **Enemy Projectiles:** [Details about enemy shots]

### Collision Detection
Describe how collisions are detected between player, enemies, projectiles, and any other game elements (e.g., barriers).

### Scoring
Explain how points are awarded in the game (e.g., destroying enemies, special bonuses).

### Game Over Conditions
List the conditions that lead to a "Game Over" state (e.g., player health, enemies reaching the bottom).

## 4. New Features
### Endless Mode
Explain how the endless mode works. Is it about continuous waves, increasing difficulty, or both?

### Dynamic Difficulty Scaling
Describe the algorithm or logic behind how the game's difficulty dynamically adjusts based on player performance.
*   **How difficulty increases:** [e.g., faster enemies, more projectiles, increased enemy health]
*   **Triggers for difficulty change:** [e.g., score thresholds, time elapsed]

### Limited Fire Rate
Explain the mechanics of the limited fire rate.
*   **Cooldown:** [Time between shots]
*   **Visual/Audio indicators:** [How the player knows they can't fire]

### Upgrade System
Detail the available upgrades and how they are acquired and applied.
*   **Upgrade Acquisition:** [How players get upgrades, e.g., power-ups, in-game shop]
*   **Upgrade Application:** [How upgrades are activated]

#### Double Shot
Describe what the "Double Shot" upgrade does and its effects on gameplay.

#### Increased Fire Rate
Explain the impact of the "Increased Fire Rate" upgrade.

## 5. User Interactions
### Main Menu
Describe the options available on the main menu (e.g., Start Game, Options, Exit).

### In-Game Controls
Reiterate or expand on the in-game controls, perhaps with a visual representation or keybindings table.

### Pause Menu
Explain what options are available when the game is paused.

### Upgrade Selection
If there's a specific menu or process for selecting upgrades, describe it here.

## 6. Game Flow
### Starting a New Game
Describe the sequence of events from launching the game to the start of gameplay.

### Gameplay Loop
Explain the continuous cycle of the game (e.g., enemy waves, player actions, scoring, updates).

### Level Progression
How does the game progress through levels or stages, especially in endless mode?

### Game End
Describe the end-game sequence, including score display, options to restart or return to the main menu.

## 7. Technical Documentation (For Developers)
### Project Structure
Outline the directory and file structure of the game's codebase.

### Key Game Components/Classes
Provide a brief overview of the main classes or modules and their responsibilities (e.g., `Player`, `Enemy`, `Projectile`, `GameManager`).

### Dependency Management (if applicable)
List any external libraries or frameworks used and how they are managed.

### Build and Run Instructions
Provide clear steps for developers to set up, build, and run the game from the source code.

### Extensibility/Modding (if applicable)
If the game is designed to be extensible, explain how developers can add new features or modify existing ones.

## 8. Troubleshooting
Common issues and their solutions.

### Invisible Player/Enemies Issue

**Problem:**
Initially, players and enemies were not visible on the screen, leading to a broken game experience. This was caused by game assets (specifically images for the player and enemy sprites) not being fully loaded into memory before the game attempted to draw them. The drawing functions were called on uninitialized or incomplete image objects, resulting in nothing being rendered.

**Solution:**
The issue was resolved by implementing a robust asset pre-loading mechanism.
1.  **Image Pre-loading:** All necessary image assets for the player, enemies, projectiles, and background elements are now loaded into memory at the very beginning of the game's initialization phase.
2.  **Asset Loading Check:** A system was put in place to ensure that the game loop and drawing operations do not commence until all critical assets have been successfully loaded. This often involves a loading screen or a simple check that delays the start of the main game until all resources are ready.

This ensures that when drawing functions are called, valid image data is available, making the player and enemies visible and allowing the game to function as intended.

## 9. Future Enhancements
Ideas or plans for future updates and features.

## 10. Credits and Acknowledgements
List contributors, assets creators, or any resources used.

## 11. License
Specify the licensing information for the project.