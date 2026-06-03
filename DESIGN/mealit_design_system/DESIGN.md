---
name: MEALIT Design System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#404943'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#2b694d'
  on-secondary: '#ffffff'
  secondary-container: '#b0f1cc'
  on-secondary-container: '#327053'
  tertiary: '#693d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a5200'
  on-tertiary-container: '#ffd1a5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#b0f1cc'
  secondary-fixed-dim: '#94d4b1'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#0c5136'
  tertiary-fixed: '#ffdcbc'
  tertiary-fixed-dim: '#ffb86b'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#683d00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-side: 20px
---

## Brand & Style

This design system is built on the pillars of **Practicality, Support, and Precision**. It targets individuals who seek a balanced lifestyle but feel constrained by financial or nutritional complexity. The visual language bridges the gap between high-end wellness aesthetics and utilitarian budgeting tools.

The chosen style is **Modern / Corporate**, leaning heavily into minimalism to ensure data density remains legible and non-intimidating. By prioritizing generous whitespace and a "content-first" hierarchy, the system evokes a sense of calm and control. The UI communicates reliability through structured layouts, while the energetic color accents provide the "nudge" needed to maintain healthy habits.

The emotional response should be one of "empowered clarity"—users should feel that their health goals are mathematically achievable and visually inviting.

## Colors

The palette is strategically split to represent the app's dual focus:
- **Health Green (#2D6A4F)** serves as the primary anchor, representing vitality, nutrition, and growth. It is used for primary actions and brand-heavy elements.
- **Fresh Lime (#95D5B2)** acts as a supporting tint, ideal for success states, soft backgrounds, and secondary highlights that need to feel approachable.
- **Action Orange (#FF9F1C)** is the "Economy" signal. It is reserved specifically for budget-related callouts, price tags, and urgent ordering actions to create a clear mental model: Green is for Health, Orange is for Wealth.

The background uses a soft **Neutral Gray (#F8F9FA)** to reduce eye strain compared to pure white, maintaining a professional and clean canvas.

## Typography

The design system utilizes **Public Sans** for all levels of the hierarchy. This choice reinforces the "trustworthy and institutional" vibe while remaining highly readable on mobile screens. 

- **Headlines:** Use Bold and Semi-Bold weights to create clear entry points into content.
- **Body Text:** Standardized at 16px for optimal legibility, ensuring nutritional data and instructions are easily digestible.
- **Labels:** Small, all-caps or medium-weight labels are used for budget indicators and category tags to differentiate data points from narrative text.
- **Data Visualization:** Numbers should always use a slightly heavier weight to emphasize the app's data-driven personality.

## Layout & Spacing

This design system employs a **Fluid Grid** model optimized for mobile-first interactions. The rhythmic foundation is an **8px base unit**, ensuring consistent alignment across all components.

- **Margins:** Side margins are set to 20px to provide a wide, breathable frame for content.
- **Gutters:** Standard 16px gutters between cards and columns to prevent visual clutter.
- **Vertical Rhythm:** Generous vertical spacing (24px to 32px) between sections helps the user focus on one task at a time, such as reviewing a meal plan or checking a grocery budget.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. This design system avoids stark black shadows in favor of tinted, diffused elevations that feel more natural and modern.

- **Level 0 (Base):** Neutral Gray background.
- **Level 1 (Cards/Surfaces):** Pure white surfaces with a very subtle 1px border (#E9ECEF) and no shadow for a flat, clean look.
- **Level 2 (Interactive Elements):** Elevated cards or buttons use a soft shadow: `Y: 4, Blur: 12, Color: rgba(45, 106, 79, 0.08)`. The slight green tint in the shadow maintains brand harmony.
- **Level 3 (Modals/Overlays):** Higher elevation with a broader blur: `Y: 8, Blur: 24, Color: rgba(0, 0, 0, 0.12)`.

This approach ensures the UI feels "light" and manageable, never overwhelming the user with heavy textures.

## Shapes

The shape language is defined as **Rounded**, promoting a friendly and supportive interface. 

- **Primary Components (Buttons, Inputs):** Use a standard 0.5rem (8px) radius to feel modern and tactile.
- **Containers (Cards, Meal Tiles):** Use a 1rem (16px) radius to create soft, distinct sections of content.
- **Pills (Tags, Category Chips):** Use a fully rounded radius (e.g., 100px) to distinguish them as interactive, clickable elements.

These rounded edges counteract the "stiff" nature of data-heavy apps, making the experience feel more like a lifestyle companion and less like a spreadsheet.

## Components

### Buttons
- **Primary:** Health Green background with White text. Bold, 16px, 8px radius. Used for "Add to Plan" or "Save."
- **Action/Budget:** Action Orange background. Used for "Buy Now" or "Check Best Price."
- **Secondary:** Fresh Lime background with Primary Green text. Used for "Edit" or "View Details."

### Cards
- **Meal Cards:** White background, 16px radius, subtle 1px border. Feature a large image at the top with nutrition/cost badges overlaid.
- **Budget Cards:** Feature a Progress Bar (Fresh Lime for 'under budget', Action Orange for 'limit reached').

### Input Fields
- White background with a 1px #ADB5BD border. On focus, the border transitions to Primary Green with a soft outer glow.

### Chips
- **Nutrition Chips:** Small, semi-transparent Green backgrounds with Dark Green text (e.g., "High Protein").
- **Budget Chips:** Small, semi-transparent Orange backgrounds with Dark Orange text (e.g., "Under $5").

### Progress Indicators
- Linear bars for tracking weekly budget and daily caloric intake. Use rounded ends to match the overall shape language.