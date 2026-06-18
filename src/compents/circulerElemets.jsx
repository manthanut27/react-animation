import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const cardImages = [
  "https://images.unsplash.com/photo-1774888441163-6f2f23d19ad1?q=80&w=1033&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1780855780004-f8e7669e35f3?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1777405972227-23fb094c9ed9?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1780789593810-2664c4c4dcd5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1780856132003-9bd90e0554f8?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1778003586075-0d361afc71a9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1777740718372-75b8d23d3cc0?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1780689978569-9a281be2e4ec?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

export default function CircularElements() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(
    () => {
      const radius = 520;
      const totalRotation = 360;
      let rotationTarget = { value: 0 };
      let isHovered = false;
      const cards = cardsRef.current.filter(Boolean);

      function updateCards(rotation) {
        const total = cards.length;

        cards.forEach((card, index) => {
          if (!card) return;
          // 1. Calculate the specific angle for this card in radians
          const baseAngle = (360 / total) * index;
          const angleInRadians = ((baseAngle + rotation) * Math.PI) / 180;

          // 2. Trigonometry to get X and Y coordinates from the center
          const x = Math.cos(angleInRadians) * radius;
          const y = Math.sin(angleInRadians) * radius;

          // 3. Apply styles quickly using gsap.set
          gsap.set(card, {
            x,
            y,
            xPercent: -50,
            yPercent: -50,
          });
        });
      }

      // Set initial positions
      updateCards(0);

      // Create ScrollTrigger
      const scrollTriggerInstance = ScrollTrigger.create({
        trigger: ".circular-section",
        start: "top top",
        end: "+=3000",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          // If hovering, do NOT update the wheel rotation based on scroll
          if (isHovered) return;

          // Otherwise, smoothly animate the rotation target value
          gsap.to(rotationTarget, {
            value: self.progress * totalRotation,
            overwrite: "auto",
            duration: 0.1, // Adds a slight easing to the wheel movement
            onUpdate: () => updateCards(rotationTarget.value),
          });
        },
      });

      // Hover listeners setup
      const cleanups = [];
      cards.forEach((card) => {
        if (!card) return;

        const enterHandler = () => {
          isHovered = true;
          // Visually emphasize the hovered card
          gsap.to(card, { scale: 1.1, duration: 0.3 });
        };

        const leaveHandler = () => {
          isHovered = false;
          gsap.to(card, { scale: 1, duration: 0.3 });

          // Smoothly catch up to the current scroll position's rotation
          gsap.to(rotationTarget, {
            value: scrollTriggerInstance.progress * totalRotation,
            duration: 0.5,
            onUpdate: () => updateCards(rotationTarget.value),
          });
        };

        card.addEventListener("mouseenter", enterHandler);
        card.addEventListener("mouseleave", leaveHandler);

        cleanups.push(() => {
          card.removeEventListener("mouseenter", enterHandler);
          card.removeEventListener("mouseleave", leaveHandler);
        });
      });

      return () => {
        // Cleanup all events and scrolltriggers on unmount
        cleanups.forEach((cleanup) => cleanup());
        scrollTriggerInstance.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>

      {/* Circular Slider Section */}
      <section className="circular-section">
        <div className="center-content">
          <h2>Creative Studio</h2>
          <p>Scroll to rotate</p>
        </div>

        <div className="circle-wrapper">
          {cardImages.map((src, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="card"
            >
              <img src={src} alt={`Studio card ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
