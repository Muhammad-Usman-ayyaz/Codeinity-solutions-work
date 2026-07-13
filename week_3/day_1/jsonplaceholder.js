const BASE_URL = 'https://jsonplaceholder.typicode.com';
const grid = document.getElementById('content-grid');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error');
const navButtons = document.querySelectorAll('.nav-btn');

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    fetchData('posts');
});

// Navigation handlers
navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active state
        navButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const resource = e.target.dataset.resource;
        fetchData(resource);
    });
});

async function fetchData(resource) {
    showLoader();
    try {
        // Fetch only 20 items to keep it clean, except users which only has 10
        const limit = resource === 'users' ? '' : '?_limit=20';
        const response = await fetch(`${BASE_URL}/${resource}${limit}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderData(data, resource);
    } catch (error) {
        showError(`Failed to fetch ${resource}: ${error.message}`);
    } finally {
        hideLoader();
    }
}

function renderData(data, resource) {
    grid.innerHTML = ''; // Clear current content

    if (data.length === 0) {
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-muted);">No data found.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        switch (resource) {
            case 'posts':
                card.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.body}</p>
                    <div class="meta">
                        <span>Post ID: ${item.id}</span>
                        <span>User: ${item.userId}</span>
                    </div>
                `;
                break;

            case 'comments':
                card.innerHTML = `
                    <h3>${item.name}</h3>
                    <p><a href="mailto:${item.email}" style="color: #2dd4bf; text-decoration: none; font-size: 0.85rem; margin-bottom: 0.5rem; display: inline-block;">${item.email}</a></p>
                    <p>${item.body}</p>
                    <div class="meta">
                        <span>Comment ID: ${item.id}</span>
                        <span>Post: ${item.postId}</span>
                    </div>
                `;
                break;

            case 'albums':
                card.innerHTML = `
                    <h3>${item.title}</h3>
                    <div class="meta" style="margin-top: auto;">
                        <span>Album ID: ${item.id}</span>
                        <span>User: ${item.userId}</span>
                    </div>
                `;
                break;

            case 'photos':
                card.classList.add('photo-card');
                card.innerHTML = `
                    <img src="${item.url}" alt="${item.title}" loading="lazy">
                    <div class="photo-info">
                        <h3>${item.title}</h3>
                        <div class="meta" style="margin-top: auto;">
                            <span>Photo: ${item.id}</span>
                            <span>Album: ${item.albumId}</span>
                        </div>
                    </div>
                `;
                break;

            case 'todos':
                card.innerHTML = `
                    <h3>${item.title}</h3>
                    <div class="meta" style="border-top: none; padding-top: 0; margin-top: auto;">
                        <span class="badge" style="background: ${item.completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${item.completed ? '#86efac' : '#fca5a5'};">
                            ${item.completed ? 'Completed' : 'Pending'}
                        </span>
                        <span>User: ${item.userId}</span>
                    </div>
                `;
                break;

            case 'users':
                card.classList.add('user-card');
                card.innerHTML = `
                    <div class="avatar">${item.name.charAt(0)}</div>
                    <h3>${item.name}</h3>
                    <p style="color: #e2e8f0; margin-bottom: 0.25rem;">@${item.username}</p>
                    <p style="font-size: 0.85rem;">📧 ${item.email}</p>
                    <p style="font-size: 0.85rem;">📍 ${item.address.city}, ${item.address.street}</p>
                    <p style="font-size: 0.85rem;">🏢 ${item.company.name}</p>
                    <div class="meta" style="margin-top: auto;">
                        <a href="http://${item.website}" target="_blank" style="color: #2dd4bf; text-decoration: none;">🌐 ${item.website}</a>
                    </div>
                `;
                break;
        }

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}

function showLoader() {
    grid.innerHTML = '';
    errorMsg.classList.add('hidden');
    loader.classList.remove('hidden');


    if (!loader.parentElement.classList.contains('loader-container')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'loader-container';
        loader.parentNode.insertBefore(wrapper, loader);
        wrapper.appendChild(loader);
    }
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}
