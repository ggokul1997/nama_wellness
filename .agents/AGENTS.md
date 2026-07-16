# UI and Styling Guidelines

## Button Contrast & CSS Classes
When implementing buttons in the UI, NEVER use CSS classes (e.g., `btn-outline`) without first verifying that they are defined in the global CSS (e.g., `globals.css`). 

Always ensure that buttons have proper styling with high contrast between the background and text color to maintain accessibility and readability. For example, if a button uses a transparent background (`btn-outline`, `btn-ghost`), ensure the text color is distinct (e.g., `var(--brand-400)`) and visible in both light and dark modes. Avoid relying on browser defaults which can result in low-contrast font colors matching the background.
