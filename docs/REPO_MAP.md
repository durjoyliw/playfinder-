# PlayFinder repository map

Read-only audit of what the code actually does. Every claim cites a path. If something the prompt asked about is not in the repo, it is marked **not present**.

---

## Framework and versions

Source: `package.json`.

| Piece | What is actually installed |
| --- | --- |
| Next.js | `15.0.0-rc.0` (`next`, `eslint-config-next`) |
| React | `19.0.0-rc-f994737d14-20240522` |
| Router | **App Router only.** Routes live under `src/app/`. There is **no** `pages/` directory. |
| Prisma | `prisma` and `@prisma/client` `^5.16.1`. Schema at `prisma/schema.prisma`. Client generated as `prisma-client-js` with preview feature `fullTextSearch`. Database is PostgreSQL (`POSTGRES_PRISMA_URL` + `POSTGRES_URL_NON_POOLING`). |
| Auth | **NextAuth is not present.** There is no `next-auth` dependency and no NextAuth config file. Auth is **Lucia v3** (`lucia` `^3.2.0`, `@lucia-auth/adapter-prisma` `^4.0.1`) plus **Arctic** `^1.9.1` for Google OAuth. Config: `src/auth.ts`. |
| Stream Chat | `stream-chat` `^8.37.0`, `stream-chat-react` `^11.23.0` |
| UploadThing | `uploadthing` `^7.7.4`, `@uploadthing/react` `^7.3.3` |
| Tailwind | `tailwindcss` `^3.4.1`, plugin `tailwindcss-animate` `^1.0.7`, wrapped with `withUt()` from `uploadthing/tw` in `tailwind.config.ts`. shadcn-style setup in `components.json` (`style: "default"`, `cssVariables: true`, `baseColor: "slate"`). |
| Other notable deps | `@tanstack/react-query` `^5.50.1`, TipTap `^2.4.0`, `mapbox-gl` `^3.24.0`, `next-themes` `^0.3.0`, Radix dialog/dropdown/label/slot/tabs/toast/tooltip, `class-variance-authority`, `zod`. |

Next config (`next.config.mjs`): TypeScript and ESLint errors ignored during builds; `experimental.staleTimes.dynamic = 30`; `serverExternalPackages: ["@node-rs/argon2"]`; image host `utfs.io`; rewrite `/hashtag/:tag` → `/search?q=%23:tag`.

---

## High-level folder structure

```
d:\playfinder-\
├── prisma/                    # schema.prisma, migrations/, seed.ts
├── public/                    # static SVGs
├── reference/Design/          # standalone design prototype (not the Next app)
├── src/
│   ├── auth.ts                # Lucia + Google OAuth
│   ├── middleware.ts          # admin cookie gate only
│   ├── app/                   # Next.js App Router
│   ├── components/            # UI + feature components
│   ├── hooks/                 # 4 client hooks
│   ├── lib/                   # server/shared helpers
│   └── assets/                # avatar placeholder (imported by UserAvatar)
├── tailwind.config.ts
├── components.json            # shadcn config
└── package.json
```

### Routes (`src/app/`)

App Router route groups:

| Group / tree | Role |
| --- | --- |
| `src/app/layout.tsx` | Root HTML, fonts, ThemeProvider, UploadThing SSR plugin, React Query, Toaster |
| `src/app/(marketing)/page.tsx` | `/` landing; redirects logged-in users to `/home` |
| `src/app/(auth)/` | `/login`, `/signup`, Google start at `login/google/route.ts` |
| `src/app/(main)/` | Authenticated app (home, discover, messages, notifications, search, settings, users, posts, bookmarks, teammates) |
| `src/app/(admin)/admin/` | Separate admin UI; cookie auth, not Lucia |
| `src/app/onboarding/` | Post-signup onboarding |
| `src/app/api/` | REST handlers (see below) |

`(main)` pages (each `page.tsx`):

