---
name: Vitality & Value
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#006591'
  on-tertiary: '#ffffff'
  tertiary-container: '#36b6fb'
  on-tertiary-container: '#004564'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

This design system is engineered for a youthful, health-conscious audience that values both nutritional density and fiscal responsibility. The brand personality is **Helpful, Fresh, and Smart**, positioning the product as an intelligent companion in the kitchen rather than just a utility tool.

The visual style follows a **Modern Minimalism** approach with a focus on high-quality white space and tactile, approachable elements. By blending clean layouts with vibrant, appetite-stimulating accents, the interface evokes a sense of organized energy. The UI is intentionally "soft" to reduce the friction of meal planning, making the process feel as intuitive as scrolling through a social feed.

## Colors

The palette is anchored by **Fresh Green**, representing growth and vitality, and **Warm Orange**, which triggers appetite and signals energy. 

- **Primary (Fresh Green):** Used for "Success" states, primary calls to action, and health-related highlights.
- **Secondary (Warm Orange):** Used for budget-saving features, alerts, and high-energy interaction points.
- **Background (Soft Cream):** A warm, off-white base that reduces eye strain compared to pure white and feels more organic.
- **Surface:** Pure white is reserved for cards and elevated containers to create a distinct layer above the cream background.
- **Success/Warning/Error:** Built into the primary/secondary logic, supplemented by a standard red for destructive actions.

## Typography

**Plus Jakarta Sans** is the sole typeface for this design system, chosen for its friendly, modern curves and exceptional legibility at small sizes. 

- **Headings:** Use bold or extra-bold weights with tight letter spacing to create a strong visual anchor for recipe titles and section headers.
- **Body:** Standardized at 16px for optimal readability on mobile devices. Line heights are generous (1.6) to ensure ingredient lists and instructions are easy to scan while cooking.
- **Labels:** Small caps or semi-bold weights are used for metadata like "Prep Time" or "Cost Per Serving" to distinguish them from narrative text.

## Layout & Spacing

This design system uses a **Fluid Grid** model optimized for a mobile-first PWA experience. 

- **Mobile (0-599px):** A 4-column grid with 20px outside margins. All primary content is contained within cards that span the full width of the grid.
- **Tablet (600-1023px):** An 8-column grid. Content cards begin to span 4 columns (2 per row).
- **Desktop (1024px+):** A 12-column grid with a max-width of 1280px. 

Spacing follows a 4px baseline, but primary layouts should prioritize `md` (16px) and `lg` (24px) increments to maintain an open, airy feel. Gutters are fixed at 16px to ensure density without clutter.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

1. **Level 0 (Background):** The Soft Cream base layer.
2. **Level 1 (Cards/Sheets):** Pure White surfaces with a soft, diffused shadow. Use a large blur radius (20px) with low opacity (5-8%) tinted with a hint of the primary green to keep the shadows from feeling "dirty."
3. **Level 2 (Interaction):** Active states or floating action buttons (FABs). These use a slightly tighter, darker shadow to indicate they are physically closer to the user.

Avoid harsh borders. Depth should feel natural, like paper stacked on a kitchen counter.

## Shapes

The shape language is defined by **Generous Radii**. 

- **Primary Cards:** Use a fixed 20px (`1.25rem`) corner radius to evoke a friendly, non-threatening aesthetic. 
- **Buttons & Inputs:** Follow the `rounded-lg` (16px) pattern to maintain consistency with the card language.
- **Chips/Badges:** Use a pill-shaped (full radius) style to distinguish them from interactive buttons.
- **Images:** All food photography must feature rounded corners to match the UI containers; sharp edges are strictly avoided.

## Components

### Buttons
Primary buttons use the Fresh Green background with white text, featuring a subtle "press" animation. Secondary buttons use a light tint of Warm Orange with dark orange text for budget-related actions.

### Cards
The centerpiece of the UI. Cards must have a 20px radius and a soft shadow. Use "Recipe Cards" with a top-aligned image and a bottom-aligned content area. Provide 16px of internal padding.

### Inputs
Text fields use a light gray border (#E2E8F0) that transitions to Fresh Green on focus. Labels should be floating or positioned clearly above the field using the `label-md` typography style.

### Chips & Tags
Use these for dietary preferences (e.g., "Vegan," "Gluten-Free") and price levels ("$," "$$"). These should be low-contrast, using a subtle background tint of the category color.

### Progress Bars
Used for "Weekly Budget Used" or "Nutritional Goals." Use a thick 8px track with rounded ends and a vibrant gradient of Fresh Green.

### Navigation
A bottom navigation bar is essential for the PWA. Use thick, friendly icons with 24px bounding boxes and semi-bold labels.