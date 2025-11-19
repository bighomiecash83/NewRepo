# 🎨 DMF Frontend - Complete UI Architecture

**Status**: Final Layer Design  
**Framework**: Next.js 14+ (App Router)  
**Database**: Firebase Firestore  
**Scope**: Everything DMF built, visible and controllable

---

## 🗺️ Complete Page Map (Everything We Built, Actually Visible)

### A. OWNER / EXEC DASHBOARD

**Route**: `/owner/dashboard`

**Purpose**: Bird's-eye view of entire DMF operation

**Components**:
- **KPI Cards** (top 4):
  - Total streams (all time, this month, this week)
  - Revenue this month
  - Active releases vs pending QC
  - Active clients & services running

- **Catalog Health Widget**:
  - Tracks missing ISRC
  - Tracks missing UPC
  - Tracks missing BMI/ASCAP
  - Tracks missing SoundExchange

- **Migration Status Board** (Symphonic → DMF):
  - NOT_STARTED count
  - IN_PROGRESS count
  - LIVE_DMF count
  - TAKEDOWN_READY count
  - SYMPHONIC_CLOSED count

- **StreamGod Alerts** (live feed):
  - "10 tracks missing SoundExchange"
  - "5 releases failed QC"
  - "3 clients overdue on invoice"
  - "2 bots offline"

- **Recent Activity**:
  - Last 10 releases uploaded
  - Last 10 client orders
  - Last 10 legal cases opened

**Firestore Collections Read**:
- `releases` (all)
- `artists` (all)
- `clients` (all)
- `services` (active orders only)
- `streamgod_tasks` (alerts)
- `activity_log` (recent only)

**Key Actions**:
- "Create Release" → `/catalog/new`
- "View Catalog" → `/catalog`
- "Manage Roster" → `/roster`
- "Run StreamGod" → `/streamgod`

---

### B. CATALOG & DISTRIBUTION

#### B1. Catalog Index

**Route**: `/catalog`

**Purpose**: Full release inventory with QC status

**Components**:
- **Table/Card View Toggle**:
  - Columns: Cover, Title, Artist, Label, UPC, Status, QC Score, Migration Status

- **Filters**:
  - By label (DMF Records, Fly Hoolie ENT, OBMB, etc.)
  - By artist (dropdown autocomplete)
  - By status (LIVE_SYMPHONIC, LIVE_DMF, DRAFT, BLOCKED, ARCHIVED)
  - By QC score (< 50, 50-75, 75-90, > 90)
  - By migration status (NOT_STARTED, IN_PROGRESS, LIVE_DMF, TAKEDOWN_READY)

- **Search**:
  - By title, artist, UPC

- **Bulk Actions**:
  - "Prepare for DMF" (multiple releases)
  - "Flag for QC Review"
  - "Archive"

**Firestore Collections Read**:
- `releases` (all fields)

**Key Actions**:
- Click row → `/catalog/:releaseId`
- "Create Release" → form opens
- "Export to CSV" → download

---

#### B2. Release Detail

**Route**: `/catalog/:releaseId`

**Purpose**: Complete release information + distribution + QC

**Components**:
- **Header Section**:
  - Cover art (large)
  - Title, Primary Artist
  - Label, Release Date
  - Status badge (LIVE_SYMPHONIC, LIVE_DMF, DRAFT, BLOCKED)
  - QC Score gauge

- **Basic Info Panel**:
  - UPC, ISRC codes
  - Genre, Subgenre
  - Explicit flag
  - Release date
  - Copyright notice

- **Track List** (table):
  - Track #, Title, Duration, ISRC
  - Writer splits (%)
  - PRO status (BMI/ASCAP/SESAC/Unregistered)
  - Each row editable

- **Distribution Status Panel**:
  - DSPs live on: Spotify, Apple Music, YouTube, SoundCloud, etc.
  - Last updated timestamp
  - Symphonic status (LIVE, SCHEDULED, INACTIVE)
  - DMF status (NOT_SENT, QUEUED, LIVE, FAILED)

