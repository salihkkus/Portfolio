---
name: Aura
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c6'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636465'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#303031'
  secondary-container: '#464747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#342f2e'
  tertiary-container: '#eae0dd'
  on-tertiary-container: '#6a6361'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#eae0dd'
  tertiary-fixed-dim: '#cec5c2'
  on-tertiary-fixed: '#1f1b19'
  on-tertiary-fixed-variant: '#4b4544'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Newsreader
    fontSize: 84px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  h3:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  interactive:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 32px
  margin-page: 64px
  section-gap: 128px
---

## Brand & Style

This design system is rooted in **Minimalism** with an editorial influence. The brand personality is intellectual, confident, and quiet, designed for a high-end creative portfolio where the absence of imagery shifts the focus entirely onto the narrative and the structure of the work. 

The emotional response should be one of "calm authority." By leveraging extreme whitespace and rigorous typographic hierarchy, the UI creates a museum-like experience. The aesthetic avoids all trends—no blurs, no shadows, no gradients—relying instead on the tension between the delicate serif headings and the functional sans-serif body text.

## Colors

The palette is strictly monochromatic to emphasize form and content over decoration. 

- **Background:** The deep charcoal (#121212) provides a stable, non-distracting canvas.
- **Primary (Text):** Off-white (#E5E5E5) ensures high legibility without the harshness of pure white.
- **Secondary (Accents):** Mid-grey (#888888) is used for metadata, inactive states, and secondary information.
- **Borders:** Subtle separation is achieved via low-contrast lines (#333333), maintaining the grid without cluttering the visual field.

## Typography

The typographic system is the primary visual driver of the design system. **Newsreader** (used as a proxy for the requested high-elegance serif) is reserved for large-scale expressive headings. **Inter** provides a utilitarian counterpoint for all functional text, ensuring that navigation and body content remain legible at any scale.

Large "Display" sizes should be used sparingly to anchor pages. Ensure generous leading (line height) for body text to promote readability in a dark environment. Use "Label-Caps" for section identifiers and breadcrumbs to provide a rhythmic contrast to the fluid serif headers.

## Layout & Spacing

The layout follows a **Fixed Grid** model centered on the screen, utilizing a 12-column structure for desktop. The design system prioritizes vertical rhythm and "breathing room." 

- **Whitespace:** Use aggressive margins between sections (128px+) to signify transitions in thought or project phases.
- **Alignment:** Headlines are often offset or indented to create a dynamic, asymmetrical flow that feels intentional and curated.
- **Modular Blocks:** Content is organized into modular blocks separated by thin #333 horizontal rules.

## Elevation & Depth

This design system rejects shadows and Z-axis depth in favor of **Low-contrast outlines**. Hierarchy is established through the stacking of elements and the use of the #333 border color.

- **Planes:** All elements exist on the same physical plane. 
- **Separation:** Use thin 1px lines to define the edges of sections or cards. 
- **Active States:** Subtle shifts in text color (from #E5E5E5 to #888888) or a slight 1px indentation of text are preferred over traditional elevation cues like shadows or glows.

## Shapes

The shape language is strictly **Sharp (0px)**. 

This reinforces the architectural and editorial feel of the design system. Buttons, input fields, and modular containers must maintain 90-degree corners. This uncompromising geometry communicates precision and aligns with the thin-border aesthetic.

## Components

### Buttons
- **Primary:** No fill. 1px border (#E5E5E5), sharp corners. Text in Inter Medium, uppercase. 
- **Hover:** Background fills with #E5E5E5 and text color flips to #121212. Transition: 0.2s ease-out.

### Input Fields
- Underline style only (1px border-bottom #333). 
- Label uses `label-caps` styling positioned above the line.
- Focus state: Border-bottom changes to #E5E5E5.

### Lists
- Projects are presented in a vertical list separated by 1px horizontal lines.
- Hovering a list item reveals a small serif arrow (→) or shifts the project title 16px to the right.

### Chips / Tags
- Small Inter text, 1px border #333, no background. 
- Used for project categories or skill sets.

### Navigation
- Top-aligned, minimal links. 
- Current page indicated by a simple underline or the word appearing in Newsreader Italic while others remain in Inter.

### Text Cards
- Large modular boxes defined by #333 borders. 
- No background fill; content is padded heavily (40px+) from the borders.