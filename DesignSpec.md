# Co.Property Operations Dashboard
## Design Specification Document v1.0

---

## Document Information

| Field | Value |
|-------|-------|
| Project | Co.Property Operations Dashboard |
| Version | 1.0.0 |
| Last Updated | January 2025 |
| Status | Draft |
| Authors | Development Team |

---

## 1. Executive Summary

This document provides the complete design specification for the Co.Property Operations Dashboard, a real-time property management interface designed for managing 100+ short-term rental properties in Bangkok. The dashboard integrates with Hospitable for reservation management and Turno for cleaning coordination, providing operations staff with a unified view of daily activities, task management, and property status monitoring.

The design prioritizes operational efficiency, real-time data visibility, and mobile responsiveness while maintaining a professional aesthetic aligned with Co.Property brand guidelines. The interface follows modern dashboard conventions with a persistent sidebar navigation, card-based content areas, and status-driven visual indicators.

---

## 2. Brand Identity and Design Tokens

### 2.1 Color System

The color palette derives from Co.Property's brand identity, emphasizing professionalism and clarity for operational contexts.

#### Primary Colors

```css
:root {
  /* Primary Brand Colors */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #e0e9ff;
  --color-primary-200: #c7d6fe;
  --color-primary-300: #a4bcfc;
  --color-primary-400: #8098f8;
  --color-primary-500: #6172f3;
  --color-primary-600: #444ce7;
  --color-primary-700: #3538cd;
  --color-primary-800: #2d31a6;
  --color-primary-900: #2b2f83;
  --color-primary-950: #1a1c4e;

  /* Secondary - Gold Accent */
  --color-secondary-50: #fefce8;
  --color-secondary-100: #fef9c3;
  --color-secondary-200: #fef08a;
  --color-secondary-300: #fde047;
  --color-secondary-400: #facc15;
  --color-secondary-500: #eab308;
  --color-secondary-600: #ca8a04;
  --color-secondary-700: #a16207;
  --color-secondary-800: #854d0e;
  --color-secondary-900: #713f12;
  --color-secondary-950: #422006;
}
```

#### Semantic Colors

```css
:root {
  /* Status Colors */
  --color-success-50: #ecfdf5;
  --color-success-100: #d1fae5;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  --color-success-700: #047857;

  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  --color-info-50: #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
}
```

#### Neutral Colors

```css
:root {
  /* Neutral Grays */
  --color-gray-25: #fcfcfd;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f2f4f7;
  --color-gray-200: #eaecf0;
  --color-gray-300: #d0d5dd;
  --color-gray-400: #98a2b3;
  --color-gray-500: #667085;
  --color-gray-600: #475467;
  --color-gray-700: #344054;
  --color-gray-800: #1d2939;
  --color-gray-900: #101828;
  --color-gray-950: #0c111d;
}
```

#### Dark Mode Colors

```css
:root[data-theme="dark"] {
  --background: var(--color-gray-950);
  --foreground: var(--color-gray-50);
  --card: var(--color-gray-900);
  --card-foreground: var(--color-gray-50);
  --popover: var(--color-gray-900);
  --popover-foreground: var(--color-gray-50);
  --primary: var(--color-primary-500);
  --primary-foreground: var(--color-gray-50);
  --secondary: var(--color-gray-800);
  --secondary-foreground: var(--color-gray-50);
  --muted: var(--color-gray-800);
  --muted-foreground: var(--color-gray-400);
  --accent: var(--color-gray-800);
  --accent-foreground: var(--color-gray-50);
  --border: var(--color-gray-800);
  --input: var(--color-gray-800);
  --ring: var(--color-primary-500);
}
```

### 2.2 Typography System

The typography system uses Inter as the primary font family for its excellent legibility at all sizes and comprehensive weight range.

