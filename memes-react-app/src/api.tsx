import axios from 'axios';
const digitaloceanSpaceUrl: string = "https://linus-mimietz-com-memes.fra1.digitaloceanspaces.com";

interface IAuthManager {
    getAccessToken(): Promise<string>;
}

export class Meme {
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
            await axios.post("https://eu-central-1.aws.data.mongodb-api.com/app/data-zgorjkq/endpoint/increment_one", this.id, {
                headers: {
                    "Content-Type": "text/plain",
                    Authorization: `Bearer ${token}`,
                }
            });
            this.likes++;
            console.log("Meme liked:", this);
        } catch (error) {
            console.error("Error liking meme:", error);
        }
    }
}

export class MongodbAuthManager implements IAuthManager {
    token: string = "";
    expiry: number = Date.now();

    async getAccessToken(): Promise<string> {
        if (this.token && Date.now() < this.expiry) {
            return this.token;
        }
        try {
            const response = await axios.post("https://eu-central-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-zgorjkq/auth/providers/anon-user/login");
            const { access_token } = response.data;
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
    try {
        const response = await axios.get(url, { responseType: 'text' });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error("Network response was not ok.");
    }
}

async function parseXML(xml: string, authManager: IAuthManager): Promise<Meme[]> {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const files = xmlDoc.getElementsByTagName("Contents");
    let memes: Meme[] = [];
    Array.from(files).forEach((file) => {
        const key = file.getElementsByTagName("Key")[0].textContent!;
        const fileId = file.getElementsByTagName("ETag")[0].textContent!.replace(/"/g, "");
        const fileUrl = `${digitaloceanSpaceUrl}/${encodeURIComponent(key)}`;
        memes.push(new Meme(fileId, fileUrl, 0, authManager));
    });
    return memes;
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
        const response = await axios.get("https://eu-central-1.aws.data.mongodb-api.com/app/data-zgorjkq/endpoint/get_all", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.result.map((item: { _id: string; likes: number }) => new Meme(item._id, "", item.likes, authManager));
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                authManager.token = "";
                return fetchLikesData(authManager);
            }
            console.error(`HTTP error! Status: ${error.response.status}`);
        } else {
            console.error("Error fetching likes data:", error);
        }
        return [];
    }
}

async function mergeData(fileMemes: Meme[], likesData: Meme[]): Promise<Meme[]> {
    const likesMap = new Map(likesData.map(meme => [meme.id, meme.likes]));
    fileMemes.forEach(meme => {
        if (likesMap.has(meme.id)) {
            meme.likes = likesMap.get(meme.id) || 0;
        }
    });
    return fileMemes;
}

export async function getMemes(): Promise<Meme[]> {
    const authManager = new MongodbAuthManager();
    try {
        const xmlData = await fetchXML(`${digitaloceanSpaceUrl}?list-type=2`);
        console.log("XML data fetched:", xmlData);
        const memeFiles = await parseXML(xmlData, authManager);
        console.log("Meme files parsed:", memeFiles);
        const likesData = await fetchLikesData(authManager);
        console.log("Likes data fetched:", likesData);
        const memes = await mergeData(memeFiles, likesData);
        memes.forEach((meme) => meme.display());
        // memes[2].like();
        return memes;
    } catch (error) {
        console.error("Error in getMemes:", error);
        return [];
    }
}

// var memes = getMemes();
