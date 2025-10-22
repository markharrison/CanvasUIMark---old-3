# CanvasUIMark Documentation

CanvasUIMark is a JavaScript library for creating UI controls within an HTML Canvas element, specifically designed for simple web games.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Input Controls](#input-controls)
4. [Display Features](#display-features)
5. [Modal Dialogs](#modal-dialogs)
6. [Toast Notifications](#toast-notifications)
7. [Input Handling](#input-handling)
8. [Styling and Customization](#styling-and-customization)
9. [API Reference](#api-reference)

## Getting Started

### Installation

Include the library in your HTML file:

```html
<script type="module">
    import { CanvasUIMark } from './canvasUImark.js';
</script>
```

### Basic Setup

```html
<canvas id="gameCanvas" width="1280" height="720"></canvas>

<script>
    const canvas = document.getElementById('gameCanvas');
    const ui = new CanvasUIMark(canvas, {
        backgroundColor: '#1a1a1a'
    });
</script>
```

### Making Canvas Responsive

To make your canvas scale with screen width:

```css
.canvas-container {
    width: 100%;
    max-width: 1280px;
    aspect-ratio: 16 / 9;
}

#gameCanvas {
    width: 100%;
    height: 100%;
}
```

The library automatically handles mouse position calculations for scaled canvases.

## Core Concepts

### CanvasUIMark Instance

The main `CanvasUIMark` class manages all UI elements, input handling, and rendering.

```javascript
const ui = new CanvasUIMark(canvas, options);
```

**Options:**
- `backgroundColor` (string): Default background color (e.g., '#1a1a1a')
- `backgroundGradient` (array): Gradient definition (see [Display Features](#display-features))

### Adding Controls

Controls are added to the UI instance:

```javascript
const button = new CanvasUIControls.Button(x, y, width, height, label, callback);
ui.addControl(button);
```

### Focus Management

The library automatically manages focus and keyboard navigation:
- **Tab**: Move to next control
- **Shift+Tab**: Move to previous control
- Focus is visually indicated by a highlighted border

## Input Controls

### Button

A clickable button that executes a callback when activated.

```javascript
const button = new CanvasUIControls.Button(
    100, 100,           // x, y position
    200, 50,            // width, height
    'Click Me!',        // label
    () => {             // callback
        console.log('Button clicked!');
    },
    {                   // optional styling
        backgroundColor: '#333333',
        textColor: '#ffffff',
        focusColor: '#4CAF50'
    }
);
ui.addControl(button);
```

**Activation:**
- Mouse click
- Enter or Space key when focused
- Gamepad A button when focused

### Menu

A vertical list of selectable items (buttons).

```javascript
const menu = new CanvasUIControls.Menu(
    100, 100,           // x, y position
    200, 50,            // width, item height
    [                   // menu items
        { label: 'New Game', callback: () => console.log('New Game') },
        { label: 'Load Game', callback: () => console.log('Load Game') },
        { label: 'Options', callback: () => console.log('Options') },
        { label: 'Exit', callback: () => console.log('Exit') }
    ],
    {                   // optional styling
        backgroundColor: '#333333',
        focusColor: '#4CAF50'
    }
);
ui.addControl(menu);
```

**Navigation:**
- Mouse click on item
- Arrow Up/Down keys when focused
- Enter or Space to select when focused
- Gamepad D-pad up/down and A button

### Toggle

A switch that can be turned on or off.

```javascript
const toggle = new CanvasUIControls.Toggle(
    100, 100,           // x, y position
    250, 50,            // width, height
    'Sound Effects',    // label
    true,               // initial value
    (value) => {        // callback with current value
        console.log('Toggle is now:', value);
    },
    {                   // optional styling
        focusColor: '#4CAF50'
    }
);
ui.addControl(toggle);
```

**Activation:**
- Mouse click
- Enter or Space key when focused
- Gamepad A button when focused

### TextInput

A text input field for user text entry.

```javascript
const textInput = new CanvasUIControls.TextInput(
    100, 100,                  // x, y position
    300, 50,                   // width, height
    'Enter your name...',      // placeholder text
    {                          // optional styling
        backgroundColor: '#333333',
        textColor: '#ffffff'
    }
);
ui.addControl(textInput);

// Get the value
console.log(textInput.value);
```

**Interaction:**
- Click to focus and position cursor
- Type to enter text
- Backspace/Delete to remove text
- Arrow keys to move cursor
- Home/End keys

### Radio

A group of mutually exclusive options.

```javascript
const radio = new CanvasUIControls.Radio(
    100, 100,                  // x, y position
    250, 45,                   // width, item height
    ['Easy', 'Medium', 'Hard', 'Expert'],  // options
    1,                         // initial selected index
    (index, value) => {        // callback
        console.log(`Selected: ${value} (index ${index})`);
    },
    {                          // optional styling
        focusColor: '#4CAF50'
    }
);
ui.addControl(radio);
```

**Navigation:**
- Mouse click on option
- Arrow Up/Down keys when focused
- Gamepad D-pad up/down

### Slider

A slider for selecting numerical values within a range.

```javascript
const slider = new CanvasUIControls.Slider(
    100, 100,          // x, y position
    300, 80,           // width, height
    0, 100,            // min, max values
    50,                // initial value
    5,                 // step increment
    'Volume',          // label
    (value) => {       // callback
        console.log('Value:', value);
    },
    {                  // optional styling
        focusColor: '#4CAF50'
    }
);
ui.addControl(slider);
```

**Interaction:**
- Mouse click on track to set value
- Arrow Left/Right keys when focused
- Gamepad D-pad left/right when focused
- Displays current value

## Display Features

### Text Display

Add static text to the canvas:

```javascript
ui.addText('Hello World', 640, 100, {
    font: 'bold 24px Arial',
    color: '#ffffff',
    align: 'center',      // 'left', 'center', 'right'
    baseline: 'top'       // 'top', 'middle', 'bottom'
});
```

### Image Display

Add images to the canvas:

```javascript
const image = new Image();
image.src = 'path/to/image.png';
image.onload = () => {
    ui.addImage(image, 100, 100, 200, 150);  // x, y, width, height
};
```

### Background Color

Set a solid background color:

```javascript
ui.setBackground('#1a1a1a');
```

### Background Gradient

Set a gradient background:

```javascript
ui.setBackgroundGradient([
    { offset: 0, color: '#1a1a1a' },
    { offset: 0.5, color: '#2c3e50' },
    { offset: 1, color: '#34495e' }
]);
```

## Modal Dialogs

Display modal dialog boxes with a semi-transparent overlay:

```javascript
ui.showModal(
    'Confirm Action',                    // title
    'Are you sure you want to proceed?', // message
    [                                    // buttons
        { 
            label: 'Yes', 
            callback: () => console.log('Confirmed') 
        },
        { 
            label: 'No', 
            callback: () => console.log('Cancelled') 
        }
    ]
);
```

**Features:**
- Semi-transparent background overlay
- Word-wrapped message text
- Multiple button support
- Click outside or button to close
- Automatic centering

**Default Modal:**
If no buttons are provided, a single "OK" button is shown.

## Toast Notifications

Display temporary notification messages in the corner:

```javascript
ui.showToast(
    'Operation successful!',  // message
    'success',                // type: 'info', 'success', 'warning', 'error'
    3000                      // duration in milliseconds
);
```

**Toast Types:**
- `info` - Blue with info icon (ℹ)
- `success` - Green with checkmark (✓)
- `warning` - Orange with warning icon (⚠)
- `error` - Red with X icon (✕)

**Features:**
- Stacks multiple toasts vertically
- Auto-dismisses after duration
- Icon with type-specific color
- Word-wrapped text

## Input Handling

### Keyboard Support

The library handles keyboard input automatically:

- **Tab** / **Shift+Tab**: Navigate between controls
- **Arrow Keys**: Navigate within menus/radios, adjust sliders, move cursor in text inputs
- **Enter** / **Space**: Activate buttons, toggles
- **Escape**: Trigger custom escape handler
- **Text Keys**: Type in text inputs
- **Backspace** / **Delete**: Edit text inputs
- **Home** / **End**: Move cursor in text inputs

### Mouse Support

Mouse interaction is fully supported:

- **Click**: Activate controls
- **Hover**: Visual feedback (on compatible controls)
- Automatically accounts for canvas scaling

### Gamepad Support

Basic gamepad controller support:

- **D-pad Up/Down**: Navigate between controls
- **D-pad Left/Right**: Adjust sliders
- **A Button (button 0)**: Activate control
- Auto-detects connected gamepads

### Escape Key Handler

Set a custom handler for the Escape key:

```javascript
ui.onEscape = () => {
    console.log('User pressed ESC');
    // Navigate to menu, pause game, etc.
};
```

## Styling and Customization

### Control Options

All controls accept an `options` object for styling:

```javascript
const options = {
    backgroundColor: '#333333',  // Background color
    borderColor: '#666666',      // Normal border color
    textColor: '#ffffff',        // Text color
    focusColor: '#4CAF50',       // Focused border/highlight color
    hoverColor: '#555555',       // Hover state color
    font: '16px Arial',          // Font style
    borderWidth: 2,              // Border thickness
    padding: 10                  // Internal padding
};
```

### Fonts

Customize fonts using CSS font strings:

```javascript
{
    font: 'bold 20px Arial'
    font: '18px "Courier New"'
    font: 'italic 16px Georgia'
}
```

### Colors

Colors can be specified using:
- Hex: `'#4CAF50'`
- RGB: `'rgb(76, 175, 80)'`
- RGBA: `'rgba(76, 175, 80, 0.8)'`
- Named: `'green'`, `'red'`, etc.

## API Reference

### CanvasUIMark Class

#### Constructor

```javascript
new CanvasUIMark(canvas, options)
```

#### Methods

- `addControl(control)` - Add a control to the UI
- `removeControl(control)` - Remove a control from the UI
- `addText(text, x, y, options)` - Add text display
- `addImage(image, x, y, width, height)` - Add image display
- `setBackground(color)` - Set solid background color
- `setBackgroundGradient(gradient)` - Set gradient background
- `showModal(title, message, buttons)` - Display modal dialog
- `closeModal(modal)` - Close specific modal
- `showToast(message, type, duration)` - Display toast notification
- `start()` - Start animation loop
- `stop()` - Stop animation loop

#### Properties

- `canvas` - Reference to canvas element
- `ctx` - Canvas 2D context
- `controls` - Array of all controls
- `onEscape` - Escape key callback function

### Control Classes

All available in `CanvasUIControls`:

- `Button(x, y, width, height, label, callback, options)`
- `Menu(x, y, width, itemHeight, items, options)`
- `Toggle(x, y, width, height, label, initialValue, callback, options)`
- `TextInput(x, y, width, height, placeholder, options)`
- `Radio(x, y, width, itemHeight, options, selectedIndex, callback, options)`
- `Slider(x, y, width, height, min, max, value, step, label, callback, options)`

## Examples

### Complete Example

```javascript
// Initialize
const canvas = document.getElementById('gameCanvas');
const ui = new CanvasUIMark(canvas);

// Add title
ui.addText('My Game', 640, 50, {
    font: 'bold 48px Arial',
    align: 'center'
});

// Add menu
const mainMenu = new CanvasUIControls.Menu(
    540, 200, 200, 60,
    [
        { label: 'Start', callback: startGame },
        { label: 'Options', callback: showOptions },
        { label: 'Exit', callback: exitGame }
    ]
);
ui.addControl(mainMenu);

// Add settings toggle
const musicToggle = new CanvasUIControls.Toggle(
    440, 450, 400, 50,
    'Background Music',
    true,
    (enabled) => {
        if (enabled) startMusic();
        else stopMusic();
    }
);
ui.addControl(musicToggle);

// Set escape handler
ui.onEscape = () => {
    ui.showModal('Pause', 'Game Paused', [
        { label: 'Resume', callback: () => {} },
        { label: 'Quit', callback: exitGame }
    ]);
};

// Show welcome message
ui.showToast('Welcome!', 'success', 3000);
```

## Best Practices

1. **Canvas Size**: Use the recommended 1280x720 for optimal display, but the library works with any size
2. **Responsive Design**: Always make your canvas scale with CSS to support different screen sizes
3. **Control Placement**: Leave adequate spacing between controls for better usability
4. **Focus Order**: Add controls in the order you want users to tab through them
5. **Callbacks**: Keep callback functions lightweight; perform heavy operations asynchronously
6. **Toast Duration**: Use 2-3 seconds for info messages, 4-5 seconds for important warnings
7. **Modal Usage**: Use modals sparingly; they block all other interaction
8. **Testing**: Test with keyboard, mouse, and gamepad if possible

## Troubleshooting

### Mouse clicks not registering correctly when canvas is scaled

The library automatically handles canvas scaling. Ensure your canvas uses CSS for scaling:

```css
#gameCanvas {
    width: 100%;
    height: 100%;
}
```

### Controls not receiving keyboard input

Ensure focus management is working:
- Call `ui.addControl()` to add controls properly
- Check browser console for errors
- Verify the canvas or page has focus

### Gamepad not working

- Ensure a gamepad is connected before the page loads
- Check browser console for "Gamepad connected" message
- Not all browsers support gamepad API

### Performance issues

- Limit the number of controls (recommended: < 50)
- Use `ui.stop()` when UI is not visible
- Optimize callback functions
- Consider using separate canvases for complex scenes

## License

MIT License - See LICENSE file for details.
