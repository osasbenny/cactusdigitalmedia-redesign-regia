import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
const films = [
  {
    file: "cactus-digital-media-web-development-services-video",
    title: "Ideas into impact",
    description: "Digital experiences for your next chapter.",
  },
  {
    file: "cactus-digital-media-creative-collaboration-video",
    title: "Made together",
    description: "Creative thinking. Shared ambition.",
  },
  {
    file: "cactus-digital-media-mobile-app-development-video",
    title: "A world in your hand",
    description: "Mobile experiences that move with you.",
  },
  {
    file: "cactus-digital-media-ecommerce-development-video",
    title: "Designed for commerce",
    description: "Make the journey from discovery to checkout effortless.",
  },
];
function MotionFilm({ file, title, description }: (typeof films)[number]) {
  const ref = useRef<HTMLVideoElement>(null);
  const manualPause = useRef(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      if (!video.getAttribute("src")) video.src = `/video/${file}.mp4`;
      void video.play().catch(() => undefined);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduced.matches && !manualPause.current)
          play();
        else video.pause();
      },
      { threshold: 0.25 },
    );
    const onPreference = () => {
      if (reduced.matches) video.pause();
    };
    reduced.addEventListener("change", onPreference);
    observer.observe(video);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", onPreference);
      video.pause();
    };
  }, [file]);
  return (
    <article className="motion-card">
      <div className="motion-frame">
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster={`/video/${file}.webp`}
          aria-label={title}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button
          className="video-control"
          aria-label={`${playing ? "Pause" : "Play"} ${title}`}
          onClick={() => {
            const video = ref.current;
            if (!video) return;
            if (playing) {
              manualPause.current = true;
              video.pause();
            } else {
              manualPause.current = false;
              if (!video.getAttribute("src")) video.src = `/video/${file}.mp4`;
              void video.play().catch(() => undefined);
            }
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
      </div>
      <div className="motion-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
export default function MotionShowcase() {
  return (
    <section className="wrap motion-showcase" aria-labelledby="motion-heading">
      <div className="motion-intro">
        <span className="eyebrow">Cactus in motion</span>
        <h2 id="motion-heading">
          Bring your next idea <em>to life.</em>
        </h2>
      </div>
      <div className="motion-grid">
        {films.map((film) => (
          <MotionFilm key={film.file} {...film} />
        ))}
      </div>
    </section>
  );
}
