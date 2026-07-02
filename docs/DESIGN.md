---
name: MURU
url: https://muru.ru
colors:
  primary: '#5d6b3a'
  primary-hover: '#879650'
  background: '#fcfbfb'
  surface: '#f4f0e8'
  text-primary: '#555558'
  text-secondary: '#5b5b5b'
  text-muted: '#b8b8b8'
  text-inverse: '#ffffff'
  text-heading: '#2f2f2f'
  border: '#d1cdcd'
  error: '#e03a43'
  success: '#2a4c39'
  warning: '#ffc117'
typography:
  display:
    family: 'Mulish'
    size: 36px
    weight: 400
    line-height: 1.2
  heading-h2:
    family: 'Mulish'
    size: 36px
    weight: 400
    line-height: 1.2
  body:
    family: 'Mulish'
    size: 16px
    weight: 300
    line-height: 1.5
  small:
    family: 'Mulish'
    size: 14px
    weight: 300
    line-height: 1.5
  caption:
    family: 'Mulish'
    size: 14px
    weight: 500
    line-height: 1.2
  button:
    family: 'Mulish'
    size: 14px
    weight: 300
    line-height: 1.2
  nav-link:
    family: 'Mulish'
    size: 14px
    weight: 500
    line-height: 1.2
spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 40, 64]
radius:
  sm: 0px
  md: 50px
  lg: 100px
motion:
  duration-fast: '0.3s'
  duration-base: '0.5s'
  duration-slow: '0.8s'
  easing-standard: 'ease-in-out'
components:
  button-primary:
    bg: '{colors.primary}'
    text: '{colors.text-inverse}'
    radius: '{radius.sm}'
    padding: '1px 32px'
  button-secondary:
    bg: 'transparent'
    text: '{colors.text-muted}'
    border: '1px solid {colors.text-muted}'
    radius: '{radius.sm}'
    padding: '12px 16px'
  input:
    bg: '{colors.background}'
    text: '{colors.text-primary}'
    border: '1px solid {colors.border}'
    radius: '{radius.sm}'
    padding: '8px 8px'
layout:
  max-width: 1564px
  gutter: 20px
  section-padding: 32px
---

# Design System Inspired by MURU

## 1. Visual Theme & Atmosphere
The MURU design system cultivates a serene and refined atmosphere, characterized by a naturalistic color palette and a clean, spacious layout. The primary brand color, a muted forest green (`#5d6b3a`), anchors interactive elements like the "Каталог" button, providing a subtle contrast to the predominantly light backgrounds (`#fcfbfb`). Typography, primarily set in Mulish, employs light weights and generous line spacing to enhance readability and contribute to the airy feel.

The visual identity is defined by a lack of overt ornamentation, favoring functional elegance. Elements like buttons and inputs feature sharp, `0px` border radii, emphasizing clarity and precision. Ample whitespace, including a `32px` page padding and `20px` item gaps, ensures visual calm and clear content separation. Subtle CSS transitions, such as `0.3s ease-in-out` for popovers and `0.8s` for header elements, introduce a gentle responsiveness without distracting from the content.

Key Characteristics:
- Muted green (`#5d6b3a`) as primary accent.
- Clean `0px` border radius for interactive elements.
- Mulish font with light weights (300, 400).
- Generous `32px` page padding and `20px` item gaps.
- Minimalist iconography with monochrome outlines.
- No strong shadows, relying on z-index for layering.
- CSS transitions (e.g., `0.3s ease-in-out`) for subtle motion.

## 2. Color Palette & Roles
The MURU color palette is grounded in natural tones, emphasizing a calm and sophisticated aesthetic.

-   **Primary**
    -   **Primary (`#5d6b3a`)** — The brand's signature muted forest green, used for primary calls-to-action, active states, and key brand elements like the logo.
    -   **Primary Hover (`#879650`)** — A lighter, more vibrant green, used for the hover state of primary interactive elements.
-   **Neutral Scale**
    -   **Background (`#fcfbfb`)** — The dominant light background color for pages and main content areas, providing a clean canvas.
    -   **Surface (`#f4f0e8`)** — A subtle beige, used for secondary background elements like the footer and accent sections.
    -   **Text Primary (`#555558`)** — A dark gray, used for primary body text and main headings, ensuring high readability on light backgrounds.
    -   **Text Secondary (`#5b5b5b`)** — A slightly lighter dark gray, used for secondary text, descriptions, and less prominent information.
    -   **Text Muted (`#b8b8b8`)** — A light gray, used for muted text, inactive navigation links, and subtle informational elements.
    -   **Text Inverse (`#ffffff`)** — Pure white, used for text on dark backgrounds, such as primary buttons.
    -   **Text Heading (`#2f2f2f`)** — A very dark gray, used for prominent headings and titles.
    -   **Border (`#d1cdcd`)** — A light gray, used for subtle borders, input fields, and dividers.
