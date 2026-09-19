# PlayFinder design system (as implemented)

Facts only. No recommendations. If a token, breakpoint, or primitive is not in the running app, it is marked **not present**.

---

## Breakpoints

`tailwind.config.ts` does **not** set `theme.screens`. The app therefore uses Tailwind CSS v3.4 default screens:

| Prefix | Min width |
| --- | --- |
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |

The only custom screen-like value is on the **container** (not the `2xl:` utility):

```17:19:tailwind.config.ts
      screens: {
        "2xl": "1400px",
      },
```

`theme.container` also sets `center: true` and `padding: "2rem"` (`tailwind.config.ts` lines 14–16). The live app shell does not use the `container` class for the main chrome.

A separate JS breakpoint exists in `src/components/playfinder-profile/ui/use-mobile.tsx` line 3: `MOBILE_BREAKPOINT = 768` (max-width `767px`). That hook is **not imported** by any app file.

Layout chrome actually switches on:

- `lg` (`1024px`) — desktop sidebar, drop mobile header/bottom nav, widen the centre column (`src/app/(main)/main-app-shell.tsx`).
- `xl` (`1280px`) — show the right rail (`src/components/playfinder/desktop-right-rail.tsx` line 42: `hidden … xl:flex`).

---

## Layout widths

Source of the authenticated chrome: `src/app/(main)/main-app-shell.tsx`.

### Outer gutters

Line 49:

```
lg:px-[max(24px,calc((100vw_-_1225px)_/_2))]
```

`1225` is the sum of the expanded left rail (`275`) + centre column (`600`) + right rail (`350`). Below `lg`, this padding is not applied (class is `lg:` only). Minimum desktop side padding is **24px**.

Comment in the same file (lines 35–39) states every non-full-bleed route shares a **600px** content column so the rails stay aligned.

### Centre column

| Viewport | Width | File / line |
| --- | --- | --- |
| Default (mobile) | `w-full max-w-[480px]`, `mx-auto` | `main-app-shell.tsx` lines 56, 72 |
| `lg+` normal routes | `lg:max-w-[600px]`, `lg:mx-0`, `lg:border-x lg:border-[#2a2f2a]` | lines 72–73 |
| Discover / Messages (`lg+`) | full-bleed: `lg:max-w-none lg:flex-1` (mobile still `max-w-[480px]`) | line 56 |

`pb-28` (Tailwind `7rem` / **112px**) is applied on the non-full-bleed `<main>` (line 79) to clear the fixed bottom nav.

### Left rail

`src/components/playfinder/desktop-sidebar.tsx`:

| State | Width / padding | Visibility | Lines |
| --- | --- | --- | --- |
| Expanded | `w-[275px]`, `pl-6` (24px), `pr-3` (12px), `py-3` | `hidden … lg:flex` | 171 |
| Collapsed (Discover, Messages) | `w-[88px]`, `py-3`, icons centered | `hidden … lg:flex` | 104 |

### Right rail

Both rails: `sticky top-0 hidden h-screen w-[350px] shrink-0 … px-6 py-3 … xl:flex`.

- Default: `src/components/playfinder/desktop-right-rail.tsx` line 42 (`px-6` = **24px**).
- Profile routes (`pathname.startsWith("/users/")`): `src/components/playfinder-profile/profile-desktop-right-rail.tsx` line 57. Same `350px` / `px-6`.
- Full-bleed routes: right rail is `null` (`main-app-shell.tsx` lines 42–46).

### Mobile horizontal padding

Used repeatedly as `px-4` (**16px**):

- Mobile header: `src/components/playfinder/header.tsx` line 85 (`px-4 py-3`).
- Profile body: `src/components/playfinder-profile/athlete-profile.tsx` lines 100, 148, 172, 262 (`px-4` / `mx-4`).
- Feed type tabs: `src/components/playfinder/feed-type-tabs.tsx` line 22 (`px-4`).
- Sport tabs: `src/components/playfinder/sport-tabs.tsx` line 28 (`px-4`).
- Arena feed list: `src/components/playfinder/playfinder-feed.tsx` line 71 (`px-4`).

Header also adds `pt-[calc(12px+env(safe-area-inset-top,0px))]` (`header.tsx` line 85).

### Bottom nav

`src/components/playfinder/bottom-nav.tsx` line 64–65:

- Bar: `fixed bottom-0 left-0 right-0`, height `h-[calc(64px+env(safe-area-inset-bottom,0px))]`.
- Inner row: `w-full max-w-md` (Tailwind `md` = **28rem / 448px**), `mx-auto`.
- Shown only under `lg` (`main-app-shell.tsx` lines 65, 80: `lg:hidden`).

