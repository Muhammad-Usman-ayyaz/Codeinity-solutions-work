/* ================================================================
   JobSphere — Main JavaScript
   Uses JSONPlaceholder /posts (jobs) + /users (companies) APIs
   ================================================================ */
// ── CONFIG ────────────────────────────────────────────────────
const API_BASE = 'https://jsonplaceholder.typicode.com';
const JOBS_PER_PAGE = 9;
// Enrich raw JSONPlaceholder data with realistic job metadata
const JOB_TITLES = [
    'Frontend Developer', 'Backend Engineer', 'Full Stack Developer',
    'UI/UX Designer', 'Product Manager', 'Data Scientist',
    'DevOps Engineer', 'Mobile Developer', 'Cloud Architect',
    'Machine Learning Engineer', 'QA Engineer', 'Security Analyst',
    'Business Analyst', 'Scrum Master', 'Technical Writer',
    'Database Administrator', 'Systems Engineer', 'Network Engineer',
    'AI Researcher', 'Blockchain Developer',
];
const JOB_TYPES = ['Full-Time', 'Remote', 'Part-Time', 'Contract'];
const JOB_LOCATIONS = [
    'San Francisco, CA', 'New York, NY', 'Remote',
    'Austin, TX', 'Seattle, WA', 'Boston, MA',
    'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
    'London, UK', 'Berlin, DE', 'Toronto, CA',
];
const SALARY_RANGES = [
    '$60k – $80k', '$75k – $95k', '$90k – $120k',
    '$100k – $130k', '$120k – $160k', '$130k – $170k',
    '$50k – $70k', '$80k – $110k', '$110k – $140k',
    '$140k – $180k',
];
const SKILLS_POOL = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL',
    'GraphQL', 'REST API', 'CI/CD', 'Git', 'Agile',
    'Figma', 'Swift', 'Kotlin', 'Go', 'Rust',
    'TensorFlow', 'PyTorch', 'Vue.js', 'Angular', 'Next.js',
];
const LOGO_COLORS = [
    ['#8b5cf6', '#06b6d4'], ['#f59e0b', '#ef4444'],
    ['#10b981', '#06b6d4'], ['#f97316', '#a855f7'],
    ['#06b6d4', '#10b981'], ['#a855f7', '#f97316'],
    ['#ef4444', '#f59e0b'], ['#3b82f6', '#8b5cf6'],
    ['#14b8a6', '#3b82f6'], ['#ec4899', '#f59e0b'],
];
// ── STATE ─────────────────────────────────────────────────────
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
let activeFilter = 'all';
let searchQuery = '';
let currentSort = 'newest';
// ── DOM REFS ──────────────────────────────────────────────────
const grid = document.getElementById('jobs-grid');
const loaderWrap = document.getElementById('loader-wrap');
const resultsCount = document.getElementById('results-count');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterChips = document.querySelectorAll('.chip');
const sortSelect = document.getElementById('sort-select');
const loadMoreBtn = document.getElementById('load-more-btn');
const emptyState = document.getElementById('empty-state');
const clearBtn = document.getElementById('clear-search-btn');
const statJobs = document.getElementById('stat-jobs');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');
// ── HELPERS ───────────────────────────────────────────────────
function seededRandom(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}
function pickSeeded(arr, seed) {
    return arr[Math.floor(seededRandom(seed) * arr.length)];
}
function pickNSeeded(arr, n, seed) {
    const shuffled = [...arr].sort(() => seededRandom(seed++) - 0.5);
    return shuffled.slice(0, n);
}
function getTypeClass(type) {
    const map = {
        'Remote': 'badge-remote',
        'Full-Time': 'badge-fulltime',
        'Part-Time': 'badge-parttime',
        'Contract': 'badge-contract',
    };
    return map[type] || 'badge-fulltime';
}
function timeAgo(id) {
    const hours = (id * 7) % 72;
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}
// ── DATA TRANSFORM ────────────────────────────────────────────
/**
 * Merges JSONPlaceholder /posts (100) with /users (10).
 * Each post becomes a job listing; each user becomes a company.
 */
