import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ClipPathAnimation() {
  const containerRef = useRef(null);
  const topCircleRef = useRef(null);
  const bottomCircleRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          // Use the containerRef DOM node directly as the trigger instead of the
          // global class string ".reveal-section", which would match the first
          // instance in the document if multiple were ever mounted.
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Direct ref targets instead of global ".reveal-circle.top/bottom" selectors.
      // The { scope: containerRef } option scopes GSAP's own selector utility but
      // does NOT scope raw class strings passed as animation targets — those always
      // resolve against document, making the first DOM match win regardless of scope.
      tl.to(
        topCircleRef.current,
        { clipPath: "circle(140vmax at 50% 0%)", ease: "none" },
        0
      ).to(
        bottomCircleRef.current,
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
        <div ref={topCircleRef} className="inner-content reveal-circle top">
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
        <div ref={bottomCircleRef} className="inner-content reveal-circle bottom" aria-hidden="true">
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