- **Distribution Actions**:
  - [Button] "Prepare DMF Delivery"
  - [Button] "Send to DSPs"
  - [Button] "Mark Symphonic Takedown Completed"
  - [Button] "Archive Release"

- **QC & Risk Section**:
  - Risk flags:
    - Samples detected (AI analysis)
    - Missing credits
    - Duplicate title in DSPs
    - Low metadata quality
    - Potential copyright issues
  - StreamGod recommendations

- **Metadata Issues** (if any):
  - "Missing ISRC: Track 3"
  - "PRO mismatch: Track 1 BMI vs Track 2 ASCAP"
  - "SoundExchange not linked"

- **Contributors Panel**:
  - Artist (featured/non-featured)
  - Songwriter splits
  - Producer
  - Label info

**Firestore Collections Read**:
- `releases/{releaseId}` (all)
- `releases/{releaseId}/tracks` (subcollection)
- `artists` (linked artistIds)

**Key Actions**:
- Edit any field (title, genre, metadata)
- Add/remove tracks
- Edit splits
- View full distribution history
- Trigger QC rescan
- Mark for migration

---

#### B3. Migration Board

**Route**: `/distribution/migration`

**Purpose**: Kanban-style migration from Symphonic → DMF

**Components**:
- **Kanban Columns** (drag-and-drop):
  1. **NOT_STARTED** (releases not yet migrated)
  2. **READY_FOR_DMF_UPLOAD** (metadata clean, ready to send)
  3. **LIVE_DMF** (now live on DMF DSPs)
  4. **SAFE_TO_TAKEDOWN** (DMF live and stable, ready to close Symphonic)
  5. **SYMPHONIC_CLOSED** (takedown complete, archived)

- **Cards in each column**:
  - Cover art (small)
  - Title
  - Primary artist
  - Symphonic DSP count
  - DMF readiness score
  - "Next step" button

- **StreamGod Suggestions**:
  - "Top 5 releases ready to migrate: ..."
  - "10 releases missing metadata for DMF"

- **Bulk Migration**:
  - Select multiple releases
  - "Move to DMF Delivery" (all at once)
  - "Start Symphonic Takedown" (all at once)

**Firestore Collections Read**:
- `releases` (status field)
- `migration_tasks` (if exists)

**Key Actions**:
- Drag card between columns
- Click card → `/catalog/:releaseId`
- "Fix Metadata" → edit form
- "Ready to Deliver" → marks for DMF

---

### C. ROSTER & CLIENTS

#### C1. Roster Index

**Route**: `/roster`

**Purpose**: DMF artist roster management

**Components**:
- **Card View** (grid layout):
  - Artist photo
  - Name (clickable)
  - Label imprint (DMF Records, Fly Hoolie ENT, OBMB)
  - Active releases count
  - Last release date
  - Total streams (this year)
  - Status badge (Active, On Hold, Development)
  - Revenue share (if applicable)

- **Filters**:
  - By label
  - By status (Active, On Hold, Development, Inactive)
  - By genre
  - By contract type (Exclusive, Non-Exclusive, Independent)

- **Search**:
  - By artist name

- **View Toggle**:
  - Grid view (cards)
  - List view (table)

**Firestore Collections Read**:
- `artists` (all)
- `releases` (grouped by primaryArtistId)

**Key Actions**:
- Click card → `/roster/:artistId`
- "+ Create Artist" → new form
- "Create Release for Artist" (bulk action)

---

#### C2. Artist Detail

**Route**: `/roster/:artistId`

**Purpose**: Artist profile + services + contract

**Components**:
- **Artist Profile Header**:
  - Large photo
  - Name, stage name
  - Bio (editable)
  - Social links (Instagram, TikTok, Twitter, Spotify)

