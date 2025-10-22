/**
 * CanvasUIMark - A JavaScript library for UI controls in HTML Canvas for web games
 * @version 1.0.0
 * @license MIT
 * @author Mark Harrison
 */

'use strict';

// Helper function to draw rounded rectangles
export function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (radius === 0) {
        ctx.rect(x, y, width, height);
        return;
    }
    
    radius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

// Main CanvasUIMark class
export class CanvasUIMark {
        constructor(canvas, options = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.controls = [];
            this.focusIndex = -1;
            this.modals = [];
            this.toasts = [];
            this.images = [];
            this.texts = [];
            
            // Configuration
            this.options = {
                backgroundColor: options.backgroundColor || '#1a1a1a',
                backgroundGradient: options.backgroundGradient || null,
                ...options
            };

            // Input state
            this.keys = {};
            this.mouse = { x: 0, y: 0, buttons: 0 };
            this.gamepad = null;
            this.lastGamepadButtons = [];

            // Event callbacks
            this.onEscape = null;

            // Setup event listeners
            this.setupEventListeners();

            // Animation frame
            this.lastFrameTime = 0;
            this.animationFrameId = null;
            this.start();
        }

        setupEventListeners() {
            // Keyboard events
            window.addEventListener('keydown', (e) => this.handleKeyDown(e));
            window.addEventListener('keyup', (e) => this.handleKeyUp(e));

            // Mouse events
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            this.canvas.addEventListener('click', (e) => this.handleClick(e));

            // Gamepad support
            window.addEventListener('gamepadconnected', (e) => {
                console.log('Gamepad connected:', e.gamepad.id);
            });
        }

