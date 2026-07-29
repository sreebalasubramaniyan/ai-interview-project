# IDE UI/UX Redesign Plan

## Overview
Redesign the IntervieweeDashboard to match LeetCode's professional look and feel with a movable/resizable console panel.

---

## Current Issues
1. Console panel is not movable/resizable
2. Layout is not truly responsive
3. Visual design looks dated
4. Poor user experience for resizing panels

---

## Target Design (LeetCode Style)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Two Sum                              ⏱ 45:32           [Run] [Submit]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├────────────────────────────────┬────────────────────────────────────────────┤
│                                │  ┌──────────────────────────────────────┐  │
│    PROBLEM PANEL               │  │  Language: [JavaScript ▼]  [▼][▲]  │  │
│    ─────────────────           │  ├──────────────────────────────────────┤  │
│                                │  │                                      │  │
│    Difficulty: Easy             │  │         MONACO EDITOR               │  │
│                                │  │                                      │  │
│    Description                 │  │                                      │  │
│    ─────────────────           │  │                                      │  │
│    Given an array...           │  │                                      │  │
│                                │  ├──────────────────────────────────────┤  │
│    Example 1:                 │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │
│    Input: [2,7,11,15]         │  │  (Resizable Handle)                 │  │
│    Output: [0,1]              │  ├──────────────────────────────────────┤  │
│                                │  │                                      │  │
│    Constraints:                │  │  Console Output                     │  │
│    • 2 <= nums.length          │  │  ─────────────────                  │  │
│                                │  │  Test 1: ✓ Passed                  │  │
│                                │  │  Input: [2,7]                      │  │
│                                │  │  Expected: [0,1]                   │  │
│                                │  │  Output: [0,1]                     │  │
│                                │  │                                      │  │
│                                │  └──────────────────────────────────────┘  │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## Key Features

### 1. Split Panel Layout
- **Left Panel**: Problem description (fixed or collapsible)
- **Right Panel**: Editor + Console (vertically split)
- **Resizable**: Drag handle between editor and console

### 2. Professional UI Elements
- Dark theme (LeetCode dark mode style)
- Clean typography
- Smooth animations
- Proper spacing and padding

### 3. Console Panel Features
- Draggable/resizable from top edge
- Collapsible (hide/show)
- Shows: Test results, errors, execution time
- Status badges (passed/failed)

### 4. Console Panel (Key Feature)
- **Perfectly scrollable** - Independent scroll, smooth scrolling
- **Adjustable height** - Drag to resize (min 100px, max 70% of panel)
- **Collapsible** - Hide/show with animation
- **Custom resize handle** - Visible bar with hover effect
- **Auto-scroll to bottom** - When new output appears
- **Never loses content** - Scroll position maintained when collapsed/expanded

### 5. Responsive Design
- Desktop: Full split view
- Tablet: Stacked or collapsible panels
- Mobile: Tab-based navigation

---

## Implementation Steps

### Step 1: CSS Variables & Theme
- Define color palette
- Set up CSS custom properties
- Create dark theme variables

### Step 2: Layout Structure
- Use CSS Grid/Flexbox
- Create resizable panels with CSS resize or JS
- Add proper breakpoints

### Step 3: Component Styling
- Navbar styling
- Problem panel styling
- Editor toolbar styling
- Console panel styling

### Step 4: Interactivity
- Resizable handle functionality
- Collapse/expand console
- Smooth transitions

---

## Color Palette (LeetCode Dark)

```css
:root {
  /* Backgrounds */
  --bg-primary: #1a1a1a;
  --bg-secondary: #282828;
  --bg-tertiary: #323232;
  --bg-elevated: #3d3d3d;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-muted: #787878;
  
  /* Accents */
  --accent-blue: #4a9eff;
  --accent-green: #28a745;
  --accent-red: #dc3545;
  --accent-yellow: #ffc107;
  
  /* Borders */
  --border-color: #404040;
  --border-hover: #505050;
  
  /* Difficulty Tags */
  --easy-color: #28a745;
  --medium-color: #ffc107;
  --hard-color: #dc3545;
}
```

---

## Files to Modify

```
frontend/vite-project/src/
├── pages/interview/
│   ├── IntervieweeDashboard.jsx   # Main component (update structure)
│   └── IntervieweeDashboard.css   # Full CSS redesign
└── components/interview/
    └── CodeEditor.jsx             # Minor updates if needed
```

---

## Resizable Panel Implementation

### Console Panel Requirements
```css
.console-panel {
  /* Scrollable */
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  /* Resizable */
  resize: vertical;
  min-height: 120px;
  max-height: 70vh;
  
  /* Visual */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-blue) var(--bg-tertiary);
}

/* Custom scrollbar for webkit */
.console-panel::-webkit-scrollbar {
  width: 8px;
}
.console-panel::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}
.console-panel::-webkit-scrollbar-thumb {
  background: var(--accent-blue);
  border-radius: 4px;
}

/* Custom drag handle */
.resize-handle {
  height: 6px;
  background: var(--border-color);
  cursor: row-resize;
  transition: background 0.2s;
  position: relative;
}

.resize-handle:hover,
.resize-handle:active {
  background: var(--accent-blue);
}

.resize-handle::after {
  content: '•••';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-muted);
  font-size: 8px;
  letter-spacing: 2px;
}
```

### Key Features
1. **Independent scrolling** - Console scrolls separately from editor
2. **Smooth scrolling** - `scroll-behavior: smooth`
3. **Custom scrollbar** - Matches theme
4. **Drag to resize** - CSS `resize: vertical`
5. **Min/Max limits** - 120px to 70vh
6. **Visual feedback** - Handle changes color on hover

---

## Decision Needed

1. **Panel Resizing**: CSS `resize` (simple) or JS library (full control)?
2. **Problem Panel**: Always visible or collapsible?
3. **Mobile View**: Stack vertically or use tabs?

Let me know your preference and I'll implement!