- **Contract Info**:
  - Contract type (Exclusive/Non-Exclusive/Independent)
  - Term (start date, end date)
  - Termination clause summary
  - Revenue split percentage
  - Link to full contract (PDF, external storage)

- **Statistics Panel**:
  - Total streams
  - Total revenue
  - Active releases
  - Top 5 songs (by streams)
  - Growth chart (last 12 months)

- **Active Services**:
  - Distribution ✅
  - Marketing campaigns (count)
  - Branding package (y/n)
  - Legal services (y/n)
  - Other services (list)

- **Releases Tab**:
  - Table of all releases by this artist
  - Status, release date, streams, revenue

- **Actions**:
  - [Button] "Create New Release"
  - [Button] "Add Service Package"
  - [Button] "Manage Contract"
  - [Button] "Send Message"

**Firestore Collections Read**:
- `artists/{artistId}`
- `releases` (where primaryArtistId = artistId)
- `contracts/{artistId}`
- `services_ordered` (by artistId)

**Key Actions**:
- Edit profile
- Create release
- Manage services
- View contract
- Message artist

---

#### C3. Clients Index

**Route**: `/clients`

**Purpose**: Non-roster B2B client management

**Components**:
- **Client Cards** (grid):
  - Client logo/brand image
  - Name
  - Service tier (Bronze, Silver, Gold, Custom)
  - Assigned A&R or account manager
  - Next due date / invoice
  - Status (Active, Pending, Inactive)
  - Quick stats (releases, campaigns, etc.)

- **Filters**:
  - By tier (Bronze, Silver, Gold, Custom)
  - By manager
  - By status
  - By industry/genre

- **Search**:
  - By client name

**Firestore Collections Read**:
- `clients` (all)

**Key Actions**:
- Click card → `/clients/:clientId`
- "+ Add Client" → new form
- "Send Invoice" (bulk action)

---

#### C4. Client Detail

**Route**: `/clients/:clientId`

**Purpose**: Client profile + services + deliverables

**Components**:
- **Client Profile**:
  - Logo, name, brand info
  - Contact person(s)
  - Email, phone, website
  - Industry/genre
  - Service tier

- **Service Package**:
  - Services purchased (distribution, campaigns, audits, legal, etc.)
  - Cost per service
  - Total monthly cost

- **Deliverables & Timeline**:
  - List of commitments with deadlines
  - Status (Not Started, In Progress, Complete, Overdue)
  - Assigned to team member

- **Files & Assets**:
  - Uploaded files (organized by service)
  - Latest master files
  - Links to external storage (Drive, Dropbox)

- **Invoicing**:
  - Recent invoices (table)
  - Payment status
  - Next invoice date
  - Send invoice button

- **Notes** (internal):
  - Last contact date
  - Important info
  - Follow-up tasks

**Firestore Collections Read**:
- `clients/{clientId}`
- `services_ordered` (by clientId)
- `invoices` (by clientId)

**Key Actions**:
- Edit profile
- Create service order
- Upload assets
- Send invoice
- Update status

---

### D. SERVICES & PRICING

#### D1. Services Grid

**Route**: `/services`

**Purpose**: Browse all DMF services

**Components**:
- **Service Cards** (grid layout):
  - Service name
  - Icon/graphic
  - Short description
  - Price or price range
  - Turnaround time
  - "Book for Artist" button
  - "Book for Client" button

- **Services Shown**:
  - Distribution packages (basic, plus, premium)
  - AI marketing campaigns
  - Anti-bot audits
  - Legal/IP takedowns (Gavel Syndicate)
  - Brand kits & design
  - Metadata cleanup
  - Audio mastering
  - Music video production
  - Social media management
  - A&R consulting
  - (Whatever your full service menu is)

- **Filters**:
  - By category (Distribution, Marketing, Legal, Production, Consulting)
  - By price range
  - By turnaround time

**Firestore Collections Read**:
- `services` (all)

**Key Actions**:
- Click card → `/services/:serviceId`
- "Book for Artist" → service order form
- "Book for Client" → service order form