        // Get mouse position accounting for canvas scaling
        getCanvasMousePosition(e) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }

        handleKeyDown(e) {
            this.keys[e.key] = true;
            
            // Handle escape key
            if (e.key === 'Escape') {
                // Pass to modal first if one exists
                if (this.modals.length > 0) {
                    const modal = this.modals[this.modals.length - 1];
                    if (modal.handleKeyDown) {
                        modal.handleKeyDown(e);
                    }
                } else if (this.onEscape) {
                    this.onEscape();
                }
                e.preventDefault();
                return;
            }

            // Pass other keys to modal if one exists
            if (this.modals.length > 0) {
                const modal = this.modals[this.modals.length - 1];
                if (modal.handleKeyDown) {
                    modal.handleKeyDown(e);
                }
                return;
            }

            // Handle tab navigation
            if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.focusPrevious();
                } else {
                    this.focusNext();
                }
                return;
            }

            // Pass to focused control
            if (this.focusIndex >= 0 && this.focusIndex < this.controls.length) {
                const control = this.controls[this.focusIndex];
                if (control.handleKeyDown) {
                    control.handleKeyDown(e);
                }
            }
        }

        handleKeyUp(e) {
            this.keys[e.key] = false;
        }

        handleMouseMove(e) {
            const pos = this.getCanvasMousePosition(e);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
        }

        handleMouseDown(e) {
            this.mouse.buttons |= (1 << e.button);
        }

        handleMouseUp(e) {
            this.mouse.buttons &= ~(1 << e.button);
        }

        handleClick(e) {
            const pos = this.getCanvasMousePosition(e);
            
            // Check modals first
            if (this.modals.length > 0) {
                const modal = this.modals[this.modals.length - 1];
                modal.handleClick(pos.x, pos.y);
                return;
            }

            // Check controls
            for (let i = this.controls.length - 1; i >= 0; i--) {
                const control = this.controls[i];
                if (control.containsPoint(pos.x, pos.y)) {
                    this.focusIndex = i;
                    if (control.handleClick) {
                        control.handleClick(pos.x, pos.y);
                    }
                    break;
                }
            }
        }

        updateGamepad() {
            const gamepads = navigator.getGamepads();
            if (!gamepads) return;

            for (let gp of gamepads) {
                if (gp) {
                    this.gamepad = gp;
                    
                    // Check for button presses (compare with last frame)
                    for (let i = 0; i < gp.buttons.length; i++) {
                        const pressed = gp.buttons[i].pressed;
                        const wasPressed = this.lastGamepadButtons[i] || false;
                        
                        if (pressed && !wasPressed) {
                            this.handleGamepadButton(i);
                        }
                    }
                    
                    // Update button state
                    this.lastGamepadButtons = gp.buttons.map(b => b.pressed);
                    
                    break;
                }
            }
        }

        handleGamepadButton(buttonIndex) {
            // Pass to modal first if one exists
            if (this.modals.length > 0) {
                const modal = this.modals[this.modals.length - 1];
                if (modal.handleGamepadButton) {
                    modal.handleGamepadButton(buttonIndex);
                }
                return;
            }

            // Button 0 (A/Cross) = Select
            if (buttonIndex === 0) {
                if (this.focusIndex >= 0 && this.focusIndex < this.controls.length) {
                    const control = this.controls[this.focusIndex];
                    if (control.activate) {
                        control.activate();
                    }
                }
            }
            // Button 1 (B/Circle) = Exit/Escape
            else if (buttonIndex === 1) {
                if (this.onEscape) {
                    this.onEscape();
                }
            }
            // Button 12 = D-pad up
            else if (buttonIndex === 12) {
                this.focusPrevious();
            }
            // Button 13 = D-pad down
            else if (buttonIndex === 13) {
                this.focusNext();
            }
            // Button 14 = D-pad left
            else if (buttonIndex === 14) {
                if (this.focusIndex >= 0 && this.focusIndex < this.controls.length) {
                    const control = this.controls[this.focusIndex];
                    if (control.handleGamepadAxis) {
                        control.handleGamepadAxis(-1);
                    } else if (control.handleGamepadLeft) {
                        control.handleGamepadLeft();
                    }
                }
            }
            // Button 15 = D-pad right
            else if (buttonIndex === 15) {
                if (this.focusIndex >= 0 && this.focusIndex < this.controls.length) {
                    const control = this.controls[this.focusIndex];
                    if (control.handleGamepadAxis) {
                        control.handleGamepadAxis(1);
                    } else if (control.handleGamepadRight) {
                        control.handleGamepadRight();
                    }
                }
            }
        }

        focusNext() {
            if (this.controls.length === 0) return;
            this.focusIndex = (this.focusIndex + 1) % this.controls.length;
        }

        focusPrevious() {
            if (this.controls.length === 0) return;
            this.focusIndex = (this.focusIndex - 1 + this.controls.length) % this.controls.length;
        }

        addControl(control) {
            control.manager = this;
            this.controls.push(control);
            if (this.focusIndex === -1 && this.controls.length === 1) {
                this.focusIndex = 0;
            }
            return control;
        }

        removeControl(control) {
            const index = this.controls.indexOf(control);
            if (index > -1) {
                this.controls.splice(index, 1);
                if (this.focusIndex >= this.controls.length) {
                    this.focusIndex = this.controls.length - 1;
                }
            }
        }

        addText(text, x, y, options = {}) {
            const textObj = {
                text,
                x,
                y,
                font: options.font || '20px Arial',
                color: options.color || '#ffffff',
                align: options.align || 'left',
                baseline: options.baseline || 'top'
            };
            this.texts.push(textObj);
            return textObj;
        }

        addImage(image, x, y, width, height) {
            const imageObj = { image, x, y, width, height };
            this.images.push(imageObj);
            return imageObj;
        }

        setBackground(color) {
            this.options.backgroundColor = color;
            this.options.backgroundGradient = null;
        }

        setBackgroundGradient(gradient) {
            this.options.backgroundGradient = gradient;
        }

        showModal(title, message, buttons = [], options = {}) {
            const modal = new Modal(this, title, message, buttons, options);
            this.modals.push(modal);
            return modal;
        }

        closeModal(modal) {
            const index = this.modals.indexOf(modal);
            if (index > -1) {
                this.modals.splice(index, 1);
            }
        }

        showToast(message, type = 'info', duration = 3000) {
            const toast = new Toast(this, message, type, duration);
            this.toasts.push(toast);
            
            setTimeout(() => {
                const index = this.toasts.indexOf(toast);
                if (index > -1) {
                    this.toasts.splice(index, 1);
                }
            }, duration);
            
            return toast;
        }

        update(deltaTime) {
            // Update gamepad
            this.updateGamepad();

            // Update controls
            for (let control of this.controls) {
                if (control.update) {
                    control.update(deltaTime);
                }
            }

            // Update modals
            for (let modal of this.modals) {
                if (modal.update) {
                    modal.update(deltaTime);
                }
            }
        }

        draw() {
            // Clear canvas with background
            if (this.options.backgroundGradient) {
                const gradient = this.ctx.createLinearGradient(
                    0, 0, 
                    this.canvas.width, 
                    this.canvas.height
                );
                for (let stop of this.options.backgroundGradient) {
                    gradient.addColorStop(stop.offset, stop.color);
                }
                this.ctx.fillStyle = gradient;
            } else {
                this.ctx.fillStyle = this.options.backgroundColor;
            }
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw panels first (background layer)
            for (let i = 0; i < this.controls.length; i++) {
                const control = this.controls[i];
                if (control.constructor.name === 'Panel') {
                    control.draw(this.ctx, false); // Panels never get focus
                }
            }

            // Draw images
            for (let img of this.images) {
                if (img.image.complete) {
                    this.ctx.drawImage(img.image, img.x, img.y, img.width, img.height);
                }
            }

            // Draw texts
            for (let text of this.texts) {
                this.ctx.font = text.font;
                this.ctx.fillStyle = text.color;
                this.ctx.textAlign = text.align;
                this.ctx.textBaseline = text.baseline;
                this.ctx.fillText(text.text, text.x, text.y);
            }

            // Draw other controls (interactive layer)
            for (let i = 0; i < this.controls.length; i++) {
                const control = this.controls[i];
                if (control.constructor.name !== 'Panel') {
                    const isFocused = i === this.focusIndex;
                    control.draw(this.ctx, isFocused);
                }
            }

            // Draw modals
            for (let modal of this.modals) {
                modal.draw(this.ctx);
            }

            // Draw toasts
            for (let i = 0; i < this.toasts.length; i++) {
                const toast = this.toasts[i];
                toast.draw(this.ctx, i);
            }
        }

        start() {
            const loop = (timestamp) => {
                const deltaTime = timestamp - this.lastFrameTime;
                this.lastFrameTime = timestamp;

                this.update(deltaTime);
                this.draw();

                this.animationFrameId = requestAnimationFrame(loop);
            };

            this.animationFrameId = requestAnimationFrame(loop);
        }

        stop() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

