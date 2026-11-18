import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Check,
  FileText,
  Home,
  Info,
  LayoutDashboard,
  Mail,
  Palette,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { DashboardLayout, PageHeader, type FooterLink, type NavItem } from '@/components/layout';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmationDialog,
  Drawer,
  Dropdown,
  EmptyState,
  Input,
  Modal,
  OutlineButton,
  Pagination,
  PrimaryButton,
  SecondaryButton,
  Select,
  SkeletonCard,
  Tabs,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
} from '@/components/ui';
import { buttonClassName } from '@/lib/utils/button-styles';

const primaryNavItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: <Home size={16} /> },
  { label: 'Design System', to: '/design-system', icon: <Palette size={16} /> },
];

const sectionItems: NavItem[] = [
  { label: 'Foundations', to: '/design-system#foundations', icon: <Palette size={16} /> },
  { label: 'Buttons', to: '/design-system#buttons', icon: <Sparkles size={16} /> },
  { label: 'Forms', to: '/design-system#forms', icon: <FileText size={16} /> },
  { label: 'Feedback', to: '/design-system#feedback', icon: <Bell size={16} /> },
  { label: 'Data display', to: '/design-system#data-display', icon: <LayoutDashboard size={16} /> },
  { label: 'Navigation', to: '/design-system#navigation', icon: <Search size={16} /> },
  { label: 'Layout', to: '/design-system#layout', icon: <LayoutDashboard size={16} /> },
];

const footerLinks: FooterLink[] = [
  { label: 'Overview', to: '/' },
  { label: 'Design System', to: '/design-system' },
];

const colors = [
  { name: 'Burgundy', value: '#800020', swatch: 'bg-burgundy', text: 'text-cream' },
  { name: 'Beige', value: '#F3E6D5', swatch: 'bg-beige', text: 'text-dark' },
  { name: 'Cream', value: '#FFF9F2', swatch: 'bg-cream', text: 'text-dark' },
  { name: 'Rose', value: '#D45060', swatch: 'bg-rose', text: 'text-dark' },
  { name: 'Dark Text', value: '#302126', swatch: 'bg-dark', text: 'text-cream' },
];

interface SectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-10 first:border-t-0">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-dark">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

interface PreviewProps {
  children: ReactNode;
  className?: string;
}

