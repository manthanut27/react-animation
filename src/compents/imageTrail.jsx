import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const trailImages = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop"
];

export default function ImageTrail() {
    const containerRef = useRef(null);
    const imagesRef = useRef([]);

    useGSAP(
        () => {
            const container = containerRef.current;
            if (!container) return;

            const images = imagesRef.current.filter(Boolean);
            let lastMousePos = { x: 0, y: 0 };
            let activeImageIndex = 0;
            let zIndexCounter = 1;
            let isFirstMove = true;

            function getDistance(p1, p2) {
                return Math.hypot(p2.x - p1.x, p2.y - p1.y);
            }

            function showNextImage(pos) {
                const img = images[activeImageIndex];
                if (!img) return;

                // Ensure newly spawned image is on top
                zIndexCounter++;

                // Randomize rotation angle for organic feel
                const randomRot = gsap.utils.random(-15, 15);

                // Reset and clear any running animation on this specific element
                gsap.killTweensOf(img);

                // Position at cursor instantly, scaled down & transparent
                gsap.set(img, {
                    x: pos.x,
                    y: pos.y,
                    xPercent: -50,
                    yPercent: -50,
                    zIndex: zIndexCounter,
                    scale: 0.5,
                    rotation: randomRot,
                    opacity: 0
                });

                // GSAP Timeline to animate entrance, pause, and exit
                const tl = gsap.timeline();
                tl.to(img, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.35,
                    ease: "power2.out"
                }).to(img, {
                    scale: 0.8,
                    opacity: 0,
                    y: "+=60", // slide down slightly
                    duration: 0.5,
                    ease: "power2.in",
                    delay: 0.35
                });

                // Move to next image in pool
                activeImageIndex = (activeImageIndex + 1) % images.length;
            }

            const onMouseMove = (e) => {
                const rect = container.getBoundingClientRect();
                const currentPos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                if (isFirstMove) {
                    lastMousePos = currentPos;
                    isFirstMove = false;
                    showNextImage(currentPos);
                    return;
                }

                const distance = getDistance(lastMousePos, currentPos);

                // Trigger new image once cursor moves 80px or more
                if (distance > 80) {
                    showNextImage(currentPos);
                    lastMousePos = currentPos;
                }
            };

            container.addEventListener("mousemove", onMouseMove);

            return () => {
                container.removeEventListener("mousemove", onMouseMove);
                // Clean up all running animations on unmount
                images.forEach((img) => gsap.killTweensOf(img));
            };
        },
        { scope: containerRef }
    );

    return (
        <section ref={containerRef} className="trail-section">
            <div className="trail-title-wrapper">
                <h2 className="trail-title">Interactive Trail</h2>
                <p className="trail-subtitle">Move your cursor around</p>
            </div>

            {trailImages.map((src, index) => (
                <div
                    key={index}
                    ref={(el) => (imagesRef.current[index] = el)}
                    className="trail-image"
                >
                    <img src={src} alt={`Trail item ${index + 1}`} />
                </div>
            ))}
        </section>
    );
}