// Base Control class
export class Control {
        constructor(x, y, width, height, options = {}) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.options = {
                backgroundColor: '#333333',
                borderColor: '#666666',
                textColor: '#ffffff',
                focusColor: '#4CAF50',
                hoverColor: '#555555',
                font: '16px Arial',
                borderWidth: 2,
                padding: 10,
                borderRadius: 0, // Default no rounding
                ...options
            };
            this.manager = null;
        }

        containsPoint(x, y) {
            return x >= this.x && x <= this.x + this.width &&
                   y >= this.y && y <= this.y + this.height;
        }

        drawBase(ctx, isFocused) {
            const radius = this.options.borderRadius;
            
            // Background
            ctx.fillStyle = this.options.backgroundColor;
            if (radius > 0) {
                drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                ctx.fill();
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }

            // Border
            ctx.strokeStyle = isFocused ? this.options.focusColor : this.options.borderColor;
            ctx.lineWidth = this.options.borderWidth;
            if (radius > 0) {
                drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                ctx.stroke();
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }

        draw(ctx, isFocused) {
            this.drawBase(ctx, isFocused);
        }
    }

// Button Control
export class Button extends Control {
        constructor(x, y, width, height, label, callback, options = {}) {
            super(x, y, width, height, options);
            this.label = label;
            this.callback = callback;
            this.pressed = false;
            this.pressedTime = 0;
            this.pressedDuration = 200; // milliseconds
        }

        handleClick(x, y) {
            this.activate();
        }

        handleKeyDown(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.activate();
                e.preventDefault();
            }
        }

        activate() {
            this.pressed = true;
            this.pressedTime = 0;
            if (this.callback) {
                this.callback();
            }
        }

        update(deltaTime) {
            if (this.pressed) {
                this.pressedTime += deltaTime;
                if (this.pressedTime >= this.pressedDuration) {
                    this.pressed = false;
                    this.pressedTime = 0;
                }
            }
        }

        draw(ctx, isFocused) {
            const radius = this.options.borderRadius;
            
            // Background - change color when pressed
            ctx.fillStyle = this.pressed ? this.options.focusColor : this.options.backgroundColor;
            if (radius > 0) {
                drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                ctx.fill();
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }

            // Border
            ctx.strokeStyle = isFocused ? this.options.focusColor : this.options.borderColor;
            ctx.lineWidth = this.options.borderWidth;
            if (radius > 0) {
                drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                ctx.stroke();
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }

            // Draw label
            ctx.font = this.options.font;
            ctx.fillStyle = this.options.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
        }
    }

    // Menu Control (vertical or horizontal list of buttons)
export class Menu extends Control {
        constructor(x, y, width, itemHeight, items, options = {}) {
            // Support both old and new constructor signatures
            const orientation = options.orientation || 'vertical'; // 'vertical' or 'horizontal'
            const gap = options.gap || 0; // Gap between items
            
            let totalWidth, totalHeight;
            if (orientation === 'horizontal') {
                totalWidth = items.length * width + (items.length - 1) * gap;
                totalHeight = itemHeight;
            } else {
                totalWidth = width;
                totalHeight = items.length * itemHeight + (items.length - 1) * gap;
            }
            
            super(x, y, totalWidth, totalHeight, options);
            this.itemWidth = width;
            this.itemHeight = itemHeight;
            this.items = items;
            this.selectedIndex = 0;
            this.orientation = orientation;
            this.gap = gap;
        }