---

#### D2. Service Detail

**Route**: `/services/:serviceId`

**Purpose**: Detailed service breakdown

**Components**:
- **Overview**:
  - Service name, icon
  - Full description
  - Price (fixed or custom quote)
  - Turnaround time
  - Available add-ons

- **What's Included**:
  - Bulleted list of deliverables
  - Detailed specs

- **Requirements**:
  - Assets needed (master files, metadata, etc.)
  - Budget expectations
  - Links/info needed
  - Timeline

- **Internal Checklist** (staff view only):
  - Step-by-step process for staff to fulfill
  - QC checkpoints
  - Sign-off steps

- **Call-to-Action**:
  - "Book this service" button
  - Trigger order form

**Firestore Collections Read**:
- `services/{serviceId}`

**Key Actions**:
- Book service (opens order form)
- Request custom quote
- View FAQ

---

#### D3. Orders Index

**Route**: `/orders`

**Purpose**: Track all service orders

**Components**:
- **Table of Orders**:
  - Order ID
  - Client/Artist name
  - Service
  - Status (NEW, IN_PROGRESS, WAITING_ON_CLIENT, COMPLETE, ON_HOLD)
  - Order date
  - Due date
  - Assigned to
  - Progress bar (% complete)

- **Filters**:
  - By status
  - By client/artist
  - By service
  - By assigned team member

- **Bulk Actions**:
  - Mark as complete
  - Reassign team member

**Firestore Collections Read**:
- `orders` (all)

**Key Actions**:
- Click row → order detail view
- Update status
- Add note
- Message team member

---

### E. STREAMGOD / RYIA BOSS PLAYGROUND

#### E1. StreamGod Console

**Route**: `/streamgod`

**Purpose**: AI control room for catalog intelligence

**Components**:
- **Prompt Interface**:
  - Large text box: "What do you want StreamGod to analyze or do?"
  - Example prompts visible below
  - Submit button

- **Quick Action Buttons**:
  - "Scan catalog for missing PRO info"
  - "Generate marketing plan for top 5 tracks"
  - "Find releases with migration issues"
  - "Detect sample usage risks"
  - "Recommend next migration batch"
  - "Find artists needing follow-up"

- **Output Area**:
  - Cards with StreamGod responses:
    - Recommendation cards
    - Warning cards
    - Analysis cards
    - Generated task cards

- **Recent Analyses**:
  - List of previous StreamGod queries + results
  - Searchable, sortable

**Firebase Functions Called**:
- `streamgod_analyze` (via httpsCallable)
- `streamgod_generate_tasks` (via httpsCallable)
- `streamgod_recommendations` (via httpsCallable)

**Key Actions**:
- Submit prompt
- "Create Tasks from This" (auto-generate tasks)
- "View Full Analysis"
- Pin/favorite analyses

---

#### E2. StreamGod Tasks

**Route**: `/streamgod/tasks`

**Purpose**: Tasks auto-generated by StreamGod

**Components**:
- **Task List** (table):
  - Task description
  - Generated from (which StreamGod analysis)
  - Status (NEW, IN_PROGRESS, COMPLETE, CANCELLED)
  - Priority (High, Medium, Low)
  - Assigned to
  - Due date

- **Filters**:
  - By status
  - By priority
  - By assigned person
  - By source (StreamGod, Manual, Client)

- **Task Detail** (click to expand):
  - Full description
  - Related release/artist
  - Metadata to fix (specific)
  - Checklist for completion
  - Comment thread

**Firestore Collections Read**:
- `streamgod_tasks` (all)
- `releases` (referenced tasks)

**Key Actions**:
- Update status
- Assign to team member
- Add comment
- Link to release/artist
- Mark complete

---

#### E3. Bots Division View

**Route**: `/streamgod/bots`

**Purpose**: View 10,000-bot architecture at high level

