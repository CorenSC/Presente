import { useEffect, useRef, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

type Props = {
    videoId: string;
    onEnded?: () => void;
    // se quiser passar uma thumb sua (melhor ainda)
    posterUrl?: string;
};

export default function YoutubePlyrPlayer({ videoId, onEnded, posterUrl }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Plyr | null>(null);

    const poster =
        posterUrl ||
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`; // fallback

    useEffect(() => {
        if (!containerRef.current) return;

        // Destroy anterior
        playerRef.current?.destroy();
        playerRef.current = null;

        // Cria o elemento que o Plyr vai “pegar”
        containerRef.current.innerHTML = `
      <div data-plyr-provider="youtube" data-plyr-embed-id="${videoId}"></div>
    `;

        const target = containerRef.current.firstElementChild as HTMLElement;

        const plyr = new Plyr(target, {
            controls: ["play", "progress", "current-time", "duration", "mute", "volume"],
            clickToPlay: true,
            keyboard: { focused: false, global: false },
            tooltips: { controls: false, seek: false },

            youtube: {
                noCookie: true,
                rel: 0,
                modestbranding: 1,
                iv_load_policy: 3,
            },
        });

        plyr.on("ended", () => onEnded?.());

        playerRef.current = plyr;

        return () => {
            playerRef.current?.destroy();
            playerRef.current = null;
        };
    }, [videoId, onEnded]);

    return (
        <div className="w-full">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border dark:border-white/10 bg-black">
                {/* Player */}
                <div ref={containerRef} className="absolute inset-0" />
            </div>
        </div>
    );
}