        handleClick(x, y) {
            for (let i = 0; i < this.items.length; i++) {
                const itemBounds = this.getItemBounds(i);
                if (x >= itemBounds.x && x <= itemBounds.x + itemBounds.width &&
                    y >= itemBounds.y && y <= itemBounds.y + itemBounds.height) {
                    this.selectedIndex = i;
                    if (this.items[i].callback) {
                        this.items[i].callback();
                    }
                    break;
                }
            }
        }

        getItemBounds(index) {
            if (this.orientation === 'horizontal') {
                return {
                    x: this.x + index * (this.itemWidth + this.gap),
                    y: this.y,
                    width: this.itemWidth,
                    height: this.itemHeight
                };
            } else {
                return {
                    x: this.x,
                    y: this.y + index * (this.itemHeight + this.gap),
                    width: this.itemWidth,
                    height: this.itemHeight
                };
            }
        }

        handleKeyDown(e) {
            const isVertical = this.orientation === 'vertical';
            const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
            const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
            
            if (e.key === prevKey || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
                e.preventDefault();
            } else if (e.key === nextKey || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (this.items[this.selectedIndex].callback) {
                    this.items[this.selectedIndex].callback();
                }
                e.preventDefault();
            }
        }

        handleGamepadLeft() {
            this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
        }

        handleGamepadRight() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
        }

        activate() {
            if (this.items[this.selectedIndex].callback) {
                this.items[this.selectedIndex].callback();
            }
        }

        draw(ctx, isFocused) {
            const radius = this.options.borderRadius;
            
            for (let i = 0; i < this.items.length; i++) {
                const bounds = this.getItemBounds(i);
                const isSelected = i === this.selectedIndex;

                // Background
                if (isSelected && isFocused) {
                    ctx.fillStyle = this.options.focusColor;
                } else if (isSelected) {
                    ctx.fillStyle = this.options.hoverColor;
                } else {
                    ctx.fillStyle = this.options.backgroundColor;
                }
                
                if (radius > 0) {
                    drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, radius);
                    ctx.fill();
                } else {
                    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                }

                // Border
                ctx.strokeStyle = isFocused && isSelected ? this.options.focusColor : this.options.borderColor;
                ctx.lineWidth = this.options.borderWidth;
                if (radius > 0) {
                    drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, radius);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                }

                // Label
                ctx.font = this.options.font;
                ctx.fillStyle = this.options.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.items[i].label, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
            }
        }
    }

    // Toggle Control
export class Toggle extends Control {
        constructor(x, y, width, height, label, initialValue, callback, options = {}) {
            super(x, y, width, height, options);
            this.label = label;
            this.value = initialValue;
            this.callback = callback;
        }

        handleClick(x, y) {
            this.toggle();
        }

        handleKeyDown(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.toggle();
                e.preventDefault();
            }
        }

        activate() {
            this.toggle();
        }

        toggle() {
            this.value = !this.value;
            if (this.callback) {
                this.callback(this.value);
            }
        }

        draw(ctx, isFocused) {
            this.drawBase(ctx, isFocused);

            // Draw label
            ctx.font = this.options.font;
            ctx.fillStyle = this.options.textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.label, this.x + this.options.padding, this.y + this.height / 2);

            // Draw toggle switch
            const switchWidth = 50;
            const switchHeight = 25;
            const switchX = this.x + this.width - switchWidth - this.options.padding;
            const switchY = this.y + (this.height - switchHeight) / 2;
            const switchRadius = this.options.borderRadius > 0 ? Math.min(switchHeight / 2, this.options.borderRadius) : switchHeight / 2;

            // Switch background
            ctx.fillStyle = this.value ? this.options.focusColor : '#999999';
            drawRoundedRect(ctx, switchX, switchY, switchWidth, switchHeight, switchRadius);
            ctx.fill();

            // Switch knob
            const knobSize = 20;
            const knobX = this.value ? switchX + switchWidth - knobSize - 2 : switchX + 2;
            const knobY = switchY + 2.5;
            const knobRadius = this.options.borderRadius > 0 ? Math.min(knobSize / 2, this.options.borderRadius) : knobSize / 2;
            
            ctx.fillStyle = '#ffffff';
            drawRoundedRect(ctx, knobX, knobY, knobSize, knobSize, knobRadius);
            ctx.fill();
        }
    }

