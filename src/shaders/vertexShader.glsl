uniform float uTime;

varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vUv;

void main() {
    vNormal = normal;
    vUv = uv;
    vColor = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
