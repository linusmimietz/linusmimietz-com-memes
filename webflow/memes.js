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
