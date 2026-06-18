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

    const onMouseEnterInteractive = () => {
      gsap.to(cursor, {
        scale: 1.8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderColor: "#fff",
        duration: 0.3
      });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const onMouseLeaveInteractive = () => {
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: "transparent",
        borderColor: "rgba(255, 255, 255, 0.6)",
        duration: 0.3
      });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    // Attach listeners dynamically to interactive components
    const attachListeners = () => {
      const targets = document.querySelectorAll(
        "a, button, .card, .trail-image, .three-showcase canvas, .circle-wrapper"
      );
      targets.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterInteractive);
        el.addEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };

    // Run on mount and periodically query to handle dynamically rendered items
    attachListeners();
    const interval = setInterval(attachListeners, 2000);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(interval);
      
      const targets = document.querySelectorAll(
        "a, button, .card, .trail-image, .three-showcase canvas, .circle-wrapper"
      );
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </>
  );
}