- `src/app/(main)/home/page.tsx` — `/home`
- `src/app/(main)/discover/page.tsx`
- `src/app/(main)/messages/page.tsx`, `messages/[channelId]/page.tsx`
- `src/app/(main)/notifications/page.tsx`
- `src/app/(main)/search/page.tsx`
- `src/app/(main)/settings/` (+ about, activity, blocked, edit-profile, help, intent, location, notifications, privacy, sports, terms)
- `src/app/(main)/users/[username]/page.tsx`
- `src/app/(main)/posts/[postId]/page.tsx`
- `src/app/(main)/bookmarks/page.tsx`
- `src/app/(main)/teammates/page.tsx`

There is **no** `src/app/(main)/page.tsx`. Logged-in users hitting `/` are redirected to `/home` by `src/app/(marketing)/page.tsx`.

### Components (`src/components/`)

- `src/components/ui/` — shadcn primitives actually used by the app (button, dialog, dropdown-menu, form, input, label, skeleton, tabs, textarea, toast, toaster, tooltip).
- `src/components/playfinder/` — current product chrome and feed (header, bottom-nav, desktop-sidebar, desktop-right-rail, home-feed-card, composer-sheet, playfinder-home, …).
- `src/components/playfinder-profile/` — live profile screen (`athlete-profile.tsx`) plus a large unused `ui/` kit.
- `src/components/posts/` — legacy post card + TipTap editor + `submitPost`.
- `src/components/comments/`, `src/components/discover/`, `src/components/onboarding/`, `src/components/marketing/`, `src/components/teammates/`, `src/components/auth/`.

### Server actions and API handlers

Server actions (`"use server"`) live next to the feature, not in a single `actions/` folder:

- `src/app/(auth)/actions.ts` — logout
- `src/app/(auth)/login/actions.ts` — login
- `src/app/(auth)/signup/actions.ts` — signup
- `src/app/(admin)/admin/login/actions.ts` — admin login
- `src/app/(main)/users/[username]/actions.ts` — profile update
- `src/components/posts/editor/actions.ts` — `submitPost`
- `src/components/posts/actions.ts` — delete post
- `src/components/playfinder/actions.ts` — `submitBroadcast`
- `src/components/comments/actions.ts` — comments

API routes: `src/app/api/**/route.ts` (48 files). Groups include `posts/`, `users/`, `messages/`, `notifications/`, `discover/`, `search/`, `uploadthing/`, `get-token`, `stream/sync-users`, `push/`, `reports/`, `teammates/`, `playfinder/active-count`, `clear-uploads`, `cron/notifications`, `auth/callback/google`.

### Prisma

- Schema: `prisma/schema.prisma`
- Client singleton: `src/lib/prisma.ts`
- Migrations: `prisma/migrations/`
- Seed: `prisma/seed.ts` (`npm run db:seed`)

### Lib / helpers (`src/lib/`)

Shared server and client helpers: `prisma.ts`, `stream.ts`, `stream-browser-client.ts`, `stream-messaging.ts`, `uploadthing.ts`, `uploadthing-file-key.ts`, `types.ts`, `validation.ts`, `playfinder.ts`, `home-feed-card.ts`, `onboarding.ts`, `settings.ts`, `sports.ts`, `location.ts`, `teammate.ts`, `teammate-server.ts`, `admin/*`, `discover*`, `push.ts`, `ky.ts`, `utils.ts`, etc.

Client hooks: `src/hooks/use-user-settings.ts`, `useFollowerInfo.ts`, `useDebounce.ts`, `use-horizontal-scroll.ts`.

---

## Prisma models (full, from `prisma/schema.prisma`)

Datasource: PostgreSQL. Generator: `prisma-client-js` with `previewFeatures = ["fullTextSearch"]`.

### Enums

