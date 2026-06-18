import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function StreamMasking() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const columnsRef = useRef([]);
    const slidersRef = useRef([]);
    const overlaysRef = useRef([]);
    const bgTextRef = useRef(null);
    const charsRef = useRef([]);
    const bgTagRef = useRef(null);

    const reactChars = ["R", "E", "A", "C", "T"];

    // 3 premium high-res contrasting images for the scrolling sequence
    const images = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600", // Pink/purple abstract flow
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600", // Tech cyber neon grid
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1600"  // Natural organic sunlight
    ];

    const overlays = [
        { title: "PERSPECTIVE", subtitle: "SLICED MOTION SYSTEM" },
        { title: "SYNCHRONICITY", subtitle: "DIGITAL NETWORK GRID" },
        { title: "REGENERATION", subtitle: "ORGANIC NATURE FLOW" }
    ];

    const numCols = 5;

    // Interactive mouse-tracking particles canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const mouse = { x: null, y: null, radius: 150 };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener("resize", handleResize);
        
        // Track mouse events on the main container
        const parent = containerRef.current;
        if (parent) {
            parent.addEventListener("mousemove", handleMouseMove);
            parent.addEventListener("mouseleave", handleMouseLeave);
        }

        // Particle System
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = (Math.random() - 0.5) * 0.7;
                this.radius = Math.random() * 3 + 2;
                // Elegant colors to complement the deep background and image transitions
                const colors = [
                    "rgba(255, 255, 255, 0.85)", 
                    "rgba(133, 112, 171, 0.95)", // Syne purple
                    "rgba(99, 102, 241, 0.95)"   // Indigo
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off boundaries
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction (gentle repulsion)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = dx / distance;
                        const directionY = dy / distance;

                        // Push particles away smoothly
                        this.x -= directionX * force * 2.5;
                        this.y -= directionY * force * 2.5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Set up particle density based on screen size
        const particleCount = Math.min(80, Math.floor((width * height) / 15000));
        const particles = Array.from({ length: particleCount }, () => new Particle());

        // Draw connections between close nodes and the mouse
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        const alpha = (110 - dist) / 110 * 0.55;
                        ctx.strokeStyle = `rgba(133, 112, 171, ${alpha})`;
                        ctx.lineWidth = 1.0;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Connection line to mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p1.x - mouse.x;
                    const dy = p1.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius) {
                        const alpha = (mouse.radius - dist) / mouse.radius * 0.75;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.update();
                p.draw();
            });

            drawConnections();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            if (parent) {
                parent.removeEventListener("mousemove", handleMouseMove);
                parent.removeEventListener("mouseleave", handleMouseLeave);
            }
        };
    }, []);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            const cols = columnsRef.current.slice(0, numCols);
            const sliders = slidersRef.current.slice(0, numCols);
            const chars = charsRef.current.filter(Boolean);

            // --- Background text entrance (immediate, before scroll) ---
            gsap.fromTo(
                chars,
                { opacity: 0, y: 80 },
                {
                    opacity: 1,
                    y: 0,
                    ease: "power4.out",
                    duration: 1.2,
                    stagger: 0.08,
                    delay: 0.2,
                }
            );
            gsap.fromTo(
                bgTagRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, ease: "power3.out", duration: 1, delay: 0.9 }
            );

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=3600",
                    pin: true,
                    scrub: 1,
                }
            });

            // Fade out background text as columns reveal
            tl.to(
                [bgTextRef.current],
                { opacity: 0, scale: 1.08, ease: "power2.in", duration: 0.4 },
                0
            );

            // PHASE 1: Staggered reveal of Image 1 from down to up
            tl.fromTo(
                cols,
                { yPercent: 100 },
                {
                    yPercent: 0,
                    ease: "power2.inOut",
                    stagger: 0.08,
                },
                0
            );

            tl.fromTo(
                sliders,
                { yPercent: -100 }, // Counter translate to keep Image 1 stationary relative to screen
                {
                    yPercent: 0,
                    ease: "power2.inOut",
                    stagger: 0.08,
                },
                0
            );

            // Overlay 1 Fade In
            const o1Title = overlaysRef.current[0]?.querySelector("h1");
            const o1Sub = overlaysRef.current[0]?.querySelector(".stream-subtitle");
            if (o1Title && o1Sub) {
                tl.fromTo(o1Title, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, "-=0.3");
                tl.fromTo(o1Sub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, "-=0.2");
            }

            // PHASE 2: Slide to Image 2 (slide up by -100%)
            // Fade out Overlay 1
            if (overlaysRef.current[0]) {
                tl.to(overlaysRef.current[0], { opacity: 0, y: -40, ease: "power2.in", duration: 0.4 }, "+=0.3");
            }

            // Slide columns to reveal Image 2
            tl.to(
                sliders,
                {
                    yPercent: -100,
                    ease: "power2.inOut",
                    stagger: 0.08,
                },
                "-=0.2"
            );

            // Overlay 2 Fade In
            const o2Title = overlaysRef.current[1]?.querySelector("h1");
            const o2Sub = overlaysRef.current[1]?.querySelector(".stream-subtitle");
            if (o2Title && o2Sub) {
                tl.fromTo(o2Title, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, "-=0.5");
                tl.fromTo(o2Sub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, "-=0.4");
            }

            // PHASE 3: Slide to Image 3 (slide up by -200%)
            // Fade out Overlay 2
            if (overlaysRef.current[1]) {
                tl.to(overlaysRef.current[1], { opacity: 0, y: -40, ease: "power2.in", duration: 0.4 }, "+=0.3");
            }

            // Slide columns to reveal Image 3
            tl.to(
                sliders,
                {
                    yPercent: -200,
                    ease: "power2.inOut",
                    stagger: 0.08,
                },
                "-=0.2"
            );

            // Overlay 3 Fade In
            const o3Title = overlaysRef.current[2]?.querySelector("h1");
            const o3Sub = overlaysRef.current[2]?.querySelector(".stream-subtitle");
            if (o3Title && o3Sub) {
                tl.fromTo(o3Title, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, "-=0.5");
                tl.fromTo(o3Sub, { y: 20, opacity: 0 }, { y: 0, opacity: 1, ease: "power3.out", duration: 0.5 }, "-=0.4");
            }
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="stream-hero-container">
            {/* Interactive Particle Background */}
            <canvas ref={canvasRef} className="stream-bg-canvas" />

            {/* Animated REACT background text */}
            <div ref={bgTextRef} className="stream-bg-text">
                <div className="stream-bg-word">
                    {reactChars.map((char, i) => (
                        <span
                            key={i}
                            ref={(el) => (charsRef.current[i] = el)}
                            className="stream-bg-char"
                            data-char={char}
                        >
                            {char}
                        </span>
                    ))}
                </div>
                <div ref={bgTagRef} className="stream-bg-tag">
                    INTERACTIVE · ANIMATION · STUDIO
                </div>
            </div>

            <div className="stream-split-wrapper">
                {Array.from({ length: numCols }).map((_, i) => {
                    const widthPercent = 100 / numCols;
                    const leftPercent = i * widthPercent;

                    return (
                        <div
                            key={i}
                            ref={(el) => (columnsRef.current[i] = el)}
                            className="stream-col"
                            style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                            }}
                        >
                            <div className="stream-col-image-wrapper">
                                <div
                                    ref={(el) => (slidersRef.current[i] = el)}
                                    className="stream-image-slider"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                >
                                    {images.map((imgUrl, imgIdx) => (
                                        <img
                                            key={imgIdx}
                                            src={imgUrl}
                                            alt={`Stream segment ${i + 1} image ${imgIdx + 1}`}
                                            style={{
                                                position: "absolute",
                                                top: `${imgIdx * 100}%`,
                                                left: `-${i * widthPercent}vw`,
                                                width: "100vw",
                                                height: "100vh",
                                                objectFit: "cover",
                                                maxWidth: "none",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Elegant stacked overlay typography */}
            <div className="stream-overlay-content">
                {overlays.map((overlay, index) => (
                    <div
                        key={index}
                        ref={(el) => (overlaysRef.current[index] = el)}
                        className="stream-text-overlay-group"
                    >
                        <div className="stream-title-reveal">
                            <h1>{overlay.title}</h1>
                        </div>
                        <div className="stream-subtitle">
                            {overlay.subtitle}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pulse Scroll Indicator */}
            <div className="stream-overlay-text">Scroll Down</div>
        </div>
    );
}
