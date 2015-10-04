uniform sampler2D map;
varying vec2 vUv;
varying float vColor;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
    vec3 color = texture2D( map, vUv ).rgb ;
    float d = length(color.xy) * 0.01 ;
    float c = 7.0 - d; //smoothstep(0.16, 1.0, d);   
//    gl_FragColor = vec4(vec3(1.0, 0.0, 0.0) * d, 1.0);
   gl_FragColor = vec4(
            mix(
                vec3(0.988, 0.055, 0.055),
                vec3(1.0, 0.804, 0.176), 
                0.5
            ) * d,d
    );
}