-   **System States**
    -   **Error (`#e03a43`)** — A vibrant red, indicating error messages or destructive actions.
    -   **Success (`#2a4c39`)** — A deep green, indicating successful operations or positive feedback.
    -   **Warning (`#ffc117`)** — A bright yellow, indicating warnings or cautionary information.

## 3. Typography Rules
-   **Font Family**:
    -   Primary: 'Mulish', sans-serif
    -   Monospace: 'monospace' (for code snippets or technical displays)
-   **Hierarchy**:
    -   **Display/H1**: 'Mulish' `36px` `400` · line-height `1.2` · tracking `none` · Used for prominent page titles and hero sections.
    -   **H2**: 'Mulish' `36px` `400` · line-height `1.2` · tracking `none` · Used for major section headings.
    -   **Body**: 'Mulish' `16px` `300` · line-height `1.5` · tracking `none` · Standard text for paragraphs and detailed content.
    -   **Small**: 'Mulish' `15px` `300` · line-height `1.5` · tracking `none` · Used for secondary body text or smaller content blocks.
    -   **Caption**: 'Mulish' `14px` `500` · line-height `1.2` · tracking `none` · Applied to navigation links, button labels, and metadata.
    -   **Code/Mono**: `'monospace'` `14px` `400` · line-height `1.4` · tracking `none` · For code examples or fixed-width text.
-   **Principles**:
    -   Prioritize readability with light font weights and ample line heights, especially for body text.
    -   Maintain a clear visual hierarchy by differentiating headings and body text primarily through size and weight, rather than excessive styling.
    -   Utilize the `Mulish` font consistently across all text elements to ensure a cohesive brand voice.
    -   Employ `14px` `Mulish` `500` for interactive elements like navigation and buttons to provide clear legibility and a sense of action.

## 4. Component Stylings

### Buttons

Buttons in MURU are characterized by their sharp, `0px` border radius and clear state transitions, reflecting a precise and functional aesthetic.

#### Primary Button
A prominent call-to-action button with a solid green background and inverse white text, indicating primary actions. On hover, the background subtly brightens.

```css
.button-primary {
  background-color: var(--color-primary, #5d6b3a);
  color: var(--color-text-inverse, #ffffff);
  font-family: var(--typography-button-family, 'Mulish');
  font-size: var(--typography-button-size, 14px);
  font-weight: var(--typography-button-weight, 300);
  padding: 1px 32px; /* Extracted from button data */
  border: none;
  border-radius: var(--radius-sm, 0px);
  cursor: pointer;
  transition: background-color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.button-primary:hover {
  background-color: var(--color-primary-hover, #879650);
}

.button-primary:active {
  box-shadow: none; /* Extracted from pseudoStates */
  background-color: var(--color-primary, #5d6b3a); /* (inferred from screenshot) */
}

.button-primary:disabled {
  cursor: not-allowed;
  background-color: initial; /* Extracted from pseudoStates */
  color: #bbbbbb; /* Extracted from pseudoStates */
  opacity: 0.7; /* (inferred from screenshot) */
}
```

#### Secondary Button
A button with a transparent background and a subtle border, used for secondary actions or navigation within content blocks. Text and border color lighten on hover.

```css
.button-secondary {
  background-color: transparent;
  color: var(--color-text-muted, #b8b8b8);
  font-family: var(--typography-nav-link-family, 'Mulish');
  font-size: var(--typography-nav-link-size, 14px);
  font-weight: var(--typography-nav-link-weight, 500);
  padding: 12px 16px; /* Extracted from button data */
  border: 1px solid var(--color-text-muted, #b8b8b8);
  border-radius: var(--radius-sm, 0px);
  cursor: pointer;
  transition: color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out),
              border-color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.button-secondary:hover {
  color: var(--color-text-primary, #555558); /* (inferred from screenshot) */
  border-color: var(--color-text-primary, #555558); /* (inferred from screenshot) */
}

.button-secondary:active {
  color: var(--color-primary, #5d6b3a); /* (inferred from screenshot) */
  border-color: var(--color-primary, #5d6b3a); /* (inferred from screenshot) */
}

.button-secondary:disabled {
  cursor: not-allowed;
  color: #bbbbbb; /* Extracted from pseudoStates */
  border-color: #bbbbbb; /* (inferred from screenshot) */
  opacity: 0.7; /* (inferred from screenshot) */
}
```

