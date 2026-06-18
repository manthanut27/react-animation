import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ClipPathAnimation() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".reveal-section",
          start: "top top",
          end: "+=150%",
          scrub: true,
          pin: true,
          anticipatePin: 1
        }
      });

      tl.to(
        ".reveal-circle.top",
        { clipPath: "circle(140vmax at 50% 0%)", ease: "none" },
        0
      ).to(
        ".reveal-circle.bottom",
        { clipPath: "circle(140vmax at 50% 100%)", ease: "none" },
        0
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <section className="reveal-section">
        {/* TOP CIRCLE: grows downward from the top edge */}
        <div className="inner-content reveal-circle top">
          <div className="logos">
            <span>RIVER</span>
            <span>FLOW</span>
            <span>CURRENT</span>
            <span>FREEDOM</span>
            <span>SERENITY</span>
          </div>
          <h1>
            A RIVER NEVER<br />
            ASKS WHERE<br />
            IT BELONGS.
          </h1>
        </div>

        {/* BOTTOM CIRCLE: grows upward from the bottom edge */}
        <div className="inner-content reveal-circle bottom" aria-hidden="true">
          <div className="logos">
            <span>RIVER</span>
            <span>FLOW</span>
            <span>CURRENT</span>
            <span>FREEDOM</span>
            <span>SERENITY</span>
          </div>
          <h1>
            A RIVER NEVER<br />
            ASKS WHERE<br />
            IT BELONGS.
          </h1>
        </div>
      </section>
    </div>
  );
}