```prisma
enum UserRole {
  USER
  MODERATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  RESTRICTED
  MESSAGING_DISABLED
  EVENT_CREATION_DISABLED
  SUSPENDED
  BANNED
}

enum ProfileIntent {
  LOOKING_TO_PLAY
  JOIN_A_TEAM
  JUST_VIBES
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  PRO
}

enum PostIntent {
  LOOKING_TO_PLAY
  RECRUITING
  BANTER
}

enum MediaType {
  IMAGE
  VIDEO
}

enum NotificationType {
  LIKE
  FOLLOW
  COMMENT
  TEAMMATE
  MESSAGE_REQUEST
  GAME_INTEREST
  NEARBY_GAMES
  INACTIVITY_NUDGE
  TRENDING_POST
}
```

`Sport` is a large Prisma enum (acrobatics through yoga) defined in `prisma/schema.prisma` lines 147–252. It is used by `Post.sport` (optional). User sports are stored as `UserSport.sport String`, not as this enum.

### User

```prisma
model User {
  id                    String         @id
  username              String         @unique
  displayName           String
  email                 String?        @unique
  passwordHash          String?
  googleId              String?        @unique
  avatarUrl             String?
  bio                   String?
  location              String?
  profileIntent         ProfileIntent?
  completedOnboarding   Boolean                @default(false)
  role                  UserRole               @default(USER)
  status                UserStatus             @default(ACTIVE)
  suspendedUntil        DateTime?
  sessions              Session[]
  posts                 Post[]
  sports                UserSport[]
  following             Follow[]       @relation("Following")
  followers             Follow[]       @relation("Followers")
  blocking              Block[]        @relation("BlockedBy")
  blockedBy             Block[]        @relation("Blocking")
  muting                Mute[]         @relation("MutedBy")
  mutedBy               Mute[]         @relation("Muting")
  pushSubscriptions     PushSubscription[]
  likes                 Like[]
  bookmarks             Bookmark[]
  comments              Comment[]
  receivedNotifications Notification[] @relation("Recipient")
  issuedNotifications   Notification[] @relation("Issuer")
  sentMessageRequests     MessageRequest[] @relation("MessageRequestsSent")
  receivedMessageRequests MessageRequest[] @relation("MessageRequestsReceived")
  interests               PostInterest[]
  reports                 Report[]
  appeals                 Appeal[]

  createdAt DateTime @default(now())

  @@map("users")
}
```

Indexes / uniques: `@id` on `id`; `@unique` on `username`, `email`, `googleId`. No other `@@index`.

### UserSport

```prisma
model UserSport {
  id         String     @id @default(cuid())
  userId     String
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  sport      String
  skillLevel SkillLevel

  @@unique([userId, sport])
  @@map("user_sports")
}
```

### Session (Lucia)

