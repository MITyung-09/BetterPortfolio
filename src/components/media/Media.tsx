import type { MediaItem } from "@/types";

export default function Media({ item }: { item: MediaItem }) {
  if (item.type === "video") {
    return <video className="media" src={item.src} controls preload="metadata" playsInline aria-label={item.alt} />;
  }
  if (item.type === "youtube") {
    return (
      <iframe
        className="media video"
        src={`https://www.youtube-nocookie.com/embed/${item.src}`}
        title={item.alt ?? "YouTube video"}
        loading="lazy"
        allowFullScreen
      />
    );
  }
  return <img className="media" src={item.src} alt={item.alt ?? ""} loading="lazy" decoding="async" />;
}
