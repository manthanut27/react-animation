import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./compents/Home";
import ProjectDetail from "./compents/ProjectDetail";
import CustomCursor from "./compents/customCursor";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function App() {
  // Initialize Lenis smooth scroll and sync with ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
    });

    // Single driver: gsap.ticker keeps Lenis in sync with ScrollTrigger.
    // A separate requestAnimationFrame loop was previously running lenis.raf()
    // on a different time base — two drivers fighting each other. Removed.
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", ScrollTrigger.update);

    // Scroll to top on route change to make page transitions look clean
    const onRouteTransition = () => {
      lenis.scrollTo(0, { immediate: true });
    };

    window.addEventListener("popstate", onRouteTransition);

    return () => {
      lenis.destroy();
      window.removeEventListener("popstate", onRouteTransition);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Global Interactive Cursor */}
      <CustomCursor />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