### Other widths that exist but are not the app shell

- Messages conversation list: `w-[420px]` at `lg` (`src/app/(main)/messages/messages-layout-shell.tsx` line 14).
- Unused leftover navbar: `max-w-7xl` + `px-5` (`src/app/(main)/Navbar.tsx` line 8). **Navbar is not imported** by the live shell.
- Bookmarks page still wraps content with `TrendsSidebar` (`src/app/(main)/bookmarks/page.tsx`) inside the 600px column.

---

## Spacing scale

`tailwind.config.ts` `theme.extend` has **no** `spacing` key. The spacing scale is Tailwind v3.4 defaults (0, px, 0.5, 1=0.25rem/4px, 2=0.5rem/8px, … 96=24rem/384px).

The product UI also uses many hardcoded pixel values (`px-4`, `h-[88px]`, `gap-[7px]`, `text-[26px]`, etc.) rather than only the scale.

`borderRadius` tokens (`tailwind.config.ts` lines 62–66):

- `lg` → `var(--radius)`
- `md` → `calc(var(--radius) - 2px)`
- `sm` → `calc(var(--radius) - 4px)`

`--radius` is `1rem` (`src/app/globals.css` line 159).

---

## Colour tokens

### PlayFinder custom tokens (`:root` in `src/app/globals.css` lines 116–130)

| Token | Value |
| --- | --- |
| `--pf-bg` | `#08090a` |
| `--pf-bg-2` | `#0d0f0d` |
| `--pf-surface` | `#131614` |
| `--pf-surface-2` | `#1a1e1b` |
| `--pf-surface-3` | `#232824` |
| `--pf-border` | `#2a2f2a` |
| `--pf-border-light` | `#353c34` |
| `--pf-text` | `#f2f5ef` |
| `--pf-text-2` | `#b4bcaf` |
| `--pf-text-3` | `#7e8a7e` |
| `--pf-text-4` | `#5a635a` |
| `--pf-volt` | `#a1c217` |
| `--pf-volt-dim` | `#76930f` |
| `--pf-volt-glow` | `rgba(161, 194, 23, 0.35)` |
| `--pf-blue` | `#56ccf2` |

These `--pf-*` names are **not** registered in `tailwind.config.ts` `theme.colors`. Components mostly paste the hex values (`bg-[#08090a]`, `text-[#a1c217]`) or use `var(--pf-volt)` in a few CSS rules (`.pf-live-orb`, `.pf-map-pulse`).

### shadcn HSL tokens (`globals.css` lines 131–159, mapped in `tailwind.config.ts` lines 27–60)

`:root` HSL (space-separated, no `hsl()` wrapper — Tailwind adds it):

| Token | HSL |
| --- | --- |
| `--background` | `0 0% 5.1%` |
| `--foreground` | `0 0% 95%` |
| `--card` / `--card-foreground` | `0 0% 8%` / `0 0% 95%` |
| `--popover` / `--popover-foreground` | `0 0% 8%` / `0 0% 95%` |
| `--primary` / `--primary-foreground` | `72 90% 53%` / `0 0% 5.1%` |
| `--secondary` / `--secondary-foreground` | `0 0% 12%` / `0 0% 98%` |
| `--muted` / `--muted-foreground` | `0 0% 12%` / `0 0% 65%` |
| `--accent` / `--accent-foreground` | `0 0% 12%` / `0 0% 98%` |
| `--destructive` / `--destructive-foreground` | `0 84.2% 60.2%` / `0 0% 98%` |
| `--border` / `--input` | `0 0% 15%` |
| `--ring` | `72 90% 53%` |

Tailwind colour names: `border`, `input`, `ring`, `background`, `foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `destructive`, `destructive-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `popover`, `popover-foreground`, `card`, `card-foreground`.

Hardcoded extras that appear on chrome (not tokens): bottom-nav plus button `bg-[#A0CC00]` (`bottom-nav.tsx` line 79); composer focus `border-[#A0CC00]` (`composer-sheet.tsx` line 49); Stream/messages surfaces `#0d0d0d`, `#1a1a1a`, `#161616`.

### Dark mode

- Tailwind: `darkMode: ["class"]` (`tailwind.config.ts` line 5).
- Root layout wraps the tree in `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` (`src/app/layout.tsx` lines 50–55).
- `.dark { … }` in `globals.css` lines 162–190 restates the same HSL tokens as `:root`, except `--destructive` becomes `0 62.8% 50%` and `--destructive-foreground` becomes `0 85.7% 97.3%`.
- `:root` already uses a near-black background. The authenticated shell hardcodes `bg-[#08090a] text-[#f2f5ef]` (`main-app-shell.tsx` line 49). The profile screen hardcodes `text-[#f2f5ef]` and dark hex surfaces (`athlete-profile.tsx` line 59).
- A second `ThemeProvider` exists at `src/components/playfinder-profile/theme-provider.tsx` and is **not imported** anywhere.

