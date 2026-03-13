import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_GITHUB_URL,
    headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Awesome-Octocat-App",
        "X-GitHub-Api-Version": "2022-11-28",
         Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
    },
});



export default api;