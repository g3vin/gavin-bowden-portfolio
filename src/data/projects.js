export const projects = [
  {
    slug: 'event-pass',
    title: 'Event Pass',
    description:
      'A real-time number-calling system for 300+ person giveaway events with attendee tickets, a room display, and a staff control panel.',
    summary:
      'Purdue\'s Boiler Book Club hands out free books and other book related goodies at events to 300+ people. We used to use paper numbers shouted across a room plus a Google Form nobody remembered to fill in to track item claims. I replaced all of it with three synchronized screens: a ticket on every attendee\'s phone, a projected display for the room, and a control panel for staff.',
    year: '2024',
    role: 'Solo — Purdue\'s Boiler Book Club',
    stack: ['React 19', 'Vite', 'Firebase', 'Cloud Functions', 'Discord OAuth'],
    links: [{ label: 'Source', href: 'https://github.com/BoilerBookClub/number-caller' }],
    poster: '/projects/event-pass-next-group.jpg',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'I like to think of a giveaway event like the DMV : everyone takes a number from that rolly ticket dispenser thing, and groups get called up to the front. Slowly. Very slowly. It makes sense why, since running something by hand means a clipboard, someone shouting over a crowded room, a paper list of who has already taken a book, and no way to answer the question that actually matters most: how many people are still waiting. Attendees at our events frequently lost their slips (even after many reminders from staff to hold onto them), the inventory form was ignored, and nobody\'s memory of what number was up matched anybody else\'s. I replaced this system with three screens that all read and write the same live event document, so an attendee\'s ticket flips the instant staff call their number, and multiple staff members can run the same event from multiple devices without competing.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-next-group.mp4',
        poster: '/projects/event-pass-next-group.jpg',
        ratio: '1280 / 740',
        caption: 'The room display the moment a group is called: the round, the numbers that are up, the rotating check-in code counting down to its next rotation, and the join feed down the left. A confetti animation and a chime sound appear instantly when every ticket in a group flips to ready.',
      },
      { type: 'heading', text: 'The three screens' },
      {
        type: 'list',
        items: [
          'Attendee ticket: they check in by scanning the display and then sign in with Discord, granting a numbered ticket that turns itself into a scannable claim QR the instant the number is called, and hides it automatically once it\'s been scanned successfully.',
          'Room display: the current round, the number range that\'s up, if it\'s a final call, a rotating check-in code, a live activity feed, and a prize raffle wheel that can appear if staff want raffle prizes.',
          'Staff control panel: call groups, auto-advance, rewind, scan claims with the device camera, manage the roster and pre-event queue, run raffles, watch turnout graphs, and archive the event when it ends.',
        ],
      },
      {
        type: 'video',
        src: '/projects/event-pass-control-groups.mp4',
        poster: '/projects/event-pass-control-groups.jpg',
        ratio: '1280 / 740',
        caption: 'The staff control panel mid-round: the current group beside the backlog of people called who still haven\'t collected, round progress against the room, and one primary button that changes with the round.',
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'I built the front end in React 19 and Vite, with Firebase behind it. Firestore holds a live event document with claims, queue, and feed collections. I pushed everything the client isn\'t allowed to decide into 27 Cloud Functions. That split is basically the architecture, meaning numbers, membership, staff status, and user eligibility all come from a verified token on the server. The browser only chooses which screen to draw! To match the club\'s vibe, I used rough.js\'s wired-elements, which provide a unique hand-drawn look. Every component down to the crash screen uses it.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-login.mp4',
        poster: '/projects/event-pass-login.jpg',
        ratio: '1280 / 740',
        caption: 'Staff login, creating a live event, and pre-event user logins from the staff side.',
      },
      {
        type: 'list',
        items: [
          'Built a rewind features goes backwards through the group, previous group, round-not-yet-started, and previous round\'s final call. Nobody that grabbed a prize can get a second one through rewind (the server tests eligibility as "claimed in this round or a later one" rather than trusting the UI). The feature is for staff member misclicks, so everyone can get their first prize.',
          'Wired up an auto-advance system with multiple triggers, including group size, a claimed-percentage threshold, a group timer, a next-round timer, and a backlog limit that holds the queue until the staff table has caught up (this feature is one of my favorites!).',
          'Stored staff numbers as negative integers, which allows them to sort ahead of #1, force the group-call window to never reach them, and every query on a positive number excludes them by nature.',
          'Built a demo mode that drives up to 300 simulated attendees through the real callables, so I could rehearse the behaviour of the queue and use it to teach new staff members.',
        ],
      },
      {
        type: 'video',
        src: '/projects/event-pass-raffle.mp4',
        poster: '/projects/event-pass-raffle.jpg',
        ratio: '1280 / 740',
        caption: 'The prize raffle on the projector. The wheel grows past screen height midspin so names passing the pointer stay readable from the back of the room.',
      },
      { type: 'heading', text: 'The attendee is evil and wants to steal from us' },
      {
        type: 'text',
        text: 'Every attendee is a signed in user on a device I don\'t control, standing in a room where free books are being handed out. Meaning they will try anything to get extra prizes. Most of the structure and security follows from that basis.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-mobile-login.mp4',
        poster: '/projects/event-pass-mobile-login.jpg',
        ratio: '588 / 1280',
        caption: 'What the attendee does to get a number. They scan the code off the display, sign in with Discord, and land on a numbered ticket.',
      },
      {
        type: 'list',
        items: [
          'Used physical presence as an auth factor: the display shows a QR code from a staff-only secret and a 60-second time bucket, so opening the site directly gets you a wall, not a number. I widened the server\'s accepted window to six buckets after the three I shipped first were way too narrow, since a person just coming in through the door has to complete a whole Discord OAuth in a venue with 300 phones on the network. Basically, the tight window was closing the gate on people already through it.',
          'Moved login off the implicit grant, which had been leaving a real Discord access token in every attendee\'s localStorage for 24 hours, to an authorization-code exchange with PKCE. Nothing Discord issues ever reaches the browser.',
          'Screen display names and avatar URLs server-side: a filter the client enforces is one direct callable away from being skipped, and the value ends up on a projector in front of a room.',
        ],
      },
      { type: 'heading', text: 'When the floodgate explodes'},
      {
        type: 'text',
        text: 'The load profile is zero traffic, then the entire user base blows up the document, and then zero traffic again (what a fun problem). Number assignment runs in a transaction against the live event document that holds the counters, but a transactional read takes a lock, so every attendee who already had a number was still contending with every check-in. That\'s something that happened on every reload, every retry, and when everyone is reopening their ticket. I turned it into two point reads and a batch with no lock, falling through to the transaction only when the claim doesn\'t exist yet.',
      },
      {
        type: 'list',
        items: [
          'Raised the hot callables to 60 max instances, which did nothing until I gave them a full vCPU. below one CPU, Cloud Run refuses more than one request per instance, so sixty instances just meant sixty concurrent check-ins and sixty cold starts landing on the first people through the door.',
          'Found the display\'s activity feed was one array document rewritten in a transaction per claim, putting the whole room behind a single contended write. Split it so each item is its own document, trimmed on a schedule.',
          'Discovered three sweeps had quietly grown past Firestore\'s 500-operation commit limit, including the one that converts the pre-event queue when doors open — it failed for the entire event once ~250 people were waiting, leaving nobody with a number. Paged all three.',
          'Caught the QR code being rebuilt from scratch on every render, on a componenet rendering once per second. Memoizing on the payload was a one-line fix worth 3.9 ms and 137 KB a render.',
        ],
      },
      { type: 'heading', text: 'The QR code bug' },
      {
        type: 'text',
        text: 'I knock the attendee\'s number out of the middle of their own QR code, and error correction level H is supposed to reconstruct whatever a hole like that destroys, but Reed-Solomon corrects per block, and a hole in the middle is one contiguous blob that interleaving doesn\'t spread evenly. This meant every attendee numbered above 100 had a ticket that couldn\'t be scanned (whoops). I compressed it from 207 bytes of JSON down to 105 bytes of positional fields, which dropped the code from version 16 to version 10, drew every module about 40% larger in the same box, and left the worst block at two thirds of its budget. I checked it in tests against the real encoder rather than trusting it.',
      },
      { type: 'heading', text: 'Tests, tests, and more tests (and deployment)' },
      {
        type: 'text',
        text: 'You can\'t debug anything on the night of an event (if you can, I salute you), which set the bar for what I had to verify beforehand. I ended up with 209 automated tests across four layers, and a development loop that runs entirely offline.',
      },
      {
        type: 'list',
        items: [
          '116 pure-helper tests over the auth step machine, claim access codes, QR payloads, raffle weighting and retry classification.',
          '69 Firestore rules tests against the emulator, gating every deploy. The rules are the only thing between a signed-in Discord user and the event\'s data, and a bad edit is invisible until someone can\'t claim a number.',
          'A boot smoke test that evaluates the whole client module graph in JSDOM, because a successful vite build isn\'t evidence the app can start.',
          'The full system runs against local Firestore, Auth and Functions emulators with a seed script and three fake logins the server only honours when the emulator environment variable is set, a branch that can\'t run in a deployed function.',
          'GitHub Actions runs lint, unit tests, smoke test and rules tests before anything deploys, with production behind a protected environment. Both jobs write the Functions runtime config from repo configuration, after a real bug where a gitignored env file meant CI deploys silently fell back to code defaults.',
        ],
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'text',
        text: 'Most of the work above is a fix for things I got wrong the first time around. The contention, the 500 write ceilings, the too narrow check-in window and the unscannable three digit tickets were all discoverable before an event rather than during one. This iswhy the load test harness and the 300 participant demo mode exist now, and why I\'d build those first next time. You live and learn.',
      },
    ],
  },
  {
    slug: 'puac-practice-manager',
    title: 'Purdue Archery Practice Manager & Website',
    description:
      'Membership, QR practice check-in, pass sales, and the public website for Purdue\'s Archery Club, built on our Discord as the source of truth for identity.',
    summary:
      'Purdue Archery Club used to run practice check-in off a paper sign-in sheet and manually decrement the number of practices people had purchased in a spreadsheet. I built a Firebase app that logs members in with the Discord account the club already uses for everything else, checks them into practice with a QR scan, sells and tracks their passes, and lets officers edit the public website without a code deploy. It\'s been live at purduearchery.club since 2025.',
    year: '2025',
    role: 'Solo — Purdue University Archery Club',
    stack: ['React 18', 'React Router 6', 'Vite', 'Firebase', 'Cloud Functions', 'Firestore', 'Discord API', 'Resend'],
    links: [{ label: 'Live site', href: 'https://purduearchery.club' }],
    poster: '/projects/puac-front-page-poster.jpg',
    gif: '/projects/puac-front-page.gif',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Every club member is already on the club Discord. That\'s where practices get scheduled, where officers post, and where bans already happen when someone needs to be removed. Rather than build a second identity system, I built the whole platform on top of it: just sign in with Discord. Everything downstream, like who\'s an officer, who\'s allowed in, and whose pass is active,  reads off that one login. What started as "replace the paper sign-in sheet" grew into membership, QR check-in, pass sales pulled automatically off order emails, a staff dashboard, and a CMS for the public site, all on one Firestore project.',
      },
      {
        type: 'video',
        src: '/projects/puac-front-page.mp4',
        poster: '/projects/puac-front-page-video-poster.jpg',
        ratio: '1280 / 788',
        caption: 'The public landing page with the calendar, pricing cards, and the photo pile all being officer editable, not hardcoded.',
      },
      { type: 'heading', text: 'Membership & identity' },
      {
        type: 'list',
        items: [
          'Discord OAuth2 is the only sign-in path: there\'s no separate password system to manage or leak. Login state mirrors live off a Firestore onSnapshot, so a ban or role change in Discord reaches an already open tab quickly.',
          'Every member gets a digital pass at /my-id: a QR code encoding an opaque, rotatable scan token rather than a hash of their user ID, so a lost phone can be re-keyed without touching their identity.',
          'A Resend-backed magic-link flow verifies a member\'s Purdue or personal email against club records.',
          'First-time sign-ins go through a simple profile completion flow, just name and email, before landing anywhere else.',
          'Officer routes and actions are gated by role and enforced twice: OfficerRoute in the UI, and again in Firestore security rules, so the UI check is really just a convenience, not the actual boundary.',
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
        text: 'Practices already exist as scheduled events in the club Discord, so I didn\'t duplicate that scheduling anywhere. A sync job pulls them in every 15 minutes and filters to the ones that read as an actual practice rather than a competition or social. But the scheduled practice and what actually happens on a given night are kept as separate records on purpose. A session opens itself on the first QR scan of the night, removing a manual "start" button, and closes itself either aligned to the scheduled window or 3 hours after that first scan, with officers also able to end one early by hand.',
      },
      {
        type: 'list',
        items: [
          '/scan is the officer-facing check-in screen: the barcode-detector API drives a live camera scan, with a manual check-in fallback for a dead phone or a camera that won\'t cooperate under gym lighting.',
          'A member\'s full attendance history is queryable across schema versions via a Firestore collection-group query at /my-practices, so an old attendance record written under a previous schema doesn\'t just disappear from their history.',
          'Deleting a practice is modeled as a real operation, not a hide: it refunds any day passes spent on it, removes the Discord event, and recursively deletes every attendance record tied to it. Hiding one, by contrast, only pulls it from staff-facing lists and leaves history untouched. Two very different things.',
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
          'Term and day pass pricing and color are pulled from the same officer editable content on the public pricing cards, so a pass can\'t be advertised in one color and issued in another.',
          'A scheduled Cloud Function scrapes TooCOOL order-confirmation emails off Gmail every 5 minutes, writes the resulting pass straight to Firestore, and sends the member a Resend confirmation. This is deliberately decoupled so a Resend outage can never block a purchase from actually registering.',
          'Day-pass economics: burning a credit, buying at the door, and refunding a rained-out night, all move through transaction-safe Firestore operations, specifically so two officers can\'t double-refund something.',
          'Officers can manually issue or adjust a pass (setMemberPass, issuePassAndCheckIn) for the cases automation can\'t cover, like walk-ins, comps, corrections.',
        ],
      },
      { type: 'heading', text: 'Discord integration' },
      {
        type: 'text',
        text: 'Discord stays the single source of truth for bans and RSVPs instead of the site keeping its own copy. One extra API round trip on every sign-in, in exchange for never having two systems disagree about who\'s banned. The site checks Discord\'s ban list on every login and mirrors it into a Firestore flag for real-time lockout, and there\'s deliberately no "unban" button anywhere in the app, since those happen in Discord, where the ban actually lives.',
      },
      {
        type: 'list',
        items: [
          'Guild member count syncs every 6 hours into a rolled-up time series (joins over time, percent of the server with a site account), charted on the staff overview. When Discord\'s privileged intents aren\'t available, it shows why the data is missing instead of silently rendering a blank chart.',
          'Slash commands (/pass, /session) let members and officers pull pass links and live session headcounts from inside Discord itself, without exposing member PII to the rest of the server.',
        ],
      },
      { type: 'heading', text: 'Staff dashboard' },
      {
        type: 'text',
        text: 'The officer side is a full internal admin tool at /dashboard, tabbed and swipeable on mobile since officers run most of this from their phones at practice. Every chart on it (bar, line, heatmap, sparkline) and every piece of shared UI (data table, drawer, confirm dialog, toasts, collapsible sections, stat tiles) is hand-built rather than pulled from a charting or component library to match the app theme.',
      },
      {
        type: 'list',
        items: [
          'Overview: attendance and membership charts plus the Discord growth stats.',
          'Members: a searchable, filterable table with CSV export and a per-member drawer for editing pass status, issuing refunds, banning, or permanently deleting an account. Deletion anonymizes rather than deletes attendance history, so club-wide night-counts stay accurate without retaining anyone\'s identity.',
          'Practices: a schedule view with a drawer per practice or session for closing a session early, refunding a rained-out night, or deleting a practice, all with onfirmation that tells you exactly what\'s about to be removed.',
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
        text: 'The parts of the public site that change every semester used to be hardcoded JSX, which meant a code deploy for something as small as a new officer photo and people without programming experince couldn\'t update things. I pulled those sections into Firestore documents editable from the dashboard: landing copy and pricing cards, the FAQ accordion, officer boards versioned by year (starting a new year prepends a board rather than overwriting the last one), the competitive roster and tournament results by year, the join-page steps and Discord invite link, and footer/social links.',
      },
      {
        type: 'list',
        items: [
          'Officer-uploaded images are downscaled and re-encoded to WebP client-side via Canvas before they ever leave the device — a ~6MB phone photo lands around ~150KB — independent of the separate build-time image optimizer used for committed site assets.',
          'Every editable section ships with a committed fallback, so a missing document, a failed read, or a half-saved edit renders the last known-good content instead of a blank section. The CMS is designed to fail closed to that fallback, never open to a broken page.',
          'Read access is public, since a logged-out visitor still needs to see the site, and write access is officer-only, enforced in Firestore security rules.',
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
          'A contact form, which is the one endpoint reachable while logged out, so it\'s the one hardened the hardest. It\'s IP-hashed, with transaction-safe rate limiting at 3 per IP per 10 minutes and 30 site-wide per hour, Discord mention injection suppression so it can\'t be used to @everyone the Discord server, and an origin allowlist.',
          'FAQ, join flow, and merch/sponsorship pages.',
          'Mobile-tuned interaction details, like edge-scroll and swipe gesture hooks, device-tilt effects, and viewport-height fixes for mobile browser chrome.',
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
        text: 'Custom Node test scripts run standalone or against the Firestore emulator, covering rate limits, security rules, session windows, pass-expiry math, Discord rollups, and email templates. The rules tests in particular gate deploys, since the rules are the only thing standing between a signed-in member and the rest of the data.',
      },
      { type: 'heading', text: 'Engineering decisions I\'d point to' },
      {
        type: 'list',
        items: [
          'Practices and sessions are deliberately separate records, so the schedule (from Discord) and reality (what actually happened) are allowed to diverge. This means a missing or stale Discord event never blocks check-in.',
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
        text: 'This started as a fix for a paper sign-in sheet and, one feature at a time, turned into the club\'s entire management system for membership, payments, attendance, comms, and the public website all in one place. The rough edge that shows up most as the club grows is officer permissions being a single boolean: every officer can currently refund a pass, ban a member, or edit the CMS, when in practice only a few people on the e-board should be able to do some of those. Splitting officer into real per-action roles is the next real piece of work, not a new feature so much as catching the permission model up to how the tool actually gets used.',
      },
    ],
  },
  {
    slug: 'inkblot-dictation',
    title: 'Inkblot Dictation',
    description:
      'An offline Rust dictation pipeline with mic capture, VAD chunking, local Whisper transcription. Built be embeded in a Tauri app without depending on one.',
    summary:
      'inkblot-dictation is a standalone Rust crate that turns a live microphone stream into cleaned, punctuated text with an on-device Whisper model. It is chunked on speech and silence, transcribed with no network calls, and exposed as a plain callback API any Rust app can utilize.',
    year: '2026',
    role: 'Solo project',
    stack: ['Rust', 'Tokio', 'cpal', 'whisper.cpp', 'whisper-rs'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin/inkblot-dictation' }],
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'I\'m building a Tauri + React app that wants live dictation, and I didn\'t want that app\'s codebase to get clogged up with my "speech to text" solution. So I made inkblot-dictation is its own crate: microphone in, cleaned transcript out, no cloud calls or Tauri dependincies. It loads a local Whisper model once, listens using the default input device, decides for itself where one spoken phrase ends and the next begins, and gives a raw transcript and a punctuated, capitalized one over a callback, for both a Tauri command or the plain CLI.',
      },
      { type: 'heading', text: 'Two stages, one boundary that matters' },
      {
        type: 'text',
        text: 'The pipeline is two async tasks connected by channels. The first is a chunk builder that owns the audio, and the second is a transcription worker that owns Whisper. There\'s a reason why they\'re kept seperate. cpal calls the input callback on a real-time audio thread, and blocking that thread for even a few milliseconds means audio many be dropped. This callback only converts samples and does try_send on a mpsc channel, always dropping a packet rather than blocking. Whisper inference, on the other hand, is a CPU call that can take real time, so it runs inside tokio::task::spawn_blocking rather than on the async runtime, where it would stall every other task when sharing the thread.',
      },
      {
        type: 'list',
        items: [
          'The audio callback handles whatever format the OS default input device actually hands over (F32, I16, or U16) rather than assuming F32 and failing on some devices that don\'t offer it.',
          'Every packet gets downmixed to mono and linearly resampled to the 16kHz Whisper expects, regardless of the mic\'s native rate. It\'s a plain linear-interpolation resampler, not a proper sinc one. Dictation chunks aren\'t where resampling artifacts show up, so I didn\'t pull in a DSP crate to avoid them.',
        ],
      },
      { type: 'heading', text: 'Chunking a stream that never stops' },
      {
        type: 'text',
        text: 'Whisper doesn\'t take a live stream, it takes a buffer, so something has to decide where one buffer ends and the next begins. Voice activity detection here is a single RMS-threshold gate, not a model, just root-mean-square against a floor (0.012 by default). It\'s only used for that boundary decision, not for cleaning the audio. Once speech crosses the threshold, a chunk opens. That chunk closes on whichever of two independent triggers fires first, either 900ms of continuous silence, or a 12-second hard cap. The latter exists so one long continuous sentence can\'t grow the buffer without bound.',
      },
      {
        type: 'list',
        items: [
          'While a chunk is still open, it gets re-transcribed every 1500ms and emitted as a Partial event, which gives a UI has something to show mid-sentence instead of a blank field until the pause. The Nth partial re-transcribes the whole growing buffer from scratch. Whisper runs with no_context(true), so nothing carries between calls. A simple solution at the cost of doing some of the same work twice.',
          'That statelessness is also what makes the Started / Partial / Final / Stopped / Error event safe to drop and retry from, since a chunk that fails to transcribe doesn\'t corrupt anything downstream, because there\'s no cross-chunk state to corrupt!',
        ],
      },
      { type: 'heading', text: 'Cleanup by hand, not by regex' },
      {
        type: 'text',
        text: 'Raw Whisper output is lowercase and unpunctuated except for spoken words like "comma" and "new paragraph." Turning that into normal human text is a small handwritten pass rather than a bunch of regex substitutions, mainly regex treats a standalone "i" the same as an i inside "is," "it," or "in", capitalizing them all indiscriminately. The cleanup module checks the character on each side "i" and only capitalizes it when both neighbors aren\'t letters. It also does a pass for spoken punctuation, whitespace before punctuation, and capitalization after sentence boundaries. Both the raw and cleaned text are kept every event, so a caller can see the cleaned version but still have the raw one if the cleanup pass ever fails horribly.',
      },
      { type: 'heading', text: 'Staying out of the app\'s way' },
      {
        type: 'text',
        text: 'The crate never imports tauri, and that\'t on purpose. The public surface is DictationService (load a model, start/stop a session, ask its status) plus an Arc<dyn Fn(DictationEvent)> callback, and DictationError implements Into<String> so a Tauri command can return it with a plain .map_err(Into::into) without the crate knowing Tauri commands exist. The included example, live_dictation, drives the exact same service and callback from a bare CLI loop (used to both check that the boundary actually holds and as a usage demo). GPU backends are similar: forwarded to whisper-rs as Cargo features (metal, vulkan, cuda) so the host app opts in per-device instead of just guessing.',
      },
      { type: 'heading', text: 'Where this goes next' },
      {
        type: 'text',
        text: 'This is the working prototype, not the hardened version. There\'s also no automated test suite yet, which is a gap I\'d close before deploying it into a live app. The fixed RMS threshold is the part most likely to need revisiting first, since it has no noise floor adaptation ability. This means a threshold tuned for a quiet room will clip soft speech or hang open in a noisy one. Re-transcribing the full buffer is the other obvious next target. Yes, it works, but an incremental approach would mean partials stop getting more expensive as a chunk grows.',
      },
    ],
  },
  {
    slug: 'lexical-substitution-pipeline',
    title: 'Lexical Substitution Pipeline',
    description:
      'A multi-stage NLP pipeline that generates and ranks context-aware, single-word synonyms, and an honest SWORDS benchmark for each stage.',
    summary:
      'Given a sentence and a target word, this pipeline generates candidate single-word substitutes from four different sources, filters them through spaCy syntax and WordNet checks, scores them with Sentence-BERT and BERT fluency, optionally reranks with a cross-encoder, and re-inflects the winner to match the target\'s tense and number. Evaluated against the SWORDS benchmark, with a feature-ablation study that turned up an odd result: the most expensive stage in the pipeline is the one hurting it most.',
    year: '2026',
    role: 'Solo project',
    stack: ['Python', 'PyTorch', 'Transformers', 'spaCy', 'Sentence-BERT', 'FLAN-T5', 'scikit-learn', 'NLTK/WordNet'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin/lexical-substitution-pipline' }],
    poster: '/projects/lexsub-ablation.png',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Lexical substitution sounds like a thesaurus lookup, until you make it context-aware. Take "reached" in "I reached across the table..". It should return "extended" or "stretched" not "arrived" or "contact", and should be properly conjugated ("extended" over "extend"). I built this as a pipeline rather than a single model, because no single signal is trustworthy alone. A masked language model will happily suggest a word that means the opposite of the target, a thesaurus will hand you a synonym that\'s the wrong part of speech in this sentence, and a sentence embedding will call two sentences similar even when the substitute doesn\'t inflect correctly. Each stage exists to catch what the stage before it can\'t see (kinda like the Magi in Neon Genesis Evangelion!).',
      },
      {
        type: 'text',
        text: 'For a concrete run: sentence "I reached across the table to grab the glass of water in front of my mother," target reached. The pipeline\'s top candidates are extended, stretched, leaned, lunged, strained, arranged in a ranked order, not just listed, with every candidate having six separate scores (lexical-resource match, target-word similarity, sentence-level semantic similarity, MLM fluency rank, a learned substitute-validity score, and a cross-encoder rerank score) that get combined into the final ordering.',
      },
      { type: 'heading', text: 'The pipeline' },
      {
        type: 'list',
        items: [
          'Candidate generation pulls from four independent sources: WordNet synsets expanded through similar-to/hypernym/hyponym relations and derivationally related forms, an optional SWORDS split used purely as a lexical resource (not as ground truth), FLAN-T5 prompted eight different ways, from a bare "synonyms of X:" to a full sentence-context prompt seeded with the WordNet/SWORDS hints, and the top 150 BERT masked-language-model completions at the target\'s position. A generation-mode flag (full/balanced/fast/resources/mlm/t5) controls which of these actually run, since the T5 prompt sweep is by far the slowest part.',
          'Linguistic filtering runs every candidate back through spaCy in context: drop it if it\'s already in the sentence, a stopword, a named entity, shares a lemma or substring with the target, is a WordNet antonym (checked transitively through similar-to synsets, not just direct antonym pairs), or comes back the wrong part of speech once it\'s re-inflected and re-parsed. For verbs specifically, a dependency-parsed argument frame (subject, object, indirect object, preposition, particle) has to be a subset of the candidate\'s own frame, with a WordNet double-object check for ditransitive verbs, so a verb needing a direct object doesn\'t get swapped for one that can\'t take one.',
          'Semantic and classifier filtering scores what survives: Sentence-BERT cosine similarity between the original and substituted sentence, an optional WiC-style sense-consistency classifier, an optional bidirectional NLI contradiction check, and an optional supervised substitute-validity model — a RoBERTa regression head fine-tuned on SWORDS\' soft human-agreement labels — that can act as a soft score or a hard filter.',
          'Ranking combines those signals as a weighted sum with multiplicative penalties for candidates under the semantic/target/MLM/substitute thresholds, rather than hard-cutting them (a candidate can survive a bad score, just discounted). There\'s a swap-in alternative too: a gradient-boosted ranker (HistGradientBoostingRegressor) trained directly on SWORDS labels over the five raw scores plus six engineered interaction/gap features, which is what\'s bundled as the default.',
          'A cross-encoder reranks the top-scoring pool and gets blended back into the final score — in theory the most powerful single signal, since it attends over the whole sentence pair instead of pooling to embeddings first. In practice, see below.',
          'Morphology re-inflects the winning candidate to match the target\'s tense, number, and comparison via lemminflect, with hand-written fallback rules for plurals, -ing forms, past tense, third-person singular, and comparative/superlative, plus a regex guard against the classic double-suffix bug where an inflector hands back "greaterer" or "classeses" for a word that already ends in -er/-es.',
        ],
      },
      { type: 'heading', text: 'Evaluating against SWORDS' },
      {
        type: 'text',
        text: 'SWORDS is a lexical-substitution benchmark of real sentences where crowdworkers scored a large candidate pool per target word, so an evaluation run isn\'t "did the model guess the one right answer" but "how well does its ranking agree with a distribution of human judgments." I scored all 370 dev-split targets, 22,978 candidate substitutes total, using NDCG@k, MAP@k, precision@k, and pairwise accuracy (the fraction of gold-scored candidate pairs the model orders correctly, independent of k). The bundled learned ranker plus cross-encoder gets NDCG@10 of 0.531, MAP@10 of 0.356, precision@10 of 0.263, and pairwise accuracy of 0.624.',
      },
      {
        type: 'text',
        text: 'Two numbers from the dataset itself shaped design decisions before any modeling happened: 82.4% of SWORDS\' gold substitutes are single words, which is what justified scoping this to single-word substitution instead of also chasing multi-word paraphrases; and the mean gold score across all candidates is 0.111, meaning most proposed substitutes in the dataset are mediocre-to-bad matches even by crowdworker judgment, so a high precision score can\'t be gamed by an undiscriminating ranker.',
      },
      {
        type: 'image',
        src: '/projects/lexsub-metrics-by-k.png',
        alt: 'Line chart of NDCG, MAP, and precision at k from 1 to 10, all decreasing as k grows',
        caption: 'Precision@k drops from 0.58 at k=1 to 0.26 at k=10 mechanically. SWORDS gold sets are small, so requiring 10 returns caps precision once you run out of genuinely good substitutes. NDCG stays near 0.53 across k because it\'s rank-weighted rather than a raw hit count.',
      },
      {
        type: 'image',
        src: '/projects/lexsub-metrics-by-pos.png',
        alt: 'Bar chart comparing NDCG, MAP, and precision at k=10 across VERB, NOUN, ADJ, and ADV target words',
        caption: 'Verbs are the hardest part of speech for this pipeline (NDCG 0.505, precision 0.244), plausibly the cost of the extra subcategorization-frame filtering being strict, on top of verbs just carrying more sense ambiguity than nouns or adjectives.',
      },
      { type: 'heading', text: 'Results, honestly' },
      {
        type: 'text',
        text: 'I ran a feature-ablation sweep — drop one signal at a time, re-score the whole dev set, see what breaks. Removing the MLM fluency score is the most damaging single ablation (NDCG drops from 0.531 to 0.469, the worst of any feature), confirming it\'s doing more real work than any other individual signal. That part matched my expectation. What didn\'t: dropping the cross-encoder reranker entirely, "No rerank" beats "All features" on every metric measured. NDCG 0.541 vs 0.531, MAP 0.365 vs 0.356, precision 0.275 vs 0.263, pairwise accuracy 0.639 vs 0.624. The single most expensive stage in the pipeline, an entire extra transformer forward pass per candidate in the rerank pool, is net negative on this benchmark.',
      },
      {
        type: 'image',
        src: '/projects/lexsub-ablation.png',
        alt: 'Bar chart of NDCG, MAP, and precision at k=10 for the full pipeline versus six single-feature ablations, showing "No rerank" scoring highest on all three metrics',
        caption: '"No rerank" is the tallest bar on all three metrics. The pipeline ranks better with the cross-encoder stage removed entirely than with it included.',
      },
      {
        type: 'text',
        text: 'My best guess at why: the cross-encoder is a general sentence-pair similarity model (cross-encoder/stsb-roberta-base, trained for semantic textual similarity), not anything fine-tuned for lexical-substitution appropriateness the way the substitute-validity classifier is. It\'s plausibly rewarding paraphrase-level closeness. Two sentences that "mean about the same thing" over the more surgical judgment of whether one specific word swap is correct, and at a rerank blend weight of 0.75 that reward dominates the final score for anything that makes the rerank pool. It\'s exactly the kind of result that\'s easy to miss if you only look at a handful of example sentences and the top result looks fine, the pipeline shipped with the reranker on by default before I ran this ablation and actually looked at the aggregate numbers.',
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'list',
        items: [
          'Not ship the reranker on by default. The ablation data was sitting right there in report_plots_model/ before I wrote this — the fix isn\'t more modeling, it\'s reading my own evaluation output before flipping a flag to true.',
          'Either retune the rerank blend alpha down from 0.75 toward something the ablation would actually support, or replace the off-the-shelf STS cross-encoder with one fine-tuned on SWORDS pairs the same way the substitute-validity classifier already is, rather than trusting a general-purpose similarity model to do a specific job it was never trained for.',
          'Add real unit tests. The SWORDS evaluation is the only thing exercising this code, and it never touches the regex-and-heuristic corners — the double-suffix inflection guard, the verb subcategorization-frame matching. This is exactly the kind of code that breaks quietly and only shows up as a slightly worse aggregate score nobody investigates.',
          'Measure what single-word-only scoping actually costs. ~18% of SWORDS gold substitutes are multi-word and this pipeline can\'t produce them by design, which is a reasonable scope decision, but I never ran the counterfactual to see how many NDCG/MAP points that\'s actually leaving on the table versus how much complexity multi-word generation would add.',
        ],
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
    poster: '/projects/cooling-tower-poster.jpg',
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
]

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}