There is no light-theme palette on `:root` that differs from `.dark` for background/foreground/primary. Switching `class="dark"` only changes the destructive HSL pair among the listed tokens.

`body` applies `bg-background font-grotesk text-foreground` (`globals.css` lines 197–199).

---

## Typography

### Font families

Loaded in `src/app/layout.tsx`:

| CSS variable | Source | Tailwind name |
| --- | --- | --- |
| `--font-space-grotesk` | `next/font/google` `Space_Grotesk` | `font-sans`, `font-grotesk` (`tailwind.config.ts` lines 22–24) |
| `--font-dm-mono` | `next/font/google` `DM_Mono` weights 400, 500 | `font-dm-mono` |
| `--font-geist-sans` | local `src/app/fonts/GeistVF.woff` | **not present** in `tailwind.config.ts` `fontFamily` |
| `--font-geist-mono` | local `src/app/fonts/GeistMonoVF.woff` | **not present** in `tailwind.config.ts` `fontFamily` |

`<body>` class: `${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${dmMono.variable} font-grotesk antialiased` (`src/app/layout.tsx` line 46). Runtime body font is Space Grotesk.

### Profile screen sizes and weights

All from the live profile tree. One component; no heading scale file.

| Element | Classes | File / lines |
| --- | --- | --- |
| Page wrapper | `font-grotesk text-[#f2f5ef]` | `athlete-profile.tsx` 59 |
| Display name (`h1`) | `text-[26px] font-bold tracking-[-0.03em] text-white` | 124 |
| Username | `text-sm text-[#7e8a7e]` | 127 |
| Location / joined | `text-[13px] text-[#b4bcaf]` | 128 |
| Stat numbers | `text-2xl font-bold` | 150, 156, 165 |
| Stat labels | `font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#7e8a7e]` | 151–152, 157–158, 166–167 |
| Section eyebrow (“Athlete ID”, “In my own words”) | `font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]` | 175–176; `ProfileBioEditor.tsx` 55–56 |
| Section heading (`h2`) | `text-[22px] font-bold tracking-[-0.03em]` | `athlete-profile.tsx` 178; `ProfileBioEditor.tsx` 58 |
| Sport name | `text-[15px] font-bold` | `athlete-profile.tsx` 209 |
| Sport tier | `font-dm-mono text-[10px] font-medium uppercase tracking-[0.08em]` | 225 |
| Add-sport CTA | `text-[13px] font-semibold text-[#7e8a7e]` | 238 |
| Empty sports | `text-sm text-[#7e8a7e]` | 254 |
| Status label | `font-dm-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]` | `ProfileIntentPill.tsx` 60 |
| Status chips | `text-[13px] font-semibold` | `ProfileIntentPill.tsx` 75, 100 |
| Bio body | `text-[15px] leading-relaxed text-[#b4bcaf]` | `ProfileBioEditor.tsx` 114 |
| Bio editor textarea | `text-[15px] leading-relaxed text-[#f2f5ef]` | `ProfileBioEditor.tsx` 87 |
| Posts / Highlights tabs | `text-sm font-medium capitalize` | `profile-posts-section.tsx` 62 |
| Avatar fallback initials | `text-2xl font-bold text-[#a1c217]` | `athlete-profile.tsx` 111 |

---

## Component inventory

### Primitives that the running app imports

| Primitive | Path | Notes |
| --- | --- | --- |
| Avatar (used) | `src/components/UserAvatar.tsx` | `next/image`, default size 48, placeholder `@/assets/avatar-placeholder.png`. Profile uses `size={88}`. |
| Button | `src/components/ui/button.tsx` | CVA variants: default, destructive, outline, secondary, ghost, link. Sizes: default `h-10`, sm, lg, icon. |
| Input | `src/components/ui/input.tsx` | |
| Textarea | `src/components/ui/textarea.tsx` | |
| Label | `src/components/ui/label.tsx` | |
| Dialog | `src/components/ui/dialog.tsx` | |
| Dropdown menu | `src/components/ui/dropdown-menu.tsx` | |
| Tabs (Radix) | `src/components/ui/tabs.tsx` | List `h-12`, triggers `text-sm`. |
| Toast / toaster | `src/components/ui/toast.tsx`, `toaster.tsx`, `use-toast.ts` | Root layout mounts `Toaster`. |
| Tooltip | `src/components/ui/tooltip.tsx` | |
| Form | `src/components/ui/form.tsx` | |
| Skeleton | `src/components/ui/skeleton.tsx` | |
| Loading button | `src/components/LoadingButton.tsx` | |
| Password input | `src/components/PasswordInput.tsx` | |

