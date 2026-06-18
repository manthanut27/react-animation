uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Output the mapped texture color
    gl_FragColor = texColor;
}
