# Design System

AI Career Studio uses a restrained, premium SaaS design language built from five brand colors. The live documentation is available at `/design-system`.

## Brand tokens

| Token     | Value     | Usage                                          |
| --------- | --------- | ---------------------------------------------- |
| Burgundy  | `#800020` | Primary actions, focus rings, key text accents |
| Beige     | `#F3E6D5` | Secondary surfaces, borders, subtle panels     |
| Cream     | `#FFF9F2` | Page background and raised cards               |
| Rose      | `#D45060` | Warnings, errors, selective accents            |
| Dark Text | `#302126` | Body and heading text                          |

Typography uses Manrope for headings and Inter for body copy. All semantic colors, shadows, radii, and transitions are defined in `client/src/styles/tokens.css`.

## Reusable components

| Component                                    | Purpose                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `PrimaryButton`                              | Highest-priority action                            |
| `SecondaryButton`                            | Supporting action                                  |
| `OutlineButton`                              | Low-emphasis action                                |
| `Input`                                      | Labeled text input with hint and validation states |
| `Textarea`                                   | Labeled multiline input                            |
| `Select`                                     | Native select with options, hint, and validation   |
| `Checkbox`                                   | Accessible boolean control                         |
| `Modal`                                      | Focus-trapped centered dialog                      |
| `Drawer`                                     | Focus-trapped slide-in panel                       |
| `Dropdown`                                   | Keyboard-accessible action menu                    |
| `Tabs`                                       | Controlled or uncontrolled tab set                 |
| `Badge`                                      | Compact status label                               |
| `Tooltip`                                    | Hover and focus description                        |
| `ToastProvider` / `useToast`                 | Accessible notification queue                      |
| `Skeleton` / `SkeletonText` / `SkeletonCard` | Loading placeholders                               |
| `EmptyState`                                 | No-data state with optional action                 |
| `ConfirmationDialog`                         | Destructive or consequential confirmation          |
| `Pagination`                                 | Accessible page navigation                         |
| `Breadcrumbs`                                | Route-aware orientation                            |
| `Card` and companions                        | Consistent surface container                       |

Import components from `@/components/ui`. Import layouts from `@/components/layout`.

## Layouts

- `Navbar`: responsive primary navigation with a mobile menu.
- `Footer`: brand, real links, and dynamic copyright.
- `Sidebar`: desktop rail plus mobile drawer.
- `DashboardLayout`: composes navbar, sidebar, main content, and footer.
- `PageHeader`: eyebrow, title, description, breadcrumbs, and actions.

## Responsive verification

Run the responsive suite after changes:

```bash
npm run test:responsive
```

Playwright verifies the design system at 375px, 768px, and 1440px. It checks horizontal overflow, navigation behavior, dialogs, dropdowns, toasts, tabs, pagination, and form validation.
