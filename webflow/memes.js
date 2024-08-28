const digitaloceanSpaceUrl = "https://linus-mimietz-com-memes.fra1.digitaloceanspaces.com";

class Meme {
    constructor(id, url, likes = 0) {
        this.id = id;
        this.url = url;
        this.likes = likes;
    }

    display() {
        console.log(`Meme: ${this.url} | Likes: ${this.likes}`);
    }
}

class MongodbAuthManager {
    constructor() {
        this.token = null;
        this.expiry = Date.now();
    }

    async getAccessToken() {
        if (this.token && Date.now() < this.expiry) {
            return this.token;
        }
        try {
            const response = await fetch("https://eu-central-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-zgorjkq/auth/providers/anon-user/login", { method: "POST" });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const { access_token, expires_in } = await response.json();
            this.token = access_token;
            this.expiry = Date.now() + expires_in * 1000 - 60000;
            console.log("New token fetched:", this.token);
            return this.token;
        } catch (error) {
            console.error("Error obtaining access token:", error);
            throw error;
        }
    }
}

async function fetchXML(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok.");
    }
    return response.text();
}

function parseXML(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const files = xmlDoc.getElementsByTagName("Contents");
    let fileMap = {};
    Array.from(files).forEach((file) => {
        const key = file.getElementsByTagName("Key")[0].textContent;
        const fileId = file.getElementsByTagName("ETag")[0].textContent.replace(/"/g, "");
        const fileUrl = `${digitaloceanSpaceUrl}/${encodeURIComponent(key)}`;
        fileMap[fileId] = fileUrl;
    });
    return fileMap;
}

async function fetchLikesData(authManager) {
    let token;
    try {
        token = await authManager.getAccessToken();
    } catch (error) {
        console.error("Failed to get access token:", error);
        return [];
    }

    try {
        const response = await fetch("https://eu-central-1.aws.data.mongodb-api.com/app/data-zgorjkq/endpoint/get_all", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                authManager.token = null;
                return fetchLikesData(authManager);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        return jsonData.result.map((item) => new Meme(item._id, undefined, item.likes));
    } catch (error) {
        console.error("Error fetching likes data:", error);
        return [];
    }
}

async function mergeData(fileData, likesData) {
    const likesMap = new Map(likesData.map((meme) => [meme.id, meme.likes]));
    return Object.keys(fileData).map((fileId) => new Meme(fileId, fileData[fileId], likesMap.get(fileId) || 0));
}

async function getMemes() {
    try {
        const xmlData = await fetchXML(`${digitaloceanSpaceUrl}?list-type=2`);
        const fileData = parseXML(xmlData);
        const likesData = await fetchLikesData(authManager);
        const memes = await mergeData(fileData, likesData);
        memes.forEach((meme) => meme.display());
        return memes;
    } catch (error) {
        console.error("Error in getMemes:", error);
    }
}

const authManager = new MongodbAuthManager();
getMemes();
