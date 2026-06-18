import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

class GradientBlob {
    constructor(x, y, r, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
    }

    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.r < 0 || this.x + this.r > w) this.vx *= -1;
        if (this.y - this.r < 0 || this.y + this.r > h) this.vy *= -1;
    }

    draw(ctx) {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "rgba(10, 10, 10, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default function StreamMasking() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const textRef = useRef(null);

    // Canvas liquid gradient animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const w = window.innerWidth;
        const h = window.innerHeight;
        const baseRadius = Math.min(w, h);

        // Create a pool of large flowing colorful blobs with responsive coordinates and radii
        const blobs = [
            new GradientBlob(w * 0.2, h * 0.2, baseRadius * 0.8, "rgba(99, 102, 241, 0.8)", 1.5, 1.2), // Indigo
            new GradientBlob(w * 0.8, h * 0.4, baseRadius * 0.9, "rgba(236, 72, 153, 0.8)", -1.2, 1.6), // Pink
            new GradientBlob(w * 0.3, h * 0.8, baseRadius * 0.85, "rgba(20, 184, 166, 0.8)", 1.6, -1.0), // Teal
            new GradientBlob(w * 0.9, h * 0.7, baseRadius * 0.95, "rgba(249, 115, 22, 0.75)", -1.0, -1.4) // Orange
        ];

        const render = () => {
            // Clear with dark base color
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            // Ensure color overlay blends together nicely
            ctx.globalCompositeOperation = "screen";

            blobs.forEach((blob) => {
                blob.update(canvas.width, canvas.height);
                blob.draw(ctx);
            });

            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    // GSAP ScrollTrigger for zooming into the text cutout
    useGSAP(
        () => {
            if (!textRef.current || !containerRef.current) return;

            // Set origin precisely on the SVG text center
            gsap.set(textRef.current, { transformOrigin: "960px 540px" });

            // Scale text up enormously to reveal background stream
            gsap.fromTo(
                textRef.current,
                { scale: 1 },
                {
                    scale: 65,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "+=1500",
                        pin: true,
                        scrub: 1
                    }
                }
            );
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="stream-hero-container">
            {/* Liquid Canvas Stream */}
            <canvas ref={canvasRef} className="stream-canvas" />

            {/* SVG Text Mask overlay */}
            <svg
                className="stream-mask-svg"
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <mask id="hero-text-mask">
                        {/* White parts keep content, black cutout hides it */}
                        <rect width="1920" height="1080" fill="white" />
                        <text
                            ref={textRef}
                            x="960"
                            y="540"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="240"
                            fontWeight="900"
                            fill="black"
                            style={{ fontFamily: "Impact, sans-serif" }}
                        >
                            STREAM
                        </text>
                    </mask>
                </defs>

                {/* Foreground Solid Rect that has the Text cutout */}
                <rect
                    width="1920"
                    height="1080"
                    fill="#0f0f0f"
                    mask="url(#hero-text-mask)"
                />
            </svg>

            {/* Scroll indicator overlay */}
            <div className="stream-overlay-text">Scroll Down</div>
        </div>
    );
}