function Preview({ children, className }: PreviewProps) {
  return (
    <div className={`rounded-lg border border-line bg-cream p-5 ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function DesignSystemPage() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  );
}

function DesignSystemContent() {
  const location = useLocation();
  const { showToast } = useToast();
  const [lastAction, setLastAction] = useState('No action recorded yet.');
  const [email, setEmail] = useState('');
  const [summary, setSummary] = useState('');
  const [role, setRole] = useState('editor');
  const [notifications, setNotifications] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  const emailError =
    email.length > 0 && !email.includes('@') ? 'Enter a valid email address.' : undefined;

  const recordAction = (action: string) => setLastAction(action);

  return (
    <DashboardLayout
      navItems={primaryNavItems}
      sidebarItems={sectionItems}
      footerLinks={footerLinks}
      sidebarTitle="Design System"
      navbarActions={
        <Link to="/" className={buttonClassName({ variant: 'outline', size: 'sm' })}>
          Back to overview
        </Link>
      }
    >
      <PageHeader
        eyebrow="AI Career Studio"
        title="Design System"
        description="Reusable primitives, layouts, and interaction patterns for a premium career platform. Every example below is live and uses real component state."
        breadcrumbs={[
          { label: 'Home', to: '/', icon: <Home size={14} /> },
          { label: 'Design System' },
        ]}
        actions={
          <PrimaryButton
            leadingIcon={<Sparkles size={16} />}
            onClick={() => recordAction('Opened the design system guide')}
          >
            Explore tokens
          </PrimaryButton>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div
          aria-live="polite"
          className="mt-8 flex flex-col gap-2 rounded-lg border border-line-strong bg-burgundy-weak px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-burgundy">
            Live component state
          </span>
          <span className="text-sm text-dark">{lastAction}</span>
        </div>

        <Section
          id="foundations"
          title="Foundations"
          description="A restrained palette, two typography families, consistent spacing, rounded cards, thin borders, and subtle shadows. All semantic colors are derived from the five brand colors."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {colors.map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div className={`h-24 ${color.swatch}`} aria-hidden="true" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-dark">{color.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{color.value}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Preview>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-burgundy">
                Display · Manrope
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-dark">
                Build careers with clarity.
              </p>
            </Preview>
            <Preview>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-burgundy">
                Body · Inter
              </p>
              <p className="mt-2 text-base leading-7 text-muted">
                Clear, calm typography keeps complex career workflows approachable and focused.
              </p>
            </Preview>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="Primary actions use burgundy, secondary actions use beige, and outline actions stay quiet until interacted with. Every button is keyboard focusable and exposes loading state."
        >
          <Preview>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton onClick={() => recordAction('Primary button clicked')}>
                Primary
              </PrimaryButton>
              <SecondaryButton onClick={() => recordAction('Secondary button clicked')}>
                Secondary
              </SecondaryButton>
              <OutlineButton onClick={() => recordAction('Outline button clicked')}>
                Outline
              </OutlineButton>
              <Button
                variant="danger"
                leadingIcon={<Trash2 size={16} />}
                onClick={() => recordAction('Danger button clicked')}
              >
                Delete
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PrimaryButton size="sm" onClick={() => recordAction('Small button clicked')}>
                Small
              </PrimaryButton>
              <PrimaryButton size="lg" onClick={() => recordAction('Large button clicked')}>
                Large
              </PrimaryButton>
              <SecondaryButton
                leadingIcon={<Plus size={16} />}
                onClick={() => recordAction('Added item')}
              >
                With icon
              </SecondaryButton>
            </div>
          </Preview>
        </Section>

        <Section
          id="forms"
          title="Forms"
          description="Inputs, textareas, selects, and checkboxes share labels, hints, validation messages, focus rings, and accessible descriptions."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Preview>
              <div className="flex flex-col gap-5">
                <Input
                  label="Full name"
                  placeholder="Ayesha Khan"
                  hint="Use the name you want employers to see."
                  leadingIcon={<Mail size={16} />}
                />
                <Input
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={emailError}
                />
                <Checkbox
                  label="Email me about new jobs"
                  description="Only weekly career matches. No noise."
                  checked={notifications}
                  onChange={(event) => {
                    setNotifications(event.target.checked);
                    recordAction(`Notifications ${event.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </Preview>
            <Preview>
              <div className="flex flex-col gap-5">
                <Select
                  label="Preferred role"
                  placeholder="Choose a role"
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value);
                    recordAction(`Role changed to ${event.target.value}`);
                  }}
                  options={[
                    { value: 'editor', label: 'Resume Editor' },
                    { value: 'designer', label: 'Product Designer' },
                    { value: 'engineer', label: 'Software Engineer' },
                    { value: 'student', label: 'Student', disabled: true },
                  ]}
                />
                <Textarea
                  label="Career summary"
                  placeholder="Write a short professional summary…"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  hint={`${summary.length} characters`}
                />
                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">Controlled</Badge>
                  <Badge tone="success">Validated</Badge>
                  <Badge tone="neutral">Accessible</Badge>
                </div>
              </div>
            </Preview>
          </div>
        </Section>

        <Section
          id="feedback"
          title="Overlays and feedback"
          description="Modals, drawers, dropdowns, tooltips, confirmation dialogs, and toasts provide accessible feedback without inventing application data."
        >
          <Preview>
            <div className="flex flex-wrap gap-3">
              <SecondaryButton onClick={() => setModalOpen(true)}>Open modal</SecondaryButton>
              <SecondaryButton onClick={() => setDrawerOpen(true)}>Open drawer</SecondaryButton>
              <SecondaryButton onClick={() => setConfirmOpen(true)}>Confirm action</SecondaryButton>
              <Tooltip content="Helpful context appears on hover and focus.">
                <OutlineButton aria-label="More information" leadingIcon={<Info size={16} />}>
                  Tooltip
                </OutlineButton>
              </Tooltip>
              <Dropdown
                label="Actions"
                items={[
                  {
                    id: 'rename',
                    label: 'Rename document',
                    onSelect: () => recordAction('Selected: Rename document'),
                  },
                  {
                    id: 'duplicate',
                    label: 'Duplicate document',
                    onSelect: () => recordAction('Selected: Duplicate document'),
                  },
                  {
                    id: 'delete',
                    label: 'Delete document',
                    destructive: true,
                    icon: <Trash2 size={15} />,
                    onSelect: () => recordAction('Selected: Delete document'),
                  },
                ]}
              />
            </div>
          </Preview>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Button
              variant="outline"
              onClick={() =>
                showToast({
                  title: 'Changes saved',
                  description: 'Your design preferences were stored.',
                  tone: 'success',
                })
              }
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                showToast({
                  title: 'New suggestion',
                  description: 'A career tip is ready to review.',
                  tone: 'info',
                })
              }
            >
              Info toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                showToast({
                  title: 'Check your details',
                  description: 'One field needs attention.',
                  tone: 'warning',
                })
              }
            >
              Warning toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                showToast({
                  title: 'Unable to continue',
                  description: 'The request did not complete.',
                  tone: 'error',
                })
              }
            >
              Error toast
            </Button>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Design system modal"
            description="A focused dialog with keyboard focus trapping, Escape to close, and a real footer action."
            footer={
              <div className="flex justify-end gap-3">
                <OutlineButton onClick={() => setModalOpen(false)}>Cancel</OutlineButton>
                <PrimaryButton
                  onClick={() => {
                    recordAction('Modal action confirmed');
                    setModalOpen(false);
                  }}
                >
                  Confirm
                </PrimaryButton>
              </div>
            }
          >
            <p className="text-sm leading-7 text-muted">
              Use this pattern for short tasks that need user attention without leaving the current
              page.
            </p>
          </Modal>

          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Design system drawer"
            description="A slide-in panel for focused workflows on small and large screens."
            footer={
              <PrimaryButton fullWidth onClick={() => setDrawerOpen(false)}>
                Done
              </PrimaryButton>
            }
          >
            <div className="flex flex-col gap-3">
              {['Typography', 'Color', 'Spacing', 'Motion'].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-line bg-beige-weak px-4 py-3 text-sm font-medium text-dark"
                >
                  {item}
                </div>
              ))}
            </div>
          </Drawer>

          <ConfirmationDialog
            open={confirmOpen}
            title="Discard changes?"
            description="This action cannot be undone. Confirm only when you are sure."
            confirmLabel="Discard"
            destructive
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              recordAction('Destructive action confirmed');
              setConfirmOpen(false);
            }}
          />
        </Section>

        <Section
          id="data-display"
          title="Data display"
          description="Cards, tabs, badges, skeletons, empty states, and pagination present information consistently across every screen size."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile completeness</CardTitle>
                <CardDescription>Real state from the controlled form above.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={emailError ? 'danger' : 'success'}>
                    {emailError ? 'Email needs attention' : 'Email valid'}
                  </Badge>
                  <Badge tone={notifications ? 'brand' : 'neutral'}>
                    Notifications {notifications ? 'on' : 'off'}
                  </Badge>
                  <Badge tone="neutral">Role: {role}</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <OutlineButton
                  size="sm"
                  onClick={() => recordAction('Reviewed profile completeness')}
                >
                  Review
                </OutlineButton>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading states</CardTitle>
                <CardDescription>Skeletons reserve layout space while data loads.</CardDescription>
              </CardHeader>
              <CardContent>
                {showSkeleton ? (
                  <SkeletonCard />
                ) : (
                  <p className="text-sm leading-7 text-muted">
                    Skeleton preview is hidden. Toggle it to see the loading treatment.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <SecondaryButton size="sm" onClick={() => setShowSkeleton((visible) => !visible)}>
                  {showSkeleton ? 'Hide skeleton' : 'Show skeleton'}
                </SecondaryButton>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              items={[
                {
                  id: 'overview',
                  label: 'Overview',
                  icon: <LayoutDashboard size={15} />,
                  content: (
                    <p className="text-sm leading-7 text-muted">
                      Tabs expose their selected state with ARIA and support arrow-key navigation.
                    </p>
                  ),
                },
                {
                  id: 'activity',
                  label: 'Activity',
                  icon: <Bell size={15} />,
                  content: (
                    <p className="text-sm leading-7 text-muted">
                      Activity would be populated by real application data when a feature is built.
                    </p>
                  ),
                },
                {
                  id: 'settings',
                  label: 'Settings',
                  icon: <Sparkles size={15} />,
                  content: (
                    <p className="text-sm leading-7 text-muted">
                      Settings panels can reuse the form primitives documented above.
                    </p>
                  ),
                },
              ]}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <EmptyState
              icon={<FileText size={20} />}
              title="No documents yet"
              description="Create your first resume when the document feature is available."
              action={
                <PrimaryButton size="sm" onClick={() => recordAction('Create document requested')}>
                  Create document
                </PrimaryButton>
              }
            />
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-line bg-cream p-6">
              <p className="text-sm font-semibold text-dark">Page {page} of 12</p>
              <Pagination page={page} totalPages={12} onPageChange={setPage} />
            </div>
          </div>
        </Section>

        <Section
          id="navigation"
          title="Navigation"
          description="Breadcrumbs and focused link buttons keep orientation clear while preserving real routes."
        >
          <Preview>
            <Breadcrumbs
              items={[
                { label: 'Home', to: '/', icon: <Home size={14} /> },
                { label: 'Design System', to: '/design-system' },
                { label: 'Navigation' },
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/" className={buttonClassName({ variant: 'primary', size: 'sm' })}>
                Go to overview
              </Link>
              <Link
                to="/design-system#foundations"
                className={buttonClassName({ variant: 'outline', size: 'sm' })}
              >
                Back to foundations
              </Link>
            </div>
          </Preview>
        </Section>

        <Section
          id="layout"
          title="Layout"
          description="This page itself is composed from the responsive Navbar, Sidebar, PageHeader, main region, and Footer. On mobile the sidebar opens from a drawer; on tablet and desktop it becomes a fixed rail."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { title: 'Navbar', body: 'Adaptive primary navigation with a mobile menu.' },
              { title: 'Footer', body: 'Brand, real links, and a dynamic copyright line.' },
              { title: 'Sidebar', body: 'Desktop rail and mobile drawer from one item model.' },
              { title: 'Dashboard layout', body: 'Composes navigation, content, and footer.' },
              {
                title: 'Page header',
                body: 'Eyebrow, title, description, breadcrumbs, and actions.',
              },
              {
                title: 'Responsive',
                body: 'Verified at 375px, 768px, and 1440px viewport widths.',
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="success">
              <Check size={13} /> Mobile
            </Badge>
            <Badge tone="success">
              <Check size={13} /> Tablet
            </Badge>
            <Badge tone="success">
              <Check size={13} /> Desktop
            </Badge>
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
