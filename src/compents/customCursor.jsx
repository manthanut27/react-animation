import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Place off-screen initially
    gsap.set([cursor, dot], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const onMouseMove = (e) => {
      // Immediate follower dot
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
      // Eased outer ring
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.45, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMouseMove);

    // Event delegation — one listener on document covers every matching element,
    // present and future, with zero polling cost.
    // Previously: setInterval(attachListeners, 2000) re-ran querySelectorAll every
    // 2 seconds forever, calling addEventListener repeatedly on the same static
    // elements. Nothing on this page adds interactive elements after mount, so
    // the interval was pure overhead and a potential source of duplicate listeners.
    const INTERACTIVE = "a, button, .card, .trail-image, .three-showcase canvas, .circle-wrapper";

    const onDocMouseEnter = (e) => {
      // e.target can be `document` itself (not an Element) in capture phase —
      // guard before calling .closest(), which only exists on Element nodes.
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(INTERACTIVE)) return;
      gsap.to(cursor, {
        scale: 1.8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderColor: "#fff",
        duration: 0.3,
      });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const onDocMouseLeave = (e) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(INTERACTIVE)) return;
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: "transparent",
        borderColor: "rgba(255, 255, 255, 0.6)",
        duration: 0.3,
      });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    document.addEventListener("mouseenter", onDocMouseEnter, true);
    document.addEventListener("mouseleave", onDocMouseLeave, true);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onDocMouseEnter, true);
      document.removeEventListener("mouseleave", onDocMouseLeave, true);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </>
  );
}
