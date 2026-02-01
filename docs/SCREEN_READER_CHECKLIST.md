# Screen Reader Testing Checklist

## Setup

- [ ] VoiceOver enabled (macOS: Cmd+F5)
- [ ] Safari browser (best VoiceOver compatibility)
- [ ] Test in both light and dark modes
- [ ] Ensure dev server is running on localhost:3000

## Global Navigation

- [ ] Skip to content link appears on first Tab press
- [ ] Skip link moves focus to main content area
- [ ] Sidebar navigation announces current page via `aria-current="page"`
- [ ] Sidebar landmarks announced: `aria-label="Sidebar navigation"` and `aria-label="Main navigation"`
- [ ] Mobile menu button announces state (open/closed)
- [ ] Mobile navigation announces: `aria-label="Mobile navigation"`
- [ ] Command palette (Cmd+K) opens and search field receives focus
- [ ] Notifications dropdown announces unread count
- [ ] Mark-as-read and dismiss buttons have `aria-label`
- [ ] User avatar has `role="img"` and `aria-label="User avatar"`

## Page-by-Page Testing

### Dashboard

- [ ] Page title: h1 "Dashboard Overview"
- [ ] All 4 KPI cards announce name and value
- [ ] Refresh button has `aria-label="Refresh dashboard data"`
- [ ] Charts announce titles (or note as limitation)
- [ ] Alerts banner has `role="region"` and `aria-live="polite"`
- [ ] Individual alerts have `role="alert"`
- [ ] Sync button status announced via `aria-live="polite"`

### Properties

- [ ] Page title: h1 "Properties"
- [ ] Property cards announce all info (name, status, occupancy)
- [ ] Search field has accessible label
- [ ] View toggle uses `role="tablist"` / `role="tab"` / `aria-selected`
- [ ] Property detail tabs work with keyboard

### Tasks

- [ ] Page title: h1 "Tasks"
- [ ] Table headers announce on navigation
- [ ] Create task button accessible and labeled
- [ ] Task detail sidebar announces on open
- [ ] Edit, delete, cancel buttons have `aria-label`
- [ ] Pagination wrapped in `<nav aria-label="Table pagination">`

### Cleaning

- [ ] Page title: h1 "Cleaning Schedule"
- [ ] Kanban columns announce status
- [ ] Job cards announce property and status
- [ ] View toggle uses proper tab ARIA semantics
- [ ] Metrics toggle has `aria-pressed` attribute
- [ ] Checklist dialog categories use tablist/tab/tabpanel roles
- [ ] Progress bars have `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] Calendar view navigable with keyboard

### Reservations

- [ ] Page title: h1 "Reservations"
- [ ] Calendar grid navigable
- [ ] Reservation cards announce dates and guest info
- [ ] Check-in/out status clear

## Dialogs and Modals

- [ ] Create task dialog: title announced, focus trapped, Escape closes
- [ ] Photo upload dialog: file input has `aria-label="Upload issue photos"`
- [ ] Cleaning checklist dialog: categories, progress, checkbox labels all announced
- [ ] Issue report dialog: photo remove buttons have `aria-label="Remove photo N"`
- [ ] All dialogs return focus to trigger element on close

## Toast Notifications

- [ ] Toast container has `aria-live="polite"` and `aria-atomic="true"`
- [ ] Toast close button has `aria-label="Close notification"`
- [ ] New toasts announced by screen reader automatically

## Forms

- [ ] All inputs have visible or `aria-label` labels
- [ ] Error messages announced when they appear
- [ ] Required fields marked appropriately
- [ ] Success messages announced

## Keyboard Navigation

- [ ] Tab moves forward through interactive elements
- [ ] Shift+Tab moves backward
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within tab groups, dropdowns, command palette
- [ ] Escape closes overlays (dialogs, dropdowns, command palette)
- [ ] No keyboard traps (focus can always escape)

## Color and Contrast

- [ ] All text meets 4.5:1 contrast ratio (body text)
- [ ] Large text meets 3:1 contrast ratio
- [ ] Muted text meets 4.5:1 contrast ratio (verified: ~4.8:1 light, ~4.6:1 dark)
- [ ] Focus indicators visible in both light and dark themes

## Pass Criteria

All checkboxes must pass OR have documented mitigation in `/docs/ACCESSIBILITY.md`.

Known items with mitigation:
- Charts (Recharts): Data available in non-chart format
- Drag and drop (Kanban): dnd-kit keyboard support built in
- Calendar views: react-day-picker keyboard navigation built in
