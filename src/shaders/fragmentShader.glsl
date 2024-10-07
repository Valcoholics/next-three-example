precision highp float;

#define PI 3.14159265
#define TAU 6.28318

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;

varying vec3 vNormal;
// varying vec3 vColor; // Remove if not used

const int RAYMARCH_MAX_STEPS = 100;
const float RAYMARCH_MAX_DIST = 10.0;
const float EPSILON = 0.0001;

// Cosine palette
vec3 palette(in vec3 t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(TAU * (c * t + d));
}

// 2D rotation matrix
mat2 Rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

// Signed distance function for a box
float sdBox(vec3 p, vec3 s) {
    p = abs(p) - s;
    return length(max(p, 0.0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

// Distance estimation function
float getDist(vec3 p, vec2 mouse) {
    vec3 mouseRotation = p;
    mouseRotation.yz *= Rot(-mouse.y * PI + 1.0);
    mouseRotation.xz *= Rot(-mouse.x * TAU);
    return sdBox(mouseRotation, vec3(1.0));
}

// Calculate normals using finite differences
vec3 getNormal(vec3 p, vec2 mouse) {
    float d = getDist(p, mouse);
    if (d == 0.0) return vec3(0.0); // Avoid division by zero
    vec2 e = vec2(sin(uTime + 0.006), 0.0);
    vec3 n = d - vec3(
        getDist(p - e.xyy, mouse),
        getDist(p - e.yxy, mouse),
        getDist(p - e.yyx, mouse)
    );
    return normalize(n);
}

// Raymarching algorithm
float rayMarch(vec3 ro, vec3 rd, vec2 mouse) {
    float dO = 0.0;
    for (int i = 0; i < RAYMARCH_MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = getDist(p, mouse);
        dO += dS;
        if (dO > RAYMARCH_MAX_DIST || abs(dS) < EPSILON) break;
    }
    return dO;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;
    vec2 m = uMouse / uResolution;

    vec3 camPos = vec3(0.0, 0.0, -5.0);
    vec3 rayDir = normalize(vec3(uv, 1.0));

    vec3 col = vec3(0.0);
    float d = rayMarch(camPos, rayDir, m);

    if (d < RAYMARCH_MAX_DIST) {
        vec3 p = camPos + rayDir * d;
        vec3 n = getNormal(p, m);
        vec3 rdIn = refract(rayDir, n, 1.0 / 1.9);

        vec3 pEnter = p - n * EPSILON * 3.0;
        float dIn = rayMarch(pEnter, rdIn, m);

        vec3 pExit = pEnter + rdIn * dIn;
        vec3 nExit = -getNormal(pExit, m);

        vec3 rdOut = refract(rdIn, nExit, 1.9);

        if (dot(rdOut, rdOut) == 0.0) {
            rdOut = reflect(rdIn, nExit);
        }

        vec3 reflCol = palette(
            vec3(rdOut),
            vec3(0.5),
            vec3(0.5),
            vec3(1.45, 0.15, 0.65),
            vec3(0.97, 0.23, 0.62)
        );
        col = reflCol;
    }

    col = pow(col, vec3(0.4535)); // Gamma correction
    gl_FragColor = vec4(col, 1.0);
}