// TextInput Control
export class TextInput extends Control {
        constructor(x, y, width, height, placeholder, options = {}) {
            super(x, y, width, height, options);
            this.placeholder = placeholder;
            this.value = '';
            this.cursorPos = 0;
            this.cursorVisible = true;
            this.cursorBlinkTime = 0;
        }

        handleClick(x, y) {
            // Calculate cursor position based on click
            const textX = this.x + this.options.padding;
            // For simplicity, just put cursor at end
            this.cursorPos = this.value.length;
        }

        handleKeyDown(e) {
            if (e.key === 'Backspace') {
                if (this.cursorPos > 0) {
                    this.value = this.value.slice(0, this.cursorPos - 1) + this.value.slice(this.cursorPos);
                    this.cursorPos--;
                }
                e.preventDefault();
            } else if (e.key === 'Delete') {
                if (this.cursorPos < this.value.length) {
                    this.value = this.value.slice(0, this.cursorPos) + this.value.slice(this.cursorPos + 1);
                }
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                this.cursorPos = Math.max(0, this.cursorPos - 1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.cursorPos = Math.min(this.value.length, this.cursorPos + 1);
                e.preventDefault();
            } else if (e.key === 'Home') {
                this.cursorPos = 0;
                e.preventDefault();
            } else if (e.key === 'End') {
                this.cursorPos = this.value.length;
                e.preventDefault();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                this.value = this.value.slice(0, this.cursorPos) + e.key + this.value.slice(this.cursorPos);
                this.cursorPos++;
                e.preventDefault();
            }
            
            this.cursorVisible = true;
            this.cursorBlinkTime = 0;
        }

        update(deltaTime) {
            this.cursorBlinkTime += deltaTime;
            if (this.cursorBlinkTime >= 500) {
                this.cursorVisible = !this.cursorVisible;
                this.cursorBlinkTime = 0;
            }
        }

        draw(ctx, isFocused) {
            this.drawBase(ctx, isFocused);

            // Draw text or placeholder
            ctx.font = this.options.font;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const textX = this.x + this.options.padding;
            const textY = this.y + this.height / 2;

            if (this.value) {
                ctx.fillStyle = this.options.textColor;
                ctx.fillText(this.value, textX, textY);

                // Draw cursor if focused
                if (isFocused && this.cursorVisible) {
                    const textBeforeCursor = this.value.slice(0, this.cursorPos);
                    const cursorX = textX + ctx.measureText(textBeforeCursor).width;
                    ctx.strokeStyle = this.options.textColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cursorX, this.y + this.options.padding);
                    ctx.lineTo(cursorX, this.y + this.height - this.options.padding);
                    ctx.stroke();
                }
            } else if (!isFocused) {
                ctx.fillStyle = '#999999';
                ctx.fillText(this.placeholder, textX, textY);
            } else if (this.cursorVisible) {
                // Draw cursor at start when empty
                ctx.strokeStyle = this.options.textColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(textX, this.y + this.options.padding);
                ctx.lineTo(textX, this.y + this.height - this.options.padding);
                ctx.stroke();
            }
        }
    }

    // Radio Control
export class Radio extends Control {
        constructor(x, y, width, itemHeight, options, selectedIndex, callback, opts = {}) {
            const height = itemHeight * options.length;
            super(x, y, width, height, opts);
            this.itemHeight = itemHeight;
            this.items = options;
            this.selectedIndex = selectedIndex;
            this.callback = callback;
        }

        handleClick(x, y) {
            const index = Math.floor((y - this.y) / this.itemHeight);
            if (index >= 0 && index < this.items.length) {
                this.selectedIndex = index;
                if (this.callback) {
                    this.callback(this.selectedIndex, this.items[this.selectedIndex]);
                }
            }
        }

        handleKeyDown(e) {
            if (e.key === 'ArrowUp') {
                this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
                if (this.callback) {
                    this.callback(this.selectedIndex, this.items[this.selectedIndex]);
                }
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                if (this.callback) {
                    this.callback(this.selectedIndex, this.items[this.selectedIndex]);
                }
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
                if (this.callback) {
                    this.callback(this.selectedIndex, this.items[this.selectedIndex]);
                }
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                if (this.callback) {
                    this.callback(this.selectedIndex, this.items[this.selectedIndex]);
                }
                e.preventDefault();
            }
        }

        handleGamepadLeft() {
            this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
            if (this.callback) {
                this.callback(this.selectedIndex, this.items[this.selectedIndex]);
            }
        }

