// Define the URL of your DigitalOcean space
const digitaloceanSpaceUrl = "https://linus-mimietz-com-memes.fra1.digitaloceanspaces.com";

// Function to fetch and list all file URLs in the space
async function listFiles() {
    try {
        const response = await fetch(`${digitaloceanSpaceUrl}?list-type=2`);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const data = await response.text(); // The S3 API returns XML responses for bucket operations
        const fileMap = parseXML(data);
        // console.log("File Map:", fileMap); // Log the map of ETag and URLs
        return fileMap; // This can be used to further process the map of ETags and URLs
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to parse the XML response and return file URLs mapped to their ETags
function parseXML(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const files = xmlDoc.getElementsByTagName("Contents");
    let fileMap = {};

    Array.from(files).forEach((file) => {
        const key = file.getElementsByTagName("Key")[0].textContent;
        const etag = file.getElementsByTagName("ETag")[0].textContent.replace(/"/g, ""); // Remove quotes from ETag
        const fileUrl = `${digitaloceanSpaceUrl}/${encodeURIComponent(key)}`;
        fileMap[etag] = fileUrl;
    });

    return fileMap;
}

// Call the function to list files
listFiles().then((fileMap) => {
    console.log(fileMap); // Optionally log the dictionary of ETag and URLs here
});

// ############################################################

class AuthManager {
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
            this.expiry = Date.now() + expires_in * 1000 - 60000; // Refresh 1 minute before expiry
            console.log("New token fetched", this.token);
            return this.token;
        } catch (error) {
            console.error("Error obtaining access token:", error);
            throw error; // Re-throw to handle upstream
        }
    }
}

async function fetchLikesData() {
    let token;
    try {
        token = await authManager.getAccessToken();
    } catch (error) {
        console.error("Failed to get access token:", error);
        return null; // Return null to indicate failure to fetch data
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
                // Token expired
                authManager.token = null; // Invalidate the expired token
                return await fetchLikesData(); // Retry with a new token
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        const data = jsonData.result.map((item) => ({
            fileId: item._id,
            likes: item.likes,
        }));
        return data;
    } catch (error) {
        console.error("Error fetching likes data:", error);
        return null; // Return null to handle errors cleanly upstream
    }
}

const additionalData = {
    "82ee19aabf68ec80b9aaf3dc22ee1054": "https://linus-mimietz-com-memes.fra1.digitaloceanspaces.com/meme.jpeg",
    d5f32d3f92679cf6db444d0f9f091a53: "https://linus-mimietz-com-memes.fra1.digitaloceanspaces.com/X%20tweet%20image.png",
};

async function mergeData() {
    const likesData = await fetchLikesData();
    if (!likesData) return [];

    // Convert likesData to a map for quick access
    const likesMap = new Map(likesData.map((item) => [item.fileId, item.likes]));

    // Construct the final array using additionalData as the base
    return Object.keys(additionalData).map((fileId) => ({
        fileId: fileId,
        likes: likesMap.get(fileId) || 0, // Default to 0 if no likes data is available
        imageUrl: additionalData[fileId],
    }));
}

const authManager = new AuthManager();
mergeData().then((data) => {
    console.log("Merged data:", data);
});
