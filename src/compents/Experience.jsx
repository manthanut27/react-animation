import { useTexture, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import fragmentShader from "../shaders/fragment.glsl";
import vertexShader from "../shaders/vertex.glsl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const IMAGE_URL = [

    "https://images.unsplash.com/photo-1774606570918-aa9d70b2932b?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1774523195578-121a2d1da490?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1773772255047-74744067601e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1749303544314-cb8ec06223d5?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1775119221769-6b0af28704ed?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1775563655673-c28ac3802166?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const PROJECT_LABELS = [
    { title: "Urban Pulse",    sub: "Architecture" },
    { title: "Sable Drift",    sub: "Fashion" },
    { title: "Neon Bloom",     sub: "Nature" },
    { title: "Void Study",     sub: "Abstract" },
    { title: "Coastal Hymn",   sub: "Landscape" },
    { title: "Dusk Protocol",  sub: "Editorial" },
];

const CARD_H = 1.1;
const CARD_W = 2;
const RADIUS = 3;
const TOTAL_CARD = IMAGE_URL.length;
const LERP_RATIO = 0.05;

// ─── Particle Field ──────────────────────────────────────────────────────────
const PARTICLE_COUNT = 800;

// Each particle gets a random position inside a hollow sphere shell.
function randomInShell(innerR, outerR) {
    // Rejection-sample uniform sphere distribution then scale to shell range
    let x, y, z, len;
    do {
        x = (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * 2;
        z = (Math.random() - 0.5) * 2;
        len = Math.sqrt(x * x + y * y + z * z);
    } while (len === 0);
    const r = innerR + Math.random() * (outerR - innerR);
    return [x / len * r, y / len * r, z / len * r];
}

const Particles = ({ scrollSpeedRef }) => {
    const pointsRef = useRef(null);

    // Build a real THREE.BufferGeometry + typed arrays once.
    // Using drei's <Points> with a nested <bufferGeometry> causes an internal
    // conflict — drei manages its own buffer, so the child geometry is ignored
    // and nothing renders. Raw R3F <points> (lowercase) maps directly to
    // THREE.Points with no wrapper, so the ref and geometry are fully ours.
    const { geometry, velocities, homes } = useMemo(() => {
        const positions  = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const homes      = new Float32Array(PARTICLE_COUNT * 3);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const [x, y, z] = randomInShell(6, 18);
            const i3 = i * 3;

            positions[i3]     = homes[i3]     = x;
            positions[i3 + 1] = homes[i3 + 1] = y;
            positions[i3 + 2] = homes[i3 + 2] = z;

            velocities[i3]     = (Math.random() - 0.5) * 0.004;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.004;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.004;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        return { geometry, velocities, homes };
    }, []);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;

        const pos   = geometry.attributes.position.array;
        const speed = Math.abs(scrollSpeedRef.current);
        const t     = clock.getElapsedTime();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            const noiseX = Math.sin(t * 0.3  + i * 0.7) * 0.002;
            const noiseY = Math.cos(t * 0.25 + i * 0.5) * 0.002;
            const noiseZ = Math.sin(t * 0.2  + i * 0.9) * 0.002;

            // Spring back toward home
            velocities[i3]     += (homes[i3]     - pos[i3])     * 0.0008 + noiseX;
            velocities[i3 + 1] += (homes[i3 + 1] - pos[i3 + 1]) * 0.0008 + noiseY;
            velocities[i3 + 2] += (homes[i3 + 2] - pos[i3 + 2]) * 0.0008 + noiseZ;

            // Scroll burst — push radially outward
            if (speed > 0.01) {
                const len = Math.sqrt(
                    pos[i3] * pos[i3] +
                    pos[i3 + 1] * pos[i3 + 1] +
                    pos[i3 + 2] * pos[i3 + 2]
                ) || 1;
                velocities[i3]     += (pos[i3]     / len) * speed * 0.06;
                velocities[i3 + 1] += (pos[i3 + 1] / len) * speed * 0.06;
                velocities[i3 + 2] += (pos[i3 + 2] / len) * speed * 0.06;
            }

            velocities[i3]     *= 0.96;
            velocities[i3 + 1] *= 0.96;
            velocities[i3 + 2] *= 0.96;

            pos[i3]     += velocities[i3];
            pos[i3 + 1] += velocities[i3 + 1];
            pos[i3 + 2] += velocities[i3 + 2];
        }

        pointsRef.current.rotation.y = t * 0.04;
        pointsRef.current.rotation.x = t * 0.015;
        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                color="#8a7a9b"
                size={0.06}
                sizeAttenuation
                transparent
                opacity={0.75}
                depthWrite={false}
            />
        </points>
    );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ index, texture, scrollSpeedRef }) => {
    const angle = (index / TOTAL_CARD) * 2 * Math.PI;
    // Label sits between this card and the next one in the ring
    const labelAngle = angle + (Math.PI / TOTAL_CARD);
    const labelRadius = RADIUS * 0.82;

    const position = useMemo(() => {
        const x = RADIUS * Math.sin(angle);
        const z = RADIUS * Math.cos(angle);
        return [x, 0, z];
    }, [angle]); // dep array was missing — recomputed on every render before

    const labelPosition = useMemo(() => {
        const x = labelRadius * Math.sin(labelAngle);
        const z = labelRadius * Math.cos(labelAngle);
        return [x, 0, z];
    }, [labelAngle, labelRadius]); // dep array was missing

    const uniforms = {
        uTexture: { value: texture },
        uScrollSpeed: { value: 0 },
    };

    const materialRef = useRef(null);

    useFrame(() => {
        if (!materialRef.current) return;
        materialRef.current.uniforms.uScrollSpeed.value = scrollSpeedRef.current;
    });

    const navigate = useNavigate();

    const handleClick = (index) => {
        navigate(`/project/${index}`);
    };

    const label = PROJECT_LABELS[index];

    return (
        <>
            <mesh
                onPointerEnter={() => (document.body.style.cursor = "pointer")}
                onPointerLeave={() => (document.body.style.cursor = "default")}
                onClick={() => handleClick(index)}
                position={position}
                rotation={[0, angle, 0]}
            >
                <planeGeometry args={[CARD_W, CARD_H, 32, 32]} />
                <shaderMaterial
                    ref={materialRef}
                    side={THREE.DoubleSide}
                    uniforms={uniforms}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                />
            </mesh>

            {/* Between-image text label */}
            <Html
                position={labelPosition}
                rotation={[0, labelAngle, 0]}
                center
                distanceFactor={4}
                zIndexRange={[10, 20]}
                style={{ pointerEvents: "none" }}
            >
                <div className="carousel-label">
                    <span className="carousel-label-num">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="carousel-label-title">{label.title}</span>
                    <span className="carousel-label-sub">{label.sub}</span>
                </div>
            </Html>
        </>
    );
};

