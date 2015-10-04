#pragma glslify: curlNoise = require(glsl-curl-noise)

// simulation
varying vec2 vUv;

uniform sampler2D tPositions;
uniform sampler2D origin;

uniform float timer;
uniform float wind;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

    vec3 pos = texture2D( tPositions, vUv ).xyz;

    if ( rand(vUv + timer ) > 0.95) {
        pos = texture2D( origin, vUv ).xyz;
    } else {
        vec3 velocity = curlNoise(pos * 0.02) * 0.1;
        float l = pow(smoothstep(500.0, -500.0,  pos.x), 2.0);
        velocity.x += -0.05 + l * - (0.2 + rand(vUv) * 0.2);
        velocity.x = clamp(velocity.x, -5.0, -0.01);
        
        pos = pos + velocity* wind;
    }
    gl_FragColor = vec4(pos,  1.0);
}