**Components**:
- **Bot Divisions** (cards):
  - Legal Division (bots: X, active: Y, tasks completed: Z)
  - Marketing Division (bots: X, active: Y, campaigns run: Z)
  - Analytics Division (bots: X, active: Y, insights generated: Z)
  - Catalog Division (bots: X, active: Y, items scanned: Z)
  - Anti-Piracy Division (bots: X, active: Y, takedowns: Z)

- **Each Division Card Shows**:
  - Name
  - Bot count (summarized)
  - Active bot count
  - Health status (All Green / X Issues)
  - Last activity timestamp
  - Quick stats

- **Top Section**:
  - Total bots online
  - Total bots idle
  - Total tasks assigned
  - Overall system health gauge

- **Click Division** → more detail (optional v2 feature)

**Firestore Collections Read**:
- `bots_divisions` (summary collection)
- `bots_status` (real-time heartbeat)

**Key Actions**:
- View division details (future)
- Enable/disable division (admin only)
- View logs

---

### F. LEGAL / GAVEL SYNDICATE

#### F1. Legal Dashboard

**Route**: `/legal`

**Purpose**: Overview of legal issues + takedowns

**Components**:
- **Active Cases Widget**:
  - Count of open cases
  - By type (Takedown, Copyright, Contract, Other)
  - Most urgent case

- **Takedown Requests** (recent):
  - List of takedown requests
  - Source (DMCA, Orchard, Rights Holder, etc.)
  - Status (NEW, IN_PROGRESS, COMPLETED)
  - Assigned to

- **Upcoming Expirations**:
  - Contracts expiring (next 30 days)
  - Service agreements
  - Artist deals

- **Quick Actions**:
  - "File Takedown"
  - "Add Case"
  - "Upload Contract"

**Firestore Collections Read**:
- `legal_cases` (open)
- `contracts` (expiring)

**Key Actions**:
- Click case → `/legal/cases/:caseId`
- File new case
- Upload document

---

#### F2. Cases Index

**Route**: `/legal/cases`

**Purpose**: All legal cases in one place

**Components**:
- **Case Table**:
  - Case ID
  - Type (Takedown, Copyright, Contract, Dispute)
  - Title / Description
  - Status (NEW, IN_PROGRESS, PENDING_RESPONSE, RESOLVED, CLOSED)
  - Created date
  - Assigned to
  - Link to docs

- **Filters**:
  - By status
  - By type
  - By assigned person

- **Search**:
  - By case ID or description

**Firestore Collections Read**:
- `legal_cases` (all)

**Key Actions**:
- Click → case detail
- Create new case
- Download case docs

---

#### F3. Case Detail

**Route**: `/legal/cases/:caseId`

**Purpose**: Full case file

**Components**:
- **Case Summary**:
  - Case ID, type
  - Description
  - Status
  - Created date
  - Assigned to
  - Due date

- **Timeline**:
  - Events (created, assigned, updated, resolved)
  - Timestamps

- **Documents**:
  - List of attached files
  - Links to external storage (GDrive, Dropbox)
  - Option to upload more

- **Notes**:
  - Internal comment thread
  - Decision log

- **Actions**:
  - Update status
  - Reassign
  - Add note
  - Upload document

**Firestore Collections Read**:
- `legal_cases/{caseId}`
- `legal_cases/{caseId}/documents` (subcollection)

**Key Actions**:
- Update status
- Add comment
- Upload doc
- Mark resolved

---

### G. SETTINGS & CONFIGURATION

#### G1. Settings Hub

**Route**: `/settings`

**Purpose**: System configuration + branding + integrations