**Card primitive in `src/components/ui/`:** not present. Feed “cards” are custom components (below). A Card exists only in the unused profile UI kit.

### App chrome (header, nav, rails)

| Piece | Path |
| --- | --- |
| Mobile header | `src/components/playfinder/header.tsx` (`lg:hidden` via class on the `<header>` itself, line 85) |
| Bottom nav | `src/components/playfinder/bottom-nav.tsx` |
| Desktop left nav | `src/components/playfinder/desktop-sidebar.tsx` |
| Desktop right rail | `src/components/playfinder/desktop-right-rail.tsx` |
| Profile right rail | `src/components/playfinder-profile/profile-desktop-right-rail.tsx` |
| App shell | `src/app/(main)/main-app-shell.tsx` |
| Page back header | `src/components/playfinder/page-back-header.tsx` |

Leftover chrome **not mounted** by `MainAppShell`: `src/app/(main)/Navbar.tsx`, `src/app/(main)/MenuBar.tsx`.

### Tab strips in use

| Strip | Path |
| --- | --- |
| Home Social / Arena | `src/components/playfinder/feed-type-tabs.tsx` |
| Home sport chips | `src/components/playfinder/sport-tabs.tsx` |
| Profile Posts / Highlights | inline buttons in `src/app/(main)/users/[username]/profile-posts-section.tsx` lines 55–70 |

### Feed / post surfaces

| Piece | Path |
| --- | --- |
| Home feed card | `src/components/playfinder/home-feed-card.tsx` |
| Alternate feed card (profile + detail) | `src/components/playfinder/feed-card.tsx` |
| Legacy post card | `src/components/posts/Post.tsx` (bookmarks page still uses it) |

### Profile UI kit under `src/components/playfinder-profile/ui/`

Present on disk (avatar, badge, button, button-group, card, tabs, sidebar, … — 50+ files). **Zero application imports** of `@/components/playfinder-profile/ui/*` were found. The live profile does not use `playfinder-profile/ui/avatar.tsx` or `ui/card.tsx`; it uses `UserAvatar` and raw `div`s.

---

## Profile screen: mobile vs desktop

### Which file renders a user profile

1. Route: `src/app/(main)/users/[username]/page.tsx` — server page, loads the user, builds `AthleteProfileData` via `build-athlete-profile.ts`, renders `<AthleteProfile />`.
2. Screen: `src/components/playfinder-profile/athlete-profile.tsx` — single client component for the whole profile (cover, identity, stats, sports, bio, posts).
3. Children: `ProfileActions.tsx`, `ProfileBioEditor.tsx`, `ProfileIntentPill.tsx`, `profile-posts-section.tsx` (all under `src/app/(main)/users/[username]/`).

There are **no** separate `profile-mobile.tsx` / `profile-desktop.tsx` files in the app. A design-reference profile exists at `reference/Design/project/src/screens/profile.tsx` and is not imported by Next.

### How mobile vs desktop is handled

**One responsive component** for the profile body. `athlete-profile.tsx` contains **no** `sm:`, `md:`, `lg:`, or `xl:` classes. Cover is a fixed `h-[180px]`; sports use `grid-cols-2`; stats use `grid-cols-3`; horizontal padding is `px-4` / `mx-4` at every width.

Viewport differences come from the **shell**, not from the profile file:

| Width | What changes | Where |
| --- | --- | --- |
| `< lg` (default) | Centre column capped at **480px**; mobile `Header` visible; `BottomNav` visible | `main-app-shell.tsx` 72, 76–81; `header.tsx` 85 (`lg:hidden`) |
| `lg`–`xl` | Centre column **600px** with side borders; `DesktopSidebar` **275px**; header and bottom nav hidden | `main-app-shell.tsx` 73; `desktop-sidebar.tsx` 171 |
| `xl+` | Same 600px column + sidebar + `ProfileDesktopRightRail` **350px** | `main-app-shell.tsx` 32, 42–43; `profile-desktop-right-rail.tsx` 57 (`hidden … xl:flex`) |

`isProfileRoute` only swaps which right rail is rendered (`ProfileDesktopRightRail` vs `DesktopRightRail`). It does not load a different profile component.
