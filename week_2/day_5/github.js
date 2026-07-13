"use strict";

const GITHUB_TOKEN = "";

const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const searchError = document.getElementById("searchError");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const profileCard = document.getElementById("profileCard");

function getHeaders() {
    if (GITHUB_TOKEN !== "") {
        return { Authorization: `token ${GITHUB_TOKEN}` };
    } else {
        return {};
    }
}

function showSection(section) {

    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    profileCard.classList.add("hidden");

    if (section !== null) {
        section.classList.remove("hidden");
    }
}

function renderProfile(user, repos) {
    document.getElementById("avatarImg").src = user.avatar_url;

    if (user.name) {
        document.getElementById("profileName").textContent = user.name;
    } else {
        document.getElementById("profileName").textContent = user.login;
    }

    const loginEl = document.getElementById("profileLogin");
    loginEl.textContent = `@${user.login}`;
    loginEl.href = user.html_url;

    const bioEl = document.getElementById("profileBio");
    if (user.bio) {
        bioEl.textContent = user.bio;
    } else {
        bioEl.textContent = "No bio available.";
    }

    document.getElementById("githubLink").href = user.html_url;

    document.getElementById("statRepos").textContent = user.public_repos;
    document.getElementById("statFollowers").textContent = user.followers;
    document.getElementById("statFollowing").textContent = user.following;
    document.getElementById("statGists").textContent = user.public_gists;

    const reposList = document.getElementById("reposList");

    if (repos.length > 0) {
        const sortedRepos = repos.sort(function (a, b) {
            return b.stargazers_count - a.stargazers_count;
        });

        const topRepos = sortedRepos.slice(0, 6);

        let reposHTML = "";

        for (let i = 0; i < topRepos.length; i++) {
            const repo = topRepos[i];

            let languageSpan = "";
            if (repo.language) {
                languageSpan = `<span>🔹 ${repo.language}</span>`;
            }

            let description = repo.description;
            if (!description) {
                description = "No description provided.";
            }

            reposHTML += `
                <a href="${repo.html_url}" target="_blank" class="repo-card">
                    <h4>📦 ${repo.name}</h4>
                    <p>${description}</p>
                    <div class="repo-stats">
                        ${languageSpan}
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                    </div>
                </a>
            `;
        }
        reposList.innerHTML = reposHTML;
    } else {
        reposList.innerHTML = "<p>No public repositories found.</p>";
    }

    showSection(profileCard);
}

async function fetchGitHubUser(username) {
    showSection(loadingState);
    searchError.textContent = "";

    try {
        const headers = getHeaders();

        const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers: headers });
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers: headers });

        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                errorState.textContent = ` User "${username}" not found.`;
            } else if (userResponse.status === 403 || userResponse.status === 429) {
                errorState.textContent = " Rate limit exceeded.";
            } else {
                errorState.textContent = ` API error (${userResponse.status}).`;
            }
            showSection(errorState);
            return;
        }

        const userData = await userResponse.json();

        let reposData = [];
        if (reposResponse.ok) {
            reposData = await reposResponse.json();
        }

        renderProfile(userData, reposData);

    } catch (error) {
        errorState.textContent = "📵 Network error. Check your connection.";
        showSection(errorState);
    }
}

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (username === "") {
        searchError.textContent = "Please enter a username.";
        return;
    }

    fetchGitHubUser(username);
});
