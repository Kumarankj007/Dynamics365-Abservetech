// 'use client';
// import React from "react";
// import ReactPlayer from "react-player";
// import { Button } from "@/components/ui/button";

// interface VideoPlayerProps {
//   fileUrl?: string;
//   videoUrl?: string;
//   duration?: number;
//   uploading?: boolean;
//   progress?: number;
//   onReplace: () => void;
//   onRemove: () => void;
//   onCancelUpload?: () => void;
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   fileUrl,
//   videoUrl,
//   duration,
//   uploading,
//   progress,
//   onReplace,
//   onRemove,
//   onCancelUpload,
// }) => {
//   const src = fileUrl || videoUrl;
//   if (!src) return null;

//   return (
//     <div className="space-y-3">
//       {uploading ? (
//         <div className="flex flex-col items-center justify-center py-4">
//           <div className="relative flex items-center justify-center w-20 h-20">
//           <div className="w-20 h-20 border-4 border-t-white border-gray-400 rounded-full animate-spin flex items-center justify-center">
//           </div>
//             <span className="absolute text-sm font-semibold">{progress}%</span>
//             </div>
//           <p className="text-gray-600 mt-2">Uploading...</p>
//           {onCancelUpload && (
//             <Button type="button" variant="outline" className="mt-2" onClick={onCancelUpload}>
//               Cancel Upload
//             </Button>
//           )}
//         </div>
//       ) : (
//         <>
//           <ReactPlayer src={src} controls width="100%" height="250px" muted playsInline />
//           {/* <p className="text-sm text-gray-600">
//             Duration: {duration ? `${Math.round(duration)} sec` : "N/A"}
//           </p> */}
//           <div className="flex gap-2">
//             {/* <Button type="button" variant="outline" onClick={onReplace}>
//               Replace Video
//             </Button> */}
//             <Button type="button" onClick={onRemove}>
//               Remove Video
//             </Button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VideoPlayer;

import React from "react";

interface VideoPlayerProps {
  fileUrl?: string;      // local/uploaded video file
  videoUrl?: string;     // embed URL (YouTube/Vimeo)
  duration?: number;
  uploading?: boolean;
  progress?: number;
  onReplace?: () => void;
  onRemove?: () => void;
  onCancelUpload?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  fileUrl,
  videoUrl,
  duration,
  uploading,
  progress,
  onReplace,
  onRemove,
  onCancelUpload,
}) => {
  // console.log(fileUrl);
  
  // Determine if URL is YouTube or Vimeo
  const isEmbed = videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("vimeo.com"));

  // Convert YouTube URL to embed
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Convert Vimeo URL to embed
  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  };

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-300 p-2">
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white z-10">
          <p>Uploading... {progress}%</p>
          <button className="ml-4 underline" onClick={onCancelUpload}>Cancel</button>
        </div>
      )}

      {fileUrl && (
        <video
          src={fileUrl}
          controls
          className="w-full h-80 rounded object-contain"
        />
      )}

      {/* {isEmbed && videoUrl && (
        <iframe
          src={videoUrl.includes("youtube") ? getYouTubeEmbedUrl(videoUrl) : getVimeoEmbedUrl(videoUrl)}
          title="Embedded video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-60 md:h-80 rounded"
        />
      )} */}

      <div className="flex justify-end gap-2 mt-2">
        {/* {onReplace && <button onClick={onReplace} className="text-blue-500 underline">Replace</button>} */}
        {onRemove && <button onClick={onRemove} className="text-red-500 underline cursor-pointer">Remove</button>}
      </div>

      {duration && !uploading && (
        <p className="text-gray-500 text-sm mt-1">Duration: {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")} min</p>
      )}
    </div>
  );
};

export default VideoPlayer;