function transformToJobs(posts, users) {
    return posts.map(post => {
        const seed = post.id;
        const user = users[(post.userId - 1) % users.length];
        const title = pickSeeded(JOB_TITLES, seed);
        const type = pickSeeded(JOB_TYPES, seed + 3);
        const location = pickSeeded(JOB_LOCATIONS, seed + 7);
        const salary = pickSeeded(SALARY_RANGES, seed + 11);
        const colors = LOGO_COLORS[seed % LOGO_COLORS.length];
        const skills = pickNSeeded(SKILLS_POOL, 3 + (seed % 3), seed);
        return {
            id: post.id,
            title,
            company: user.company.name,
            website: user.website,
            location,
            type,
            salary,
            description: post.body.charAt(0).toUpperCase() + post.body.slice(1),
            skills,
            postedAgo: timeAgo(post.id),
            logoInitials: getInitials(user.company.name),
            logoColors: colors,
            rawType: type.toLowerCase().replace('-', ''),
        };
    });
}
// ── FETCH DATA ────────────────────────────────────────────────
async function fetchJobs() {
    try {
        showLoader(true);
        const [postsRes, usersRes] = await Promise.all([
            fetch(`${API_BASE}/posts`),
            fetch(`${API_BASE}/users`),
        ]);
        if (!postsRes.ok || !usersRes.ok) throw new Error('API error');
        const [posts, users] = await Promise.all([postsRes.json(), usersRes.json()]);
        allJobs = transformToJobs(posts, users);
        filteredJobs = [...allJobs];
        statJobs.textContent = allJobs.length + '+';
        showLoader(false);
        applyFiltersAndRender();
    } catch (err) {
        console.error('Failed to fetch jobs:', err);
        showLoader(false);
        resultsCount.textContent = '⚠️ Failed to load jobs. Please try refreshing.';
    }
}
// ── FILTER & SORT ─────────────────────────────────────────────
function applyFiltersAndRender() {
    currentPage = 1;
    // 1. Filter by type chip
    let result = activeFilter === 'all'
        ? [...allJobs]
        : allJobs.filter(j => j.rawType.includes(activeFilter));
    // 2. Filter by search query (title, company, skills, location)
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(j =>
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q) ||
            j.skills.some(s => s.toLowerCase().includes(q))
        );
    }
    // 3. Sort
    if (currentSort === 'salary') {
        result.sort((a, b) => {
            const numA = parseInt(a.salary.replace(/\D/g, '').slice(0, 3));
            const numB = parseInt(b.salary.replace(/\D/g, '').slice(0, 3));
            return numB - numA;
        });
    } else if (currentSort === 'company') {
        result.sort((a, b) => a.company.localeCompare(b.company));
    }
    // 'newest' = default post order (already newest first by id)
    filteredJobs = result;
    renderJobs(true);
}
// ── RENDER ────────────────────────────────────────────────────
function renderJobs(reset = false) {
    if (reset) {
        grid.innerHTML = '';
        currentPage = 1;
    }
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    const end = currentPage * JOBS_PER_PAGE;
    const slice = filteredJobs.slice(start, end);
    const total = filteredJobs.length;
    // Update results count
    const from = total === 0 ? 0 : start + 1;
    const to = Math.min(end, total);
    resultsCount.innerHTML = total > 0
        ? `Showing <strong>${from}–${to}</strong> of <strong>${total}</strong> jobs`
        : 'No jobs match your search';
    // Empty state
    if (total === 0) {
        emptyState.classList.remove('hidden');
        loadMoreBtn.classList.add('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    // Render cards with staggered animation delay
    slice.forEach((job, i) => {
        const card = createJobCard(job, start + i);
        grid.appendChild(card);
    });
    // Load more button visibility
    if (end < total) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
}
function createJobCard(job, index) {
    const card = document.createElement('article');
    card.className = 'job-card';
    card.id = `job-card-${job.id}`;
    card.style.animationDelay = `${(index % JOBS_PER_PAGE) * 0.045}s`;
    card.innerHTML = `
    <div class="job-card-header">
      <div class="company-logo" style="--c1:${job.logoColors[0]};--c2:${job.logoColors[1]}">
        ${job.logoInitials}
      </div>
      <div class="job-badge-wrap">
        <span class="job-type-badge ${getTypeClass(job.type)}">${job.type}</span>
        <span style="font-size:0.72rem;color:var(--text-muted)">${job.postedAgo}</span>
      </div>
    </div>
    <h2 class="job-title">${job.title}</h2>
    <p class="company-name">${job.company}</p>
    <div class="job-meta">
      <span class="job-meta-item">📍 ${job.location}</span>
      <span class="job-meta-item">🏢 ${job.type}</span>
    </div>
    <p class="job-desc">${job.description}</p>
    <div class="job-tags">
      ${job.skills.map(s => `<span class="tag">${s}</span>`).join('')}
    </div>
    <div class="job-card-footer">
      <div class="job-salary">${job.salary} <small>/yr</small></div>
      <button class="apply-btn" id="apply-btn-${job.id}">View Details →</button>
    </div>
  `;
    card.addEventListener('click', () => openModal(job));
    return card;
}
// ── MODAL ─────────────────────────────────────────────────────
function openModal(job) {
    modalBody.innerHTML = `
    <div class="modal-company-header">
      <div class="modal-logo company-logo" style="--c1:${job.logoColors[0]};--c2:${job.logoColors[1]};width:60px;height:60px;font-size:1.5rem">
        ${job.logoInitials}
      </div>
      <div class="modal-title-group">
        <h2>${job.title}</h2>
        <p>${job.company} · <a href="https://${job.website}" target="_blank" style="color:var(--accent-2);text-decoration:none">${job.website}</a></p>
      </div>
    </div>
    <div class="modal-meta-grid">
      <div class="modal-meta-item">
        <label>📍 Location</label>
        <span>${job.location}</span>
      </div>
      <div class="modal-meta-item">
        <label>💼 Job Type</label>
        <span>${job.type}</span>
      </div>
      <div class="modal-meta-item">
        <label>💰 Salary</label>
        <span style="color:var(--accent-2)">${job.salary}/yr</span>
      </div>
      <div class="modal-meta-item">
        <label>🕐 Posted</label>
        <span>${job.postedAgo}</span>
      </div>
    </div>
    <p class="modal-section-title">About the Role</p>
    <p class="modal-desc">${job.description.replace(/\n/g, '<br>')}</p>
    <p class="modal-section-title">Required Skills</p>
    <div class="modal-tags">
      ${job.skills.map(s => `<span class="tag" style="padding:5px 13px;font-size:0.82rem">${s}</span>`).join('')}
    </div>
    <button class="modal-apply-btn" id="modal-apply-btn-${job.id}" onclick="applyNow('${job.title}', '${job.company}')">
      Apply Now — ${job.company}
    </button>
  `;
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}
function applyNow(title, company) {
    alert(`🎉 Application submitted!\n\nRole: ${title}\nCompany: ${company}\n\nGood luck! (This is a demo — no real application was sent.)`);
    closeModal();
}
// ── UI HELPERS ────────────────────────────────────────────────
function showLoader(visible) {
    loaderWrap.style.display = visible ? 'flex' : 'none';
}
// ── EVENT LISTENERS ───────────────────────────────────────────
// Search button click
searchBtn.addEventListener('click', () => {
    searchQuery = searchInput.value;
    applyFiltersAndRender();
    document.getElementById('jobs-section').scrollIntoView({ behavior: 'smooth' });
});
// Enter key in search
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchQuery = searchInput.value;
        applyFiltersAndRender();
        document.getElementById('jobs-section').scrollIntoView({ behavior: 'smooth' });
    }
});
// Live search as user types (debounced)
let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value;
        applyFiltersAndRender();
    }, 350);
});
// Filter chip clicks
filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        applyFiltersAndRender();
    });
});
// Sort
sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    applyFiltersAndRender();
});
// Load more
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    renderJobs(false);
    // Scroll to newly loaded cards
    const allCards = grid.querySelectorAll('.job-card');
    if (allCards.length > 0) {
        const firstNew = allCards[(currentPage - 2) * JOBS_PER_PAGE];
        if (firstNew) firstNew.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
// Clear search
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    activeFilter = 'all';
    filterChips.forEach(c => c.classList.remove('active'));
    document.getElementById('chip-all').classList.add('active');
    applyFiltersAndRender();
});
// Modal close
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
// Navbar scroll style
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 60) {
        navbar.style.background = 'rgba(255,255,255,0.95)';
    } else {
        navbar.style.background = 'rgba(248,250,252,0.7)';
    }
});
// ── INIT ─────────────────────────────────────────────────────
fetchJobs();