#### Font Stack

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace;
}
```

#### Type Scale

```css
:root {
  /* Display */
  --text-display-2xl: 4.5rem;    /* 72px */
  --text-display-xl: 3.75rem;    /* 60px */
  --text-display-lg: 3rem;       /* 48px */
  --text-display-md: 2.25rem;    /* 36px */
  --text-display-sm: 1.875rem;   /* 30px */
  --text-display-xs: 1.5rem;     /* 24px */

  /* Text */
  --text-xl: 1.25rem;            /* 20px */
  --text-lg: 1.125rem;           /* 18px */
  --text-md: 1rem;               /* 16px */
  --text-sm: 0.875rem;           /* 14px */
  --text-xs: 0.75rem;            /* 12px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font Weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Typography Classes

```css
.text-display-lg {
  font-size: var(--text-display-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.text-heading-lg {
  font-size: var(--text-display-xs);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

.text-heading-md {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.text-heading-sm {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
}

.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
}

.text-body-md {
  font-size: var(--text-md);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
}

.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
}

.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  letter-spacing: 0.01em;
}

.text-overline {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

### 2.3 Spacing System

The spacing system follows an 8-point grid with half-step values for fine-tuning.

```css
:root {
  --space-0: 0;
  --space-0-5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1-5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2-5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3-5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-28: 7rem;        /* 112px */
  --space-32: 8rem;        /* 128px */
}
```

### 2.4 Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

### 2.5 Shadow System

```css
:root {
  --shadow-xs: 0 1px 2px 0 rgb(16 24 40 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(16 24 40 / 0.1), 0 1px 2px -1px rgb(16 24 40 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(16 24 40 / 0.1), 0 2px 4px -2px rgb(16 24 40 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(16 24 40 / 0.1), 0 4px 6px -4px rgb(16 24 40 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(16 24 40 / 0.1), 0 8px 10px -6px rgb(16 24 40 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(16 24 40 / 0.25);

  /* Colored shadows for interactive elements */
  --shadow-primary: 0 4px 14px 0 rgb(97 114 243 / 0.25);
  --shadow-success: 0 4px 14px 0 rgb(16 185 129 / 0.25);
  --shadow-warning: 0 4px 14px 0 rgb(245 158 11 / 0.25);
  --shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.25);
}
```

### 2.6 Animation Tokens

```css
:root {
  /* Durations */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 3. Layout System

### 3.1 Application Shell

The application uses a fixed sidebar layout with a scrollable main content area. The shell adapts to different screen sizes with a collapsible sidebar on mobile devices.

```
+------------------------------------------------------------------+
|  [Logo]     Co.Property Dashboard                    [User Menu] |
+----------+-------------------------------------------------------+
|          |                                                       |
|  SIDEBAR |                    MAIN CONTENT                       |
|          |                                                       |
|  - Home  |  +--------------------------------------------------+ |
|  - Props |  |  Page Header with Breadcrumbs                    | |
|  - Res.  |  +--------------------------------------------------+ |
|  - Clean |  |                                                  | |
|  - Tasks |  |  Content Area                                    | |
|  - Inv.  |  |                                                  | |
|          |  |  +----------------+  +----------------+          | |
|  ------  |  |  |    Card 1     |  |    Card 2     |          | |
|          |  |  +----------------+  +----------------+          | |
|  RBAC:   |  |                                                  | |
|  - Users |  |  +----------------------------------------+     | |
|  - Roles |  |  |         Data Table / Content           |     | |
|  - Audit |  |  +----------------------------------------+     | |
|          |  |                                                  | |
+----------+--+--------------------------------------------------+-+
```

#### Shell Dimensions

```css
:root {
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 72px;
  --header-height: 64px;
  --content-max-width: 1440px;
  --content-padding: var(--space-6);
}
```

### 3.2 Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 3.3 Grid System

The dashboard uses CSS Grid for page layouts and Flexbox for component-level arrangements.

```css
/* Page Grid */
.page-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}
```

---

## 4. Page Specifications

### 4.1 Dashboard Home (/)

The dashboard home provides an at-a-glance view of daily operations, combining check-in/check-out status, cleaning progress, and priority tasks.

#### Page Layout

```
+------------------------------------------------------------------+
|  Dashboard                                        [Date Picker]  |
|  Today's Operations Overview                                      |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  | Check-ins   |  | Check-outs  |  | Cleaning    |  | Tasks     | |
|  | Today: 12   |  | Today: 8    |  | Pending: 5  |  | High: 3   | |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  TODAY'S CHECK-OUTS       |  |  TODAY'S CHECK-INS            | |
|  |                           |  |                               | |
|  |  [Property Card]          |  |  [Property Card]              | |
|  |  - 029-SKT | 11:00 AM    |  |  - 045-SAT | 14:00            | |
|  |  - Guest: John Smith     |  |  - Guest: Maria Garcia        | |
|  |  - Clean: In Progress    |  |  - Clean: Pending             | |
|  |                           |  |                               | |
|  |  [Property Card]          |  |  [Property Card]              | |
|  |  - 031-SKT | 11:00 AM    |  |  - 067-PHR | 15:00            | |
|  |  ...                      |  |  ...                          | |
|  +---------------------------+  +-------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  CLEANING BOARD                                              | |
|  |                                                               | |
|  |  PENDING (5)    IN PROGRESS (3)    COMPLETED (8)    VERIFIED | |
|  |  +---------+    +-----------+      +-----------+    +-------+| |
|  |  |  Card   |    |   Card    |      |   Card    |    | Card  || |
|  |  +---------+    +-----------+      +-----------+    +-------+| |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  PRIORITY TASKS                                    [View All]| |
|  |  +----------------------------------------------------------+| |
|  |  | [!] AC not cooling - 029-SKT           Due: Today        || |
|  |  | [!] Guest complaint follow-up - 045    Due: Today        || |
|  |  | [ ] Restock toiletries - 067-PHR       Due: Tomorrow     || |
|  |  +----------------------------------------------------------+| |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

#### Stats Cards Specification

| Metric | Icon | Color | Click Action |
|--------|------|-------|--------------|
| Check-ins Today | ArrowDownCircle | Success Green | Navigate to filtered reservations |
| Check-outs Today | ArrowUpCircle | Warning Orange | Navigate to filtered reservations |
| Cleaning Pending | Sparkles | Info Blue | Navigate to cleaning board |
| High Priority Tasks | AlertTriangle | Error Red | Navigate to tasks filtered by high priority |

#### Operation Cards Specification

Each operation card displays:
- Property short code (bold, primary color)
- Full property name (secondary text)
- Expected time with clock icon
- Guest name and count
- Cleaning status badge
- Assigned cleaner (if applicable)
- Quick action buttons (View Details, Mark Complete)

### 4.2 Properties Page (/properties)

The properties page provides a searchable, filterable list of all managed properties with quick access to property details and status.

#### Page Layout

```
+------------------------------------------------------------------+
|  Properties                                                       |
|  Manage all 101 properties in your portfolio                     |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Search...]                [Segment v] [Status v] [Owner v] | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  Property         | Segment | Status  | Owner    | Occupancy | |
|  +--------------------------------------------------------------+ |
|  |  029-SKT-1-R123   | MID     | Active  | K. Wong  | 78%       | |
|  |  Sukhumvit Soi 31 |         |         |          |           | |
|  +--------------------------------------------------------------+ |
|  |  030-SKT-1-R124   | MID     | Active  | K. Wong  | 82%       | |
|  |  Sukhumvit Soi 31 |         |         |          |           | |
|  +--------------------------------------------------------------+ |
|  |  045-SAT-2-R201   | UPS     | Active  | P. Chen  | 91%       | |
|  |  Sathorn Tower    |         |         |          |           | |
|  +--------------------------------------------------------------+ |
|  |  ...                                                          | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  Showing 1-25 of 101 properties           [< Prev] [1] [2] [Next>]|
+------------------------------------------------------------------+
```

#### Property Detail Modal/Page

```
+------------------------------------------------------------------+
|  [Back] Property Details                              [Edit] [X] |
+------------------------------------------------------------------+
|                                                                   |
|  029-SKT-1-R123-F05-01-BDR02                                     |
|  Sukhumvit Soi 31, Bangkok                                       |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  PROPERTY INFO            |  |  CURRENT STATUS               | |
|  |  Segment: MID             |  |  Status: OCCUPIED             | |
|  |  Bedrooms: 2              |  |  Current Guest: John Smith    | |
|  |  Bathrooms: 1             |  |  Check-out: Jan 30, 11:00     | |
|  |  Max Guests: 4            |  |  Next Check-in: Jan 30, 14:00 | |
|  |  Owner: K. Wong           |  |                               | |
|  +---------------------------+  +-------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  UPCOMING RESERVATIONS                                       | |
|  |  +----------------------------------------------------------+| |
|  |  | Jan 30 - Feb 2 | Maria Garcia | Airbnb | 3 nights        || |
|  |  | Feb 5 - Feb 8  | T. Johnson   | Booking| 3 nights        || |
|  |  +----------------------------------------------------------+| |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  RECENT TASKS                                     [View All] | |
|  |  +----------------------------------------------------------+| |
|  |  | AC Maintenance - Completed Jan 25                        || |
|  |  | Deep Clean - Completed Jan 20                            || |
|  |  +----------------------------------------------------------+| |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 4.3 Reservations Page (/reservations)

Displays all reservations with filtering by date range, property, platform, and status.

#### Page Layout

```
+------------------------------------------------------------------+
|  Reservations                                                     |
|  View and manage all bookings                                    |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Search guest/confirmation...]                              | |
|  |  [Date Range: Jan 1 - Jan 31 v]  [Property v]  [Platform v]  | |
|  |  [Status v]  [Clear Filters]                                 | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +------ Tab Navigation ----------------------------------------+ |
|  |  [All (156)] [Today (20)] [Upcoming (45)] [Past (91)]       | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | Conf. Code  | Property  | Guest       | Dates      | Status  | |
|  +--------------------------------------------------------------+ |
|  | HMXZT5E3Z   | 029-SKT   | John Smith  | Jan 28-30  | Active  | |
|  | Platform: Airbnb        | 2 guests    | 2 nights   |         | |
|  +--------------------------------------------------------------+ |
|  | BK12345678  | 045-SAT   | M. Garcia   | Jan 30-Feb2| Confirm | |
|  | Platform: Booking.com   | 3 guests    | 3 nights   |         | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

#### Reservation Detail View

```
+------------------------------------------------------------------+
|  Reservation HMXZT5E3Z                               [Actions v] |
+------------------------------------------------------------------+
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  GUEST INFORMATION        |  |  BOOKING DETAILS              | |
|  |  Name: John Smith         |  |  Property: 029-SKT            | |
|  |  Email: john@email.com    |  |  Check-in: Jan 28, 14:00      | |
|  |  Phone: +1 555-1234       |  |  Check-out: Jan 30, 11:00     | |
|  |  Guests: 2 adults         |  |  Nights: 2                    | |
|  +---------------------------+  |  Platform: Airbnb             | |
|                                 |  Status: Checked In           | |
|  +---------------------------+  +-------------------------------+ |
|  |  FINANCIALS               |                                   |
|  |  Total: 4,500 THB         |                                   |
|  |  Platform Fee: 450 THB    |                                   |
|  |  Payout: 4,050 THB        |                                   |
|  +---------------------------+                                   |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  SPECIAL REQUESTS                                            | |
|  |  Early check-in requested (12:00 PM)                         | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  INTERNAL NOTES                                    [Add Note]| |
|  |  [Jan 28 10:30] Guest confirmed arrival time - Staff A       | |
|  |  [Jan 28 14:15] Check-in completed, all good - Staff B       | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  TIMELINE                                                    | |
|  |  [o] Jan 25 - Reservation created                            | |
|  |  [o] Jan 27 - Pre-arrival message sent                       | |
|  |  [o] Jan 28 - Guest checked in                               | |
|  |  [ ] Jan 30 - Check-out scheduled                            | |
|  |  [ ] Jan 30 - Cleaning scheduled                             | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 4.4 Cleaning Board (/cleaning)

A Kanban-style board for tracking cleaning job status with drag-and-drop functionality.

#### Page Layout

```
+------------------------------------------------------------------+
|  Cleaning Board                                    [+ New Job]   |
|  Manage turnover cleaning for all properties                     |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Date: Today v]  [Property v]  [Cleaner v]  [View: Board v] | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +------------+  +------------+  +------------+  +------------+  |
|  | PENDING    |  | ASSIGNED   |  |IN PROGRESS |  | COMPLETED  |  |
|  | (5)        |  | (2)        |  | (3)        |  | (8)        |  |
|  +------------+  +------------+  +------------+  +------------+  |
|  |            |  |            |  |            |  |            |  |
|  | +--------+ |  | +--------+ |  | +--------+ |  | +--------+ |  |
|  | |029-SKT | |  | |031-SKT | |  | |045-SAT | |  | |067-PHR | |  |
|  | |11:00 CO| |  | |11:00 CO| |  | |11:00 CO| |  | |Verified | |  |
|  | |14:00 CI| |  | |13:00 CI| |  | |14:00 CI| |  | |10:45 AM | |  |
|  | |        | |  | |Cleaner:| |  | |Somchai | |  | |Cleaner: | |  |
|  | |[Assign]| |  | |Somchai | |  | |Started: | |  | |Noi      | |  |
|  | +--------+ |  | +--------+ |  | |10:15 AM| |  | +--------+ |  |
|  |            |  |            |  | +--------+ |  |            |  |
|  | +--------+ |  | +--------+ |  |            |  | +--------+ |  |
|  | |030-SKT | |  | |...     | |  | +--------+ |  | |...     | |  |
|  | |...     | |  | +--------+ |  | |067-PHR | |  | +--------+ |  |
|  | +--------+ |  |            |  | |...     | |  |            |  |
|  |            |  |            |  | +--------+ |  |            |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

#### Cleaning Card Specification

Each cleaning card displays:
- Property short code (header)
- Check-out time with guest name
- Check-in time with incoming guest name
- Time pressure indicator (red if less than 2 hours until check-in)
- Assigned cleaner name
- Start time (if in progress)
- Completion time (if completed)
- Photo count badge
- Issues reported badge (if any)

#### Cleaning Detail Modal

```
+------------------------------------------------------------------+
|  Cleaning Job: 029-SKT                                      [X]  |
+------------------------------------------------------------------+
|                                                                   |
|  Property: 029-SKT-1-R123-F05-01-BDR02                           |
|  Sukhumvit Soi 31, Floor 5, Room 01                              |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  CHECKOUT                 |  |  NEXT CHECK-IN                | |
|  |  Guest: John Smith        |  |  Guest: Maria Garcia          | |
|  |  Time: 11:00 AM           |  |  Time: 14:00 (3h window)      | |
|  |  Status: Completed        |  |  Guests: 3                    | |
|  +---------------------------+  +-------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  ASSIGNMENT                                                  | |
|  |  Cleaner: Somchai (Primary)                                  | |
|  |  Backup: Noi                                                 | |
|  |  Status: In Progress                                         | |
|  |  Started: 10:15 AM                                           | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  CHECKLIST PROGRESS                              [View Full] | |
|  |  [x] Bedroom cleaned                                         | |
|  |  [x] Bathroom cleaned                                        | |
|  |  [x] Kitchen cleaned                                         | |
|  |  [ ] Linens replaced                                         | |
|  |  [ ] Amenities restocked                                     | |
|  |  [ ] Final inspection                                        | |
|  |  Progress: 50% (3/6)                                         | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  PHOTOS (4)                                       [View All] | |
|  |  [img] [img] [img] [img]                                     | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  ISSUES REPORTED                                  [Add Issue]| |
|  |  [!] Stain on carpet - needs deep clean                      | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  [Mark Complete]  [Request Verification]  [Create Task]          |
+------------------------------------------------------------------+
```

### 4.5 Tasks Page (/tasks)

Task management interface with filtering, priority sorting, and bulk actions.

#### Page Layout

```
+------------------------------------------------------------------+
|  Tasks                                              [+ New Task] |
|  Manage maintenance, follow-ups, and operational tasks           |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Search...]  [Category v]  [Priority v]  [Status v]         | |
|  |  [Assignee v]  [Property v]  [Due Date v]                    | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +------ Tab Navigation ----------------------------------------+ |
|  |  [All (45)] [My Tasks (12)] [Overdue (3)] [Completed (89)]  | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | [x] Select All                                [Bulk Actions v]| |
|  +--------------------------------------------------------------+ |
|  | [ ] [!!!] AC not cooling properly                             | |
|  |     Property: 029-SKT | Category: Maintenance                 | |
|  |     Assigned: Technician A | Due: Today | Created: Jan 28    | |
|  +--------------------------------------------------------------+ |
|  | [ ] [!!]  Guest complaint follow-up                           | |
|  |     Property: 045-SAT | Category: Guest Request               | |
|  |     Assigned: Staff B | Due: Today | Created: Jan 29         | |
|  +--------------------------------------------------------------+ |
|  | [ ] [!]   Restock toiletries                                  | |
|  |     Property: 067-PHR | Category: Inventory                   | |
|  |     Assigned: Cleaner Team | Due: Tomorrow | Created: Jan 28 | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

#### Task Creation/Edit Modal

```
+------------------------------------------------------------------+
|  New Task                                                   [X]  |
+------------------------------------------------------------------+
|                                                                   |
|  Title *                                                         |
|  [                                                            ]  |
|                                                                   |
|  Description                                                     |
|  [                                                            ]  |
|  [                                                            ]  |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  Property                 |  |  Category                     | |
|  |  [Select property v    ]  |  |  [Maintenance v            ]  | |
|  +---------------------------+  +-------------------------------+ |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  Priority                 |  |  Due Date                     | |
|  |  ( ) Low                  |  |  [Jan 30, 2025          v  ]  | |
|  |  (o) Medium               |  +-------------------------------+ |
|  |  ( ) High                 |                                   |
|  |  ( ) Urgent               |  Assigned To                     |
|  +---------------------------+  [Select team member v         ]  |
|                                                                   |
|  Link to Reservation (optional)                                  |
|  [Search reservation...                                       ]  |
|                                                                   |
|  Link to Cleaning Job (optional)                                 |
|  [Search cleaning job...                                      ]  |
|                                                                   |
|                                      [Cancel]  [Create Task]     |
+------------------------------------------------------------------+
```

### 4.6 Inventory Page (/inventory)

Track supplies and amenities across all properties with reorder alerts.

#### Page Layout

```
+------------------------------------------------------------------+
|  Inventory                                           [+ Add Item]|
|  Track supplies and amenities across properties                  |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  ALERTS                                                      | |
|  |  [!] 12 items below reorder threshold                        | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Search item...]  [Category v]  [Property v]  [Low Stock]   | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | Item           | Category    | Properties | Status           | |
|  +--------------------------------------------------------------+ |
|  | Bath Towels    | Linens      | 101        | 45 low stock     | |
|  +--------------------------------------------------------------+ |
|  | Shampoo        | Toiletries  | 101        | 12 low stock     | |
|  +--------------------------------------------------------------+ |
|  | Coffee Pods    | Consumables | 85         | 8 low stock      | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 4.7 RBAC - Users Page (/settings/users)

User management with role assignment (Admin only).

#### Page Layout

```
+------------------------------------------------------------------+
|  User Management                                    [+ Add User] |
|  Manage team access and permissions                              |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Search user...]  [Role v]  [Status v]                      | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | User              | Email              | Role    | Status    | |
|  +--------------------------------------------------------------+ |
|  | [Avatar] Admin A  | admin@co.prop      | Admin   | Active    | |
|  | Last login: Today 09:30                                       | |
|  +--------------------------------------------------------------+ |
|  | [Avatar] Ops Mgr  | ops@co.prop        | Manager | Active    | |
|  | Last login: Today 08:15                                       | |
|  +--------------------------------------------------------------+ |
|  | [Avatar] Staff B  | staff@co.prop      | Staff   | Active    | |
|  | Last login: Yesterday                                         | |
|  +--------------------------------------------------------------+ |
|  | [Avatar] Cleaner  | clean@co.prop      | Cleaner | Active    | |
|  | Last login: Today 07:00                                       | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 4.8 RBAC - Roles Page (/settings/roles)

Role definition and permission management.

#### Page Layout

```
+------------------------------------------------------------------+
|  Roles & Permissions                                 [+ New Role]|
|  Define access levels for your team                              |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | Role        | Users | Permissions                  | Actions | |
|  +--------------------------------------------------------------+ |
|  | Admin       | 2     | Full system access           | [Edit]  | |
|  | Description: Complete control over all features               | |
|  +--------------------------------------------------------------+ |
|  | Manager     | 3     | Operations + Reports         | [Edit]  | |
|  | Description: Day-to-day operations management                 | |
|  +--------------------------------------------------------------+ |
|  | Staff       | 8     | View + Update assignments    | [Edit]  | |
|  | Description: Task execution and status updates                | |
|  +--------------------------------------------------------------+ |
|  | Cleaner     | 15    | Cleaning jobs only           | [Edit]  | |
|  | Description: View and update assigned cleaning jobs           | |
|  +--------------------------------------------------------------+ |
|  | Owner       | 25    | Own properties only          | [Edit]  | |
|  | Description: View reports for owned properties                | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 4.9 Audit Log Page (/settings/audit)

System activity tracking for compliance and debugging.

#### Page Layout

```
+------------------------------------------------------------------+
|  Audit Log                                           [Export]    |
|  Track all system activities and changes                         |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  [Date Range v]  [User v]  [Action v]  [Resource v]          | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | Timestamp           | User    | Action  | Resource | Details | |
|  +--------------------------------------------------------------+ |
|  | Jan 29, 10:30:15   | Admin A | UPDATE  | Task     | Changed  | |
|  |                     |         |         | #1234    | status   | |
|  +--------------------------------------------------------------+ |
|  | Jan 29, 10:28:00   | Staff B | CREATE  | Task     | New task | |
|  |                     |         |         | #1235    | created  | |
|  +--------------------------------------------------------------+ |
|  | Jan 29, 10:15:22   | System  | SYNC    | Reserv.  | 15 new   | |
|  |                     |         |         |          | records  | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## 5. Navigation Structure

### 5.1 Primary Navigation (Sidebar)

```
MAIN
  - Dashboard          (LayoutDashboard icon)
  - Properties         (Building2 icon)
  - Reservations       (CalendarDays icon)
  - Cleaning           (Sparkles icon)
  - Tasks              (CheckSquare icon)
  - Inventory          (Package icon)

REPORTS (Manager+ only)
  - Analytics          (BarChart3 icon)
  - Revenue            (DollarSign icon)

SETTINGS (Role-based visibility)
  - Users              (Users icon)         [Admin only]
  - Roles              (Shield icon)        [Admin only]
  - Audit Log          (FileText icon)      [Admin only]
  - Integrations       (Plug icon)          [Admin only]
  - Preferences        (Settings icon)      [All users]
```

### 5.2 Header Navigation

```
+------------------------------------------------------------------+
| [Hamburger]  Co.Property                                         |
|                                                                   |
| [Search: Cmd+K]                                                  |
|                                                                   |
| [Bell: Notifications]  [User Avatar + Dropdown]                  |
+------------------------------------------------------------------+
```

### 5.3 User Menu Dropdown

```
+------------------------+
| [Avatar] User Name     |
| user@email.com         |
+------------------------+
| Profile Settings       |
| Preferences            |
+------------------------+
| Keyboard Shortcuts     |
| Help & Support         |
+------------------------+
| [Theme Toggle]         |
+------------------------+
| Sign Out               |
+------------------------+
```

### 5.4 Breadcrumb Navigation

All pages display contextual breadcrumbs:

```
Dashboard > Properties > 029-SKT-1-R123
Dashboard > Reservations > HMXZT5E3Z
Dashboard > Tasks > New Task
```

---

## 6. Component Library

### 6.1 Buttons

```
Primary:    Solid primary color, white text
Secondary:  Outlined, primary color border and text
Ghost:      No background, primary text, hover background
Danger:     Solid error color for destructive actions
Disabled:   50% opacity, no interactions

Sizes:      sm (32px), md (40px), lg (48px)
```

### 6.2 Form Inputs

```
Text Input:     Single line with label, helper text, error state
Textarea:       Multi-line with character count
Select:         Dropdown with search for long lists
Checkbox:       Square with check mark
Radio:          Circle with dot
Switch:         Toggle for boolean values
Date Picker:    Calendar popup with range support
Time Picker:    Hour/minute selection
File Upload:    Drag-and-drop zone with preview
```

### 6.3 Data Display

```
Table:          Sortable, filterable, paginated
Card:           Elevated container with header/content/footer
Badge:          Status indicator with color coding
Avatar:         User image with fallback initials
Tooltip:        Hover information
Progress:       Linear or circular progress indicator
Stat Card:      Metric display with trend indicator
Timeline:       Vertical event sequence
```

### 6.4 Feedback

```
Toast:          Temporary notification (bottom-right)
Alert:          Inline message (info/success/warning/error)
Modal:          Overlay dialog for focused interactions
Drawer:         Slide-in panel for detailed views
Skeleton:       Loading placeholder
Spinner:        Inline loading indicator
Empty State:    No data illustration with action
```

### 6.5 Navigation

```
Sidebar:        Fixed left navigation
Tabs:           Horizontal content switching
Breadcrumb:     Hierarchical path display
Pagination:     Page navigation for lists
Command Menu:   Global search and navigation (Cmd+K)
```

---

## 7. Icon System

The dashboard uses Lucide icons exclusively for consistency. Icon usage follows these guidelines:

### 7.1 Icon Sizes

```css
--icon-xs: 12px;   /* Inline with small text */
--icon-sm: 16px;   /* Buttons, form elements */
--icon-md: 20px;   /* Navigation items */
--icon-lg: 24px;   /* Page headers */
--icon-xl: 32px;   /* Empty states */
--icon-2xl: 48px;  /* Large illustrations */
```

### 7.2 Common Icon Mappings

| Context | Icon Name |
|---------|-----------|
| Dashboard | LayoutDashboard |
| Properties | Building2 |
| Reservations | CalendarDays |
| Cleaning | Sparkles |
| Tasks | CheckSquare |
| Inventory | Package |
| Users | Users |
| Settings | Settings |
| Search | Search |
| Notifications | Bell |
| Add/Create | Plus |
| Edit | Pencil |
| Delete | Trash2 |
| View | Eye |
| Close | X |
| Menu | Menu |
| Check-in | ArrowDownCircle |
| Check-out | ArrowUpCircle |
| Clock/Time | Clock |
| Calendar | Calendar |
| Phone | Phone |
| Email | Mail |
| Location | MapPin |
| Warning | AlertTriangle |
| Error | XCircle |
| Success | CheckCircle |
| Info | Info |
| Filter | Filter |
| Sort | ArrowUpDown |
| Export | Download |
| Refresh | RefreshCw |
| External Link | ExternalLink |

---

## 8. Interaction Patterns

### 8.1 Loading States

- **Initial Page Load**: Full-page skeleton matching content structure
- **Data Refresh**: Subtle spinner in header, content remains visible
- **Action Processing**: Button shows spinner, disabled state
- **Infinite Scroll**: Skeleton cards at bottom of list

### 8.2 Error Handling

- **API Errors**: Toast notification with retry action
- **Form Validation**: Inline errors below fields, summary at form top
- **404 Pages**: Friendly illustration with navigation options
- **Network Offline**: Banner at top with offline indicator

### 8.3 Empty States

Each list view has a contextual empty state:
- Illustration relevant to content type
- Clear message explaining the empty state
- Primary action button to add first item

### 8.4 Confirmation Dialogs

Destructive actions require confirmation:
- Delete operations
- Bulk status changes
- User deactivation
- Data exports

### 8.5 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + K | Open command menu |
| Cmd/Ctrl + / | Toggle sidebar |
| Cmd/Ctrl + B | Go to dashboard |
| Cmd/Ctrl + P | Go to properties |
| Cmd/Ctrl + R | Go to reservations |
| Cmd/Ctrl + T | Go to tasks |
| Escape | Close modal/drawer |
| Enter | Confirm action |

---

## 9. Responsive Behavior

### 9.1 Breakpoint Behaviors

| Breakpoint | Sidebar | Layout | Navigation |
|------------|---------|--------|------------|
| Mobile (<768px) | Hidden, overlay | Single column | Bottom nav |
| Tablet (768-1024px) | Collapsed icons | Two columns | Sidebar |
| Desktop (>1024px) | Full expanded | Multi-column | Sidebar |

### 9.2 Mobile Adaptations

- Touch-friendly tap targets (minimum 44x44px)
- Swipe gestures for card actions
- Pull-to-refresh on list views
- Bottom sheet modals instead of center modals
- Simplified data tables with expandable rows

---

## 10. Accessibility Requirements

### 10.1 WCAG 2.1 AA Compliance

- Color contrast ratio minimum 4.5:1 for text
- Focus indicators visible on all interactive elements
- Skip navigation link for keyboard users
- ARIA labels for icon-only buttons
- Form labels associated with inputs
- Error messages announced to screen readers

### 10.2 Keyboard Navigation

- All interactive elements reachable via Tab
- Logical tab order matching visual layout
- Modal focus trapping
- Escape key closes overlays
- Arrow keys navigate within components

### 10.3 Screen Reader Support

- Semantic HTML structure
- Heading hierarchy (h1-h6)
- Table headers and captions
- Live regions for dynamic content
- Status announcements for actions

---

## 11. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.0s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| First Input Delay | < 100ms |

### 11.1 Optimization Strategies

- Code splitting by route
- Image optimization with next/image
- Virtual scrolling for long lists
- Memoization of expensive computations
- Debounced search inputs
- Optimistic UI updates
- Service worker for offline support

---

## 12. Theme Configuration

### 12.1 Theme Provider Structure

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  radius: 'none' | 'sm' | 'md' | 'lg';
  density: 'compact' | 'default' | 'comfortable';
}
```

### 12.2 CSS Custom Property Implementation

All theming uses CSS custom properties for runtime switching without page reload. Theme preferences are persisted to localStorage and synced to user profile.

---

## 13. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Dev Team | Initial specification |

---

End of Design Specification Document