**Components**:
- **Tabs**:
  1. **Organization**
     - DMF company info
     - Logo upload
     - Address, phone, email
     - Website

  2. **Branding**
     - Primary color (blue, gold, white, black)
     - Logo variants
     - Brand guidelines link
     - Favicon

  3. **Labels**
     - DMF Records (default)
     - Fly Hoolie ENT
     - OBMB
     - Other custom labels
     - Each label: logo, contact, revenue split, etc.

  4. **User Roles & Permissions**
     - Owner / Admin / Staff / Artist / Client / Bot Manager
     - Permissions matrix (what each role can do)

  5. **Integrations**
     - Firebase project ID (display only)
     - Payment provider (Stripe/PayPal credentials - sensitive)
     - Email provider (SendGrid/AWS SES)
     - Storage integration (Google Drive, Dropbox)
     - DSP credentials (Symphonic, Tunecore, etc.)
     - Webhook endpoints

  6. **API Keys**
     - Generate API key for bot integrations
     - Revoke old keys
     - View usage

  7. **Backup & Data**
     - Last backup timestamp
     - Backup frequency
     - Download backup
     - Data retention policy

**Firestore Collections Read/Write**:
- `config/settings` (all)

**Key Actions**:
- Update any setting
- Upload logo
- Add label
- Manage API keys
- Test integrations

---

## 🏗️ Next.js Folder Structure

```
dmf-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                 (shared nav + sidebar)
│   │   │
│   │   ├── owner/
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   │
│   │   ├── catalog/
│   │   │   ├── page.tsx               (index)
│   │   │   ├── [releaseId]/
│   │   │   │   └── page.tsx           (detail)
│   │   │   └── new/
│   │   │       └── page.tsx           (create form)
│   │   │
│   │   ├── distribution/
│   │   │   └── migration/
│   │   │       └── page.tsx           (kanban board)
│   │   │
│   │   ├── roster/
│   │   │   ├── page.tsx               (index)
│   │   │   ├── [artistId]/
│   │   │   │   └── page.tsx           (detail)
│   │   │   └── new/
│   │   │       └── page.tsx           (create form)
│   │   │
│   │   ├── clients/
│   │   │   ├── page.tsx               (index)
│   │   │   ├── [clientId]/
│   │   │   │   └── page.tsx           (detail)
│   │   │   └── new/
│   │   │       └── page.tsx           (create form)
│   │   │
│   │   ├── services/
│   │   │   ├── page.tsx               (grid)
│   │   │   ├── [serviceId]/
│   │   │   │   └── page.tsx           (detail)
│   │   │   └── orders/
│   │   │       ├── page.tsx           (index)
│   │   │       └── [orderId]/
│   │   │           └── page.tsx       (detail)
│   │   │
│   │   ├── streamgod/
│   │   │   ├── page.tsx               (console)
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx           (task list)
│   │   │   └── bots/
│   │   │       └── page.tsx           (divisions)
│   │   │
│   │   ├── legal/
│   │   │   ├── page.tsx               (overview)
│   │   │   └── cases/
│   │   │       ├── page.tsx           (index)
│   │   │       ├── [caseId]/
│   │   │       │   └── page.tsx       (detail)
│   │   │       └── new/
│   │   │           └── page.tsx       (create form)
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   └── layout.tsx                      (root layout)
│
├── components/
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── CatalogHealthWidget.tsx
│   │   ├── MigrationStatusBoard.tsx
│   │   ├── AlertsFeed.tsx
│   │   └── RecentActivityList.tsx
│   │
│   ├── catalog/
│   │   ├── ReleaseTable.tsx
│   │   ├── ReleaseCard.tsx
│   │   ├── ReleaseDetailHeader.tsx
│   │   ├── TrackListTable.tsx
│   │   ├── DistributionStatusPanel.tsx
│   │   ├── QCRiskPanel.tsx
│   │   └── MigrationKanban.tsx
│   │
│   ├── roster/
│   │   ├── ArtistCard.tsx
│   │   ├── ArtistProfileHeader.tsx
│   │   ├── ArtistStatistics.tsx
│   │   ├── ClientCard.tsx
│   │   └── ClientProfileHeader.tsx
│   │
│   ├── services/
│   │   ├── ServiceCard.tsx
│   │   ├── ServiceGrid.tsx
│   │   ├── OrderTable.tsx
│   │   └── ServiceOrderForm.tsx
│   │
│   ├── streamgod/
│   │   ├── PromptBox.tsx
│   │   ├── QuickActionButtons.tsx
│   │   ├── AnalysisCard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── BotDivisionCard.tsx
│   │   └── BotHealthGauge.tsx
│   │
│   ├── legal/
│   │   ├── CaseCard.tsx
│   │   ├── CaseTable.tsx
│   │   └── DocumentUpload.tsx
│   │
│   ├── shared/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── FormInput.tsx
│   │   └── ConfirmDialog.tsx
│   │
│   └── layout/
│       ├── DashboardLayout.tsx
│       └── AuthLayout.tsx
│
├── lib/
│   ├── firebase.ts                     (init + helpers)
│   ├── auth.ts                         (auth hooks)
│   ├── hooks/
│   │   ├── useReleases.ts
│   │   ├── useArtists.ts
│   │   ├── useClients.ts
│   │   ├── useServices.ts
│   │   ├── useLegalCases.ts
│   │   ├── useStreamGod.ts
│   │   └── useOrders.ts
│   │
│   ├── types/
│   │   ├── release.ts
│   │   ├── artist.ts
│   │   ├── client.ts
│   │   ├── service.ts
│   │   ├── order.ts
│   │   ├── legal.ts
│   │   ├── task.ts
│   │   └── bot.ts
│   │
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── helpers.ts
│
├── styles/
│   ├── globals.css
│   ├── tailwind.config.ts
│   └── theme.ts                       (DMF brand colors)
│
├── .env.local                          (Firebase creds, secrets)
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 🔗 Firestore Collections & Fields (By Page)

### Collections Overview

```
artists/
  {artistId}:
    - stageName
    - legalName
    - photo
    - bio
    - socials { instagram, tiktok, twitter, spotify }
    - label (DMF Records, Fly Hoolie ENT, OBMB)
    - contractType (Exclusive, Non-Exclusive, Independent)
    - contractStart
    - contractEnd
    - revenueSplit (0.0-1.0)
    - status (Active, On Hold, Development, Inactive)
    - totalStreams
    - createdAt
    - updatedAt

