import axios from "axios";
const digitaloceanSpaceUrl: string = "https://linus-mimietz-com-memes.fra1.cdn.digitaloceanspaces.com";

export interface MemeOptions {
  url?: string;
  isVideo?: boolean;
  totalLikes?: number;
  selfliked?: boolean;
  myLikes?: number;
}

export class Meme {
  id: string;
  url: string;
  isVideo: boolean;
  totalLikes: number;
  selfliked: boolean;
  myLikes: number;

  constructor(id: string, options: MemeOptions = {}) {
    this.id = id;
    this.url = options.url ?? "";
    this.isVideo = options.isVideo ?? false;
    this.totalLikes = options.totalLikes ?? 0;
    this.selfliked = options.selfliked ?? false;
    this.myLikes = options.myLikes ?? 0;
  }
}

export const likeMeme = async (memes: Meme[], index: number): Promise<void> => {
  if (index < 0 || index >= memes.length) return;
  if (memes[index].myLikes >= 10) return;
  const meme = memes[index];
  try {
    const response = await fetch("https://flask-backend-production-8bf1.up.railway.app/increment_one", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: meme.id,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error liking meme:", error);
  }
};

async function fetchXML(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: "text" });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Network response was not ok.");
  }
}

async function parseXML(xml: string): Promise<Meme[]> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const files = xmlDoc.getElementsByTagName("Contents");
  let memes: Meme[] = [];
  Array.from(files).forEach((file) => {
    const key = file.getElementsByTagName("Key")[0].textContent!;
    const fileId = file.getElementsByTagName("ETag")[0].textContent!.replace(/"/g, "");
    const fileUrl = `${digitaloceanSpaceUrl}/${encodeURIComponent(key)}`;
    var isVideo: boolean = false;
    if (key.match(/.(mp4|webm|ogg|avi|wmv|flv|mov|3gp)$/i)) {
      isVideo = true;
    }
    memes.push(
      new Meme(fileId, {
        url: fileUrl,
        isVideo: isVideo,
      })
    );
  });
  return memes;
}

async function fetchLikesData(): Promise<Meme[]> {
  try {
    const response = await axios.get("https://flask-backend-production-8bf1.up.railway.app/get_all");
    return response.data.result.map((item: { _id: string; likes: number }) => new Meme(item._id, { totalLikes: item.likes }));
  } catch (error) {
    console.error("Error fetching totalLikes data:", error);
    return [];
  }
}

async function mergeData(fileMemes: Meme[], totalLikesData: Meme[]): Promise<Meme[]> {
  const totalLikesMap = new Map(totalLikesData.map((meme) => [meme.id, meme.totalLikes]));
  fileMemes.forEach((meme) => {
    if (totalLikesMap.has(meme.id)) {
      meme.totalLikes = totalLikesMap.get(meme.id) || 0;
    }
  });
  return fileMemes;
}

export async function getMemes(): Promise<Meme[]> {
  try {
    const xmlData = await fetchXML(`${digitaloceanSpaceUrl}?list-type=2`);
    // console.log("XML data fetched:", xmlData);
    const memeFiles = await parseXML(xmlData);
    // console.log("Meme files parsed:", memeFiles);
    const totalLikesData = await fetchLikesData();
    // console.log("Likes data fetched:", totalLikesData);
    const memes = await mergeData(memeFiles, totalLikesData);
    // console.log("Merged data:", memes.map((meme) => `Meme: ${meme.url} | Likes: ${meme.totalLikes} | isVideo: ${meme.isVideo} | ID: ${meme.id}`).join("\n"));
    const randomizedMemes = memes.sort((a, b) => {
      const aFilename = a.url.split("/").pop()?.split(".")[0].toLowerCase();
      const bFilename = b.url.split("/").pop()?.split(".")[0].toLowerCase();
      if (aFilename === "start") return -1;
      if (bFilename === "start") return 1;
      return Math.random() - 0.5;
    });
    return randomizedMemes;
  } catch (error) {
    console.error("Error in getMemes:", error);
    return [];
  }
}
