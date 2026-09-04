// Placeholder entries — swap in real titles, copy, links, and media.
export const projects = [
  {
    slug: 'puac-practice-manager',
    title: 'Purdue Archery Club — Practice Manager & Website',
    description:
      'Membership, QR practice check-in, pass sales, and the public website for Purdue\'s Archery Club, built on Discord as the source of truth for identity.',
    summary:
      'Purdue Archery Club used to run practice check-in off a paper sign-in sheet, RSVPs that lived in Discord and nowhere else, and passes tracked by memory. I built a Firebase app that logs members in with the Discord account the club already uses for everything else, checks them into practice with a QR scan, sells and tracks their passes, and lets officers edit the public website without a code deploy. It\'s been live at purduearchery.club since 2025.',
    year: '2025',
    role: 'Solo — Purdue University Archery Club',
    stack: ['React 18', 'React Router 6', 'Vite', 'Firebase', 'Cloud Functions', 'Firestore', 'Discord API', 'Resend'],
    links: [{ label: 'Live site', href: 'https://purduearchery.club' }],
    // No poster yet — swap in a real screenshot or clip once captured.
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Every club member is already on the club Discord — that\'s where practices get scheduled, where officers post, where bans already happen when someone needs to be removed. Rather than build a second identity system next to it, I built the whole platform on top of it: sign in with Discord, and that\'s the same account Discord already manages roles and bans for. Everything downstream — who\'s an officer, who\'s allowed in, whose pass is active — reads off that one login. What started as "replace the paper sign-in sheet" grew into membership, QR check-in, pass sales pulled automatically off order emails, a staff dashboard, and a CMS for the public site, all on one Firestore project.',
      },
      // TODO: screenshot — landing page hero / photo pile
      {
        type: 'image',
        src: '/projects/puac-landing.png',
        alt: 'Purdue Archery Club landing page with animated hero and photo pile',
        caption: 'The public landing page — copy, pricing cards, and the photo pile are all officer-editable, not hardcoded.',
      },
      { type: 'heading', text: 'Membership & identity' },
      {
        type: 'list',
        items: [
          'Discord OAuth2 is the only sign-in path — no separate password system to manage or leak. Login state mirrors live off a Firestore onSnapshot, so a ban or role change in Discord reaches an already-open tab within a second.',
          'Every member gets a digital pass at /my-id: a QR code encoding an opaque, rotatable scan token rather than a hash of their user ID, so a lost phone can be re-keyed without touching their identity.',
          'A Resend-backed magic-link flow verifies a member\'s Purdue or personal email against club records.',
          'First-time sign-ins go through a profile completion flow — name, pronouns, avatar — before landing anywhere else.',
          'Officer routes and actions are gated by role, enforced twice: OfficerRoute in the UI, and again in Firestore security rules, so the UI check is a convenience, not the actual boundary.',
        ],
      },
      // TODO: screenshot — /my-id QR pass screen
      {
        type: 'image',
        src: '/projects/puac-my-id.png',
        alt: 'Personal digital pass page showing a member QR code',
        caption: 'A member\'s /my-id pass. The QR encodes a rotatable token, not anything derived from their account.',
      },
      { type: 'heading', text: 'Practice attendance & QR check-in' },
      {
        type: 'text',
        text: 'Practices already exist as scheduled events in the club Discord, so I didn\'t duplicate that scheduling anywhere — a sync job pulls them in every 15 minutes and filters to the ones that read as an actual practice rather than a competition or social. But the scheduled practice and what actually happens on a given night are kept as separate records on purpose. A session opens itself on the first QR scan of the night — there\'s no manual "start" button — and closes itself either aligned to the scheduled window or 3 hours after that first scan for an unscheduled drop-in, with officers able to end one early by hand.',
      },
      {
        type: 'list',
        items: [
          '/scan is the officer-facing check-in screen: the barcode-detector API drives a live camera scan, with a manual check-in fallback for a dead phone or a camera that won\'t cooperate under gym lighting.',
          'A member\'s full attendance history is queryable across schema versions via a Firestore collection-group query at /my-practices, so an old attendance record written under a previous schema doesn\'t just disappear from their history.',
          'Deleting a practice is modeled as a real operation, not a hide: it refunds any day passes spent on it, removes the Discord event, and recursively deletes every attendance record tied to it. Hiding one, by contrast, only pulls it from staff-facing lists and leaves history untouched — those are deliberately two different buttons.',
        ],
      },
      // TODO: screen recording — /scan officer QR check-in flow
      {
        type: 'video',
        src: '/projects/puac-scan.mp4',
        poster: '/projects/puac-scan.jpg',
        ratio: '1280 / 740',
        caption: 'The /scan officer check-in screen, live camera scan against the barcode-detector API.',
      },
      { type: 'heading', text: 'Pass & payment system' },
      {
        type: 'list',
        items: [
          'Term and day pass pricing and color are pulled from the same officer-editable content that drives the public pricing cards, so a pass can\'t be advertised in one color and issued in another.',
          'A scheduled Cloud Function scrapes TooCOOL order-confirmation emails off Gmail every 5 minutes, writes the resulting pass straight to Firestore, and sends the member a Resend confirmation — deliberately decoupled so a Resend outage can never block a purchase from actually registering.',
          'Day-pass economics — burning a credit, buying at the door, refunding a rained-out night — all move through idempotent, transaction-safe Firestore operations, specifically so two officers refunding the same night at the same time can\'t double-refund it.',
          'Officers can manually issue or adjust a pass (setMemberPass, issuePassAndCheckIn) for the cases automation can\'t cover — walk-ins, comps, corrections.',
        ],
      },
      { type: 'heading', text: 'Discord integration' },
      {
        type: 'text',
        text: 'Discord stays the single source of truth for bans and RSVPs instead of the site keeping its own copy — one extra API round trip on every sign-in, in exchange for never having two systems disagree about who\'s banned. The site checks Discord\'s ban list on every login and mirrors it into a Firestore flag for real-time lockout, and there is deliberately no "unban" button anywhere in the app — lifting a ban happens in Discord, where the ban lives.',
      },
      {
        type: 'list',
        items: [
          'Guild member count syncs every 6 hours into a rolled-up time series (joins over time, percent of the server with a site account), charted on the staff overview — and when Discord\'s privileged intents aren\'t available, it shows why the data is missing instead of silently rendering a blank chart.',
          'Slash commands (/pass, /session) let members and officers pull pass links and live session headcounts from inside Discord itself, without exposing member PII to the rest of the server.',
        ],
      },
      { type: 'heading', text: 'Staff dashboard' },
      {
        type: 'text',
        text: 'The officer side is a full internal admin tool at /dashboard, tabbed and swipeable on mobile since officers run most of this from their phones at practice. Every chart on it — bar, line, heatmap, sparkline — and every piece of shared UI — data table, drawer, confirm dialog, toasts, collapsible sections, stat tiles — is hand-built rather than pulled from a charting or component library.',
      },
      {
        type: 'list',
        items: [
          'Overview: attendance and membership charts plus the Discord growth stats.',
          'Members: a searchable, filterable table with CSV export and a per-member drawer for editing pass status, issuing refunds, banning, or permanently deleting an account. Deletion anonymizes rather than deletes attendance history, so club-wide night-counts stay accurate without retaining anyone\'s identity.',
          'Practices: a schedule view with a drawer per practice or session for closing a session early, refunding a rained-out night, or deleting a practice — with an explicit confirmation that lists exactly what\'s about to be removed.',
          'Website: the CMS for the public site.',
        ],
      },
      // TODO: screenshot — dashboard members table with drawer open
      {
        type: 'gallery',
        images: [
          {
            src: '/projects/puac-dashboard-overview.png',
            alt: 'Staff dashboard overview tab with attendance and membership charts',
            caption: 'Dashboard overview: attendance, membership, and Discord growth charts, all hand-built.',
          },
          {
            src: '/projects/puac-dashboard-members.png',
            alt: 'Staff dashboard members table with a per-member drawer open',
            caption: 'The members table, with the drawer for pass edits, refunds, bans, and deletion.',
          },
        ],
      },
      { type: 'heading', text: 'Editable website content (lightweight CMS)' },
      {
        type: 'text',
        text: 'The parts of the public site that change every semester used to be hardcoded JSX, which meant a code deploy for something as small as a new officer photo. I pulled those sections out into Firestore documents editable from the dashboard: landing copy and pricing cards, the FAQ accordion, officer boards versioned by year (starting a new year prepends a board rather than overwriting the last one), the competitive roster and tournament results by year, the join-page steps and Discord invite link, and footer/social links.',
      },
      {
        type: 'list',
        items: [
          'Officer-uploaded images are downscaled and re-encoded to WebP client-side via Canvas before they ever leave the device — a ~6MB phone photo lands around ~150KB — independent of the separate build-time image optimizer used for committed site assets.',
          'The meetup/range location text is editable, but the map polyline is intentionally left hardcoded — a documented decision to avoid per-request Directions API billing for something that almost never changes.',
          'Every editable section ships with a committed fallback, so a missing document, a failed read, or a half-saved edit renders the last known-good content instead of a blank section. The CMS is designed to fail closed to that fallback, never open to a broken page.',
          'Read access is public, since a logged-out visitor still needs to see the site; write access is officer-only, enforced in Firestore security rules rather than trusted to the client.',
        ],
      },
      // TODO: screen recording — editing a pricing card in the dashboard CMS and seeing it update on the public site
      {
        type: 'video',
        src: '/projects/puac-cms.mp4',
        poster: '/projects/puac-cms.jpg',
        ratio: '1280 / 740',
        caption: 'Editing a pricing card from the dashboard CMS, no deploy required to see it live.',
      },
      { type: 'heading', text: 'Public site' },
      {
        type: 'list',
        items: [
          'Landing page with an animated hero, a polaroid-style photo pile, and scroll cues.',
          'An interactive 360° panorama viewer of the range, built on Photo Sphere Viewer.',
          'Range layout / equipment pages and an officers/team page.',
          'A Google Calendar-style practice and event calendar.',
          'A competitions page with per-year results and photo galleries.',
          'A contact form — the one endpoint reachable while logged out, so it\'s the one hardened the hardest: IP-hashed, transaction-safe rate limiting at 3 per IP per 10 minutes and 30 site-wide per hour, mention-injection suppression so it can\'t be used to @everyone the Discord server, and an origin allowlist.',
          'FAQ, join flow, and merch/sponsorship pages.',
          'Mobile-tuned interaction details — edge-scroll and swipe gesture hooks, device-tilt effects, and viewport-height fixes for mobile browser chrome.',
        ],
      },
      // TODO: screenshot or clip — 360° range panorama viewer
      {
        type: 'gallery',
        images: [
          {
            src: '/projects/puac-panorama.png',
            alt: '360-degree panorama viewer of the archery range',
            caption: 'The 360° range panorama, built on Photo Sphere Viewer.',
          },
          {
            src: '/projects/puac-calendar.png',
            alt: 'Google Calendar-style view of upcoming practices and events',
            caption: 'The public practice/event calendar.',
          },
        ],
      },
      { type: 'heading', text: 'Operations & tooling' },
      {
        type: 'list',
        items: [
          'An "approved driver" sync for club trip logistics: a Power Automate flow watches a university SharePoint spreadsheet, and a paired Cloud Function checks driver approval status off it.',
          'A build-time image optimization script (sharp) for every committed site asset, kept separate from the client-side upload pipeline described above.',
          'One-off migration and backfill scripts for the user schema, email verification backfill, purchase backfill, and resetting Firestore for local dev.',
          'A Discord slash-command registration script.',
          'Firestore security rules and composite indexes are checked into the repo and deployed alongside the functions, not managed by hand in the console.',
        ],
      },
      { type: 'heading', text: 'Testing' },
      {
        type: 'text',
        text: 'Custom Node test scripts run standalone or against the Firestore emulator, covering rate limits, security rules, session windows, pass-expiry math, Discord rollups, and email templates — the rules tests in particular gate deploys, since the rules are the only thing standing between a signed-in member and the rest of the data.',
      },
      { type: 'heading', text: 'Engineering decisions I\'d point to' },
      {
        type: 'list',
        items: [
          'Practices and sessions are deliberately separate records, so the schedule (from Discord) and reality (what actually happened) are allowed to diverge — a missing or stale Discord event never blocks check-in.',
          'Discord stays the single source of truth for bans and RSVPs instead of the site keeping a duplicate copy, trading an extra API round-trip on login for one less place state can drift out of sync.',
          'Every refund/delete path is an idempotent Firestore transaction, written specifically to survive two officers double-clicking the same action at the same time.',
          'Account deletion anonymizes rather than deletes attendance history, so club-wide statistics stay accurate over time without retaining anyone\'s PII.',
          'The CMS fails closed to last-known-good content rather than failing open to a blank or broken page.',
          'Security-sensitive fields like ban flags are denied to every client at the Firestore rules layer, not just hidden in the UI — a member can\'t grant themselves access by calling Firestore directly.',
        ],
      },
      { type: 'heading', text: 'Where this goes next' },
      {
        type: 'text',
        text: 'This started as a fix for a paper sign-in sheet and, one feature at a time, turned into the club\'s de facto back office — membership, payments, attendance, comms, and the public website all in one place. The rough edge that shows up most as the club grows is officer permissions being a single boolean: every officer can currently refund a pass, ban a member, or edit the CMS, when in practice only a few people on the e-board should be able to do some of those. Splitting officer into real per-action roles is the next real piece of work, not a new feature so much as catching the permission model up to how the tool actually gets used now.',
      },
    ],
  },
  {
    slug: 'mailstop-app',
    title: 'MailStop',
    description:
      'Replaced NASA Langley’s 2011 mail routing app with a Power App serving 3,400+ staff.',
    summary:
      'NASA Langley routes all internal mail through MailStop IDs. The app that previously managed them ran on 2011 Oracle APEX. I rebuilt it on Microsoft Power Apps to drop Oracle licensing cost and let staff maintain their own assignments.',
    year: '2025',
    role: 'Solo — Langley Student Volunteer Program',
    stack: ['Power Apps', 'Power Fx', 'SharePoint Lists', 'Oracle APEX'],
    links: [],
    poster: '/projects/mailstop-list.png',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Every piece of mail moving inside NASA Langley is sorted by a MailStop ID, which maps a recipient to one of 190 buildings, down to their room and department, for over 3,400+ staff. The previous app was built with Oracle APEX in 2011. Rising license costs and outdated UI put migration on the table. I rebuilt it as a Microsoft Power App on a SharePoint Lists backend, since Langely has a strong Office 365 agreement. Along the way, I redesigned the data model and search so staff and admins could find their own assignments easier, especailly with so many buildings being renovated and departments being reorganized.',
      },
      {
        type: 'gallery',
        images: [
          {
            src: '/projects/mailstop-landing.png',
            alt: 'LaRC Mailstop landing screen with an Open button',
            caption: 'Landing screen, with the current app version that staff can mention in a bug report.',
          },
          {
            src: '/projects/mailstop-list.png',
            alt: 'Paginated table of MailStops with search and filter controls',
            caption: 'Main list. Search by ID, filter by building or organization.',
          },
        ],
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'The hard part wasn\'t the frontend (though that was tedious), it was the backend swap. The APEX app sat on seven related Oracle tables. SharePoint Lists is flat storage, not a relational database, so every join the old schema relied on had to be reimplemented inside the Power App itself. That constraint drove most of the design.',
      },
      {
        type: 'list',
        items: [
          'Rebuilt the seven table Oracle schema as SharePoint Lists, moving all relational logic into the app layer since Lists cannot enforce it.',
          'Made the MailStop list filterable by ID, building, or organization and paginated it. In addition to performing better, this makes finding a particular stop a quick search rather than a tedious scroll (boring).',
          'Added a validation view that surfaces the records the old system let rot: missing point of contact, no assignees, invalid building, invalid room.',
          'Put mandatory-field checks, an offsite toggle, and POC search into the create flow so bad records are harder to enter than to enter correctly.',
          'Wrote a manual regression checklist to run before each release. Power Apps has no automated testing capabilities, so tests had to be a lengthy document.',
        ],
      },
      { type: 'heading', text: 'Screens' },
      {
        type: 'gallery',
        images: [
          {
            src: '/projects/mailstop-detail.png',
            alt: 'Detail view for a single MailStop',
            caption: 'MailStop details: assignees, group, created by, creation date, last modified date, point of contact (POC), and remarks.',
            fit: 'contain',
          },
          {
            src: '/projects/mailstop-edit.png',
            alt: 'Edit form for a MailStop record',
            caption: 'Editing a record: offsite toggle, group swap, POC reassignment, and remark changes.',
            fit: 'contain',
          },
          {
            src: '/projects/mailstop-create.png',
            alt: 'Create form with required fields and a person search',
            caption: 'Create flow: mandatory field checking and quick POC search.',
            fit: 'contain',
          },
          {
            src: '/projects/mailstop-error.png',
            alt: 'Record flagged in red for a missing point of contact',
            caption: 'Validation showing a record with no point of contact.',
            fit: 'contain',
          },
        ],
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'text',
        text: 'Lowcode provided a quick and cheap turnaround for this application and handed Langley something staff with no programming experience can maintain. But, it doesn\'t grant automated tests,  schema-level constraints, or relational logic inside the database. Given more time I would push more validation into the data layer rather than trusting every write path to check it.',
      },
    ],
  },
  {
    slug: 'cooling-tower-predictive-maintenance',
    title: 'Cooling Tower Predictive Maintenance',
    description:
      'An XGBoost model predicting days until a cooling tower needs unplanned repair.',
    summary:
      'A machine learning approach to predicting the remaining useful life (RUL) on NASA Langley cooling towers, joining eight years of vibration sensor data, maintenance work orders, and local weather to forecast how many days remain until a failure.',
    year: '2025',
    role: 'Solo — Langley Student Volunteer Program',
    stack: ['Python', 'XGBoost', 'scikit-learn', 'Pandas'],
    links: [],
    // No poster yet — the deck's figures for this half were PowerPoint shapes,
    // not images, so there was nothing to pull. Card falls back to its gradient.
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Fixing a cooling tower after it fails costs far more than servicing it beforehand (in addition to the cost of downtime). The question you want to ask isn\'t whether a unit is healthy now, but how long it will be. I framed that as a regression problem: predict Remaining Useful Life (the number of days until the next reactive work order) for a Langley cooling tower and all of its associated pumps.',
      },
      { type: 'heading', text: 'The data' },
      {
        type: 'text',
        text: 'Three sources had to be combined onto one timeline before any modeling could happen.',
      },
      {
        type: 'list',
        items: [
          'Aveva PI sensor data: this is hourly vibration readings (PeakVue and overall) from gearboxes, bearings, and pumps the cooling towers from 2017 to 2025.',
          'Maximo work orders: these are timestamped maintenance records from 2017 to 2022. There are two worktypes, TC and REPR, which mark reactive work (something broke or alarmed). These events are the prediction target.',
          'Langley AFB METAR weather: this is hourly local conditions, from the joint AFB. The idea was environmental factors are what wears a cooling tower down unexpectedly.',
        ],
      },
      { type: 'heading', text: 'Modeling' },
      {
        type: 'text',
        text: 'I used XGBoost regression, with evaluation designed around this being time series data. Folds were split chronologically with a newest year held outrather than being shuffled. This ensures the model is always predicting forward. Doing a random split would let it learn from the future. Not actually learning, just memorizing.',
      },
      {
        type: 'list',
        items: [
          'Threefold cross-validation, ordered oldest to newest, with a final holdout year.',
          'Compared grid search, random search, and Bayesian optimization for hyperparameter tuning. Bayesian won on cost, reaching a near optimal in about 60 trials where the full grid would\'ve taken tens of thousands.',
          'Scored against a naive benchmark rather than on zero, so improvements had to be real.',
        ],
      },
      { type: 'heading', text: 'Results, honestly' },
      {
        type: 'text',
        text: 'The naive benchmark averaged 39.43 days MSE across folds (27.81, 29.04, 61.43). The first model was around 41. What that means isthe model hadn\'t yet learned anything the benchmark didn\'t already know. The third fold\'s error is the interesting part: whatever changed in later years isn\'t captured by the engineered features. That\'s where the future work is.',
      },
      { type: 'heading', text: 'Presenting it' },
      {
        type: 'text',
        text: 'I presented this work to around 30 NASA engineers and staff as a Jam Session (typically led by my mentor Charles Liles). I walked through cross-validation, leakage, and hyperparameter tuning for time series maintenance data. The goal was partly to share the method and partly to recruit. Attendees with domain knowledge (like those in maintenance) were invited to contribute via Google Cloud Juypter Notebook to refine the model, which started an ongoing collaboration.',
      },
    ],
  },
  {
    slug: 'event-pass',
    title: 'Event Pass',
    description:
      'A real-time number-calling system for 300-person giveaway events — attendee tickets, a room display, and a staff control panel.',
    summary:
      'Purdue’s Boiler Book Club hands out free books at events of 300+ people, and ran them on paper numbers shouted across a room plus a Google Form nobody remembered to fill in. I replaced all of it with three synchronized screens — a ticket on every attendee’s phone, a projected display for the room, and a control panel for staff — driven off one live Firestore document.',
    year: '2024',
    role: 'Solo — Purdue’s Boiler Book Club',
    stack: ['React 19', 'Vite', 'Firebase', 'Cloud Functions', 'Discord OAuth'],
    links: [{ label: 'Source', href: 'https://github.com/BoilerBookClub/number-caller' }],
    poster: '/projects/event-pass-next-group.jpg',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'A giveaway event works like a deli counter: everyone takes a number, and groups get called up to a table to pick something. Run by hand that means a clipboard, someone shouting over a crowded room, a paper list of who has already taken a book, and no way to answer the question that actually matters mid-event — how many people are still waiting. Attendees lost their slips, the inventory form went unfilled, and nobody’s memory of what number was up matched anybody else’s. I replaced the clipboard with three screens that all read and write the same live event document, so an attendee’s ticket flips the instant staff call their number, and two organizers can run the same event from two phones without stepping on each other.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-next-group.mp4',
        poster: '/projects/event-pass-next-group.jpg',
        ratio: '1280 / 740',
        caption: 'The room display the moment a group is called — round, the numbers that are up, the rotating check-in code counting down to its next rotation, and the join feed down the left. Confetti and a chime land at the same instant every ticket in the room flips.',
      },
      { type: 'heading', text: 'The three screens' },
      {
        type: 'list',
        items: [
          'Attendee ticket — check in by scanning the display, sign in with Discord, hold a numbered ticket that turns itself into a scannable claim QR the instant the number is called, and hides it again once it’s been scanned.',
          'Room display — the projector view: current round, the number range that’s up, final call, a rotating check-in code, a live activity feed, and a prize raffle wheel when staff hand it the screen.',
          'Staff control panel — call groups, auto-advance, rewind, scan claims with the device camera, manage the roster and pre-event queue, run raffles, watch turnout graphs, and archive the event when it ends.',
        ],
      },
      {
        type: 'video',
        src: '/projects/event-pass-control-groups.mp4',
        poster: '/projects/event-pass-control-groups.jpg',
        ratio: '1280 / 740',
        caption: 'The staff control panel mid-round: the current group beside the backlog of people called who still haven’t collected, round progress against the room, and one primary button that rewrites itself as the round moves.',
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'I built the front end in React 19 and Vite, with Firebase behind it: Firestore holds the one live event document plus the claims, queue and feed collections, and I pushed everything the client isn’t allowed to decide into 27 Cloud Functions. That split is basically the whole architecture — numbers, membership, staff status and eligibility all come from a verified token on the server, so the browser only ever chooses which screen to draw. I drew every surface in a hand-sketched style too (rough.js by way of wired-elements), down to the crash screen, since on a projector the error boundary is what a room full of people ends up looking at.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-login.mp4',
        poster: '/projects/event-pass-login.jpg',
        ratio: '1280 / 740',
        caption: 'Staff login through to a live event: creating it with times, fonts and a member early check-in window, then the roster and the pre-event queue filling up before doors open.',
      },
      {
        type: 'list',
        items: [
          'Built a rewind that walks a round backwards along the exact path it came forward on — group, previous group, round-not-yet-started, previous round’s final call — and can never hand a second book to someone who already collected, because the server tests eligibility as "claimed in this round or a later one" rather than trusting the UI.',
          'Wired up an auto-advance engine with independent triggers: group size, a claimed-percentage threshold, a group timer, a next-round timer, and a backlog limit that holds the queue until the table has caught up.',
          'Stored staff numbers as negative integers, which buys three behaviours at once — they sort ahead of #1, the group-call window can never reach them, and every query already asking for a positive number excludes them.',
          'Built a demo mode that drives up to 300 simulated attendees through the real callables, so I could rehearse the full-house behaviour of the queue, display and auto-advance without an audience.',
        ],
      },
      {
        type: 'video',
        src: '/projects/event-pass-raffle.mp4',
        poster: '/projects/event-pass-raffle.jpg',
        ratio: '1280 / 740',
        caption: 'The prize raffle on the projector. Slice widths are the real odds — a member chance of 3x widens the slice by exactly the factor it widens the odds — and the wheel grows past screen height mid-spin so the names passing the pointer stay readable from the back of the room.',
      },
      { type: 'heading', text: 'The attendee is the attacker' },
      {
        type: 'text',
        text: 'Every attendee is a signed-in user on a device I don’t control, standing in a room where free books are being handed out. Most of the hard design follows from that, and the bugs worth writing down were all in that category.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-mobile-login.mp4',
        poster: '/projects/event-pass-mobile-login.jpg',
        ratio: '588 / 1280',
        caption: 'The attendee path, from the camera app: scanning the code off the display, signing in with Discord, and landing on a numbered ticket.',
      },
      {
        type: 'list',
        items: [
          'Used physical presence as an auth factor: the display shows a QR code derived from a staff-only secret and a 60-second time bucket, so opening the site directly gets you a wall, not a number. Widened the server’s accepted window to six buckets after the three I shipped first turned out too narrow — a walk-up has to complete a whole Discord OAuth round trip on a venue network 300 phones are saturating, and the tight window was closing the gate on people already through it.',
          'Moved login off the implicit grant, which had been leaving a real Discord access token in every attendee’s localStorage for 24 hours, to an authorization-code exchange with PKCE — nothing Discord-issued ever reaches the browser now.',
          'Closed an existence oracle in the Firestore rules: claim ids derive from the Discord user id, and the event id is world-readable, so any account could request another person’s claim and read whether they’d checked in off the allowed-and-empty versus permission-denied outcome. Rewrote the rule to decide on the requested id, so it gives the same answer either way.',
          'Screen display names and avatar URLs server-side, not in the browser — a filter the client enforces is one direct callable away from being skipped, and the value ends up on a projector in front of a room.',
        ],
      },
      { type: 'heading', text: 'Three hundred people in one minute' },
      {
        type: 'text',
        text: 'The load profile is near-zero traffic, then the entire user base hitting one document simultaneously, then near-zero again. Number allocation runs in a transaction against the live event document that holds the counters — but a transactional read takes a lock, so every attendee who already had a number and would never move a counter was still contending with every genuine check-in. That’s not a rare path: it’s every reload, every retry, and everyone reopening their ticket during the evening. I turned it into two point reads and a batch with no lock, falling through to the transaction only when the claim doesn’t exist yet, so the transaction stays the authority.',
      },
      {
        type: 'list',
        items: [
          'Raised the hot callables to 60 max instances, which did nothing until I gave them a full vCPU — below one CPU, Cloud Run refuses more than one request per instance, so sixty instances just meant sixty concurrent check-ins and sixty cold starts landing on the first people through the door.',
          'Found the display’s activity feed was one array document rewritten in a transaction per claim, putting the whole room behind a single contended write. Split it so each item is its own document, trimmed on a schedule.',
          'Discovered three sweeps had quietly grown past Firestore’s 500-operation commit limit, including the one that converts the pre-event queue when doors open — it failed for the entire event once ~250 people were waiting, leaving nobody with a number. Paged all three.',
          'Caught the QR code being rebuilt from scratch on every render of a component that re-renders once a second off a countdown clock — for the whole evening, on a phone. Memoizing on the payload was a one-line fix worth 3.9 ms and 137 KB a render.',
        ],
      },
      { type: 'heading', text: 'The QR code bug' },
      {
        type: 'text',
        text: 'I knock the attendee’s number out of the middle of their own QR code, and error correction level H is supposed to reconstruct whatever a hole like that destroys. But Reed–Solomon corrects per block, and a hole in the middle is one contiguous blob that interleaving doesn’t spread evenly — so the aggregate damage can sit comfortably inside "about 30%" while one individual block is over budget, and one block over budget is a code that doesn’t decode at all. That’s what was happening: every attendee numbered 100 and up had a ticket that couldn’t be scanned (oops). I compressed the payload from 207 bytes of JSON down to 105 bytes of positional fields, which dropped the code from version 16 to version 10, drew every module about 40% larger in the same box, and left the worst block at two thirds of its budget instead of over it. I asserted the arithmetic in tests against the real encoder rather than trusting it to a comment.',
      },
      { type: 'heading', text: 'Testing and deployment' },
      {
        type: 'text',
        text: 'You can’t debug anything on the night of an event, which set the bar for what I had to verify beforehand: 209 automated tests across four layers, and a development loop that runs entirely offline.',
      },
      {
        type: 'list',
        items: [
          '116 pure-helper tests over the auth step machine, claim access codes, QR payloads, raffle weighting and retry classification.',
          '69 Firestore rules tests against the emulator, gating every deploy — the rules are the only thing between a signed-in Discord user and the event’s data, and a bad edit is invisible until someone can’t claim a number.',
          'A boot smoke test that evaluates the whole client module graph in JSDOM, because a successful vite build isn’t evidence the app can start.',
          'The full system runs against local Firestore, Auth and Functions emulators with a seed script and three fake logins the server only honours when the emulator environment variable is set — a branch that can’t run in a deployed function.',
          'GitHub Actions runs lint, unit tests, smoke test and rules tests before anything deploys, with production behind a protected environment. Both jobs write the Functions runtime config from repo configuration, after a real bug where a gitignored env file meant CI deploys silently fell back to code defaults.',
        ],
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'text',
        text: 'Most of the work above is a fix for something I got wrong the first time, and the pattern is consistent: I built the happy path and let the room find the edges. The contention, the 500-write ceilings, the too-narrow check-in window and the unscannable three-digit tickets were all discoverable before an event rather than during one (all it would’ve taken was looking) — which is exactly why the load-test harness and the 300-participant demo mode exist now, and why I’d build those first next time instead of after the first event that needed them.',
      },
    ],
  },
  {
    slug: 'turbine-vane-defect-detection',
    title: 'Turbine Vane Defect Detection',
    description:
      'A CNN that flags internal defects in X-ray images of jet engine turbine vanes.',
    summary:
      'Howmet Aerospace inspects thousands of cast turbine vanes by having operators read X-ray images for anomalies. Through Purdue\'s Data Mine in collaboration with Howmet Aerospace, our team built an image pipeline and CNN classifier meant to do that flagging automatically. What we found is the honest test numbers were nowhere near the headline accuracy.',
    year: '2024',
    role: 'Team of 6 — The Data Mine Corporate Partners Program, with Howmet Aerospace',
    stack: ['Python', 'Keras', 'OpenCV', 'pydicom'],
    links: [
      {
        label: 'Poster (PDF)',
        href: 'https://datamine.purdue.edu/posters/TDM_Symposium2024_Poster_Howmet.pdf',
      },
      { label: 'The Data Mine — Howmet Aerospace', href: 'https://datamine.purdue.edu/howmet-aerospace' },
    ],
    poster: '/projects/turbine-vane-comparison.jpg',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Howmet casts the turbine vanes that sit in the hot section of jet engines, where a hidden void or a non-metallic inclusion is the kind of defect you find out about the expensive way. Every part is X-rayed and an operator reads the image. That read is about 87% accurate, and it does not scale. Howmet brought the problem to Purdue’s Data Mine asking for a model that could do the flagging automatically; our team of six picked up where the previous year’s group left off and built both halves — the image processing pipeline and the classifier on the end of it.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-comparison.jpg',
        alt: 'Two filtered X-ray images of turbine vanes side by side, the left one showing a mottled defect region near the top edge',
        caption:
          'Anomalous (left) and normal (right) after filtering. The defect is the mottled patch below the leading edge — this is the signal the model has to learn.',
        fit: 'contain',
      },
      { type: 'heading', text: 'The image pipeline' },
      {
        type: 'text',
        text: 'The raw input is a DICOM X-ray of the whole part, and the defect is a low-contrast texture change inside a region that is already nearly black. Feeding that to a classifier directly wastes most of the model’s capacity on learning to find the vane. So the first half of the project was a pipeline that takes a DICOM straight off the machine and hands back something a network can actually separate: crop to the vane, run a horizontal Sobel filter to pull out edge structure, invert, sharpen with an unsharp mask, then push contrast. Every image the model ever sees goes through it.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-pipeline.jpg',
        alt: 'A row of the same vane X-ray at each processing stage: original DICOM, cropped, Sobel filtered, inverted, unsharp-mask sharpened, and contrast enhanced',
        caption: 'One image through every stage, original DICOM on the left to classifier input on the right',
        fit: 'contain',
      },
      { type: 'heading', text: 'Data and splits' },
      {
        type: 'text',
        text: 'We had roughly 3,000 human-flagged images, and defective parts are (fortunately for Howmet, but unfortunately for us) rare. Augmentation added about 2,000 more. Anomalous and normal were split separately at 7:2:1 into train, validation, and test so the class balance held in every split, with the anomalous class oversampled in training.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-split.jpg',
        alt: 'Diagram of the anomalous and normal sets splitting into training, validation, and testing sets',
        caption: 'Splitting each class separately, then oversampling the anomalous side of the training set',
        fit: 'contain',
      },
      { type: 'heading', text: 'The model' },
      {
        type: 'text',
        text: 'We used a CNN built with transfer learning. After adding a custom classification head, we fine-tuned VGG and ResNet models pretrained on ImageNet with vane data. With a few thousand images and only two classes, training a network from scratch was never going to beat borrowing features that already know what edges and textures are, from millions of samples. We then swept the hyperparameters that mattered most: number of convolutional layers (2-5), batch size (16-32), and training length (20-50 epochs). The best configurations had around 94% validation accuracy, which is what our poster leads with.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-tuning.jpg',
        alt: '3D scatter plot of epochs, batch size, and number of convolutional layers, colored by accuracy from 90-94%.',
        caption: 'The hyperparameter sweep. The best runs reach ~94%. The issue is accuracy is the wrong thing to optimize here, which the test set made clear.',
        fit: 'contain',
      },
      { type: 'heading', text: 'Results, honestly' },
      {
        type: 'text',
        text: 'That 94% doesn\'t follow into the test set. On 159 held-out images the model called only 4 of the 27 defective vanes correctly and let 23 through as normal. Overall test accuracy is about 71%, and the reason the number can look so good on validation is that the dataset is about 83% normal (this means a model can just say "normal" to everything and score in the eighties without learning anything). We were distracted by accuracy when the thing that matters in an inspection problem is how many defects you miss, and we missed most of them (oops, in retrospect).',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-confusion.jpg',
        alt: 'Confusion matrix on the test set: 4 anomalous correctly flagged, 23 anomalous missed, 23 normal falsely flagged, 109 normal correct',
        caption: 'The number that actually matters is the 23 in the top right. These are defective vanes the model passed as normal',
        fit: 'contain',
      },
      {
        type: 'text',
        text: 'The training curves basically just say the same thing in a different way. Training accuracy gets past 97% while validation stalls around 91%, training AUC reaches almost 1.0 while validation flattens in the mid-eighties, and validation loss starts rising after about the fifth epoch while training loss keeps falling. That gap is the model memorizing a small number of defect examples instead of learning what a defect actually looks like.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-training.jpg',
        alt: 'Four plots over 25 epochs (loss, accuracy, AUC, and false negatives) each showing training and validation curves diverging.',
        caption: 'Loss, accuracy, AUC, and false negatives per epoch. Train and validation diverge early and never reconverge.',
        fit: 'contain',
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'text',
        text: 'We luckily concluded the model wasn\'t ready for the factory floor (I still think that was the right call to make), but the conclusion we wrote (that more defect images would help improve performance) was only part of the real story. Since labeled defects were exactly what nobody had, it was easy to pin it on that. If I were to do it again, I would instead:',
      },
      {
        type: 'list',
        items: [
          'Optimize for recall, not accuracy. On an 83/20 split, accuracy rewards laziness. A weighted loss or a tuned decision threshold would\'ve made the sweep chase a metric we actually cared about.',
          'Treat it as anomaly detection rather than binary classification. Normal vanes we had in abundance, so training on those alone and flagging what doesn\'t match removes the class imbalance entirely.',
          'Localize the issue, not just classify. An operator handed a yes/no from a model that misses defects has no reason to trust it. A heatmap over the suspect region gives them something to check, which is a far easier thing to do (lol).',
        ],
      },
    ],
  },
  {
    slug: 'project-four',
    title: 'Project Four',
    description: 'Short description of what this project does.',
    summary:
      'A one- or two-sentence framing of the problem this project solves and who it is for.',
    year: '2024',
    role: 'Solo project',
    stack: ['Go', 'SQLite'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin' }],
    poster: '/projects/project-four.png',
    gif: '/projects/project-four.gif',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'What the project is, what problem prompted it, and what it does today.',
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'The approach taken, what the first version got wrong, and what changed after using it.',
      },
      {
        type: 'image',
        src: '/projects/project-four-1.png',
        alt: 'Main view',
        caption: 'Main view',
      },
    ],
  },
  {
    slug: 'project-five',
    title: 'Project Five',
    description: 'Short description of what this project does.',
    summary:
      'A one- or two-sentence framing of the problem this project solves and who it is for.',
    year: '2023',
    role: 'Solo project',
    stack: ['C++', 'OpenGL'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin' }],
    poster: '/projects/project-five.png',
    gif: '/projects/project-five.gif',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'What the project is, what problem prompted it, and what it does today.',
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'The approach taken, what the first version got wrong, and what changed after using it.',
      },
      {
        type: 'image',
        src: '/projects/project-five-1.png',
        alt: 'Main view',
        caption: 'Main view',
      },
    ],
  },
  {
    slug: 'project-six',
    title: 'Project Six',
    description: 'Short description of what this project does.',
    summary:
      'A one- or two-sentence framing of the problem this project solves and who it is for.',
    year: '2023',
    role: 'Solo project',
    stack: ['Rust', 'WebAssembly'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin' }],
    poster: '/projects/project-six.png',
    gif: '/projects/project-six.gif',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'What the project is, what problem prompted it, and what it does today.',
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'The approach taken, what the first version got wrong, and what changed after using it.',
      },
      {
        type: 'image',
        src: '/projects/project-six-1.png',
        alt: 'Main view',
        caption: 'Main view',
      },
    ],
  },
]

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}
