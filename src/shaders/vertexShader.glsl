export default /* glsl */`

uniform float uTime;

varying vec3 vColor;

varying vec3 vNormal;

void main() {
	vNormal = normal; // Added missing semicolon
	vColor = vec3(position.x, position.y, position.z);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`; 