#### Ghost Button
A text-only button, often used for navigation links or subtle actions, with no background or border. The text color darkens on hover.

```css
.button-ghost {
  background-color: transparent;
  color: var(--color-text-primary, #555558); /* (inferred from screenshot) */
  font-family: var(--typography-body-family, 'Mulish');
  font-size: var(--typography-body-size, 16px);
  font-weight: var(--typography-body-weight, 300); /* (inferred from screenshot) */
  padding: 0;
  border: none;
  cursor: pointer;
  transition: color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.button-ghost:hover {
  color: var(--color-text-dark, #000000); /* Extracted from pseudoStates for .btn-inline:hover */
}

.button-ghost:active {
  color: var(--color-primary, #5d6b3a); /* (inferred from screenshot) */
}

.button-ghost:disabled {
  cursor: not-allowed;
  color: var(--color-text-muted, #b8b8b8); /* (inferred from screenshot) */
  opacity: 0.7; /* (inferred from screenshot) */
}
```

### Cards & Containers
The MURU design system utilizes a clean, borderless container style for content blocks, relying on ample whitespace for separation rather than explicit borders or shadows. The main content area functions as a large card.

#### Standard Card
A basic content container with a light background, minimal styling, and no visible border or shadow. Hover states are not explicitly defined for static cards.

```css
.card {
  background-color: var(--colors-background, #fcfbfb);
  color: var(--colors-text-primary, #555558);
  padding: var(--spacing-40, 40px); /* (inferred from screenshot) */
  border: none;
  border-radius: var(--radius-sm, 0px);
  transition: background-color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.card:hover {
  /* No specific hover effect observed for static cards */
}
```

### Inputs & Forms
Form elements are designed for clarity and ease of use, featuring crisp edges and clear visual feedback for interactive states.

#### Text Input
A standard text input field with a light background and a subtle border. The focus state highlights the input with an outline in the primary brand color.

```css
.input-text {
  background-color: var(--colors-background, #fcfbfb);
  color: var(--colors-text-primary, #555558);
  font-family: var(--typography-body-family, 'Mulish');
  font-size: var(--typography-body-size, 16px);
  font-weight: var(--typography-body-weight, 300);
  padding: 8px 8px; /* Extracted from button data */
  border: 1px solid var(--colors-border, #d1cdcd);
  border-radius: var(--radius-sm, 0px);
  transition: border-color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out),
              box-shadow var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.input-text:focus {
  outline: 1px solid var(--colors-primary, #5d6b3a); /* (inferred from screenshot) */
  border-color: var(--colors-primary, #5d6b3a); /* (inferred from screenshot) */
  box-shadow: rgba(0, 0, 0, 0.016) 0px 1px 1px inset; /* Extracted from pseudoStates */
  background-color: var(--colors-background, #fcfbfb); /* Extracted from pseudoStates */
}

.input-text:disabled {
  cursor: not-allowed;
  background-color: initial; /* Extracted from pseudoStates */
  color: #bbbbbb; /* Extracted from pseudoStates */
  border-color: var(--colors-border, #d1cdcd);
  opacity: 0.7; /* (inferred from screenshot) */
}
```

#### Form Label
Labels for form fields use the primary text color and body font styles for clear association.

```css
.form-label {
  color: var(--colors-text-primary, #555558);
  font-family: var(--typography-body-family, 'Mulish');
  font-size: var(--typography-body-size, 16px);
  font-weight: var(--typography-body-weight, 300);
  padding: 0;
  margin-bottom: var(--spacing-8, 8px); /* (inferred from screenshot) */
  display: block;
}
```

#### Checkbox/Radio
Custom checkbox and radio buttons with a minimal design. When checked, they display a background color in the primary brand green.

