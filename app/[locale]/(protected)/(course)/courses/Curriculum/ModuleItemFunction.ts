//   const getEmbedUrl = (url: string) => {
//   if (!url) return "";

//   // Extract YouTube ID safely
//   const ytMatch =
//     url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/);

//   if (ytMatch) {
//     const videoId = ytMatch[1]; // clean ID (no ?si or others)
//     return `https://www.youtube.com/embed/${videoId}`;
//   }

//   // Vimeo
//   const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
//   if (vimeoMatch) {
//     return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
//   }

//   return url;
// };

export const normalizeYouTubeUrl = (url: string): string => {
    const raw = extractRawVideoUrl(url);

    const patterns = [
        /youtu\.be\/([\w-]+)/,
        /youtube\.com\/watch\?v=([\w-]+)/,
        /youtube\.com\/embed\/([\w-]+)/,
        /youtube\.com\/shorts\/([\w-]+)/,
        /youtube\.com\/live\/([\w-]+)/,
        /youtube\.com\/v\/([\w-]+)/,
    ];

    for (const p of patterns) {
        const match = raw.match(p);
        if (match) return `https://www.youtube.com/watch?v=${match[1]}`;
    }

    return raw;
};

export const extractRawVideoUrl = (input: string): string => {
    if (!input) return "";
    const iframeMatch = input.match(/src="([^"]+)"/);
    return iframeMatch ? iframeMatch[1] : input.trim();
};

export const normalizeVimeoUrl = (url: string): string => {
    const raw = extractRawVideoUrl(url);

    const embedMatch = raw.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (embedMatch) return `https://vimeo.com/${embedMatch[1]}`;

    const normalMatch = raw.match(/vimeo\.com\/(\d+)/);
    if (normalMatch) return `https://vimeo.com/${normalMatch[1]}`;

    return raw;
};

export const cleanVideoUrl = (url: string): string => {
    if (!url) return "";
    const u = extractRawVideoUrl(url);

    if (u.includes("youtube") || u.includes("youtu.be")) return normalizeYouTubeUrl(u);
    if (u.includes("vimeo")) return normalizeVimeoUrl(u);

    return u;
};

export const getEmbedUrl = (url: string) => {
    if (!url) return "";

    const clean = cleanVideoUrl(url);

    // YouTube
    const yt = clean.match(/v=([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

    // Vimeo
    const vm = clean.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

    return clean;
};

// Helper: get duration for embed video (YouTube, Vimeo, or direct MP4/WebM)
export const getEmbedVideoDuration = async (url: string): Promise<number | undefined> => {
    try {
        const cleanUrlValue = cleanVideoUrl(url);
        // YouTube oEmbed (returns duration in seconds is not directly available, need YouTube API for exact)
        if (cleanUrlValue.includes("youtube")) {
            // Use oEmbed to validate, duration fallback to undefined
            const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrlValue)}&format=json`;
            const res = await fetch(oEmbedUrl);
            if (res.ok) {
                const data = await res.json();
                // YouTube oEmbed doesn't provide duration, so we just return undefined
                return undefined;
            }
        }

        // Vimeo oEmbed (provides duration in seconds)
        if (cleanUrlValue.includes("vimeo.com")) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            if (match) {
                const videoId = match[1];
                const res = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
                const data = await res.json();
                return data?.[0]?.duration; // duration in seconds
            }
        }

        // Direct MP4/WebM link
        if (cleanUrlValue.match(/\.(mp4|webm)$/)) {
            return new Promise((resolve) => {
                const video = document.createElement("video");
                video.preload = "metadata";
                video.src = url;
                video.onloadedmetadata = () => resolve(video.duration);
                video.onerror = () => resolve(undefined);
            });
        }

        return undefined;
    } catch (error) {
        console.warn("Failed to get embed video duration:", error);
        return undefined;
    }
};

export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(video.duration);
        };

        video.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };

        video.src = url;
    });
};