releases/
  {releaseId}:
    - title
    - type (Single, EP, Album)
    - primaryArtistId (FK)
    - label
    - upc
    - genre
    - subGenre
    - explicit
    - releaseDate
    - coverArtUrl
    - status (DRAFT, LIVE_SYMPHONIC, LIVE_DMF, BLOCKED, ARCHIVED)
    - qcScore (0-100)
    - migrationStatus (NOT_STARTED, IN_PROGRESS, LIVE_DMF, TAKEDOWN_READY, SYMPHONIC_CLOSED)
    - symphonic { status, liveOn[], lastUpdate }
    - dmf { status, queuedAt, liveAt, liveOn[] }
    - royaltyCheckRequired (bool)
    - contributors[ { artistId, roles[], splitShare } ]
    - createdAt
    - updatedAt
    - tracks/ (subcollection)
      {trackId}:
        - title
        - duration
        - isrc
        - writers[ { name, role, splitShare } ]
        - proStatus { bmi, ascap, sesac, unregistered }

clients/
  {clientId}:
    - name
    - logo
    - contactPerson
    - email
    - phone
    - website
    - industry
    - serviceTier (Bronze, Silver, Gold, Custom)
    - assignedManager
    - nextInvoiceDate
    - status (Active, Pending, Inactive)
    - createdAt
    - updatedAt

services/
  {serviceId}:
    - name
    - category (Distribution, Marketing, Legal, Production, Consulting)
    - description
    - price
    - turnaroundDays
    - deliverables[]
    - requirements[]
    - addOns[ { name, price } ]
    - internalChecklist[]

