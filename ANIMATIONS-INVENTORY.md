# Animations & interactions inventory (taken from main @ 67f7c83, before the template redesign)

Every item below must still work on branch `template-redesign`. The "How verified" column says how it is checked
(headless Chrome via puppeteer against the local preview, plus visual screenshots). Results are filled in after the redesign.

| # | Feature | Where | Mechanism | How verified |
|---|---------|-------|-----------|--------------|
| A1 | motion bootstrap: `html.motion` / `html.reduce` class | all motion.js pages | motion.js top | `documentElement.classList` |
| A2 | Word-by-word masked headline (`.words` → `.w>span`, `.in`) | index #mission poster | motion.js §0 + motion.css | count `.w` spans, `.in` after scroll |
| A3 | Scroll reveals (`.rv` fade/rise, stagger `--d`) | all motion.js pages | motion.js §1 | count `.rv` and `.rv.in` after scrolling |
| A4 | Blur-to-sharp lines (`.blurin`) | index hero lede, #in-motion, #why, #experts | motion.js §1 | `.blurin.in` after scroll |
| A5 | Lazy videos (`video.lv`: data-src/webm injected, play ≥35% visible, pause off-screen / tab hidden) | index features, newt-cam, phones, rail, experts; features, shared-family-calendar etc. | motion.js §2 | `<source>` injected + `!paused` when in view |
| A6 | Mascot newts on scroll paths (`.newt` drift/peekl/peekr …) | index #features, #phones, #made-for, #helping-hand; subpages | motion.js §3 | inline `transform`/`opacity` changes with scroll |
| A7 | Video chips pop on scroll (`.chip[data-at]` → `.on`) | index cards, phones, rail, experts; features | motion.js §3 | `.chip.on` count > 0 |
| A8 | Pinned scrolly feature tour (`#tour`: `--p` progress bar, `.feat-list li.on`, `.scr-slide.on`, step video play, li click scrolls) | index #tour | motion.js §3 | scroll into tour → `li.on` index changes; click li → scrollY changes |
| A9 | Parallax floaties (`.floaty[data-depth]`) + CSS bob | index hero; subpage heroes | motion.js §3 + `@keyframes bob` | `transform` set on `.floaty` |
| A10 | Hero stage crossfade (4 slides every 8s, `.thumbs` buttons + `.bar` progress, `.stage-hero .bg` from data-bg, pause off-screen) | index hero | motion.js §4 | click thumb 3 → slide 3 `.on`, bg image set, `.paused` when off-screen |
| A11 | Rail carousel (`.rail-wrap` prev/next, disabled at ends, snap) | index #in-motion | motion.js §5 | click next → scrollLeft grows; prev disabled at 0 |
| A12 | Stacking sticky sheets (`.sheet --top` from `<nav>` height) | index .sheets | motion.js §6 | `--top` set, `position:sticky` |
| A13 | Newt cam lens (`--rise --rot --px --py --blur` on scroll, hover glare/lift, REC blink) | index #newt-cam; `.lens.sm` on features, shared-family-calendar | motion.js §8 + CSS | CSS vars change with scroll |
| A14 | Marquee of moments (`.marquee .track` 70s loop, pause on hover, figure hover straighten) | index #moments | CSS `@keyframes mq` | computed `animation-name: mq` |
| A15 | Fanned phone mocks (`.fan .mock` tilt, hover straighten/lift) | index #phones | CSS | computed transform on `.mock` |
| A16 | Tilt-grid stickers + peek newt (`#start` `.tw` → `.in`, `.peek-newt` slides up, hover straighten) | index #start | motion.js §1 (`.tw`) + CSS | `.tw.in` |
| A17 | Poster text (`.poster` with inline image chips `.ic`) | index #mission, #why | CSS | visual |
| A18 | Hover lift on `.btn`, `.card`, `.vcard`, rail buttons; nav link underline grow | all pages | motion.css | computed `transition` present; visual |
| A19 | Sticky blurred nav (`nav{position:sticky}` desktop) | all pages | motion.css | computed `position` |
| A20 | Tester banner dismiss (× removes, `localStorage tb-off` remembered) | index | inline onclick + script | click × → banner gone, `tb-off` = 1 |
| A21 | Follow strip bubbles pop-in + float (`#follow .bubbles.tw.in`) + image onerror fallback | index #follow | motion.js §1 + inline CSS | `.bubbles.in` after scroll |
| A22 | Footer social icons hover lift / follow-pill hover fill | all pages | inline CSS | computed transition |
| A23 | Scroll cue bob ("Scroll") | index hero (desktop) | CSS `@keyframes cue` | computed animation |
| A24 | Reduced-motion fallbacks (static posters, no movement) | all | motion.css media query | emulate `prefers-reduced-motion` → `html.reduce`, all `.rv` visible |
| A25 | Tester flows: test.html / test-preview.html (tester.js, neut-school.js: glass, glass-row, stickers, gesture/Glass Newt demos) | test.html, test-preview.html | tester/*.js | files untouched (byte-identical to main) + page loads with no JS errors |
| A26 | #tester-cta card, #testers section, tester banner markup | index | inline | byte-identical to main |

## Results after the redesign (2026-10-28, headless Chrome, main @ :8865 vs branch @ :8866, 1280×800)

Every item was checked side by side on main and the branch with the same script (`verify.js`, which scrolls in 300px steps; `chips.js` scrolls in 150px steps).

| # | Main | Branch | Result |
|---|------|--------|--------|
| A1 | `motion` | `motion` | PASS |
| A2 | 9 words, 1/1 `.in` | 9 words, 1/1 `.in` | PASS |
| A3 | 48/48 `.rv.in` | 56/56 `.rv.in` (new sections reveal too) | PASS |
| A4 | 4/4 | 4/4 | PASS |
| A5 | 22 sources injected, up to 6 playing | 22 injected, up to 6 playing | PASS |
| A6 | 21 distinct newt states | 23 | PASS |
| A7 | 25 chips, 13 turn on at some point (max 7 at once) | 25 chips, 13 turn on (max 5 at once, because of the new layout) | PASS |
| A8 | tour `li.on` 0→1→2→3, li click scrolls | 0→1→2→3, li click scrolls | PASS |
| A9 | 4 floaties, parallax states 4, bob ×4 | 4 floaties (hero-friend/classic-flip now the front orange/silver Neuts), states 4, bob ×4 | PASS |
| A10 | thumb 3 → slide 3 on, bg set, 8s, paused off-screen | same | PASS |
| A11 | prev disabled at start, next scrolls | same | PASS |
| A12 | `--top` 73px, sticky | `--top` 69px (new nav height), sticky | PASS |
| A13 | 6 lens states; `.lens.sm` on features + shared-family-calendar | 6; same | PASS |
| A14 | `mq` | `mq` | PASS |
| A15 | 3 tilted mocks | 3 | PASS |
| A16 | 3/3 `.tw.in`, peek newt | 3/3, peek newt | PASS |
| A17 | 2 posters, 3 image chips | same | PASS |
| A18 | `.btn` transform/box-shadow/filter; `.rv` cards opacity/transform; `.vcard`; nav underline | `.btn` transform/box-shadow/filter (+background); `.rv` cards opacity/transform; `.vcard`; nav underline | PASS |
| A19 | sticky | sticky | PASS |
| A20 | × removes, `tb-off`=1, still gone after reload | same | PASS |
| A21 | bubbles `.tw.in` | same | PASS |
| A22 | footer social transitions | same | PASS |
| A23 | `cue` | `cue` | PASS |
| A24 | reduce: 0 hidden `.rv` | reduce: 0 hidden `.rv`; the 2 front hero Neuts stay visible without bob, by design | PASS |
| A25 | test.html / test-preview.html | byte-identical to main (`git diff main` is empty), `tmotion` boots | PASS |
| A26 | tester banner / #tester-cta / #testers / #start | byte-identical to main (block compare) | PASS |

Subpages (features, shared-family-calendar, pricing, help, 404): the reveal, lazy-video, floaty, newt, chip and sticky-nav results match main exactly.
The new learning-center.html runs motion.js with 12/12 reveals, lazy videos, and a working picker (aria-pressed, art swap, localStorage).
The only network error on both main and the branch is the external `learn.ai-neut.com/api/tester-status`, which is unreachable from the box.

## Re-run — Oct 28, 2026 follow-up (Neut re-cuts, "free" wording, ages 13+, kid mode coming soon)
`node verify.js` re-run against main (8865) and the branch (8866): all 26 still PASS. The only differences from the last run are expected: A3 is 57/57 reveals (it was 56; the new #kid-mode card adds one `.rv`), and the A8 scroll target is lower on the page because the page is longer. chips.js gives 25 chips with 13 ever on, for both main and branch. widths.js finds no horizontal overflow and no store-pill overlap at 320–1440 on index, learning-center, pricing, features, help and safety.

## Re-run — Oct 28, 2026 co-design pass (ChatGPT mockups: app-UI laptop, icon/mini-UI hero cards, free-standing Neuts, full-width Helping Hand band, Learning Center mini previews; cool stone wash, never cream)
`node verify.js` re-run against main (8865) and the branch (8866): all 26 still PASS. Expected differences: A3 is 51/51 reveals on the branch (48/48 on main); A7 max chips at once is 5 (main 7) because of the layout, and chips.js still finds 25 chips with 13 ever on for both; A13 shows 5 lens states (main 6) because the page is longer and the scroll steps are 300px, and the CSS vars still change with scroll; the A8 scroll target is lower. The picker on learning-center still works (aria-pressed, art swap, localStorage). widths.js finds no horizontal overflow at 320–1440. test.html and test-preview.html were not touched.

## Cast + Meet the Neuts (2026-10-29)
- New cast art (Mom #8, Dad silver #6, Skater Girl #3, Volleyball #5 recolored toward #4) swapped into the home hero cards, Neut row, LC picker and mini-pick. No new animation; existing reveal/hover motion reused.
- meet-the-neuts.html: `.rv.soft` staggered reveal on family figures (--d steps of 70ms); hover lift on family art and role tiles (translateY(-6px), .35s var(--ease)); Classic / Night glow tab toggle (aria-selected, arrow keys). All disabled under prefers-reduced-motion.
- verify.js: 26 checks pass; only expected diff is LC_picker (first button is now Mom v2).
