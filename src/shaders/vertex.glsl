uniform float uScrollSpeed;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 newPosition = position;
    
    // Bend the cards on the Z-axis based on scroll speed to give them a liquid/flexible feel
    float bend = sin(uv.x * 3.14159265);
    newPosition.z += bend * uScrollSpeed * 0.35;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