        handleGamepadRight() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
            if (this.callback) {
                this.callback(this.selectedIndex, this.items[this.selectedIndex]);
            }
        }

        draw(ctx, isFocused) {
            const radius = this.options.borderRadius;
            
            for (let i = 0; i < this.items.length; i++) {
                const y = this.y + i * this.itemHeight;
                const isSelected = i === this.selectedIndex;

                // Background
                ctx.fillStyle = this.options.backgroundColor;
                ctx.fillRect(this.x, y, this.width, this.itemHeight);

                // Radio button circle
                const radioSize = 16;
                const radioX = this.x + this.options.padding + radioSize / 2;
                const radioY = y + this.itemHeight / 2;

                ctx.strokeStyle = this.options.textColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(radioX, radioY, radioSize / 2, 0, Math.PI * 2);
                ctx.stroke();

                // Fill if selected
                if (isSelected) {
                    ctx.fillStyle = this.options.focusColor;
                    ctx.beginPath();
                    ctx.arc(radioX, radioY, radioSize / 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Label
                ctx.font = this.options.font;
                ctx.fillStyle = this.options.textColor;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.items[i], radioX + radioSize, radioY);
            }

            // Draw outer border around entire control
            ctx.strokeStyle = isFocused ? this.options.focusColor : this.options.borderColor;
            ctx.lineWidth = this.options.borderWidth;
            if (radius > 0) {
                drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                ctx.stroke();
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    }

// Slider Control
export class Slider extends Control {
        constructor(x, y, width, height, min, max, value, step, label, callback, options = {}) {
            super(x, y, width, height, options);
            this.min = min;
            this.max = max;
            this.value = value;
            this.step = step;
            this.label = label;
            this.callback = callback;
            this.dragging = false;
        }

        handleClick(x, y) {
            this.updateValueFromX(x);
        }

        handleKeyDown(e) {
            if (e.key === 'ArrowLeft') {
                this.value = Math.max(this.min, this.value - this.step);
                if (this.callback) {
                    this.callback(this.value);
                }
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.value = Math.min(this.max, this.value + this.step);
                if (this.callback) {
                    this.callback(this.value);
                }
                e.preventDefault();
            }
        }

        handleGamepadAxis(direction) {
            if (direction < 0) {
                this.value = Math.max(this.min, this.value - this.step);
            } else {
                this.value = Math.min(this.max, this.value + this.step);
            }
            if (this.callback) {
                this.callback(this.value);
            }
        }

        updateValueFromX(x) {
            const sliderX = this.x + this.options.padding;
            const sliderWidth = this.width - this.options.padding * 2;
            const percent = Math.max(0, Math.min(1, (x - sliderX) / sliderWidth));
            
            let newValue = this.min + percent * (this.max - this.min);
            newValue = Math.round(newValue / this.step) * this.step;
            newValue = Math.max(this.min, Math.min(this.max, newValue));
            
            if (newValue !== this.value) {
                this.value = newValue;
                if (this.callback) {
                    this.callback(this.value);
                }
            }
        }

        draw(ctx, isFocused) {
            this.drawBase(ctx, isFocused);

            // Draw label
            ctx.font = this.options.font;
            ctx.fillStyle = this.options.textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(this.label, this.x + this.options.padding, this.y + this.options.padding);

            // Draw slider track
            const trackY = this.y + this.height / 2;
            const trackX = this.x + this.options.padding;
            const trackWidth = this.width - this.options.padding * 2;
            const trackHeight = 4;
            const trackRadius = this.options.borderRadius > 0 ? Math.min(trackHeight / 2, this.options.borderRadius / 2) : trackHeight / 2;

            ctx.fillStyle = '#666666';
            drawRoundedRect(ctx, trackX, trackY - trackHeight / 2, trackWidth, trackHeight, trackRadius);
            ctx.fill();

            // Draw filled portion
            const percent = (this.value - this.min) / (this.max - this.min);
            ctx.fillStyle = this.options.focusColor;
            drawRoundedRect(ctx, trackX, trackY - trackHeight / 2, trackWidth * percent, trackHeight, trackRadius);
            ctx.fill();

            // Draw slider knob
            const knobSize = 20;
            const knobX = trackX + trackWidth * percent - knobSize / 2;
            const knobY = trackY - knobSize / 2;
            const knobRadius = this.options.borderRadius > 0 ? Math.min(knobSize / 2, this.options.borderRadius) : knobSize / 2;

            ctx.fillStyle = isFocused ? this.options.focusColor : '#ffffff';
            drawRoundedRect(ctx, knobX, knobY, knobSize, knobSize, knobRadius);
            ctx.fill();
            
            ctx.strokeStyle = this.options.textColor;
            ctx.lineWidth = 2;
            drawRoundedRect(ctx, knobX, knobY, knobSize, knobSize, knobRadius);
            ctx.stroke();

            // Draw value
            ctx.font = this.options.font;
            ctx.fillStyle = this.options.textColor;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(this.value.toString(), this.x + this.width - this.options.padding, this.y + this.height - this.options.padding);
        }
    }

// Panel Control - for grouping other controls with a background
export class Panel extends Control {
        constructor(x, y, width, height, options = {}) {
            super(x, y, width, height, options);
        }

        draw(ctx, isFocused) {
            const radius = this.options.borderRadius;
            
            // Background
            ctx.fillStyle = this.options.backgroundColor;
            if (radius > 0) {
                drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                ctx.fill();
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }

            // Optional border
            if (this.options.borderWidth > 0) {
                ctx.strokeStyle = this.options.borderColor;
                ctx.lineWidth = this.options.borderWidth;
                if (radius > 0) {
                    drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }

        // Panels don't receive focus or input
        containsPoint(x, y) {
            return false;
        }
    }

    // Modal Dialog
// Modal Dialog class
export class Modal {
        constructor(manager, title, message, buttons = [], options = {}) {
            this.manager = manager;
            this.title = title;
            this.message = message;
            this.buttons = buttons.length > 0 ? buttons : [{ label: 'OK', callback: () => this.close() }];
            this.selectedButton = 0;

            // Calculate dimensions - allow custom sizing
            const canvas = manager.canvas;
            this.overlayAlpha = 0.7;
            
            // Use provided dimensions or calculate based on content
            if (options.width && options.height) {
                this.width = Math.min(options.width, canvas.width * 0.9);
                this.height = Math.min(options.height, canvas.height * 0.9);
            } else {
                // Auto-size based on content
                const ctx = canvas.getContext('2d');
                ctx.font = '18px Arial';
                const words = message.split(' ');
                const maxWidth = Math.min(600, canvas.width * 0.8) - 40;
                let lineCount = 1;
                let line = '';
                
                for (let word of words) {
                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && line !== '') {
                        lineCount++;
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                }
                
                // Calculate height based on content
                const titleHeight = 60;
                const messageHeight = lineCount * 25 + 40;
                const buttonsHeight = 90;
                const minHeight = 200;
                
                this.height = Math.max(minHeight, Math.min(titleHeight + messageHeight + buttonsHeight, canvas.height * 0.8));
                this.width = Math.min(600, canvas.width * 0.8);
            }
            
            this.x = (canvas.width - this.width) / 2;
            this.y = (canvas.height - this.height) / 2;

            this.buttonHeight = 50;
            this.buttonWidth = 150;
            this.buttonSpacing = 20;
        }

        handleClick(x, y) {
            // Check if clicking on buttons
            const buttonsY = this.y + this.height - this.buttonHeight - 20;
            const totalButtonWidth = this.buttons.length * this.buttonWidth + (this.buttons.length - 1) * this.buttonSpacing;
            const startX = this.x + (this.width - totalButtonWidth) / 2;

            for (let i = 0; i < this.buttons.length; i++) {
                const buttonX = startX + i * (this.buttonWidth + this.buttonSpacing);
                if (x >= buttonX && x <= buttonX + this.buttonWidth &&
                    y >= buttonsY && y <= buttonsY + this.buttonHeight) {
                    if (this.buttons[i].callback) {
                        this.buttons[i].callback();
                    }
                    this.close();
                    return;
                }
            }
        }

        handleKeyDown(e) {
            if (e.key === 'ArrowLeft') {
                this.selectedButton = (this.selectedButton - 1 + this.buttons.length) % this.buttons.length;
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.selectedButton = (this.selectedButton + 1) % this.buttons.length;
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (this.buttons[this.selectedButton].callback) {
                    this.buttons[this.selectedButton].callback();
                }
                this.close();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                // Find and activate Exit/Close button, or close if none found
                const exitButton = this.buttons.find(b => 
                    b.label.toLowerCase() === 'exit' || 
                    b.label.toLowerCase() === 'close' ||
                    b.label.toLowerCase() === 'cancel'
                );
                if (exitButton && exitButton.callback) {
                    exitButton.callback();
                }
                this.close();
                e.preventDefault();
            }
        }

        handleGamepadButton(buttonIndex) {
            // Button 0 (A/Cross) = Select current button
            if (buttonIndex === 0) {
                if (this.buttons[this.selectedButton].callback) {
                    this.buttons[this.selectedButton].callback();
                }
                this.close();
            }
            // Button 1 (B/Circle) = Exit/Cancel like ESC
            else if (buttonIndex === 1) {
                const exitButton = this.buttons.find(b => 
                    b.label.toLowerCase() === 'exit' || 
                    b.label.toLowerCase() === 'close' ||
                    b.label.toLowerCase() === 'cancel'
                );
                if (exitButton && exitButton.callback) {
                    exitButton.callback();
                }
                this.close();
            }
            // Button 14 = D-pad left
            else if (buttonIndex === 14) {
                this.selectedButton = (this.selectedButton - 1 + this.buttons.length) % this.buttons.length;
            }
            // Button 15 = D-pad right
            else if (buttonIndex === 15) {
                this.selectedButton = (this.selectedButton + 1) % this.buttons.length;
            }
        }

        close() {
            this.manager.closeModal(this);
        }

        draw(ctx) {
            const modalRadius = 10; // Fixed radius for modals
            const buttonRadius = 5; // Radius for modal buttons
            
            // Draw overlay
            ctx.fillStyle = `rgba(0, 0, 0, ${this.overlayAlpha})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Draw modal background
            ctx.fillStyle = '#2a2a2a';
            drawRoundedRect(ctx, this.x, this.y, this.width, this.height, modalRadius);
            ctx.fill();

            // Draw border
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            drawRoundedRect(ctx, this.x, this.y, this.width, this.height, modalRadius);
            ctx.stroke();

            // Draw title
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(this.title, this.x + this.width / 2, this.y + 20);

            // Draw message
            ctx.font = '18px Arial';
            ctx.fillStyle = '#cccccc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Word wrap message
            const maxWidth = this.width - 40;
            const lineHeight = 25;
            const words = this.message.split(' ');
            let line = '';
            let y = this.y + 80;

            for (let word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line, this.x + this.width / 2, y);
                    line = word + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, this.x + this.width / 2, y);

            // Draw buttons
            const buttonsY = this.y + this.height - this.buttonHeight - 20;
            const totalButtonWidth = this.buttons.length * this.buttonWidth + (this.buttons.length - 1) * this.buttonSpacing;
            const startX = this.x + (this.width - totalButtonWidth) / 2;

            for (let i = 0; i < this.buttons.length; i++) {
                const buttonX = startX + i * (this.buttonWidth + this.buttonSpacing);

                // Button background
                ctx.fillStyle = i === this.selectedButton ? '#4CAF50' : '#444444';
                drawRoundedRect(ctx, buttonX, buttonsY, this.buttonWidth, this.buttonHeight, buttonRadius);
                ctx.fill();

                // Button border
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 2;
                drawRoundedRect(ctx, buttonX, buttonsY, this.buttonWidth, this.buttonHeight, buttonRadius);
                ctx.stroke();

                // Button label
                ctx.font = '16px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.buttons[i].label, buttonX + this.buttonWidth / 2, buttonsY + this.buttonHeight / 2);
            }
        }
    }

    // Toast Notification
// Toast Notification class
export class Toast {
        constructor(manager, message, type, duration) {
            this.manager = manager;
            this.message = message;
            this.type = type;
            this.duration = duration;

            this.width = 300;
            this.height = 80;
            this.padding = 15;

            // Type-specific colors and icons
            this.typeConfig = {
                info: { color: '#2196F3', icon: 'ℹ' },
                success: { color: '#4CAF50', icon: '✓' },
                warning: { color: '#FF9800', icon: '⚠' },
                error: { color: '#F44336', icon: '✕' }
            };

            this.config = this.typeConfig[type] || this.typeConfig.info;
        }

        draw(ctx, index) {
            const canvas = ctx.canvas;
            const x = canvas.width - this.width - 20;
            const y = 20 + index * (this.height + 10);

            // Background
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(x, y, this.width, this.height);

            // Border with type color
            ctx.strokeStyle = this.config.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, this.width, this.height);

            // Icon circle
            const iconSize = 40;
            const iconX = x + this.padding + iconSize / 2;
            const iconY = y + this.height / 2;

            ctx.fillStyle = this.config.color;
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Icon
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.config.icon, iconX, iconY);

            // Message
            ctx.font = '14px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // Word wrap
            const maxWidth = this.width - iconSize - this.padding * 3;
            const messageX = x + iconSize + this.padding * 2;
            const words = this.message.split(' ');
            let line = '';
            let lines = [];

            for (let word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== '') {
                    lines.push(line);
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            // Draw lines centered vertically
            const lineHeight = 18;
            const totalHeight = lines.length * lineHeight;
            let messageY = y + (this.height - totalHeight) / 2 + lineHeight / 2;

            for (let line of lines) {
                ctx.fillText(line.trim(), messageX, messageY);
                messageY += lineHeight;
            }
        }
    }
