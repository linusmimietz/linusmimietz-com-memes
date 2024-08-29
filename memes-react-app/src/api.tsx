const digitaloceanSpaceUrl: string = "https://linus-mimietz-com-memes.fra1.digitaloceanspaces.com";

interface IAuthManager {
    getAccessToken(): Promise<string>;
}

class Meme {
    id: string;
    url: string;
    likes: number;
    authManager: IAuthManager;

    constructor(id: string, url: string, likes: number = 0, authManager: IAuthManager) {
        this.id = id;
        this.url = url;
        this.likes = likes;
        this.authManager = authManager;
    }

    display(): void {
        console.log(`Meme: ${this.url} | Likes: ${this.likes}`);
    }

    async like(): Promise<void> {
        let token: string;
        try {
            token = await this.authManager.getAccessToken();
        } catch (error) {
            console.error("Failed to get access token:", error);
            return;
        }

        try {
            const response = await fetch("https://eu-central-1.aws.data.mongodb-api.com/app/data-zgorjkq/endpoint/increment_one", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                    Authorization: `Bearer ${token}`,
                },
                body: this.id,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            this.likes++;
            console.log("Meme liked:", this);
        } catch (error) {
            console.error("Error liking meme:", error);
        }
    }
}

class MongodbAuthManager implements IAuthManager {
    token: string = "";
    expiry: number = Date.now();

    async getAccessToken(): Promise<string> {
        if (this.token && Date.now() < this.expiry) {
            return this.token;
        }
        try {
            const response = await fetch("https://eu-central-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-zgorjkq/auth/providers/anon-user/login", { method: "POST" });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const { access_token } = await response.json();
            this.token = access_token;
            this.expiry = Date.now() + 1800000; // 30 minutes in milliseconds for standard expiry
            console.log("New token fetched:", this.token);
            return this.token;
        } catch (error) {
            console.error("Error obtaining access token:", error);
            throw error;
        }
    }
}

async function fetchXML(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok.");
    }
    return response.text();
}

function parseXML(xml: string): Record<string, string> {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const files = xmlDoc.getElementsByTagName("Contents");
    let fileMap: Record<string, string> = {};
    Array.from(files).forEach((file) => {
        const key = file.getElementsByTagName("Key")[0].textContent!;
        const fileId = file.getElementsByTagName("ETag")[0].textContent!.replace(/"/g, "");
        const fileUrl = `${digitaloceanSpaceUrl}/${encodeURIComponent(key)}`;
        fileMap[fileId] = fileUrl;
    });
    return fileMap;
}

async function fetchLikesData(authManager: MongodbAuthManager): Promise<Meme[]> {
    let token: string;
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
                authManager.token = "";
                return fetchLikesData(authManager);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        return jsonData.result.map((item: { _id: string; likes: number }) => new Meme(item._id, "", item.likes, authManager));
    } catch (error) {
        console.error("Error fetching likes data:", error);
        return [];
    }
}

async function mergeData(fileData: Record<string, string>, likesData: Meme[], authManager: IAuthManager): Promise<Meme[]> {
    const likesMap = new Map(likesData.map((meme) => [meme.id, meme.likes]));
    return Object.keys(fileData).map((fileId) => new Meme(fileId, fileData[fileId], likesMap.get(fileId) || 0, authManager));
}

async function getMemes(): Promise<void> {
    try {
        const xmlData = await fetchXML(`${digitaloceanSpaceUrl}?list-type=2`);
        const fileData = parseXML(xmlData);
        const likesData = await fetchLikesData(authManager);
        const memes = await mergeData(fileData, likesData, authManager);
        memes.forEach((meme) => meme.display());
        memes[2].like();
    } catch (error) {
        console.error("Error in getMemes:", error);
    }
}

const authManager = new MongodbAuthManager();
getMemes();
