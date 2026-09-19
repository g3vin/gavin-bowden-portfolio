// `receipt.impact` is stored in sentence case even though every sheet prints it
// in caps: the caps come from text-transform in ../styles/paper.css, so the DOM
// keeps normal-case text. Screen readers spell all-caps strings out letter by
// letter, and this string is also the one that ends up in a row's aria-label and
// in the page's link-preview alt text. An optional `receipt.served` is the
// headcount behind that impact line, summed into the receipt's "served" total.
//
// An optional `logo` is the mark that prints at the top of that project's item
// receipt, in place of the site's bear. It points at build-time art -- keep it in
// ../assets/logos/ and write the path repo-root-relative -- which
// scripts/generate-dots.py burns into ../assets/projectDots.js as a 40x44 dot
// grid. The source never ships to the browser, only the grid does, so re-run
// that script after adding or changing one. Marks have to be simple,
// high-contrast line art the way the favicon is; a screenshot has nothing left
// at 40x44. `generate-dots.py --preview <image>` shows you a mark as dots
// before you wire it up. A project without a `logo` prints the bear.
//
// `status: 'in-progress'` marks a project that is still being built. Its receipt
// row prints an "in progress" tag and its item receipt gets a Status line; leave
// the field off once a project ships.
export const projects = [
  {
    slug: 'event-pass',
    logo: 'src/assets/logos/event-pass.svg',
    receipt: { qty: 1, impact: '300+ attendees', served: 300 },
    title: 'Event Pass',
    description:
      'A real-time number-calling system for 300+ person giveaway events with attendee tickets, a room display, and a staff control panel.',
    summary:
      'Purdue\'s Boiler Book Club hands out free books and other book-related goodies to 300+ people at a time. We used to run it on paper numbers shouted across a room, plus a Google Form nobody remembered to fill in to track who claimed what. I replaced all of it with three synchronized screens: a ticket on every attendee\'s phone, a projected display for the room, and a control panel for staff.',
    year: '2026',
    role: 'Solo — Purdue\'s Boiler Book Club',
    stack: ['React 19', 'Vite', 'Firebase', 'Cloud Functions', 'Discord OAuth'],
    links: [{ label: 'Source', href: 'https://github.com/BoilerBookClub/number-caller' }],
    poster: '/projects/event-pass-next-group.jpg',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'I like to think of a giveaway event like the DMV: everyone takes a number from that rolly ticket dispenser thing, and groups get called up to the front. Slowly. Very slowly. It makes sense why. Running it by hand means a clipboard, someone shouting over a crowded room, a paper list of who has already taken a book, and no way to answer the one question that actually matters: how many people are still waiting? Attendees lost their slips (even after many reminders to hold onto them), the inventory form was ignored, and nobody\'s memory of what number was up matched anybody else\'s. I replaced all of that with three screens that read and write the same live event document, so an attendee\'s ticket flips the instant staff call their number, and several staff members can run the same event from different devices without stepping on each other.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-next-group.mp4',
        poster: '/projects/event-pass-next-group.jpg',
        ratio: '1280 / 758',
        caption: 'The room display the moment a group is called: the round, the numbers that are up, the rotating check-in code counting down to its next rotation, and the join feed down the left. A confetti animation and a chime go off the instant every ticket in a group flips to ready.',
      },
      { type: 'heading', text: 'The three screens' },
      {
        type: 'list',
        items: [
          'Attendee ticket: they check in by scanning the display and signing in with Discord, which gets them a numbered ticket. The ticket turns itself into a scannable claim QR the instant their number is called, and hides it again once it\'s been scanned.',
          'Room display: the current round, the number range that\'s up, whether it\'s a final call, a rotating check-in code, a live activity feed, and a prize raffle wheel for when staff want to give away something extra.',
          'Staff control panel: call groups, auto-advance, rewind, scan claims with the device camera, manage the roster and pre-event queue, run raffles, watch turnout graphs, and archive the event when it ends.',
        ],
      },
      {
        type: 'video',
        src: '/projects/event-pass-control-groups.mp4',
        poster: '/projects/event-pass-control-groups.jpg',
        ratio: '1280 / 758',
        caption: 'The staff control panel mid-round: the current group beside the backlog of people called who still haven\'t collected, round progress against the room, and one primary button that changes with the round.',
      },
      { type: 'heading', text: 'How I built it' },
      {
        type: 'text',
        text: 'The front end is React 19 and Vite, with Firebase behind it. Firestore holds a live event document with claims, queue, and feed collections. Everything the client isn\'t allowed to decide lives in 27 Cloud Functions: 21 callables, plus Firestore triggers, two scheduled jobs, and a crash-report endpoint. That split is basically the architecture. Numbers, membership, staff status, and eligibility all come from a verified token on the server, and the browser only chooses which screen to draw! To match the club\'s vibe, the UI is built on rough.js and its wired-elements, which give everything a hand-drawn sketchbook look. Yes, even the crash screen.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-login.mp4',
        poster: '/projects/event-pass-login.jpg',
        ratio: '1280 / 786',
        caption: 'Staff login, creating a live event, and pre-event user logins from the staff side.',
      },
      {
        type: 'list',
        items: [
          'Built a rewind that steps backwards through the group, the previous group, round-not-yet-started, and the previous round\'s final call. It exists for staff misclicks, not second helpings: the server tests eligibility as "claimed in this round or a later one" rather than trusting the UI, so nobody who already grabbed a prize can rewind their way into another.',
          'Wired up auto-advance with a claimed-percentage threshold, a group timer, a next-round timer, and a final-call timer, plus a backlog limit that holds everything until the staff table catches up with the people already called (that one is my favorite). It runs in the staff control panel, not on the server, which is a real tradeoff: close every control panel and the event politely stops advancing. For a room that always has staff at the front, I\'ll take that over yet another scheduled function.',
          'Stored staff numbers as negative integers (shown as S1, S2, and so on). They sort ahead of #1, the group-call window can never reach them, and every query on a positive number excludes them for free.',
          'Built a demo mode that drives up to 300 simulated attendees through staff-only server callables that share the production transaction and eligibility code, so I could rehearse how the queue behaves and use it to train new staff. It refuses to touch any event that wasn\'t created as a demo.',
        ],
      },
      {
        type: 'video',
        src: '/projects/event-pass-raffle.mp4',
        poster: '/projects/event-pass-raffle.jpg',
        ratio: '1280 / 758',
        caption: 'The prize raffle on the projector. The wheel grows past screen height mid-spin so names passing the pointer stay readable from the back of the room.',
      },
      { type: 'heading', text: 'The attendee is evil and wants to steal from us' },
      {
        type: 'text',
        text: 'Every attendee is a signed-in user on a device I don\'t control, standing in a room where free books are being handed out. They will try anything to get extra prizes. Most of the structure and security follows from that assumption.',
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
          'Used physical presence as an auth factor: the display shows a QR code built from a staff-only secret and a 60-second time bucket, so opening the site directly gets you a wall, not a number. I widened the server\'s accepted window to six buckets after the three I shipped first turned out way too narrow. Someone just walking in has to finish a whole Discord OAuth on venue Wi-Fi shared with 300 other phones, so the tight window was closing the gate on people already through it. (It\'s a keyed 32-bit hash, not an HMAC. The goal is "you had to be in the room", not "withstand a nation-state", and a code that dies in six minutes is plenty for a book giveaway.)',
          'Moved login off the implicit grant, which had been leaving a real Discord access token in every attendee\'s localStorage for 24 hours, to an authorization-code exchange with PKCE. Nothing Discord issues ever reaches the browser now, and the old tokens get actively deleted from anyone who still has one.',
          'Filtered display names and avatar URLs on the server. Names go through a profanity and impersonation filter (sorry, nobody gets to be "admin"), and avatars have to come from Discord\'s CDN. A filter the client enforces is one direct callable away from being skipped, and the value ends up on a projector in front of a room.',
        ],
      },
      { type: 'heading', text: 'When the floodgate explodes' },
      {
        type: 'text',
        text: 'The load profile is zero traffic, then the entire user base hitting one document at once, then zero traffic again (what a fun problem). Number assignment runs in a transaction against the live event document that holds the counters, and a transactional read takes a lock. The catch: attendees who already had a number were going through that same transaction on every reload, retry, and ticket reopen, so they were contending with every brand-new check-in for no reason. Now a returning attendee gets two point reads and a lock-free batch, and only someone without a claim falls through to the transaction.',
      },
      {
        type: 'list',
        items: [
          'Raised the hot callables to 60 max instances, which did nothing until I gave them a full vCPU. Below one CPU, Cloud Run refuses to run more than one request per instance, so sixty instances just meant sixty concurrent check-ins and sixty cold starts landing on the first people through the door. With a full vCPU, each instance takes 20 at a time.',
          'Found the display\'s activity feed was one array document rewritten in a transaction per claim, which put the whole room behind a single contended write. Split it so each item is its own document, trimmed on a schedule.',
          'Discovered four sweeps had quietly grown past Firestore\'s 500-operation commit limit, including the one that converts the pre-event queue when doors open. That one failed for the entire event once ~250 people were waiting, leaving nobody with a number. All four are paged at 200 now, and the queue sweep uses a cursor so a skipped entry can\'t send it around in circles forever.',
          'Caught the QR code being rebuilt from scratch on every render, in a component that re-renders once a second for its clock. Memoizing on the payload was a one-line fix worth 3.9 ms and 137 KB of garbage per render (measured on the old, bigger payload; more on that below).',
        ],
      },
      { type: 'heading', text: 'The QR code bug' },
      {
        type: 'text',
        text: 'I knock the attendee\'s number out of the middle of their own QR code, which sounds fine, since error correction level H is advertised as surviving 30% damage. But that 30% is split across Reed-Solomon blocks, and each block corrects on its own. A hole in the middle is one contiguous blob that interleaving doesn\'t spread evenly, so the worst block took 16 damaged codewords when it could only fix 15. Every attendee numbered 100 or above had a ticket that couldn\'t be scanned (whoops). I compressed the payload from 207 bytes of JSON down to 105 bytes of pipe-separated fields, which dropped the code from version 16 to version 10, drew every module about 40% larger in the same box, and left the worst block at two thirds of its budget. The tests now measure damage per block against the same encoder react-qr-code uses, and a regression test asserts the old geometry still fails, so nobody can "simplify" it back.',
      },
      {
        type: 'video',
        src: '/projects/event-pass-qr-scan.mp4',
        poster: '/projects/event-pass-qr-scan.jpg',
        ratio: '894 / 1280',
        caption: 'A staff member checking off #301 from the control panel\'s camera scanner. The claim is marked for the round, and the attendee\'s ticket flips to "Item claimed" and hides its QR.',
      },
      { type: 'heading', text: 'Tests, tests, and more tests (and deployment)' },
      {
        type: 'text',
        text: 'You can\'t debug anything on the night of an event (if you can, I salute you), which set the bar for what I had to verify beforehand. I ended up with 221 automated tests across four layers, a load-test harness, and a development loop that runs entirely offline.',
      },
      {
        type: 'list',
        items: [
          '151 pure unit tests over the auth step machine, claim access codes, QR payloads, raffle weighting, retry classification, and the name and avatar filters.',
          '69 Firestore rules tests against the emulator, gating every deploy. The rules are the only thing between a signed-in Discord user and the event\'s data, and a bad edit is invisible until someone can\'t claim a number.',
          'A boot smoke test that evaluates the whole client module graph in JSDOM, because a successful vite build isn\'t evidence the app can start.',
          'The full system runs against local Firestore, Auth and Functions emulators with a seed script, plus three fake logins (staff, member, guest) that the server only honors when it\'s running in the emulator, a branch that can\'t run in a deployed function.',
          'A load-test script that fires a crowd of check-ins at a non-production project, reports latency percentiles and errors by code, and asserts that every attendee got a distinct number and the counter landed where it should. It refuses to run against production, because I know myself.',
          'GitHub Actions runs lint, unit tests, the smoke test and rules tests before anything deploys, with production behind a protected environment. Deploys write the Functions runtime config from repo configuration, after a real bug where a gitignored env file meant CI deploys silently fell back to code defaults. The pipeline also fails if App Check enforcement is switched on without a site key, since that would lock out every attendee at once.',
        ],
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'text',
        text: 'Most of the work above fixes things I got wrong the first time around. The lock contention, the 500-write ceilings, the too-narrow check-in window and the unscannable three-digit tickets were all discoverable before an event rather than during one. That\'s why the load test and the 300-person demo mode exist now, and why I\'d build them first next time. You live and learn.',
      },
    ],
  },
  {
    slug: 'purdue-archery-website',
    logo: 'src/assets/logos/puac-practice-manager.svg',
    receipt: { qty: 1, impact: 'Live · purduearchery.club' },
    title: 'Purdue Archery Website',
    description:
      'Membership, QR practice check-in, pass sales, and the public website for Purdue\'s Archery Club, built on our Discord as the source of truth for identity.',
    summary:
      'Purdue Archery Club used to run practice check-in off a paper sign-in sheet, with someone manually decrementing everyone\'s remaining practices in a spreadsheet. I built a Firebase app that logs members in with the Discord account the club already uses for everything else, checks them into practice with a QR scan, sells and tracks their passes, and lets officers edit the public website without a code deploy. It\'s been live at purduearchery.club since 2025.',
    year: '2025',
    role: 'Solo — Purdue University Archery Club',
    stack: ['React 18', 'React Router 6', 'Vite', 'Firebase', 'Cloud Functions', 'Firestore', 'Discord API', 'Resend'],
    links: [
      { label: 'Live site', href: 'https://purduearchery.club' },
      { label: 'Source', href: 'https://github.com/g3vin/puac-practice-manager' },
    ],
    poster: '/projects/puac-front-page-poster.jpg',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Every club member is already on the club Discord. That\'s where practices get scheduled, where officers post, and where bans happen when someone needs to be removed. Rather than build a second identity system, I built the whole platform on top of it: just sign in with Discord. Everything downstream, like who\'s an officer, who\'s allowed in, and whose pass is active, reads off that one login. What started as "replace the paper sign-in sheet" grew into membership, QR check-in, pass sales pulled automatically off order emails, a staff dashboard, and a CMS for the public site: 27 Cloud Functions, about 4,800 lines of server code, and a lot of feature creep I regret nothing about.',
      },
      {
        type: 'video',
        src: '/projects/puac-front-page.mp4',
        poster: '/projects/puac-front-page-video-poster.jpg',
        ratio: '1280 / 744',
        caption: 'The public landing page. The calendar, pricing cards, and photo pile are all officer-editable, not hardcoded.',
      },
      { type: 'heading', text: 'Membership & identity' },
      {
        type: 'list',
        items: [
          'Discord OAuth2 is the only way in, so there\'s no password system for me to manage or leak. The sign-in handoff never puts a token in a URL: the server gives the browser a one-time code that\'s good once, for one minute, and gets redeemed inside a transaction.',
          'Login state mirrors live off a Firestore onSnapshot, so a ban reaches an already open tab within about a second. (Role changes are slower. They refresh the next time that member signs in.)',
          'Every member gets a digital pass at /my-id: a QR code holding 128 random bits of opaque scan token instead of anything derived from their account.',
          'Email verification is a 6-digit code sent through Resend, generated with crypto.randomInt, stored salted and hashed, compared with timingSafeEqual, and dead after 15 minutes or 5 wrong guesses. Overkill for an archery club? Probably. It was fun though.',
          'First-time sign-ins go through a short profile step, just name and email, before landing anywhere else.',
          'Officer routes are gated by three Discord roles (officer, admin, and faculty advisor) and enforced twice: OfficerRoute in the UI, and again in Firestore security rules, so the UI check is a convenience, not the boundary. The rules also stop members from writing privileged fields, like their own ban flag, by calling Firestore directly.',
        ],
      },
      {
        type: 'video',
        src: '/projects/puac-my-id.mp4',
        poster: '/projects/puac-my-id.jpg',
        ratio: '588 / 1280',
        caption: 'A member\'s /my-id pass. The QR encodes a random token, not anything derived from their account.',
      },
      { type: 'heading', text: 'Practice attendance & QR check-in' },
      {
        type: 'text',
        text: 'Practices already exist as scheduled events in the club Discord, so I didn\'t duplicate scheduling anywhere. A sync job pulls them in every 15 minutes and keeps the ones whose names read as a practice ("practice", "range night", "open range", "shoot night"), because nobody needs attendance tracked at a social. The scheduled practice and what actually happens that night are separate records on purpose, so a stale or missing Discord event never blocks check-in. A session opens itself on the first QR scan of the night (no "start" button to forget), and closes itself 15 minutes after the scheduled end, or 3 hours after that first scan if nothing was scheduled. Officers can also end one early.',
      },
      {
        type: 'list',
        items: [
          '/scan is the officer check-in screen. It uses the browser\'s native BarcodeDetector where one exists, and falls back to a self-hosted zxing WebAssembly build where it doesn\'t (hi, iOS Safari). There\'s a manual check-in for dead phones and a sell-at-the-door flow for walk-ins.',
          'Check-in is race-safe: the "is there a live session?" lookup happens inside the same transaction that writes the attendance, so two officers scanning the first two archers at the same instant can\'t open two sessions.',
          'A member\'s attendance history at /my-practices is a Firestore collection-group query that spans both the current layout and the older one, so records written under the previous schema don\'t just vanish from anyone\'s history.',
          'Deleting a practice is a real operation, not a hide. It refunds every day pass spent on it first, then removes the Discord event, then recursively deletes the practice and its attendance, and it refuses outright while a session is still live. Hiding one only pulls it from staff lists and leaves history alone. Two very different buttons.',
        ],
      },
      // TODO: screen recording — /scan officer QR check-in flow
      {
        type: 'video',
        src: '/projects/puac-scan.mp4',
        poster: '/projects/puac-scan.jpg',
        ratio: '1280 / 740',
        caption: 'The /scan officer check-in screen, scanning member passes with the live camera.',
      },
      { type: 'heading', text: 'Passes & payments' },
      {
        type: 'list',
        items: [
          'Term and day pass prices and colors come from the same officer-editable content as the public pricing cards, so a pass can\'t be advertised in one color and issued in another.',
          'Purchases happen on TooCOOL, and the source of truth for a purchase is its order-confirmation email. A scheduled Cloud Function reads those out of a Gmail inbox every 5 minutes, parses the attached PDF receipt, writes the pass to Firestore, and labels the email "Processed" so it can never be counted twice. The member\'s confirmation goes out through Resend afterward, so a Resend outage can\'t stop a purchase from registering.',
          'Door sales write the pass, the check-in, and the sales-ledger entry in one transaction, so there\'s no state where someone paid but isn\'t checked in.',
          'Rained-out night? Officers can refund every day pass spent on a session without deleting anything, which also cancels the pass that check-in activated. Refunds are transactions guarded by a refundedAt stamp, so two officers double-tapping the same refund only refund it once.',
          'Officers can also issue or adjust a pass by hand for everything automation can\'t cover: comps, corrections, and general chaos.',
        ],
      },
      { type: 'heading', text: 'Discord integration' },
      {
        type: 'text',
        text: 'Discord stays the single source of truth for bans instead of the site keeping its own copy. Every login checks Discord\'s ban list and the member\'s roles in parallel, then mirrors the result into a Firestore flag inside a transaction for real-time lockout. There\'s deliberately no "unban" button anywhere in the app: unbanning happens in Discord, where the ban actually lives, and the flag clears itself the next time that person logs in. That\'s one extra API round trip per sign-in, in exchange for never having two systems disagree about who\'s banned.',
      },
      {
        type: 'list',
        items: [
          'Guild membership syncs every 6 hours into a per-day time series (joins over time, percent of the server with a site account), charted on the staff overview. When Discord\'s privileged intents aren\'t available, the chart explains why it\'s empty instead of just being empty.',
          '/pass (anyone) and /session (officers only) slash commands, with Discord\'s request signatures verified using nothing but Node\'s crypto module. Members can pull up their pass and officers can check live headcount without leaving Discord or exposing anyone\'s info to the rest of the server.',
        ],
      },
      { type: 'heading', text: 'The line I\'d want a second opinion on' },
      {
        type: 'text',
        text: 'When Discord can\'t answer, the ban check fails open. If Discord\'s API is down at 7pm on a practice night, a banned member could sign in. The alternative is that nobody signs in, and a gym full of archers stands around while an officer refreshes Discord\'s status page. Bans are rare and officers are physically in the room, so I picked the failure that keeps practice running. I still go back and forth on it.',
      },
      { type: 'heading', text: 'Staff dashboard' },
      {
        type: 'text',
        text: 'The officer side is a full internal admin tool at /dashboard, tabbed and swipeable on mobile, since officers run most of this from their phones at practice. Every chart on it (bar, line, heatmap, sparkline) and every piece of shared UI (data table, drawer, confirm dialog, toasts, collapsible sections, stat tiles) is hand-built rather than pulled from a charting or component library, so it all matches the app\'s theme.',
      },
      {
        type: 'list',
        items: [
          'Overview: attendance and membership charts plus the Discord growth stats.',
          'Members: a searchable, filterable table with CSV export and a per-member drawer for editing pass status, issuing refunds, banning, or permanently deleting an account. Deletion anonymizes instead of erasing: attendance and the pass ledger get re-keyed to one anonymous id, so the club\'s night counts stay accurate without keeping anyone\'s identity around.',
          'Practices: a schedule view with a drawer per practice or session for closing a session early, refunding a rained-out night, or deleting a practice, each with a confirmation that tells you exactly what\'s about to happen.',
          'Website: the CMS for the public site.',
        ],
      },
      {
        type: 'video',
        src: '/projects/puac-dashboard-overview.mp4',
        poster: '/projects/puac-dashboard-overview.jpg',
        ratio: '1280 / 776',
        caption: 'Dashboard overview: attendance, membership, and Discord growth charts, all hand-built.',
      },
      {
        type: 'video',
        src: '/projects/puac-dashboard-members.mp4',
        poster: '/projects/puac-dashboard-members.jpg',
        ratio: '1280 / 794',
        caption: 'The members table, with the drawer for pass edits, refunds, bans, and deletion.',
      },
      { type: 'heading', text: 'Editable website content (a small CMS)' },
      {
        type: 'text',
        text: 'The parts of the public site that change every semester used to be hardcoded JSX, which meant a code deploy for something as small as a new officer photo, and nobody without programming experience could update anything. I moved those sections into Firestore documents editable from the dashboard: landing copy and pricing cards, the FAQ, officer boards versioned by year (starting a new year adds a board instead of overwriting the last one), the competitive roster and tournament results by year, the join steps and Discord invite link, and footer/social links.',
      },
      {
        type: 'list',
        items: [
          'Officer uploads get downscaled and re-encoded to WebP in the browser with Canvas before they leave the phone, since officers upload straight from their camera rolls. Committed site assets go through a separate sharp script at build time that emits 480, 960, and 1600px widths (and 4096/8192 for the panorama).',
          'Every editable section falls back to committed seed content, so a missing document or a failed read renders the last known-good version instead of a blank section. Worst case, the site looks like it did last semester, which beats looking like nothing.',
          'Read access is public, since a logged-out visitor still needs to see the site, and write access is officer-only, enforced in Firestore security rules.',
        ],
      },
      {
        type: 'video',
        src: '/projects/puac-cms.mp4',
        poster: '/projects/puac-cms.jpg',
        ratio: '1280 / 794',
        caption: 'Editing a pricing card from the dashboard CMS, no deploy required to see it live.',
      },
      { type: 'heading', text: 'Public site' },
      {
        type: 'list',
        items: [
          'Landing page with an animated hero, a polaroid-style photo pile, and a Google Calendar-style practice and event calendar.',
          'An interactive 360° panorama of the range on Photo Sphere Viewer, plus range, equipment, officer, competition (results and galleries by year), FAQ, join, and merch/sponsorship pages.',
          'A contact form. It\'s the one endpoint anyone on the internet can reach, so it got hardened the hardest: IPs stored only as SHA-256 hashes, transactional rate limits (3 per IP per 10 minutes, 30 site-wide per hour), a honeypot field, and Discord mentions disabled so nobody can use it to @everyone the club server. There\'s an origin allowlist too, but the code comment is honest about it: that one\'s a courtesy, not a defense.',
          'Mobile-tuned details like edge-scroll and swipe gestures, device-tilt effects, viewport-height fixes for mobile browser chrome, and a network-first service worker.',
        ],
      },
      {
        type: 'video',
        src: '/projects/puac-range-layout.mp4',
        poster: '/projects/puac-range-layout.jpg',
        ratio: '1280 / 790',
        caption: 'The interactive range layout. Scrolling walks through the range one line at a time, from the targets back to the waiting area.',
      },
      {
        type: 'image',
        src: '/projects/puac-calendar.png',
        alt: 'Calendar page with the weekly practice schedule above a list of upcoming practices',
        ratio: '1600 / 988',
        caption: 'The calendar: the usual weekly schedule up top, and the upcoming practices pulled from Discord below it.',
      },
      {
        type: 'gallery',
        images: [
          {
            src: '/projects/puac-join.png',
            alt: 'Join page listing four numbered steps to join the club',
            ratio: '1400 / 1082',
            caption: 'The join steps, editable from the dashboard.',
          },
          {
            src: '/projects/puac-contact.png',
            alt: 'Contact form with name, email, and message fields',
            ratio: '1400 / 1082',
            caption: 'The contact form, the one endpoint anyone on the internet can reach.',
          },
        ],
      },
      { type: 'heading', text: 'Operations & tooling' },
      {
        type: 'list',
        items: [
          'Trip logistics: a Power Automate flow (living outside this repo, in Microsoft land) copies the university\'s approved-driver SharePoint spreadsheet to Google Drive, and a Cloud Function reads it, parses Excel\'s serial dates to enforce expiry, and adds or removes the matching Discord role.',
          'Migration and backfill scripts for schema changes, a slash-command registration script, and a reset for local dev.',
          'Firestore rules, storage rules, and composite indexes are checked into the repo and deployed from it, not clicked together in the console.',
          'Server functions lazily import googleapis, so the ones that don\'t need it don\'t pay for it in cold starts.',
        ],
      },
      { type: 'heading', text: 'Testing' },
      {
        type: 'text',
        text: 'Eleven test scripts (about 2,200 lines) run standalone or against the Firestore emulator. They cover rate limits, session windows, pass-expiry math, Discord rollups, email templates, and 97 allow/deny assertions against the security rules. The honest gap: CI builds and deploys but doesn\'t run any of them yet. The rules are the only thing standing between a signed-in member and everyone else\'s data, so those tests should stand between a bad rules edit and production. Event Pass already works that way. This project hasn\'t caught up.',
      },
      { type: 'heading', text: 'Where this goes next' },
      {
        type: 'text',
        text: 'This started as a fix for a paper sign-in sheet and, one feature at a time, turned into the club\'s whole management system: membership, payments, attendance, comms, and the public website in one place. The next pieces of work aren\'t features. They\'re about making the guarantees match the design. Gate deploys on the rules tests. Move the manual pass edit, currently a read-then-write, into a transaction like everything else that touches money. And actually build scan-token rotation, which the data model was designed for but no function does yet.',
      },
    ],
  },
  {
    slug: 'inkblot',
    logo: 'src/assets/logos/inkblot.svg',
    status: 'in-progress',
    receipt: { qty: 1, impact: '3 on-device models' },
    title: 'Inkblot',
    description:
      'A local-first desktop writing app with a rich-text editor, an infinite canvas, version history, and on-device dictation and read-aloud.',
    summary:
      'Inkblot is the writing app I wanted and couldn\'t find: a Tauri + React desktop app where documents, notes, and planning canvases all live in plain files on my own disk. There are no accounts and no sync servers, and the heavy features (dictation, read-aloud, rhyme suggestions) run on models that live on the machine. I\'m still building it, so this page covers where it stands today.',
    year: '2026',
    role: 'Solo project',
    stack: ['React', 'Tauri', 'Rust', 'TipTap', 'ONNX Runtime', 'Kokoro', 'whisper.cpp'],
    links: [],
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Inkblot keeps drafts, character notes, and mood boards in one place. A project is a folder, a document is a JSON file inside it, and the file tree in the sidebar mirrors what\'s on disk. A project can live anywhere, including an iCloud or OneDrive folder, which gets me syncing across machines without me running a server. The front end is React 19 on Vite with TipTap as the editor, and the Rust side handles everything a webview can\'t: the microphone, supervising the speech models, and trackpad haptics (swiping between sidebar tabs ticks the trackpad through NSHapticFeedbackManager, which the webview has no API for).',
      },
      { type: 'heading', text: 'What\'s in it so far' },
      {
        type: 'list',
        items: [
          'A TipTap editor with custom nodes, including resizable images, tables, embedded Pinterest boards, and an iMessage-style conversation tile for writing text-message dialogue. The conversation tile saves a static HTML snapshot alongside its data, so a document still displays it without mounting the interactive view.',
          'Notes anchored to a quote in the text, marked by a colored dot at the end of the passage. The dots are ProseMirror decorations, and they only get rebuilt when the set of notes actually changes, not on every keystroke.',
          'Focus mode, a fullscreen overlay that shows the draft one sentence at a time. It\'s only a view: every edit still goes through the real editor underneath, and the overlay just moves its selection.',
          'Writing tiles for synonyms, definitions, parts of speech, and rhymes. The rhyme tile narrows candidates by shared suffix, then ranks them with a small ONNX model running in the webview.',
          'Story folder presets (Characters, Settings, Outline, Novel) that give matching folders their own icons and a "New Character" style button in the file tree.',
        ],
      },
      { type: 'heading', text: 'Version history without a server' },
      {
        type: 'text',
        text: 'Google Docs colors each edit by the collaborator who made it. Inkblot only has one writer, so it colors edits by sitting instead: every launch of the app gets a session id, hashed to a stable hue, and each checkpoint carries it. The history panel groups checkpoints by day and then by bursts of editing (a 15-minute gap starts a new burst), and it can compare any two versions side by side with a word-level diff. Merging works per paragraph, so I can take one paragraph from last Tuesday without undoing the rest of the week. Each document keeps its 200 most recent automatic checkpoints, and pruning skips named versions, so the checkpoints I bothered to name never age out.',
      },
      { type: 'heading', text: 'A canvas for planning' },
      {
        type: 'text',
        text: 'The biggest feature so far is an infinite canvas for outlining and mood boards: cards, images, audio, links to other documents, groups, and labeled edges between them. Canvas files use the open JSON Canvas format, so another JSON Canvas app can open them too. A few design decisions carry most of the weight:',
      },
      {
        type: 'list',
        items: [
          'Undo stores whole-document snapshots, not inverse patches. The reducer never mutates, so an untouched node keeps its object identity, and a snapshot costs one new top-level object plus pointer copies instead of a deep clone. Patches are a bug farm for compound edits: deleting a node also deletes every edge touching it, and undo has to bring all of it back as one step.',
          'Nothing gets dispatched mid-drag. Snap targets are computed once at pointer-down, alignment guides are painted straight to the DOM, and the move lands in state once, on pointer-up. That keeps a drag at frame rate on a big canvas and makes it exactly one undo step.',
          'Canvas images are content-addressed (the filename is a hash of the bytes), so pasting the same picture twice writes one file. Text documents inline their images as base64, but twenty photos on a canvas would have meant a multi-megabyte file to re-parse on every open.',
        ],
      },
      { type: 'heading', text: 'Speech, both directions' },
      {
        type: 'text',
        text: 'Dictation is my inkblot-dictation crate, pulled in as a Git dependency with the Metal backend turned on. I split it out so this codebase didn\'t have to carry a speech-to-text pipeline, and the app side is a thin set of Tauri commands plus a level meter for the mic indicator. Read-aloud goes the other way, using the Kokoro TTS model. The Rust side keeps a long-lived Python worker running Kokoro and talks to it over stdin and stdout, so the model loads once instead of once per sentence. If there\'s no usable Python, it falls back to kokoro-js running in WebAssembly. Text is split at paragraph, sentence, and clause boundaries because Kokoro gets worse on long inputs, and a map from characters back to document positions lets the editor highlight each word as it\'s spoken.',
      },
      { type: 'heading', text: 'Where it stands' },
      {
        type: 'text',
        text: 'Most of the app can only be exercised inside the Tauri webview, so automated tests cover the pure-logic parts, where bugs are quiet and expensive. There are thirteen headless suites for the canvas: persistence, viewport math, the reducer and undo, edges, groups, snapping, search, and a jsdom mount of the real canvas surface. The Tauri modules are stubbed with an in-memory filesystem, so the real storage code runs against them instead of a reimplementation. Running them for this write-up, the canvas search suite fails, so that goes to the top of the list. After that: the synonym model still needs work before it earns a place next to the rhyme tile, the text editor needs the same test coverage the canvas has, and the whole thing needs packaging and signing before anyone but me can install it.',
      },
    ],
  },
  {
    slug: 'inkblot-dictation',
    logo: 'src/assets/logos/inkblot-dictation.svg',
    receipt: { qty: 1, impact: '0 network calls' },
    title: 'Inkblot Dictation',
    description:
      'An offline Rust dictation pipeline with mic capture, VAD chunking, and local Whisper transcription. Built to be embedded in a Tauri app without depending on one.',
    summary:
      'inkblot-dictation is a standalone Rust crate that turns a live microphone stream into cleaned-up text with an on-device Whisper model. Audio is chunked on speech and silence, transcribed with no network calls, and exposed as a plain callback API any Rust app can use.',
    year: '2026',
    role: 'Solo project',
    stack: ['Rust', 'Tokio', 'cpal', 'whisper.cpp', 'whisper-rs'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin/inkblot-dictation' }],
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'I\'m building a Tauri + React app that wants live dictation, and I didn\'t want that app\'s codebase clogged up with my speech-to-text solution. So inkblot-dictation is its own crate: microphone in, cleaned transcript out, no cloud calls and no Tauri dependency. It loads a local Whisper model once, listens on the default input device, decides for itself where one spoken phrase ends and the next begins, and hands back a raw transcript and a cleaned one over a callback, whether the caller is a Tauri command or a plain CLI.',
      },
      { type: 'heading', text: 'Two stages, one boundary that matters' },
      {
        type: 'text',
        text: 'The pipeline is two async tasks connected by bounded channels: a chunk builder that owns the audio, and a transcription worker that owns Whisper. They\'re kept separate for a reason. cpal calls the input callback on a real-time audio thread, and blocking that thread for even a few milliseconds can drop audio. So the callback only converts samples and does a try_send, always dropping a packet rather than waiting. Whisper inference, on the other hand, is a CPU-bound call that takes real time, so it runs inside tokio::task::spawn_blocking instead of on the async runtime, where it would stall every other task sharing the thread.',
      },
      {
        type: 'list',
        items: [
          'The audio callback is one generic build_typed_input_stream<T> that handles whatever format the default input device actually hands over (F32, I16, or U16), rather than assuming F32 and failing on devices that don\'t offer it.',
          'Every packet gets downmixed to mono and linearly resampled to the 16kHz Whisper expects, regardless of the mic\'s native rate. It\'s plain linear interpolation, not a proper sinc resampler. Dictation isn\'t where resampling artifacts show up, so I didn\'t pull in a DSP crate to avoid them.',
          'The Whisper model loads once and is shared behind an Arc, with a fresh WhisperState per chunk, so concurrent inference never shares mutable state.',
        ],
      },
      { type: 'heading', text: 'Chunking a stream that never stops' },
      {
        type: 'text',
        text: 'Whisper doesn\'t take a live stream, it takes a buffer, so something has to decide where one buffer ends and the next begins. Voice activity detection here is a single RMS-threshold gate, not a model: root-mean-square against a floor (0.012 by default). It\'s only used for that boundary decision, not for cleaning the audio. Once speech crosses the threshold, a chunk opens. It closes on whichever fires first: 900ms of continuous silence (once the chunk is at least 1.2 seconds old, so a quick breath doesn\'t split "um... okay" into two chunks), or a 12-second hard cap, so one long run-on sentence can\'t grow the buffer without bound.',
      },
      {
        type: 'list',
        items: [
          'While a chunk is still open, it gets re-transcribed every 1500ms and emitted as a Partial event, which gives a UI something to show mid-sentence instead of a blank field until the pause. Each partial re-transcribes the whole growing buffer from scratch, and Whisper runs with no_context(true), so nothing carries between calls. Simple, at the cost of doing some of the same work twice.',
          'That statelessness is what makes a failed chunk harmless: if one chunk errors, there\'s no cross-chunk state for it to corrupt. It is not, however, the same thing as ordering. More on that below.',
        ],
      },
      { type: 'heading', text: 'Cleanup, and the bugs I found writing this' },
      {
        type: 'text',
        text: 'Whisper already returns cased, punctuated text. My cleanup pass throws that away on purpose: it lowercases everything, turns spoken punctuation ("comma", "period", "new paragraph") into the real thing, fixes spacing before punctuation, then re-capitalizes sentence starts and a standalone "i" (checking the characters on either side, so "is" and "it" survive). The upside is one predictable output format whether you said "comma" or just paused. The downside is that proper nouns and acronyms get flattened, so "NASA" comes out as "nasa". Both the raw and cleaned text ship in every event, so a caller can always fall back to what Whisper actually heard.',
      },
      {
        type: 'text',
        text: 'Re-reading it for this write-up turned up some bugs that are, honestly, pretty funny:',
      },
      {
        type: 'list',
        items: [
          'The spoken-punctuation rules are substring matches with a leading space but no trailing boundary. " comma" matches inside " command", so "run the command" comes out as "run the,nd". Periodic, colonel, and colony all have the same problem.',
          'The " quote " rule runs before " end quote ", so "end quote" becomes "end “" and the end-quote rule can never fire.',
          '" new paragraph " needs a trailing space, but Whisper usually hands back "new paragraph." with a period attached. The most useful command is the one that most often doesn\'t work.',
        ],
      },
      {
        type: 'text',
        text: 'The fix for all three is the same: split into words first and match whole tokens, longest phrase first, instead of patching the string in place.',
      },
      { type: 'heading', text: 'Staying out of the app\'s way' },
      {
        type: 'text',
        text: 'The crate never imports tauri, and that\'s on purpose. The public surface is DictationService (load a model, start/stop a session, ask its status) plus an Arc<dyn Fn(DictationEvent)> callback. DictationError converts into a String, so a Tauri command can return it with a plain .map_err(Into::into) without the crate knowing Tauri commands exist, and events are serde-tagged (kind plus payload, camelCase) so they cross Tauri\'s IPC as-is. The included live_dictation example drives the exact same service and callback from a bare CLI loop, which both proves the boundary holds and doubles as a usage demo. GPU backends work the same way: forwarded to whisper-rs as Cargo features (metal, vulkan, cuda), so the host app opts in per device instead of the crate guessing.',
      },
      { type: 'heading', text: 'Where this goes next' },
      {
        type: 'text',
        text: 'This is the working prototype, not the hardened version, and the honest list is longer than I\'d like. The biggest item is ordering: the worker fires off each spawn_blocking inference and never awaits the handle, so several can run at once and finish in any order. A slow partial can land after its own Final, and Finals can arrive after Stopped. A per-session sequence number, or just awaiting each job in turn, fixes it. There\'s also no automated test suite yet, which is how the cleanup bugs above survived. The cleanup module is pure string in, string out, so it\'s the easiest place to start. After that, the fixed RMS threshold needs noise-floor adaptation (a threshold tuned for a quiet room clips soft speech or hangs open in a noisy one), and re-transcribing the whole buffer should become incremental, so partials stop getting more expensive as a chunk grows.',
      },
    ],
  },
  {
    slug: 'lexical-substitution-pipeline',
    logo: 'src/assets/logos/lexical-substitution-pipeline.svg',
    receipt: { qty: 1, impact: '0.488 nDCG' },
    title: 'Lexical Substitution Pipeline',
    description:
      'A multi-stage NLP pipeline that generates and ranks context-aware single-word synonyms, plus a SWORDS evaluation that caught my own data leak.',
    summary:
      'Given a sentence and a target word, this pipeline generates candidate single-word substitutes from four sources, filters them through spaCy syntax and WordNet checks, scores them with Sentence-BERT, BERT fluency, and a learned ranker, optionally reranks with a cross-encoder, and re-inflects the winner to match the target\'s tense and number. I evaluated its ranking on the SWORDS benchmark, and the evaluation turned out to be the most interesting part: my headline number was partly scored on training data, one model had collapsed into a constant, and the most expensive stage makes things worse.',
    year: '2026',
    role: 'Solo project',
    stack: ['Python', 'PyTorch', 'Transformers', 'spaCy', 'Sentence-BERT', 'FLAN-T5', 'scikit-learn', 'NLTK/WordNet'],
    links: [{ label: 'Source', href: 'https://github.com/g3vin/lexical-substitution-pipline' }],
    poster: '/projects/lexsub-ablation.png',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Lexical substitution sounds like a thesaurus lookup until you make it context-aware. Take "falling" in "His soul swooned slowly as he heard the snow falling faintly." You want "drifting" or "settling", not "failing" or "decreasing", and you want it conjugated to match: "drifting", not "drift". I built this as a pipeline instead of a single model because no single signal can be trusted on its own. A masked language model will happily suggest a word that means the opposite, a thesaurus will hand you a synonym that\'s the wrong part of speech for this sentence, and a sentence embedding will call two sentences similar even when the swapped word doesn\'t inflect correctly. Each stage exists to catch what the one before it can\'t see (kinda like the Magi in Neon Genesis Evangelion!).',
      },
      {
        type: 'text',
        text: 'Some real runs, straight from the repo\'s example outputs: on that Joyce line, the pipeline ranks settling, descending, dropping, melting, drifting. On "The horror! The horror!" it offers fear, fright, scare, nightmare. And on "Call me Ishmael." its one surviving answer is "Leave", as in "Leave me Ishmael", which is grammatical, confident, and a completely different novel. Every candidate carries six separate scores (lexical-resource match, target-word similarity, sentence-level similarity, MLM fluency, a learned validity score, and a cross-encoder rerank) that get combined into the final order.',
      },
      { type: 'heading', text: 'The pipeline' },
      {
        type: 'list',
        items: [
          'Candidate generation pulls from four independent sources: WordNet (synonyms plus similar-to, verb-group, hypernym, hyponym, and derivationally related forms, from only the top three senses as picked by SBERT similarity between the sentence and each sense\'s gloss), SWORDS used purely as a lexical resource (never as ground truth), FLAN-T5 prompted up to eight different ways, and the top 150 BERT masked-language-model completions at the target\'s position. Each source gets its own prior, from 1.0 down to 0.25, because a WordNet hit deserves more trust than a T5 guess. A mode flag (full/balanced/fast/resources/mlm/t5) picks which sources run, since the full T5 prompt sweep is by far the slowest part. Balanced mode uses three prompts instead of eight.',
          'Linguistic filtering runs every candidate back through spaCy in context. It gets dropped if it\'s already in the sentence, a stopword, a named entity, shares a lemma or substring with the target, is a WordNet antonym (including one hop out through similar-to synsets, not just direct antonym pairs), or comes back the wrong part of speech once it\'s re-inflected and re-parsed. For verbs specifically, the dependency-parsed argument frame (subject, object, indirect object, preposition, particle) has to be a subset of the candidate\'s own frame, with a WordNet double-object check for ditransitive verbs, so a verb needing a direct object doesn\'t get swapped for one that can\'t take one.',
          'Semantic filtering scores what survives: Sentence-BERT cosine similarity between the original and substituted sentence, an optional bidirectional NLI contradiction check, and a supervised substitute-validity model (RoBERTa with a regression head, fine-tuned on SWORDS\' soft human-agreement labels). That last one has a story, below. There\'s also a WiC-style sense classifier in the code that never got wired into the pipeline, which I\'m counting as a future feature and not a lie.',
          'Ranking combines those signals as a weighted sum with multiplicative penalties for candidates under the semantic/target/MLM/validity thresholds, rather than hard-cutting them (a candidate can survive a bad score, just discounted). The MLM fluency score is 1/log2(rank + 1) of the candidate\'s rank across BERT\'s whole vocabulary, not a raw probability. The alternative is a gradient-boosted ranker (HistGradientBoostingRegressor) trained on SWORDS labels over the five raw scores plus six engineered interaction and gap features. The CLI defaults to the weighted sum; the evaluation runs use the learned ranker.',
          'A cross-encoder reranks the top 24 candidates and gets blended back into the final score. In theory it\'s the most powerful single signal, since it attends over the whole sentence pair instead of pooling to embeddings first. In practice, see below.',
          'Morphology re-inflects the winning candidate to match the target\'s tense, number, and degree via lemminflect, with hand-written fallback rules for plurals, -ing forms, past tense, third-person singular, and comparative/superlative, plus a regex guard against the classic double-suffix bug where an inflector hands back "greaterer" or "classeses".',
        ],
      },
      { type: 'heading', text: 'Evaluating against SWORDS' },
      {
        type: 'text',
        text: 'SWORDS is a lexical-substitution benchmark of real sentences where crowdworkers scored a large candidate pool per target word, so evaluation isn\'t "did it guess the one right answer" but "how well does its ranking agree with a distribution of human judgments." To be precise about what I measured: the evaluation hands the pipeline SWORDS\' own candidate lists and scores how well it ranks them. It measures ranking, not end-to-end generation. I scored all 370 dev-split targets (22,978 candidates) with NDCG@k, MAP@k, precision@k, and pairwise accuracy (the fraction of gold-scored candidate pairs ordered correctly, independent of k), all implemented by hand with per-POS and per-k breakdowns.',
      },
      {
        type: 'text',
        text: 'Two numbers from the dataset shaped decisions before any modeling happened. 82.4% of SWORDS\' candidates are single words, which justified scoping this to single-word substitution instead of chasing multi-word paraphrases. And the mean gold score across all candidates is 0.111: most candidates are mediocre-to-bad even by crowdworker judgment, so a ranker has to actually find the few good ones.',
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
        caption: 'Verbs are the hardest part of speech for this pipeline (NDCG 0.505, precision 0.244), plausibly the cost of the strict subcategorization-frame filtering, on top of verbs just carrying more sense ambiguity than nouns or adjectives.',
      },
      { type: 'heading', text: 'Results, honestly (I leaked my own test set)' },
      {
        type: 'text',
        text: 'The first number I reported was NDCG@10 of 0.531. Then, writing this up, I went back to check which split the learned ranker was trained on. It was SWORDS dev, the same 370 targets I was evaluating on, with an 80/20 split grouped by target. So 296 of the 370 targets behind that headline were training data. On the 74 held-out targets the ranker never saw, the honest numbers are NDCG@10 0.488, MAP@10 0.346, precision@10 0.243, and pairwise accuracy 0.608. That\'s the number on the receipt now.',
      },
      {
        type: 'text',
        text: 'The substitute-validity model had a quieter problem. Across 840 example outputs, its scores range from 0.110907 to 0.110915. That\'s not a signal, that\'s a constant, and specifically it\'s the dataset\'s mean gold score. On labels that are mostly near zero, the regression head found that predicting the average keeps the loss low, and stopped there. Its correlation with gold is 0.03. Since filtered-out candidates score 0, the "feature" was really just a flag for "survived filtering", which the ranker could have gotten for free, minus the 500 MB of weights.',
      },
      {
        type: 'text',
        text: 'I also ran a feature-ablation sweep: drop one signal, re-score the whole dev set, see what breaks. (These runs use the same contaminated set, so read them as comparisons between configurations, not absolute scores.) Removing the MLM fluency score hurts the most, taking NDCG from 0.531 to 0.469, which matched my expectation. What didn\'t: removing the cross-encoder reranker entirely beats the full pipeline on every metric. NDCG 0.541 vs 0.531, MAP 0.365 vs 0.356, precision 0.275 vs 0.263, pairwise 0.639 vs 0.624. The most expensive stage in the pipeline, an extra transformer forward pass per candidate in the rerank pool, is net negative.',
      },
      {
        type: 'image',
        src: '/projects/lexsub-ablation.png',
        alt: 'Bar chart of NDCG, MAP, and precision at k=10 for the full pipeline versus six single-feature ablations, showing "No rerank" scoring highest on all three metrics',
        caption: '"No rerank" is the tallest bar on all three metrics. The pipeline ranks better with the cross-encoder stage removed entirely than with it included.',
      },
      {
        type: 'text',
        text: 'My best guess at why: the cross-encoder is a general sentence-pair similarity model (cross-encoder/stsb-roberta-base, trained for semantic textual similarity), not anything tuned for whether one specific word swap is correct. It plausibly rewards paraphrase-level closeness, two sentences that "mean about the same thing", over the surgical judgment this task needs, and at a blend weight of 0.75 that reward dominates the final score for anything in the rerank pool. It\'s easy to miss if you only eyeball a handful of examples where the top result looks fine. The pipeline shipped with the reranker on by default before I ran this ablation.',
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'list',
        items: [
          'Split my data the way I\'d tell anyone else to: train, dev, and test, each doing exactly one job. Every problem above traces back to the dev split doing three jobs at once (training the ranker, tuning the weights, and grading the result).',
          'Turn the reranker off by default, or replace the general STS cross-encoder with one fine-tuned on SWORDS pairs, instead of trusting a similarity model to do a job it was never trained for.',
          'Catch a collapsed model at training time. A one-line check on the variance of its predictions would have flagged the RoBERTa model before it shipped.',
          'Add real unit tests. The SWORDS evaluation is the only thing exercising this code, and it never touches the heuristic corners like the double-suffix guard or the verb-frame matching. That\'s exactly the kind of code that breaks quietly and only shows up as a slightly worse aggregate score.',
          'Measure what single-word-only scoping actually costs, instead of assuming the ~18% of multi-word candidates weren\'t worth the complexity.',
        ],
      },
    ],
  },
  {
    slug: 'cooling-tower-predictive-maintenance',
    logo: 'src/assets/logos/cooling-tower-predictive-maintenance.svg',
    receipt: { qty: 1, impact: '8 years sensor data' },
    title: 'Cooling Tower Predictive Maintenance',
    description:
      'An XGBoost model predicting days until a cooling tower needs unplanned repair.',
    summary:
      'A machine learning approach to predicting remaining useful life (RUL) for NASA Langley cooling towers, joining eight years of vibration sensor data, maintenance work orders, and local weather to forecast how many days remain until the next unplanned repair. The model never beat the naive benchmark, and working out why was the most useful result.',
    year: '2025',
    role: 'Solo — Langley Student Volunteer Program',
    stack: ['Python', 'XGBoost', 'scikit-learn', 'Pandas'],
    links: [],
    poster: '/projects/cooling-tower-poster.jpg',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Fixing a cooling tower after it fails costs far more than servicing it beforehand, before you even count the downtime. So the useful question isn\'t whether a unit is healthy now, but how long it will stay that way. I framed that as a regression problem: predict Remaining Useful Life (the number of days until the next reactive work order) for a Langley cooling tower and all of its associated pumps.',
      },
      { type: 'heading', text: 'The data' },
      {
        type: 'text',
        text: 'Three sources had to be lined up on one timeline before any modeling could happen.',
      },
      {
        type: 'list',
        items: [
          'AVEVA PI sensor data: hourly vibration readings (PeakVue and overall) from the gearboxes, bearings, and pumps across the cooling towers, from 2017 to 2025.',
          'Maximo work orders: timestamped maintenance records from 2017 to 2022. Two work types, TC and REPR, mark reactive work (something broke or alarmed), and those events are the prediction target. Since the work orders stop in 2022 while the sensors keep going, only 2017 through 2022 has labels to learn from.',
          'Langley AFB METAR weather: hourly local conditions from the airfield next door. The theory was that weather is what wears a cooling tower down unexpectedly.',
        ],
      },
      { type: 'heading', text: 'Modeling' },
      {
        type: 'text',
        text: 'I used XGBoost regression, with evaluation designed around this being time series data. Folds were split chronologically, with the newest year held out, rather than shuffled, so the model is always predicting forward. A random split would let it learn from the future, which isn\'t learning, it\'s memorizing.',
      },
      {
        type: 'list',
        items: [
          'Three-fold cross-validation, ordered oldest to newest, with a final holdout year.',
          'Compared grid search, random search, and Bayesian optimization for hyperparameter tuning. Bayesian won on cost, getting close to the best configuration in about 60 trials where the full grid would\'ve taken tens of thousands.',
          'Scored against a naive benchmark rather than against zero, so any improvement had to be real.',
        ],
      },
      { type: 'heading', text: 'Results, honestly' },
      {
        type: 'text',
        text: 'The naive benchmark averaged an error of 39.43 across folds (27.81, 29.04, 61.43). My first model came in around 41, and tuning never got it under the benchmark. In other words, the model never learned anything a naive guess didn\'t already know. That\'s a real result, not just a failed one: it says the vibration, maintenance, and weather features as I built them don\'t carry enough signal about when the next reactive repair is coming. The third fold is the interesting part. Its error is double the other two, so whatever changed in those later years (new equipment, different maintenance habits, or just a bad year) isn\'t something the features capture. That\'s where the future work is.',
      },
      { type: 'heading', text: 'Presenting it' },
      {
        type: 'text',
        text: 'I presented this work to around 30 NASA engineers and staff at a Jam Session (usually led by my mentor, Charles Liles), walking through cross-validation, leakage, and hyperparameter tuning for time series maintenance data. The goal was partly to share the method and partly to recruit. Attendees with domain knowledge, like the maintenance folks, were invited to help refine the model through a shared Google Cloud Jupyter notebook, which started an ongoing collaboration.',
      },
    ],
  },
  {
    slug: 'turbine-vane-defect-detection',
    logo: 'src/assets/logos/turbine-vane-defect-detection.svg',
    receipt: { qty: 6, impact: 'Team of 6 · Howmet' },
    title: 'Turbine Vane Defect Detection',
    description:
      'A CNN that flags internal defects in X-ray images of jet engine turbine vanes.',
    summary:
      'Howmet Aerospace inspects thousands of cast turbine vanes by having operators read X-ray images for anomalies. Through Purdue\'s Data Mine, our team of six built an image pipeline and a CNN classifier meant to do that flagging automatically. I owned the data splits, the model and its tuning, and the evaluation, which makes me the one who found out the honest test numbers were nowhere near the headline accuracy.',
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
        text: 'Howmet casts the turbine vanes that sit in the hot section of jet engines, where a hidden void or a non-metallic inclusion is the kind of defect you find out about the expensive way. Every part is X-rayed and an operator reads the image. That read is about 87% accurate, and it doesn\'t scale. Howmet brought the problem to Purdue\'s Data Mine asking for a model that could do the flagging automatically. Our team of six picked up where the previous year\'s group left off and built both halves: the image processing pipeline, and the classifier on the end of it.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-comparison.jpg',
        alt: 'Two filtered X-ray images of turbine vanes side by side, the left one showing a mottled defect region near the top edge',
        caption:
          'Anomalous (left) and normal (right) after filtering. The defect is the mottled patch below the leading edge. That\'s the signal the model has to learn.',
        fit: 'contain',
      },
      { type: 'heading', text: 'The image pipeline' },
      {
        type: 'text',
        text: 'The raw input is a DICOM X-ray of the whole part, and the defect is a low-contrast texture change inside a region that\'s already nearly black. Feed that to a classifier directly and it wastes most of its capacity learning to find the vane. So my teammates built a pipeline that takes a DICOM straight off the machine and hands back something a network can actually separate: crop to the vane, run a horizontal Sobel filter to pull out edge structure, invert, sharpen with an unsharp mask, then push the contrast. Every image the model ever sees goes through it.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-pipeline.jpg',
        alt: 'A row of the same vane X-ray at each processing stage: original DICOM, cropped, Sobel filtered, inverted, unsharp-mask sharpened, and contrast enhanced',
        caption: 'One image through every stage, from the original DICOM on the left to classifier input on the right.',
        fit: 'contain',
      },
      { type: 'heading', text: 'Data and splits' },
      {
        type: 'text',
        text: 'This is where my part starts. We had roughly 3,000 human-flagged images, and defective parts are (fortunately for Howmet, unfortunately for us) rare. Augmentation added about 2,000 more. I split anomalous and normal separately at 7:2:1 into train, validation, and test so the class balance held in every split, and oversampled the anomalous class in training.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-split.jpg',
        alt: 'Diagram of the anomalous and normal sets splitting into training, validation, and testing sets',
        caption: 'Splitting each class separately, then oversampling the anomalous side of the training set.',
        fit: 'contain',
      },
      { type: 'heading', text: 'The model' },
      {
        type: 'text',
        text: 'I built the classifier with transfer learning: VGG and ResNet backbones pretrained on ImageNet, with a custom classification head, fine-tuned on vane data. With a few thousand images and two classes, training from scratch was never going to beat borrowing features that already know what edges and textures look like from millions of samples. Then I swept the hyperparameters that mattered most: convolutional layers (2 to 5), batch size (16 to 32), and training length (20 to 50 epochs). The best configurations hit around 94% validation accuracy, which is what our poster leads with.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-tuning.jpg',
        alt: '3D scatter plot of epochs, batch size, and number of convolutional layers, colored by accuracy from 90-94%.',
        caption: 'The hyperparameter sweep. The best runs reach ~94%. The problem is that accuracy is the wrong thing to optimize here, which the test set made very clear.',
        fit: 'contain',
      },
      { type: 'heading', text: 'Results, honestly' },
      {
        type: 'text',
        text: 'That 94% doesn\'t survive the test set. On 159 held-out images, the model caught only 4 of the 27 defective vanes and let 23 through as normal. Overall test accuracy is about 71%. The dataset is about 83% normal, which means a model can say "normal" to everything and score in the eighties without learning anything. We were distracted by accuracy when the thing that matters in inspection is how many defects you miss, and we missed most of them (oops, in retrospect).',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-confusion.jpg',
        alt: 'Confusion matrix on the test set: 4 anomalous correctly flagged, 23 anomalous missed, 23 normal falsely flagged, 109 normal correct',
        caption: 'The number that actually matters is the 23 in the top right: defective vanes the model passed as normal.',
        fit: 'contain',
      },
      {
        type: 'text',
        text: 'The training curves say the same thing a different way. Training accuracy gets past 97% while validation stalls around 91%, training AUC reaches almost 1.0 while validation flattens in the mid-eighties, and validation loss starts rising after about the fifth epoch while training loss keeps falling. That gap is the model memorizing a small number of defect examples instead of learning what a defect looks like.',
      },
      {
        type: 'image',
        src: '/projects/turbine-vane-training.jpg',
        alt: 'Four plots over 25 epochs (loss, accuracy, AUC, and false negatives) each showing training and validation curves diverging.',
        caption: 'Loss, accuracy, AUC, and false negatives per epoch. Train and validation diverge early and never reconverge.',
        fit: 'contain',
      },
      {
        type: 'text',
        text: 'Looking back, I also don\'t fully trust the 94% itself. If augmented copies of an image land in both training and validation (augment first, split second), validation is partly grading the model on pictures it has already seen with a filter on, and a 94% validation vs 71% test gap is exactly what that looks like. X-rays of the same physical part landing on both sides of the split would do the same thing. It\'s the first thing I\'d check.',
      },
      { type: 'heading', text: 'What I would do differently' },
      {
        type: 'text',
        text: 'We concluded the model wasn\'t ready for the factory floor, and I still think that was the right call. But the conclusion we wrote, that more defect images would improve performance, was only part of the story. Labeled defects were exactly what nobody had, so it was an easy thing to blame. If I did it again, I would:',
      },
      {
        type: 'list',
        items: [
          'Split by physical part before augmenting anything, and only augment the training set, so validation can\'t flatter the model.',
          'Optimize for recall, not accuracy. On an 83/17 split, accuracy rewards laziness. A weighted loss or a tuned decision threshold would\'ve made the sweep chase a metric we actually cared about.',
          'Treat it as anomaly detection rather than binary classification. We had normal vanes in abundance, so training on those alone and flagging whatever doesn\'t match sidesteps the class imbalance entirely.',
          'Localize, don\'t just classify. An operator handed a yes/no from a model that misses defects has no reason to trust it. A heatmap over the suspect region gives them something to check, which is a much easier ask.',
        ],
      },
    ],
  },
  {
    slug: 'mailstop-app',
    logo: 'src/assets/logos/mailstop-app.svg',
    receipt: { qty: 1, impact: '3,400+ NASA staff', served: 3400 },
    title: 'MailStop',
    description:
      'Replaced NASA Langley’s 2011 mail routing app with a Power App serving 3,400+ staff.',
    summary:
      'NASA Langley routes all internal mail through MailStop IDs. The app that managed them ran on Oracle APEX from 2011. I rebuilt it on Microsoft Power Apps to drop the Oracle licensing cost and let staff maintain their own assignments.',
    year: '2025',
    role: 'Solo — Langley Student Volunteer Program',
    stack: ['Power Apps', 'Power Fx', 'SharePoint Lists', 'Oracle APEX'],
    links: [],
    poster: '/projects/mailstop-list.png',
    blocks: [
      { type: 'heading', text: 'Overview' },
      {
        type: 'text',
        text: 'Every piece of mail moving inside NASA Langley is sorted by a MailStop ID, which maps a recipient to one of 190 buildings, down to their room and department, for more than 3,400 staff. The previous app was built with Oracle APEX in 2011, and rising license costs plus a very 2011 UI put migration on the table. I rebuilt it as a Microsoft Power App on a SharePoint Lists backend, since Langley already has a strong Office 365 agreement. Along the way, I redesigned the data model and search so staff and admins could find their own assignments more easily, which matters a lot when buildings are being renovated and departments reorganized constantly.',
      },
      {
        type: 'gallery',
        images: [
          {
            src: '/projects/mailstop-landing.png',
            alt: 'LaRC Mailstop landing screen with an Open button',
            caption: 'Landing screen, showing the current app version so staff can mention it in a bug report.',
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
        text: 'The hard part wasn\'t the frontend (though that was tedious), it was the backend swap. The APEX app sat on seven related Oracle tables. SharePoint Lists is flat storage, not a relational database, so every join the old schema relied on had to be reimplemented inside the Power App itself. And the app layer has a trap: delegation. Power Apps can only push some queries down to SharePoint. Anything it can\'t delegate gets evaluated against just the first 500 rows (2,000 at most), with a small warning icon and no error. With 3,400+ people in the data, a careless filter means somebody\'s MailStop silently doesn\'t exist. That constraint drove most of the design.',
      },
      {
        type: 'list',
        items: [
          'Rebuilt the seven-table Oracle schema as SharePoint Lists, moving all relational logic into the app layer since Lists can\'t enforce it.',
          'Made the MailStop list filterable by ID, building, or organization, and paginated it. Besides performing better, it turns finding a particular stop into a quick search instead of a tedious (boring) scroll.',
          'Added a validation view that surfaces the records the old system let rot: missing point of contact, no assignees, invalid building, invalid room.',
          'Put mandatory-field checks, an offsite toggle, and POC search into the create flow, so entering a bad record is harder than entering a good one.',
          'Wrote a manual regression checklist to run before every release. Power Apps\' automated testing tools weren\'t practical for this app, so the test suite is a long, very thorough document.',
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
        text: 'Low-code gave this a quick, cheap turnaround and handed Langley something staff with no programming experience can maintain. But it doesn\'t give you schema-level constraints or relational logic inside the database, and testing it is mostly manual. With more time, I would push more validation into the data layer instead of trusting every write path to check it.',
      },
    ],
  },
]

// Aggregates for the receipt subtotal block. Derived, never hardcoded, so the
// printed totals cannot drift from the project list above.
export const receiptTotals = {
  count: projects.length,
  atLangley: projects.filter((p) => p.role.includes('Langley')).length,
  peopleServed: projects.reduce((sum, p) => sum + (p.receipt.served ?? 0), 0),
}

// Whether a project is still being built -- see `status` above.
export function isInProgress(project) {
  return project.status === 'in-progress'
}

function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}

// What a project URL looks like, written once: App.jsx routes on it and
// lib/seo.js decides a URL's metadata by it, and a grammar kept in two places is
// one the router and the crawler can disagree about. The trailing slash is
// optional because a static host may or may not add one — see the two files
// scripts/prerender.js writes for every project.
const PROJECT_PATH = /^\/projects\/([^/]+)\/?$/

// Whether `path` is shaped like a project URL, whatever slug it names. Distinct
// from projectForPath on purpose: the masthead's back link keys off the shape,
// so a mistyped project URL still offers the way back to the index.
export function isProjectPath(path) {
  return PROJECT_PATH.test(path)
}

// The URL of the project with this slug -- the inverse of projectForPath.
export function projectPath(slug) {
  return `/projects/${slug}`
}

// The project a path names, or undefined where it names none. Module-private:
// callers outside want routeFor below, which answers for every path.
function projectForPath(path) {
  const match = path.match(PROJECT_PATH)
  return match ? getProject(match[1]) : undefined
}

// What a path shows: the home receipt, a project, or nothing. The one place
// that decides, read by both the page that renders and the <head> that
// describes it, so the two cannot disagree about a URL.
export function routeFor(path) {
  if (path === '/' || path === '') return { page: 'home' }
  const project = projectForPath(path)
  return project ? { page: 'project', project } : { page: 'not-found' }
}

// The project after `slug`, wrapping around so the last one still has somewhere
// to send a reader.
export function getNextProject(slug) {
  const index = projects.findIndex((project) => project.slug === slug)
  return projects[(index + 1) % projects.length]
}
