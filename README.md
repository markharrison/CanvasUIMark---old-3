# CanvasUIMark

A JavaScript library for creating UI controls within HTML Canvas elements, specifically designed for simple web games.

![CanvasUIMark Showcase](https://github.com/user-attachments/assets/38a3d404-ee28-46ed-b133-b7e2d00620fe)

## Features

- **Interactive UI Controls** - Buttons, menus, toggles, text inputs, radio buttons, and sliders
- **Modal Dialogs & Notifications** - Pop-up dialogs and toast notifications
- **Full Input Support** - Keyboard, mouse, and gamepad navigation
- **Responsive** - Automatic canvas scaling support
- **Easy to Use** - Simple API with minimal setup

## Quick Start

```javascript
import { CanvasUIMark, Button, Menu } from './canvasUImark.js';

const canvas = document.getElementById('gameCanvas');
const ui = new CanvasUIMark(canvas);

// Add a button
const button = new Button(100, 100, 200, 50, 'Click Me!', () => {
    ui.showToast('Button clicked!', 'success');
});
ui.addControl(button);
```

## Documentation

For detailed documentation, API reference, and examples, see **[canvasUImark.md](canvasUImark.md)**.

## Showcase

Open **[showcase.html](showcase.html)** in your browser to see all controls in action with interactive demonstrations.

## License

MIT License - See [LICENSE](LICENSE) file for details.
