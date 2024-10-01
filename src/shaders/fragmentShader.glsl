export default /* glsl */`

varying vec3 vColor;
varying vec3 vNormal;

void main() {
	gl_FragColor = vec4(vNormal,1);
}
`;
