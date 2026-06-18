import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS_DATA = [
  {
    title: "Liquid Glitch",
    subtitle: "Digital flows and cybernetic streams",
    images: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800",
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800"
    ]
  },
  {
    title: "Nature Breath",
    subtitle: "Scenic structures and organic shapes",
    images: [
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800"
    ]
  },
  {
    title: "Deep Canvas",
    subtitle: "Fluid textures and dynamic gradients",
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800",
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800"
    ]
  },
  {
    title: "Metal Forge",
    subtitle: "Industrial chrome and metallic reflections",
    images: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800",
      "https://images.unsplash.com/photo-1535813547-99c456a41d4a?q=80&w=800",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800"
    ]
  },
  {
    title: "Prism Light",
    subtitle: "Glass refraction and colorful spectrums",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800",
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=800"
    ]
  },
  {
    title: "Static Void",
    subtitle: "Minimalist architecture and monochrome lines",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800"
    ]
  }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const projectIndex = parseInt(id, 10) || 0;
  const project = PROJECTS_DATA[projectIndex % PROJECTS_DATA.length];

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const trackRef = useRef(null);
  const backBtnRef = useRef(null);
  const titleRevealRef = useRef(null);

  // Magnetic button hover effect
  useEffect(() => {
    const btn = backBtnRef.current;
    if (!btn) return;

    const onMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;

      const distance = Math.hypot(e.clientX - btnX, e.clientY - btnY);

      // Magnetic pull radius of 120px
      if (distance < 120) {
        gsap.to(btn, {
          x: (e.clientX - btnX) * 0.35,
          y: (e.clientY - btnY) * 0.35,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1.1, 0.3)" });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // GSAP Animations
  useGSAP(
    () => {
      // 1. Text slide-up skew reveal on load
      gsap.fromTo(
        titleRevealRef.current,
        { yPercent: 100, rotate: 3 },
        { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", delay: 0.2 }
      );

      // 2. Horizontal Scroll gallery animation
      const track = trackRef.current;
      const trigger = triggerRef.current;
      if (!track || !trigger) return;

      // Bug fix: scrollWidth was previously read synchronously here, before the
      // gallery <img> elements had finished loading. Network-fetched images don't
      // contribute their intrinsic dimensions until they decode, so the measurement
      // was too small on any connection that isn't instant cache — causing dead
      // scroll space or a gallery that cuts off early.
      //
      // Fix: collect a load promise for every image in the track (already-loaded
      // images resolve immediately via img.complete), wait for all of them, then
      // measure and create the ScrollTrigger with the real final scrollWidth.
      const imgs = Array.from(track.querySelectorAll("img"));
      const loadPromises = imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // don't block on a broken image
            })
      );

      Promise.all(loadPromises).then(() => {
        const scrollWidth = track.scrollWidth;
        const viewWidth = window.innerWidth;
        const xTranslation = -(scrollWidth - viewWidth);

        gsap.to(track, {
          x: xTranslation,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top top",
            end: `+=${scrollWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Flush any pending ScrollTrigger layout recalculations now that
        // images have defined their dimensions.
        ScrollTrigger.refresh();
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="project-detail-container">
      {/* Magnetic Back button */}
      <Link ref={backBtnRef} to="/" className="project-back-btn">
        ← Close
      </Link>

      {/* Header section with typographic reveal */}
      <header className="project-header">
        <div className="project-title-reveal">
          <h1 ref={titleRevealRef} className="project-title">
            {project.title}
          </h1>
        </div>
        <p className="project-subtitle">{project.subtitle}</p>
      </header>

      {/* Scroll-tied Horizontal Gallery */}
      <section ref={triggerRef} className="project-horizontal-section">
        <div ref={trackRef} className="project-horizontal-wrapper">
          {project.images.map((src, index) => (
            <div key={index} className="project-horizontal-card">
              <img src={src} alt={`${project.title} slide ${index + 1}`} />
              <div className="project-horizontal-card-info">
                <h3>0{index + 1}</h3>
                <p>Curated Detail Perspective</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer transition back */}
      <footer className="project-footer">
        <h2>End of Showcase</h2>
      </footer>
    </div>
  );
}