orders/
  {orderId}:
    - clientId OR artistId
    - serviceId
    - status (NEW, IN_PROGRESS, WAITING_ON_CLIENT, COMPLETE, ON_HOLD)
    - orderDate
    - dueDate
    - assignedTo
    - progress (0-100)
    - notes
    - files[]
    - createdAt
    - updatedAt

streamgod_tasks/
  {taskId}:
    - description
    - generatedFrom (streamgod analysis id)
    - status (NEW, IN_PROGRESS, COMPLETE, CANCELLED)
    - priority (High, Medium, Low)
    - assignedTo
    - dueDate
    - relatedReleaseId (FK)
    - relatedArtistId (FK)
    - checklist[ { item, done } ]
    - createdAt
    - updatedAt

legal_cases/
  {caseId}:
    - caseId
    - type (Takedown, Copyright, Contract, Dispute)
    - title
    - description
    - status (NEW, IN_PROGRESS, PENDING_RESPONSE, RESOLVED, CLOSED)
    - createdDate
    - assignedTo
    - dueDate
    - relatedReleaseId (FK)
    - relatedArtistId (FK)
    - documents/ (subcollection)
      {docId}:
        - name
        - url (external storage link)
        - uploadedAt
    - notes
    - createdAt
    - updatedAt

bots_divisions/
  legal:
    - botCount
    - activeBotCount
    - healthStatus
    - lastActivity
    - tasksCompleted
  marketing:
    - botCount
    - activeBotCount
    - healthStatus
    - lastActivity
    - campaignsRun
  analytics:
    - botCount
    - activeBotCount
    - healthStatus
    - lastActivity
    - insightsGenerated
  catalog:
    - botCount
    - activeBotCount
    - healthStatus
    - lastActivity
    - itemsScanned
  antiPiracy:
    - botCount
    - activeBotCount
    - healthStatus
    - lastActivity
    - takedownsCompleted

config/settings:
  - organizationName
  - logo
  - address
  - phone
  - email
  - website
  - primaryColor
  - labels[ { name, logo, contact, revenueSplit } ]
  - firebaseProjectId
  - integrations { stripe, sendgrid, drive, dropbox, etc. }
  - apiKeys[]
  - lastBackup
```

---

## 🔐 Role-Based Access Control (RBAC)

```
Owner / Admin:
  - View all pages
  - Edit all fields
  - Manage users
  - Access settings
  - Create labels
  - View analytics

Staff:
  - View dashboard, catalog, roster, clients, services, orders, legal
  - Cannot: manage settings, delete users, create labels, change access levels

Artist / Client:
  - View own releases, own profile, own orders
  - Create releases (with approval)
  - Cannot: view other artists/clients, access admin areas

StreamGod / Bot Manager:
  - View StreamGod console, tasks, bots
  - Trigger analyses
  - Create tasks
  - Cannot: edit release metadata (must be human staff)
```

---

## 🚀 Implementation Priority

**Phase 1 (MVP)**:
- Auth (login, signup, roles)
- Owner dashboard (KPIs + alerts)
- Catalog (index + detail)
- Roster (index + detail)
- Services (browse + book)

**Phase 2**:
- Distribution migration board
- Client management
- Orders management
- Legal cases

**Phase 3**:
- StreamGod console + tasks
- Bots divisions
- Advanced analytics
- Integrations

---

## ✅ What This Gives You

✅ **Not a simple distributor panel** – Full command center  
✅ **Everything you built, visible** – Catalog, roster, clients, services, AI, legal, bots  
✅ **Role-based access** – Owner sees all, artists see their releases, staff see assigned work  
✅ **Complete workflow** – From release creation through migration through takedown  
✅ **AI integration** – StreamGod console right in the app  
✅ **Professional branding** – DMF colors, labels, company info  

---

**Status**: Architecture Complete  
**Ready to Build**: ✅ Yes  
**Ready to Implement**: ✅ Yes  

Devs can start building page-by-page using this structure. Each page knows which Firestore collections it reads, which it writes to, and what Firebase Functions it calls.