```css
.form-checkbox,
.form-radio {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--colors-text-primary, #555558); /* (inferred from screenshot) */
  font-family: var(--typography-body-family, 'Mulish');
  font-size: var(--typography-body-size, 16px);
  font-weight: var(--typography-body-weight, 300);
}

.form-checkbox__input,
.form-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.form-checkbox__box,
.form-radio__circle {
  width: 20px; /* (inferred from screenshot) */
  height: 20px; /* (inferred from screenshot) */
  border: 1px solid var(--colors-border, #d1cdcd); /* (inferred from screenshot) */
  border-radius: var(--radius-sm, 0px); /* Checkbox */
  background-color: var(--colors-background, #fcfbfb); /* (inferred from screenshot) */
  margin-right: var(--spacing-8, 8px); /* (inferred from screenshot) */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out),
              border-color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.form-radio__circle {
  border-radius: var(--radius-md, 50px); /* Radio */
}

.form-checkbox__input:checked + .form-checkbox__label .form-checkbox__box,
.form-radio__input:checked + .form-radio__label .form-radio__circle {
  background-color: var(--colors-primary, #5d6b3a); /* Extracted from pseudoStates */
  border-color: var(--colors-primary, #5d6b3a); /* (inferred from screenshot) */
}

.form-checkbox__box::before {
  content: '';
  width: 10px; /* (inferred from screenshot) */
  height: 5px; /* (inferred from screenshot) */
  border-left: 2px solid var(--colors-text-inverse, #ffffff); /* (inferred from screenshot) */
  border-bottom: 2px solid var(--colors-text-inverse, #ffffff); /* (inferred from screenshot) */
  transform: rotate(45deg); /* Extracted from pseudoStates */
  opacity: 0;
  transition: opacity var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.form-checkbox__input:checked + .form-checkbox__label .form-checkbox__box::before {
  opacity: 1;
}
```

### Navigation
The navigation system is clean and hierarchical, with clear text links and subtle hover effects.

#### Top Navigation Bar
The main header area, featuring the brand logo, primary navigation, and utility links. It has a fixed height and a light background.

```css
.top-nav-bar {
  background-color: var(--colors-background, #fcfbfb);
  height: var(--header-height, 170px); /* Extracted from cssVariables */
  padding: var(--spacing-24, 24px) var(--layout-section-padding, 32px); /* (inferred from screenshot) */
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: height var(--motion-duration-slow, 0.8s) var(--motion-easing-standard, ease-in-out);
}
```

#### Navigation Link
Individual links within the navigation bar, using a muted text color that darkens on hover. An active state is inferred to highlight the current page.

```css
.nav-link {
  color: var(--colors-text-muted, #b8b8b8);
  font-family: var(--typography-nav-link-family, 'Mulish');
  font-size: var(--typography-nav-link-size, 14px);
  font-weight: var(--typography-nav-link-weight, 500);
  text-decoration: none;
  padding: var(--spacing-12, 12px) var(--spacing-16, 16px); /* (inferred from screenshot) */
  transition: color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.nav-link:hover {
  color: var(--colors-text-primary, #555558); /* Extracted from pseudoStates for a:hover */
}

.nav-link.active,
.nav-link[aria-current="page"] {
  color: var(--colors-primary, #5d6b3a); /* (inferred from screenshot) */
  font-weight: var(--typography-nav-link-weight, 500); /* (inferred from screenshot) */
}
```

#### Dropdown Menu
A menu that appears on hover or click, typically for sub-navigation, with a light background and a high z-index to ensure visibility.

