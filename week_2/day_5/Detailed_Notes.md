# GitHub Profile Finder — Detailed Explanation

## What This Project Does

This is a web app that lets you search for any GitHub user by their username.
It fetches live data from the GitHub API and shows their profile, stats, and repositories.

---

## Files Overview

| File | Purpose |
|---|---|
| `github.html` | Page structure and skeleton |
| `github.css` | Styling, colors, layout, animations |
| `github.js` | All logic — fetching data, updating the page |

---

## github.html — Explained

### Head Section
- `<meta charset="UTF-8">` — Tells the browser to use UTF-8 encoding so all characters display correctly
- `<meta name="viewport">` — Makes the page responsive on phones
- `<link href="github.css">` — Loads the stylesheet

### Body Structure

```text
header.header
  h1                    → "GitHub Finder" title (gradient text)
  p                     → Subtitle

main.container
  section.search-section
    form#searchForm       → The search form
      input#usernameInput → Where user types the GitHub username
      button.btn          → Search button
    p#searchError         → Inline error if input is empty

  div#loadingState        → "Loading profile..." (shown while fetching)
  div#errorState          → Error message (shown if API fails)

  section#profileCard     → The result card (hidden until data loads)
    img#avatarImg           → Profile picture
    h2#profileName          → Full name
    a#profileLogin          → @username (links to GitHub)
    p#profileBio            → Bio text
    a#githubLink            → "View on GitHub" button

    div.stats-grid
      #statRepos            → Public repo count
      #statFollowers        → Follower count
      #statFollowing        → Following count
      #statGists            → Gist count

    h3.section-title        → "Top Repositories"
    div#reposList           → Repo cards injected by JS
```

---

## github.css — Explained

### `:root` — CSS Variables
All colors and sizes defined in one place so they are easy to change:

| Variable | Value | Used for |
|---|---|---|
| `--bg` | `#070b18` | Page background |
| `--card` | `#0f1629` | Card background |
| `--card2` | `#141e35` | Repo card background |
| `--purple` | `#8b5cf6` | Primary accent |
| `--pink` | `#ec4899` | Secondary accent |
| `--cyan` | `#06b6d4` | Third accent |
| `--orange` | `#f97316` | Repo card 4 |
| `--green` | `#10b981` | Repo card 5 / Gists stat |
| `--yellow` | `#f59e0b` | Repo card 6 |
| `--text` | `#f1f5f9` | Main text |
| `--muted` | `#94a3b8` | Dimmed / secondary text |
| `--border` | `#1e2d4a` | Border color |
| `--radius` | `18px` | Rounded corners |

### Reset (`* { box-sizing, margin, padding }`)
Clears default browser spacing so layout is consistent everywhere.

### `body`
- Inter font (Google Fonts)
- Two radial gradients as background glow — subtle purple (top-left) and cyan (bottom-right)

### `.header h1`
`background-clip: text` applies a purple → pink → cyan gradient to the title text only.

### `.search-form input:focus`
Purple border + soft ring glow when user clicks the input.

### `.btn`
Purple → pink gradient button with a glowing shadow. Lifts slightly on hover.

### `.hidden`
`display: none !important` — completely hides the element.

### `.profile-card`
The result container. Plays the `fadeUp` animation when shown.

### `@keyframes fadeUp`
Slides the card up from 30px below while fading from invisible to visible.

### `.avatar`
160px circle with a purple outline ring and a purple/pink glow shadow.
Scales up slightly (`transform: scale(1.06)`) on hover.

### `.stats-grid`
4-column grid. Each stat card gets its own accent color via `:nth-child()`:
- 1st → Purple (Repos)
- 2nd → Pink (Followers)
- 3rd → Cyan (Following)
- 4th → Green (Gists)

### `.repo-card::before`
A 4px colored left-border strip using the CSS `::before` pseudo-element.
Colors cycle through all 6 accents using `:nth-child(6n+1)` through `(6n+6)`.

### `@media (max-width: 640px)`
Phone layout adjustments:
- Profile stacks vertically instead of side-by-side
- Stats become a 2-column grid
- Search form stacks vertically
- Avatar shrinks to 120px

---

## github.js — Explained

### `"use strict"`
Enforces stricter JS rules to catch common mistakes early.

### `GITHUB_TOKEN` + `HEADERS`
```javascript
const GITHUB_TOKEN = "your_token_here";
const HEADERS = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
```
- Without a token: GitHub allows 60 API requests per hour.
- With a token: 5,000 requests per hour.
- `HEADERS` is a constant (computed once at startup) instead of a function.

### `$` Shorthand
```javascript
const $ = id => document.getElementById(id);
```
A one-liner that replaces `document.getElementById("x")` with just `$("x")` everywhere, saving typing.

### `showSection(el)`
```javascript
function showSection(el) {
    [loadingState, errorState, profileCard].forEach(e => e.classList.add("hidden"));
    el?.classList.remove("hidden");
}
```
- Hides all three state panels (loading, error, profile).
- Shows only the one passed in.
- `el?.classList` uses optional chaining — safe if `el` is `null`.

### `renderProfile(user, repos)`
Fills all HTML elements with API data in one block of assignments:
```javascript
$("avatarImg").src           = user.avatar_url;
$("profileName").textContent = user.name || user.login;
$("profileLogin").textContent = `@${user.login}`;
...
```
Then builds repo cards:
```javascript
const top6 = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
$("reposList").innerHTML = top6.length ? top6.map(r => `...`).join("") : "<p>No repos.</p>";
```
- `.sort()` orders repos by star count (highest first).
- `.slice(0, 6)` keeps only the top 6.
- `.map()` converts each repo object into an HTML string.
- `.join("")` combines them into one string.
- Ternary `? :` handles the empty repos case.

### `fetchGitHubUser(username)` — async function
```javascript
const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers: HEADERS }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers: HEADERS })
]);
```
`Promise.all()` fires both requests at the same time — faster than waiting for one then the other.

Error handling with chained ternaries:
```javascript
errorState.textContent =
    userRes.status === 404        ? `❌ User "${username}" not found.` :
    userRes.status === 403 || 429 ? "⚡ Rate limit exceeded."          :
                                    `⚠️ API error (${userRes.status}).`;
```
- `404` → user doesn't exist.
- `403` / `429` → rate limit hit.
- Other → generic API error.

### Form Event Listener
```javascript
searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) return void (searchError.textContent = "Please enter a username.");
    fetchGitHubUser(username);
});
```
- `e.preventDefault()` stops the page from refreshing on form submit.
- `.trim()` removes accidental spaces.
- Returns early if empty, otherwise calls `fetchGitHubUser`.

---

## GitHub API Endpoints Used

### User Profile
```text
GET https://api.github.com/users/{username}
```
Returns: `name`, `login`, `avatar_url`, `bio`, `public_repos`, `followers`, `following`, `public_gists`, `html_url`.

### User Repositories
```text
GET https://api.github.com/users/{username}/repos?per_page=100
```
Returns an array of repos, each with: `name`, `description`, `html_url`, `stargazers_count`, `forks_count`, `language`.

---

## App Flow

```text
User types username → clicks Search
  ↓
JS validates input (empty check)
  ↓
showSection(loadingState) → shows "Loading..."
  ↓
Promise.all → fetches /users/{username} + /repos simultaneously
  ↓
userRes.ok?
  NO  → sets error message → showSection(errorState)
  YES → renderProfile(user, repos) → showSection(profileCard)
        ↓
        fills all HTML elements
        sorts repos by stars, takes top 6
        builds repo card HTML and injects it
```
