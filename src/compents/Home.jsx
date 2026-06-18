import CircularElements from "./circulerElemets";
import ImageTrail from "./imageTrail";
import StreamMasking from "./streammasking";
import ClipPathAnimation from "./ClipPathanimation";
import Experience from "./Experience";
import { Canvas } from "@react-three/fiber";

// Each wrapper gets a descending z-index.
// GSAP pins set position:fixed — a higher z-index on earlier sections
// ensures they always render above later content when pinned.
const sectionStyle = (z) => ({
  position: "relative",
  zIndex: z,
});

export default function Home() {
  return (
    <>
      <div style={sectionStyle(40)}>
        <StreamMasking />
      </div>

      <div style={sectionStyle(30)}>
        <ClipPathAnimation />
      </div>

      <div style={sectionStyle(20)}>
        <CircularElements />
      </div>

      <div style={sectionStyle(10)}>
        <ImageTrail />
      </div>

      <div
        className="three-showcase"
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          backgroundColor: "#efede7",
          overflow: "hidden",
          zIndex: 5,
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Experience />
        </Canvas>
      </div>
    </>
  );
}