```css
.dropdown-menu {
  background-color: var(--colors-background, #fcfbfb); /* (inferred from screenshot) */
  border: none; /* (inferred from screenshot) */
  border-radius: var(--radius-sm, 0px); /* (inferred from screenshot) */
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* (inferred from screenshot) */
  padding: var(--spacing-16, 16px);
  z-index: 107; /* Extracted from elevation.zIndexValues */
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px); /* (inferred from screenshot) */
  transition: opacity var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out),
              transform var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out),
              visibility var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.dropdown-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

### Links
Links are distinguished by their text color and subtle hover effects, with a focus on readability.

#### Standard Link
A default link style, often found within body text, using the primary text color and an underline.

```css
.link-standard {
  color: var(--colors-text-primary, #555558);
  font-family: var(--typography-body-family, 'Mulish');
  font-size: var(--typography-body-size, 16px);
  font-weight: var(--typography-body-weight, 300);
  text-decoration: underline; /* (inferred from screenshot) */
  transition: color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.link-standard:hover {
  color: var(--colors-text-dark, #000000); /* Extracted from pseudoStates for a:hover */
}

.link-standard:visited {
  color: var(--colors-text-primary, #555558); /* (inferred from screenshot) */
}
```

#### Secondary Link
Used for less prominent links, such as those in the footer or sidebars, typically without an underline in their default state.

```css
.link-secondary {
  color: var(--colors-text-muted, #b8b8b8);
  font-family: var(--typography-small-family, 'Mulish');
  font-size: var(--typography-small-size, 14px);
  font-weight: var(--typography-small-weight, 300);
  text-decoration: none;
  transition: color var(--motion-duration-fast, 0.3s) var(--motion-easing-standard, ease-in-out);
}

.link-secondary:hover {
  color: var(--colors-text-primary, #555558); /* (inferred from screenshot) */
  text-decoration: underline; /* (inferred from screenshot) */
}

.link-secondary:visited {
  color: var(--colors-text-muted, #b8b8b8); /* (inferred from screenshot) */
}
```

### Badges
(none observed in source)

## 5. Layout Principles
-   **Spacing System**: The MURU design system employs a `4px` base unit for its spacing scale, ensuring consistent and harmonious visual rhythm.
    -   Base: `4px`
    -   Scale: `[4, 8, 12, 16, 20, 24, 32, 40, 64]`
    -   Usage Context:
        -   `4px`: Smallest gaps, e.g., between icon and text.
        -   `8px`: Inline element separation, form field margins.
        -   `12px`: Padding for smaller buttons, list item spacing.
        -   `16px`: Standard padding, spacing between minor elements.
        -   `20px`: `--theme-items-gap` for grid items.
        -   `24px`: Vertical spacing between content blocks, larger component padding.
        -   `32px`: `--theme-page-width-padding` for page margins, section padding.
        -   `40px`: Larger component padding, significant vertical separation.
        -   `64px`: Major section breaks, ample whitespace around hero elements.
-   **Grid & Container**:
    -   Max Width: `1564px` (from `--theme-page-width`)
    -   Columns: `12` (inferred from screenshot)
    -   Gutter: `20px` (from `--theme-items-gap`)
    -   Section Padding: `32px` (from `--theme-page-width-padding`)
-   **Whitespace Philosophy**: MURU leverages generous whitespace to create a sense of calm and luxury. Content is never crowded, allowing elements to breathe and hierarchy to be easily perceived. Large margins and padding values contribute to a clean, uncluttered interface, drawing focus to key information and imagery.
-   **Border Radius Scale**: The system primarily uses sharp, `0px` corners for interactive elements, with larger radii reserved for specific visual elements like images or decorative containers.
    -   `sm`: `0px` — Buttons, inputs, general UI elements.
    -   `md`: `50px` — (inferred from `radii` array) Specific image treatments or decorative containers.
    -   `lg`: `100px` — (inferred from `radii` array) Potentially for large hero elements or circular accents.

## 6. Depth & Elevation
The MURU design system manages depth primarily through z-index layering rather than relying on box-shadows, which are largely absent. This approach maintains a clean, flat aesthetic while ensuring interactive elements are correctly stacked.

-   **Flat (z-0)**: `none` — Default background elements and static content.
-   **Interactive (z-1)**: `none` — Header search part, indicating a slightly higher interactive layer.
-   **Count Badges (z-2)**: `none` — Small icon count badges, ensuring they overlay their parent icons.
-   **Side Panel (z-3)**: `none` — Mobile side panel close button, positioned above the panel.
-   **Dropdown (z-5)**: `none` — Mobile menu dropdowns, appearing over main content.
-   **Footer (z-10)**: `none` — Footer content, ensuring it sits above any page content that might scroll beneath it.
-   **Search Result (z-100)**: `none` — Search result overlays, taking precedence over most page elements.
-   **Search Form (z-101)**: `none` — Search form containers, appearing above search results.
-   **Header Dropdown (z-107)**: `none` — Header menu dropdowns, the highest interactive layer for global navigation.

Shadow Philosophy: The MURU design system deliberately avoids prominent box-shadows, contributing to its flat, modern aesthetic. Depth is achieved through clear visual hierarchy, ample whitespace, and precise z-index management for layering interactive components and overlays. This minimalist approach keeps the focus on content and brand colors.

## 7. Do's and Don'ts

### Do's
-   **Do** use the primary brand green (`#5d6b3a`) for all primary calls-to-action, such as the Primary Button.
-   **Do** ensure body text is set in `Mulish 16px 300` using `#555558` on `#fcfbfb` for AAA readability (ratio 7.19).
-   **Do** apply `0px` border radius to all buttons and input fields to maintain the crisp, modern aesthetic.
-   **Do** utilize `32px` for page-level padding and `20px` for spacing between grid items to ensure ample whitespace.
-   **Do** use `Mulish 14px 500` with `#b8b8b8` for navigation links, transitioning to `#555558` on hover.
-   **Do** apply a `0.3s ease-in-out` transition for color changes on interactive elements like links and buttons.
-   **Do** use `#ffffff` text on `#5d6b3a` for primary buttons, which passes AA contrast with a ratio of 5.79.
-   **Do** use `#5b5b5b` text on `#f4f0e8` for secondary content, passing AA contrast with a ratio of 5.97.

### Don'ts
-   **Don't** introduce shadows on interactive elements; depth is managed solely by z-index.
-   **Don't** use `#b8b8b8` text on `#fcfbfb` backgrounds for critical information, as it fails AA contrast (ratio 1.92).
-   **Don't** deviate from the `Mulish` font family; avoid mixing with other typefaces.
-   **Don't** use arbitrary spacing values; adhere strictly to the `[4, 8, 12, 16, 20, 24, 32, 40, 64]px` scale.
-   **Don't** apply rounded corners to buttons or input fields; maintain the `0px` border radius.
-   **Don't** use `36px` `Mulish 400` for body text; reserve it for Display/H1 and H2 roles.
-   **Don't** use any color other than `#5d6b3a` for primary interactive elements to maintain brand consistency.
-   **Don't** use complex animations; stick to simple CSS transitions like `0.3s ease-in-out`.

## 8. Responsive Behavior
Note: breakpoints below are extracted from the source CSS.

-   **Suggested Breakpoints**:
    -   **Mobile Small** (~600px): Primary navigation collapses to a hamburger menu; typography scales down.
    -   **Mobile Large** (~767px): Cards may stack vertically; padding values adjust for smaller screens.
    -   **Tablet** (~991px): Grid layouts may shift to fewer columns; secondary navigation might condense.
    -   **Desktop** (~1200px): Standard desktop layout; full navigation and multi-column grids.
    -   **Desktop Large** (>1200px): Layout expands to fill available width up to `1564px` max-width.
-   **Touch Targets**:
    -   Ensure all interactive elements, especially buttons and links, have a minimum touch target size of `44px` by `44px` (inferred from industry standard).
    -   Maintain at least `8px` of clear space around touch targets to prevent accidental taps (inferred from industry standard).
-   **Collapsing Strategy**:
    -   Navigation: The main navigation menu collapses into a mobile-friendly hamburger icon below `991px`.
    -   Cards: Multi-column card layouts transition to single-column stacking on screens below `767px`.
    -   Typography: Display and heading font sizes scale down proportionally on smaller viewports to prevent overflow.
    -   Padding: Horizontal page padding (`32px`) may reduce to `16px` on mobile screens for better content utilization.
    -   Forms: Multi-field form layouts convert to single-column stacking on mobile devices.
    -   Spacing: Larger spacing values (`40px`, `64px`) are reduced to maintain visual density on smaller screens.

## 9. Agent Prompt Guide
-   **Quick Color Reference**:
    -   `primary`: `#5d6b3a`
    -   `primary-hover`: `#879650`
    -   `background`: `#fcfbfb`
    -   `surface`: `#f4f0e8`
    -   `text-primary`: `#555558`
    -   `text-secondary`: `#5b5b5b`
    -   `text-muted`: `#b8b8b8`
    -   `text-inverse`: `#ffffff`
    -   `text-heading`: `#2f2f2f`
    -   `border`: `#d1cdcd`
    -   `error`: `#e03a43`
    -   `success`: `#2a4c39`
    -   `warning`: `#ffc117`
-   **Iteration Guide**:
    1.  Always use `Mulish` as the primary font family for all text elements.
    2.  Ensure primary calls-to-action use `background-color: #5d6b3a` and `color: #ffffff`.
    3.  Apply `border-radius: 0px` consistently to all buttons and input fields.
    4.  Utilize the spacing scale: `[4, 8, 12, 16, 20, 24, 32, 40, 64]px` for all layout and component spacing.
    5.  Set body text to `Mulish 16px 300` with `line-height: 1.5` and `color: #555558`.
    6.  Implement button hover states with `background-color: #879650` for primary buttons.
    7.  Ensure input fields show an `outline: 1px solid #5d6b3a` on `:focus`.
    8.  Use `transition: color 0.3s ease-in-out` for link and button text color changes.
    9.  Maintain a maximum content width of `1564px` with `32px` horizontal page padding.
    10. Collapse main navigation into a mobile menu at `991px` max-width.
    11. Verify text contrast: `#555558` on `#fcfbfb` (7.19 AAA) and `#ffffff` on `#5d6b3a` (5.79 AA).
    12. Avoid any box-shadows; manage element layering strictly with z-index values.