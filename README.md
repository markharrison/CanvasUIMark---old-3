# CanvasUIMark

A JavaScript library for creating UI controls within HTML Canvas elements, specifically designed for simple web games.

## Overview

CanvasUIMark provides a complete set of interactive UI controls that work seamlessly within an HTML Canvas, perfect for game menus, settings screens, and in-game interfaces.

## Features

### Input Controls
- **Button** - Clickable buttons with callbacks
- **Menu** - Vertical list of selectable options
- **Toggle** - On/off switches
- **TextInput** - Text entry fields with cursor support
- **Radio** - Mutually exclusive option groups
- **Slider** - Adjustable value sliders with min/max/step configuration

### Display Features
- **Text Rendering** - Customizable text display with fonts, colors, and alignment
- **Image Display** - Show images at any position and size
- **Backgrounds** - Solid colors or gradients

### Advanced Components
- **Modal Dialogs** - Pop-up dialogs with title, message, and multiple buttons
- **Toast Notifications** - Temporary corner notifications with icons (info, success, warning, error)

### Input Support
- **Keyboard** - Full keyboard navigation with Tab, Arrow keys, Enter, Space, and Escape
- **Mouse** - Click and hover support with automatic scaling compensation
- **Gamepad** - Basic controller support (D-pad and A button)

### Key Features
- Multiple controls on the same canvas
- Automatic focus management and tab navigation
- Responsive canvas scaling support
- Extensible architecture for custom controls
- MIT Licensed

## Quick Start

### Installation

Include the library in your HTML:

```html
<script src="canvasUImark.js"></script>
```

### Basic Usage

```html
<canvas id="gameCanvas" width="1280" height="720"></canvas>

<script>
    const canvas = document.getElementById('gameCanvas');
    const ui = new CanvasUIMark(canvas);

    // Add a button
    const button = new CanvasUIControls.Button(
        100, 100, 200, 50,
        'Click Me!',
        () => {
            ui.showToast('Button clicked!', 'success');
        }
    );
    ui.addControl(button);

    // Add a menu
    const menu = new CanvasUIControls.Menu(
        100, 200, 200, 50,
        [
            { label: 'Start Game', callback: () => console.log('Start') },
            { label: 'Options', callback: () => console.log('Options') },
            { label: 'Exit', callback: () => console.log('Exit') }
        ]
    );
    ui.addControl(menu);

    // Handle escape key
    ui.onEscape = () => {
        ui.showModal('Paused', 'Game is paused', [
            { label: 'Resume', callback: () => {} }
        ]);
    };
</script>
```

## Documentation

- **[Complete Documentation](canvasUImark.md)** - Detailed usage guide and API reference
- **[Showcase Demo](showcase.html)** - Interactive demonstration of all features

## Showcase Application

Open `showcase.html` in your browser to see all controls in action. The showcase demonstrates:

- All input control types
- Modal dialogs and toast notifications
- Keyboard, mouse, and gamepad navigation
- Responsive canvas scaling
- Background customization

### Controls in Showcase

- **Tab** - Navigate between controls
- **Arrow Keys** - Navigate within menus/radios and adjust sliders
- **Enter/Space** - Activate buttons and toggles
- **Escape** - Test escape event handler
- **Mouse** - Click any control
- **Gamepad** - Use D-pad and A button (if connected)

## Browser Compatibility

CanvasUIMark works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- Gamepad API (optional, for controller support)

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Responsive Design

To make your canvas scale with screen size:

```html
<style>
    .canvas-container {
        width: 100%;
        max-width: 1280px;
        aspect-ratio: 16 / 9;
    }
    #gameCanvas {
        width: 100%;
        height: 100%;
    }
</style>

<div class="canvas-container">
    <canvas id="gameCanvas" width="1280" height="720"></canvas>
</div>
```

The library automatically handles mouse position calculations for scaled canvases.

## Architecture

The library is designed for easy extension:

- **Base Control Class** - All controls inherit from a common base
- **Event System** - Unified handling for keyboard, mouse, and gamepad
- **Rendering Loop** - Automatic update and draw cycle
- **Focus Management** - Built-in navigation between controls

## Examples

### Creating a Settings Menu

```javascript
const ui = new CanvasUIMark(canvas);

// Volume slider
const volumeSlider = new CanvasUIControls.Slider(
    400, 200, 400, 80,
    0, 100, 75, 5,
    'Volume',
    (value) => setVolume(value)
);
ui.addControl(volumeSlider);

// Music toggle
const musicToggle = new CanvasUIControls.Toggle(
    400, 300, 400, 50,
    'Background Music',
    true,
    (enabled) => toggleMusic(enabled)
);
ui.addControl(musicToggle);

// Difficulty radio
const difficulty = new CanvasUIControls.Radio(
    400, 380, 400, 50,
    ['Easy', 'Normal', 'Hard'],
    1,
    (index, value) => setDifficulty(value)
);
ui.addControl(difficulty);
```

### Creating a Modal Dialog

```javascript
ui.showModal(
    'Confirm Exit',
    'Are you sure you want to exit the game?',
    [
        { label: 'Yes', callback: () => exitGame() },
        { label: 'No', callback: () => {} }
    ]
);
```

### Showing Notifications

```javascript
// Success notification
ui.showToast('Game saved successfully!', 'success', 3000);

// Warning notification
ui.showToast('Connection unstable', 'warning', 4000);

// Error notification
ui.showToast('Failed to load save file', 'error', 5000);
```

## Contributing

Contributions are welcome! The library is structured to make adding new controls straightforward:

1. Extend the `Control` base class
2. Implement `draw()`, `handleClick()`, and `handleKeyDown()` methods
3. Add to the `CanvasUIControls` export object

## License

MIT License - Copyright (c) 2025 Mark Harrison

See [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Roadmap

Future enhancements being considered:
- Touch/mobile device support
- Additional control types (color picker, dropdown, checkbox list)
- Animation and transition effects
- Themes and styling presets
- Sound effect integration
- Accessibility improvements
