# Sudoku Logic Lab - Theme System

## Overview

The Sudoku Logic Lab features a customizable theme system that allows players to unlock and apply different visual themes by completing in-game achievements. Each theme provides a unique visual experience with custom backgrounds and color schemes.

## Available Themes

### 1. Classic 📋
- **Status**: Always unlocked
- **Description**: The original Sudoku experience
- **Colors**: Blue and indigo gradient

### 2. Ocean Depths 🌊
- **Unlock Requirement**: Win 5 games
- **Description**: Dive into tranquil waters
- **Colors**: Cyan and blue gradient

### 3. Emerald Forest 🌲
- **Unlock Requirement**: Win 10 games
- **Description**: Find peace among the trees
- **Colors**: Green and emerald gradient

### 4. Golden Sunset 🌅
- **Unlock Requirement**: Complete a Hard puzzle
- **Description**: Bask in warm twilight hues
- **Colors**: Orange and pink gradient

### 5. Midnight Sky 🌙
- **Unlock Requirement**: Win a puzzle with 0 mistakes
- **Description**: Puzzle under the stars
- **Colors**: Deep indigo and purple gradient

### 6. Sakura Bloom 🌸
- **Unlock Requirement**: Win 3 Easy puzzles
- **Description**: Cherry blossoms in spring
- **Colors**: Pink and rose gradient

### 7. Volcanic Heat 🌋
- **Unlock Requirement**: Win 3 Medium puzzles
- **Description**: Feel the magma flow
- **Colors**: Red and orange gradient

### 8. Arctic Ice ❄️
- **Unlock Requirement**: Win a puzzle in under 3 minutes
- **Description**: Cool crystalline clarity
- **Colors**: Blue and cyan gradient

## How It Works

### Unlocking Themes

Themes are automatically unlocked when you complete their associated achievement:
1. Play games and complete puzzles
2. When you meet an unlock criteria, you'll see a notification: "🎨 New Theme Unlocked!"
3. The theme becomes available in the Theme Selector

### Game Statistics Tracked

The system tracks the following stats to determine theme unlocks:
- **Total Wins**: Total number of completed puzzles
- **Easy Wins**: Number of Easy difficulty wins
- **Medium Wins**: Number of Medium difficulty wins
- **Hard Wins**: Number of Hard difficulty wins
- **Perfect Wins**: Wins with 0 mistakes
- **Fast Wins**: Wins completed in under 3 minutes

### Applying Themes

1. Click the **🎨 theme button** in the header (available on menu and game screens)
2. Browse through available themes in the Theme Selector
3. Click on any unlocked theme to apply it
4. Locked themes show their unlock criteria and your current progress
5. The selected theme is saved and persists across sessions

## Technical Implementation

### Data Storage

Themes use localStorage for persistence:
- `sudoku_v2_unlocked_themes`: Array of unlocked theme IDs
- `sudoku_v2_active_theme`: Currently selected theme ID
- `sudoku_v2_game_stats`: Player statistics for unlock criteria

### Theme Structure

Each theme includes:
- `id`: Unique identifier
- `name`: Display name
- `description`: Theme description
- `icon`: Emoji icon
- `background`: Tailwind CSS gradient classes for screen background
- `unlocked`: Whether theme is unlocked by default
- `unlockCriteria`: Description of how to unlock (for locked themes)

### Components

- **ThemeSelector**: Modal dialog for browsing and selecting themes
- **Theme Progress Tracking**: Shows progress towards unlocking themes
- **Theme Application**: Applies selected theme's background gradient to game screen

## User Experience

### Theme Unlock Notifications

When a theme is unlocked:
1. A celebratory notification appears on the victory screen
2. The newly unlocked theme is highlighted with its icon and name
3. Players can immediately select the new theme

### Progress Indicators

In the Theme Selector, locked themes display:
- Lock icon 🔒
- Unlock criteria description
- Current progress (e.g., "3/5 wins", "1/1 Hard win")

### Visual Feedback

- Active theme has a blue border and "Active" badge
- Unlocked themes are fully colored and clickable
- Locked themes appear semi-transparent with reduced opacity

## Future Enhancements

Potential additions to the theme system:
- Custom sound packs per theme
- Animated backgrounds
- Board texture variations
- Seasonal/event-limited themes
- Achievement-based special themes
- Theme preview mode