const Experience = () => {
    const textures = useTexture(IMAGE_URL);

    const groupRef = useRef(null);

    const currentRotationRef = useRef(0);
    const targetRoationRef = useRef(0);

    const scrollSpeedRef = useRef(0);
    const targetScrollSpeedRef = useRef(0);

    const mouseMouseRef = useRef({ x: 0, y: 0 });
    const targetMouseRef = useRef({ x: 0, y: 0 });

    const { gl } = useThree();

    useEffect(() => {
        const canvas = gl.domElement;

        const handleScroll = (e) => {
            e.preventDefault();
            targetRoationRef.current += e.deltaY * 0.003;
            targetScrollSpeedRef.current += e.deltaY * 0.003;
        };

        canvas.addEventListener("wheel", handleScroll, { passive: false });

        return () => {
            canvas.removeEventListener("wheel", handleScroll);
        };
    }, [gl]);

    useEffect(() => {
        // Named handler so the same reference is used for both add and remove.
        // Previously: anonymous handler + no dep array = a new listener stacked
        // on window after every render, never cleaned up (listener leak).
        const handleMouseMove = (e) => {
            targetMouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []); // empty dep array: mount once, clean up on unmount

    useGSAP(() => {
        gsap.to(mouseMouseRef.current, {
            x: targetMouseRef.current.x * 0.05,
            y: targetMouseRef.current.y * 0.05,
            duration: 0.6,
            ease: "power2.out",
        });
    });

    useFrame(() => {
        if (!groupRef.current) return;

        currentRotationRef.current +=
            (targetRoationRef.current - currentRotationRef.current) * LERP_RATIO;

        scrollSpeedRef.current +=
            (targetScrollSpeedRef.current - scrollSpeedRef.current) * LERP_RATIO;

        groupRef.current.rotation.y = currentRotationRef.current;

        groupRef.current.rotation.x +=
            (-targetMouseRef.current.x * 0.3 - groupRef.current.rotation.x) * 0.5;

        groupRef.current.rotation.z +=
            (targetMouseRef.current.y * 0.3 - groupRef.current.rotation.z) * 0.3;

        targetScrollSpeedRef.current *= 0.8;
    });

    useMemo(() => {
        textures.forEach((tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
        });
    }, [textures]);

    return (
        <>
            <color attach="background" args={["#efede7"]} />

            {/* Ambient dust particles that fill the scene volume */}
            <Particles scrollSpeedRef={scrollSpeedRef} />

            {/* Central floating headline — sits in world space so it overlaps the carousel */}
            <Html
                position={[0, 0, 0]}
                center
                distanceFactor={6}
                zIndexRange={[30, 40]}
                style={{ pointerEvents: "none" }}
            >
                <div className="carousel-center-title">
                    <span className="carousel-center-eyebrow">Explore</span>
                    <h2 className="carousel-center-heading">PROJECTS</h2>
                    <span className="carousel-center-hint">scroll to rotate</span>
                </div>
            </Html>

            <group ref={groupRef}>
                {textures.map((texture, idx) => {
                    return (
                        <Card
                            key={idx}
                            scrollSpeedRef={scrollSpeedRef}
                            index={idx}
                            texture={texture}
                        />
                    );
                })}
            </group>
        </>
    );
};

export default Experience;