```prisma
model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

### Follow

```prisma
model Follow {
  followerId  String
  follower    User   @relation("Following", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User   @relation("Followers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@map("follows")
}
```

### Post

```prisma
model Post {
  id                  String         @id @default(cuid())
  content             String
  type                String         @default("ARENA")
  userId              String
  user                User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  attachments         Media[]
  likes               Like[]
  bookmarks           Bookmark[]
  comments            Comment[]
  linkedNotifications Notification[]
  sport               Sport?
  intent              PostIntent     @default(BANTER)
  location            String?
  timeLabel           String?
  expiresAt           DateTime?
  slotsNeeded         Int?
  isFull              Boolean        @default(false)
  isHighlight         Boolean        @default(false)
  visibility          String         @default("PUBLIC")
  interests           PostInterest[]
  deletedAt           DateTime?
  deletedBy           String?
  deletionReason      String?

  createdAt DateTime @default(now())

  @@map("posts")
}
```

Indexes: primary key only. No `@@index` on `userId`, `createdAt`, `type`, `intent`, or `visibility`.

### Media

```prisma
model Media {
  id     String    @id @default(cuid())
  postId String?
  post   Post?     @relation(fields: [postId], references: [id], onDelete: SetNull)
  type   MediaType
  url    String

  createdAt DateTime @default(now())

  @@map("post_media")
}
```

`postId` is optional so an upload can exist before it is connected to a post. Unused rows are cleaned by `src/app/api/clear-uploads/route.ts`.

### Comment

```prisma
model Comment {
  id      String @id @default(cuid())
  content String
  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId  String
  post    Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@map("comments")
}
```

### Like

```prisma
model Like {
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("likes")
}
```

### Bookmark

```prisma
model Bookmark {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, postId])
  @@map("bookmarks")
}
```

### Notification

```prisma
model Notification {
  id          String           @id @default(cuid())
  recipientId String
  recipient   User             @relation("Recipient", fields: [recipientId], references: [id], onDelete: Cascade)
  issuerId    String?
  issuer      User?            @relation("Issuer", fields: [issuerId], references: [id], onDelete: Cascade)
  postId      String?
  post        Post?            @relation(fields: [postId], references: [id], onDelete: Cascade)
  type        NotificationType
  /// Freeform text for system-generated notifications (nearby games, inactivity nudges, trending) that have no issuer.
  body        String?
  read        Boolean          @default(false)

  createdAt DateTime @default(now())

  @@index([recipientId, type, createdAt])
  @@map("notifications")
}
```

### MessageRequest

```prisma
model MessageRequest {
  id         String   @id @default(cuid())
  fromUserId String
  fromUser   User     @relation("MessageRequestsSent", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUserId   String
  toUser     User     @relation("MessageRequestsReceived", fields: [toUserId], references: [id], onDelete: Cascade)
  channelId  String   @unique
  status     String   @default("PENDING")
  createdAt  DateTime @default(now())

  @@index([fromUserId, toUserId, status])
  @@map("message_requests")
}
```

### PostInterest

```prisma
model PostInterest {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@map("post_interests")
}
```

### PushSubscription

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("push_subscriptions")
}
```

### Block

```prisma
model Block {
  id        String   @id @default(cuid())
  blockerId String
  blockedId String
  createdAt DateTime @default(now())
  blocker   User     @relation("BlockedBy", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked   User     @relation("Blocking", fields: [blockedId], references: [id], onDelete: Cascade)
  @@unique([blockerId, blockedId])
}
```

No `@@map`. Table name is Prisma default `Block`.

### Mute

```prisma
model Mute {
  id        String   @id @default(cuid())
  muterId   String
  mutedId   String
  createdAt DateTime @default(now())
  muter     User     @relation("MutedBy", fields: [muterId], references: [id], onDelete: Cascade)
  muted     User     @relation("Muting", fields: [mutedId], references: [id], onDelete: Cascade)
  @@unique([muterId, mutedId])
}
```

No `@@map`.

### Report

```prisma
model Report {
  id         String   @id @default(cuid())
  reporterId String
  reporter   User     @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  targetType String
  targetId   String
  reason     String
  status     String   @default("OPEN")
  createdAt  DateTime @default(now())

  @@index([status])
  @@index([createdAt])
  @@map("reports")
}
```

### AuditLog

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  adminId    String
  action     String
  targetType String
  targetId   String
  reason     String?
  createdAt  DateTime @default(now())

  @@index([createdAt])
  @@map("audit_logs")
}
```

No relation to `User`. `adminId` is a free string (admin cookie actor uses `"playfinder_admin"` in `src/lib/admin/auth.ts`).

### FeatureFlag

```prisma
model FeatureFlag {
  id             String   @id @default(cuid())
  key            String   @unique
  enabled        Boolean  @default(true)
  rolloutPercent Int?
  cityScope      String?
  description    String?
  updatedAt      DateTime @updatedAt
  updatedBy      String?

  @@map("feature_flags")
}
```

### Appeal

```prisma
model Appeal {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  reason     String
  status     String    @default("PENDING")
  reviewedBy String?
  reviewedAt DateTime?
  reviewNote String?
  createdAt  DateTime  @default(now())

  @@index([status])
  @@map("appeals")
}
```

---

## Auth today

### NextAuth

**Not present.** No `next-auth` package, no `[...nextauth]` route, no `authOptions`.

### Lucia config

File: `src/auth.ts`.

- Adapter: `PrismaAdapter(prisma.session, prisma.user)` from `@lucia-auth/adapter-prisma`.
- Session cookie: `expires: false` (session cookie); `secure` only when `NODE_ENV === "production"`. Cookie name is Lucia’s default (`lucia.sessionCookieName`; Lucia 3 default is `auth_session`). No custom name is set.
- Google: `arctic` `Google` client, callback `${NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`.

`getUserAttributes` exposes this session user shape:

```ts
{
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  googleId: string | null;
}
```

Lucia `Session` (from the `lucia` package, used in `src/app/(main)/SessionProvider.tsx`) includes `id`, `userId`, `expiresAt`, and `fresh`. Extra DB user fields (`bio`, `role`, `status`, sports, etc.) are **not** on the session user; pages that need them query Prisma again (e.g. `src/app/(main)/layout.tsx` loads `status` / `suspendedUntil` / pending appeals).

### How a request checks the current user

1. **Server components / server actions / route handlers** call `validateRequest()` from `src/auth.ts` (React `cache`’d). It reads the Lucia session cookie, calls `lucia.validateSession`, refreshes or blanks the cookie, and returns `{ user, session }` or `{ user: null, session: null }`.
2. Typical guard: `const { user } = await validateRequest(); if (!user) throw new Error("Unauthorized")` or `return Response.json({ error: "Unauthorized" }, { status: 401 })`.
3. `auth()` in `src/auth.ts` is an alias of `validateRequest()`.
4. **Client** code uses `useSession()` from `src/app/(main)/SessionProvider.tsx`. The provider is only mounted in `src/app/(main)/layout.tsx` after `validateRequest()` succeeds (unauthenticated users are redirected to `/`).
5. Login creates a session in `src/app/(auth)/login/actions.ts` (`lucia.createSession` + `createSessionCookie`). Signup: `src/app/(auth)/signup/actions.ts`. Google: `src/app/api/auth/callback/google/route.ts`. Logout: `src/app/(auth)/actions.ts`.

`(main)/layout.tsx` also redirects to `/onboarding` when `userNeedsOnboarding` is true, and renders `RestrictedAccountView` for `SUSPENDED` / `BANNED`.

### Admin auth (separate from Lucia)

- Cookie name `admin_session` (`src/lib/admin/auth.ts`).
- Value must equal `process.env.ADMIN_SECRET`.
- `src/middleware.ts` redirects unauthenticated `/admin/*` (except `/admin/login`) to `/admin/login`.
- `requireAdmin()` in `src/lib/admin/auth.ts` does the same check inside server code.

---

## How a Post is created and rendered

### Model fields (recap)

From `prisma/schema.prisma` `model Post`: `id`, `content`, `type` (string, default `"ARENA"`), `userId`, `sport`, `intent` (default `BANTER`), `location`, `timeLabel`, `expiresAt`, `slotsNeeded`, `isFull`, `isHighlight`, `visibility` (default `"PUBLIC"`), soft-delete fields (`deletedAt`, `deletedBy`, `deletionReason`), `createdAt`, plus relations `attachments`, `likes`, `bookmarks`, `comments`, `linkedNotifications`, `interests`.

### Creation paths that exist in code

**1. Home composer — the path the current UI uses**

UI: `src/components/playfinder/composer-sheet.tsx`, opened from `PlayFinderProvider` / bottom-nav `+` / desktop “Broadcast”.

- **Social tab:** `POST /api/posts` (`src/app/api/posts/route.ts`). Body: `{ content, type: "SOCIAL", sportTags, visibility }`. Handler validates with `createSocialPostSchema`, maps the first sport tag via `sportTabToPostSport`, creates a post with `intent: BANTER`, `type` from the body (default `SOCIAL`), no location/time/slots.
- **Arena tab:** server action `submitBroadcast` in `src/components/playfinder/actions.ts`. Validates `createBroadcastSchema` from `src/lib/validation.ts`. Writes `content`, `sport`, `intent`, `location`, `timeLabel`, `expiresAt` (from `getListingExpiresAt`), `slotsNeeded` (only for `LOOKING_TO_PLAY`), `visibility`. **Does not set `type`**, so Prisma default `"ARENA"` applies.

**2. Legacy TipTap editor — still compiled, not mounted on any page**

- Action: `submitPost` in `src/components/posts/editor/actions.ts`.
- Schema: `createPostSchema` in `src/lib/validation.ts` (`content` + `mediaIds` max 5).
- Creates a post with only `content`, `userId`, and `attachments.connect`. `type` stays default `"ARENA"`.
- UI: `src/components/posts/editor/PostEditor.tsx` + `mutations.ts` + `useMediaUpload.ts`. **No page imports `PostEditor`.**

### Rendering in the feed

Current home feed:

1. `src/app/(main)/home/page.tsx` → `PlayFinderHome` (`src/components/playfinder/playfinder-home.tsx`).
2. `PlayFinderFeed` (`src/components/playfinder/playfinder-feed.tsx`) fetches `GET /api/posts/playfinder`.
3. Each row is `HomeFeedCard` (`src/components/playfinder/home-feed-card.tsx`), mapped by `mapPostToHomeFeedCard` in `src/lib/home-feed-card.ts`.

A second card, `FeedCard` (`src/components/playfinder/feed-card.tsx`), is used on the profile posts list (`src/app/(main)/users/[username]/profile-posts-section.tsx`) and post detail (`src/components/playfinder/post-detail-view.tsx`).

Legacy card `src/components/posts/Post.tsx` is still used by `ForYouFeed.tsx`, `FollowingFeed.tsx`, `bookmarks/Bookmarks.tsx`, and `users/[username]/UserPosts.tsx`. Of those, only **Bookmarks** is mounted on a live page (`src/app/(main)/bookmarks/page.tsx`). `ForYouFeed`, `FollowingFeed`, and `UserPosts` have no importers.

---

## Stream Chat

### Server client

`src/lib/stream.ts`: `StreamChat.getInstance(NEXT_PUBLIC_STREAM_KEY, STREAM_SECRET)`.

### Browser init

1. Messages layout `src/app/(main)/messages/layout.tsx` wraps children in `MessagesLayoutShell`.
2. `src/app/(main)/messages/messages-layout-shell.tsx` mounts `StreamChatProvider`.
3. `src/app/(main)/messages/StreamChatProvider.tsx` calls `useInitializeChatClient()`.
4. `src/app/(main)/messages/useInitializeChatClient.ts`:
   - Gets a singleton via `getStreamBrowserClient()` (`src/lib/stream-browser-client.ts`) using `NEXT_PUBLIC_STREAM_KEY` only.
   - `GET /api/get-token` (`src/app/api/get-token/route.ts`) — Lucia user required; `streamServerClient.createToken(user.id, exp, iat)` (1 hour, issuedAt = now − 60s).
   - `client.connectUser({ id, name: displayName, username, image }, token)`.
5. Provider renders `stream-chat-react` `<Chat>` with `theme="str-chat__theme-dark"`.
6. `useStreamUserSync()` (`src/app/(main)/messages/useStreamUserSync.ts`) POSTs `/api/stream/sync-users` once per tab (`sessionStorage` key `playfinder-stream-users-synced`). That route upserts every Prisma user into Stream (`src/app/api/stream/sync-users/route.ts`).

CSS: `stream-chat-react/dist/css/v2/index.css` imported in the messages layout; app overrides in `src/app/globals.css` (`.str-chat`) and `src/app/(main)/messages/playfinder-messages.css`.

### How a channel is created today

Helpers in `src/lib/stream-messaging.ts`:

| Function | Behaviour |
| --- | --- |
| `ensureDirectMessageChannel(senderId, recipientId)` | `streamServerClient.channel("messaging", { members: [...] })` then `channel.create()`. Ignores Stream conflict `code === 4` / `status === 409`. |
| `createGroupChannel(creatorId, memberIds, name)` | Same channel type, `created_by_id`, optional `name`, then `create()`. |
| `createPendingMessageRequestChannel(from, to, messageRequestId)` | Named channel id = `messageRequestId`, custom fields `pending`, `requestedBy`, `messageRequestId`, `messageLocked`. |

Call sites:

- Teammate DM: `POST /api/messages/prepare-dm` (`src/app/api/messages/prepare-dm/route.ts`) upserts both users then `ensureDirectMessageChannel`. Client `openOrRequestDm` in `src/app/(main)/messages/open-dm.ts` calls this when `/api/messages/request` reports `isTeammate`, then `client.channel("messaging", { members }).watch()`.
- Non-teammate request: `POST /api/messages/request` creates a pending Stream channel + `MessageRequest` row (`src/app/api/messages/request/route.ts`).
- Group: `POST /api/messages/prepare-group`.
- Share post into a DM: `POST /api/posts/[postId]/send` also calls `ensureDirectMessageChannel`.

Avatar changes also `partialUpdateUser` on Stream (`src/app/api/uploadthing/core.ts`).

---

## UploadThing

### Routes

- Router definition: `src/app/api/uploadthing/core.ts` (`fileRouter`).
- HTTP: `src/app/api/uploadthing/route.ts` — `createRouteHandler` exports `GET` and `POST`.
- Root layout wires `NextSSRPlugin` + `extractRouterConfig(fileRouter)` (`src/app/layout.tsx`).
- Tailwind: `withUt(config)` in `tailwind.config.ts`.
- React helpers: `src/lib/uploadthing.ts` (`useUploadThing`, `uploadFiles`).
- File-key parser for deletes: `src/lib/uploadthing-file-key.ts` (supports `/a/{app}/…` and `/f/…` URL shapes).
- Cron cleanup of orphan `Media` (postId null): `src/app/api/clear-uploads/route.ts` (`Authorization: Bearer CRON_SECRET`).

### Endpoints on the file router

**`avatar`** (`src/app/api/uploadthing/core.ts`):

- Image, max 512KB.
- Middleware: `validateRequest()`; 401 via `UploadThingError` if no user.
- `onUploadComplete`: deletes old avatar file via `UTApi().deleteFiles(getUploadThingFileKey(oldUrl))`; writes `file.url` to `User.avatarUrl`; `streamServerClient.partialUpdateUser({ image: newAvatarUrl })`; returns `{ avatarUrl }`.

**`attachment`**:

- Images 4MB × 5, videos 64MB × 5.
- Middleware: must be logged in (user not passed through).
- `onUploadComplete`: `prisma.media.create({ url: file.url, type: IMAGE|VIDEO })` with **no `postId`**. Returns `{ mediaId }`. The post later `connect`s those ids (`submitPost`).

### How an upload URL is saved

| Flow | Where the URL is persisted |
| --- | --- |
| Avatar | UploadThing `file.url` → `prisma.user.update({ avatarUrl })` in `onUploadComplete`. Client callers: `src/app/(main)/settings/edit-profile-form.tsx` (`useUploadThing("avatar")` after crop) and `src/app/(main)/users/[username]/mutations.ts` (legacy edit-profile mutation). |
| Post attachment | `file.url` → new `Media` row. Client `useMediaUpload` (`src/components/posts/editor/useMediaUpload.ts`) keeps `mediaId` from `serverData` and passes ids into `submitPost`. |

The live composer (`composer-sheet.tsx`) has photo/camera `<input>` elements whose `onChange` is `() => {}`. It does **not** call UploadThing. Social/arena posts created from the composer have no attachments.

Next image config allows `https://utfs.io` (`next.config.mjs`).
