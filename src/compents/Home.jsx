import CircularElements from "./circulerElemets";
import ImageTrail from "./imageTrail";
import StreamMasking from "./streammasking";
import ClipPathAnimation from "./ClipPathanimation";
import Experience from "./Experience";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <>
      <StreamMasking />
      <ClipPathAnimation />
      <CircularElements />
      <ImageTrail />
      
      <div className="three-showcase" style={{ width: "100%", height: "100vh", position: "relative", backgroundColor: "#efede7", overflow: "hidden" }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <Experience />
        </Canvas>
      </div>
    </>
  );
}
