(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";
console.log("SSOTL");

var THREE = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);


var camera;
var renderer;
var scene;
var textGeo;
var control;

var clock = new THREE.Clock();

var fboWidth = 128, fboHeight = 128;

var simulationVertexShader = "#define GLSLIFY 1\nvarying vec2 vUv;\nvoid main() {\n    vUv = vec2(uv.x, 1.0 - uv.y);\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n"
var simulationFragmentShader = "#define GLSLIFY 1\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\n\nvec3 snoiseVec3_1_8( vec3 x ){\n\n  float s  = snoise_2_3(vec3( x ));\n  float s1 = snoise_2_3(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));\n  float s2 = snoise_2_3(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));\n  vec3 c = vec3( s , s1 , s2 );\n  return c;\n\n}\n\n\nvec3 curlNoise_1_9( vec3 p ){\n  \n  const float e = .1;\n  vec3 dx = vec3( e   , 0.0 , 0.0 );\n  vec3 dy = vec3( 0.0 , e   , 0.0 );\n  vec3 dz = vec3( 0.0 , 0.0 , e   );\n\n  vec3 p_x0 = snoiseVec3_1_8( p - dx );\n  vec3 p_x1 = snoiseVec3_1_8( p + dx );\n  vec3 p_y0 = snoiseVec3_1_8( p - dy );\n  vec3 p_y1 = snoiseVec3_1_8( p + dy );\n  vec3 p_z0 = snoiseVec3_1_8( p - dz );\n  vec3 p_z1 = snoiseVec3_1_8( p + dz );\n\n  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;\n  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;\n  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;\n\n  const float divisor = 1.0 / ( 2.0 * e );\n  return normalize( vec3( x , y , z ) * divisor );\n\n}\n\n\n\n\n// simulation\nvarying vec2 vUv;\n\nuniform sampler2D tPositions;\nuniform sampler2D origin;\n\nuniform float timer;\nuniform float wind;\n\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\n    vec3 pos = texture2D( tPositions, vUv ).xyz;\n\n    if ( rand(vUv + timer ) > 0.95) {\n        pos = texture2D( origin, vUv ).xyz;\n    } else {\n        vec3 velocity = curlNoise_1_9(pos * 0.02) * 0.1;\n        float l = pow(smoothstep(500.0, -500.0,  pos.x), 2.0);\n        velocity.x += -0.05 + l * - (0.2 + rand(vUv) * 0.2);\n        velocity.x = clamp(velocity.x, -5.0, -0.01);\n        \n        pos = pos + velocity* wind;\n    }\n    gl_FragColor = vec4(pos,  1.0);\n}\n"
var particlesVertexShader = "#define GLSLIFY 1\nuniform sampler2D map;\nuniform float width;\nuniform float height;\nuniform float pointSize;\nvarying vec2 vUv;\nvoid main() {\n    vUv = position.xy + vec2( 0.5 / width, 0.5 / height );\n    vec3 color = texture2D( map, vUv ).rgb ;\n    gl_PointSize = pointSize;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( color, 1.0 );\n    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position * 200.0, 1.0 );\n}\n"
var particlesFragmentShader = "#define GLSLIFY 1\nuniform sampler2D map;\nvarying vec2 vUv;\nvarying float vColor;\n\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\nvoid main() {\n    vec3 color = texture2D( map, vUv ).rgb ;\n    float d = length(color.xy) * 0.01 ;\n    float c = 7.0 - d; //smoothstep(0.16, 1.0, d);   \n//    gl_FragColor = vec4(vec3(1.0, 0.0, 0.0) * d, 1.0);\n   gl_FragColor = vec4(\n            mix(\n                vec3(0.988, 0.055, 0.055),\n                vec3(1.0, 0.804, 0.176), \n                0.5\n            ) * d,d\n    );\n}\n"


var simulationShaders = [];
var fboParticlesArrays = [];
var fboMaterials = [];
var fboMeshes = [];

var wind = 1;

var rtTexturePos, rtTexturePos2;


var words =  ['stone', 'freedom', 'memory', 'noise', 'molten', 'strong', 'wind', 'trail-making', 'grazing', 'trust', 'air', 'connections', 'light', 'wind', 'downhill', 'eagle' , 'yellow', 'lemming', 'color', 'sleeping', 'colors', 'orange', 'border', 'smile', 'ruska', 'stone', 'yellow', 'texture', 'soft', 'floating', 'seeing', 'land', 'raja', 'reflection', 'north', 'energized', 'comfort'];


window.onload = function() {
    init();
    for (var i = 0; i < words.length; i+=2) {
        createFBO(words[i] + ' ' + (words[i+1] ? words[i+1] : ''), i);
    }

/*    var boxGeometry = new THREE.BoxGeometry( 100, 100, 100 );
    var boxMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cube = new THREE.Mesh(boxGeometry, boxMaterial );
    scene.add( cube );*/



    document.addEventListener( 'mousemove', function() {
        wind += 0.2;
        console.log("wind: ", wind);
    }, false );
    
    animate();
}


function animate(t) {
  requestAnimationFrame(animate);
  update(clock.getDelta());
  render(clock.getDelta());
}

function update(dt) {
  control.update();
  camera.updateProjectionMatrix();
  camera.position.y -= dt * 10.0;
  camera.position.z += dt * 10.0;

  if (wind > 1) {
      wind -= 0.1
  } else {
      wind = 1;
  }
}

function render(dt) {
    for (var i = 0; i < fboParticlesArrays.length; i++) {
        // swap
        var fboParticles = fboParticlesArrays[i];
        simulationShaders[i].uniforms.timer.value += dt;
            
        var tmp = fboParticles.in;
        fboParticles.in = fboParticles.out;
        fboParticles.out = tmp;
        simulationShaders[i].uniforms.tPositions.value = fboParticles.in;
        simulationShaders[i].uniforms.wind.value = wind;
        fboParticles.simulate(fboParticles.out);
        fboMaterials[i].uniforms.map.value = fboParticles.out;
    }

    renderer.render(scene, camera);
}
function createFBO(text, index) {
        if ( ! renderer.context.getExtension( 'OES_texture_float' ) ) {
            alert( 'OES_texture_float is not supported :(' );
        }

        var textGeo = createText(text);

        /*var meshMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        var mesh  = new THREE.Mesh(textGeo, meshMaterial );
        scene.add( mesh );*/
        var data = new Float32Array( fboWidth * fboHeight * 3 );
        //var points = THREE.GeometryUtils.randomPointsInGeometry( textGeo, data.length / 3 );
        var points = THREE.GeometryUtils.randomPointsInGeometry( textGeo, data.length / 3 );
        for ( var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1 ) {
            data[ i ] = points[ j ].x;
            data[ i + 1 ] = points[ j ].y;
            data[ i + 2 ] = points[ j ].z;
        }
        var texture = new THREE.DataTexture( data, fboWidth, fboHeight, THREE.RGBFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        // zz85 - fbo init
        rtTexturePos = new THREE.WebGLRenderTarget(fboWidth, fboHeight, {
            wrapS:THREE.RepeatWrapping,
            wrapT:THREE.RepeatWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat,
            type:THREE.HalfFloatType,
            stencilBuffer: false
        });
        rtTexturePos2 = rtTexturePos.clone();
        var simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                tPositions: { type: "t", value: texture },
                origin: { type: "t", value: texture },
                timer: { type: "f", value: 0},
                wind: { type: "f", value: wind}
            },
            vertexShader: simulationVertexShader,
            fragmentShader:  simulationFragmentShader
        });
        var fboParticlesArray = new THREE.FBOUtils( fboWidth, renderer, simulationShader);
        fboParticlesArray.renderToTexture(rtTexturePos, rtTexturePos2);
        fboParticlesArray.in = rtTexturePos;
        fboParticlesArray.out = rtTexturePos2;

        console.log("fboParticlesArray in:", fboParticlesArray.in);

        var geometry = new THREE.Geometry();
        for ( var i = 0, l = fboWidth * fboHeight; i < l; i ++ ) {
            var vertex = new THREE.Vector3();
            vertex.x = ( i % fboWidth ) / fboWidth ;
            vertex.y = Math.floor( i / fboWidth ) / fboHeight;
            geometry.vertices.push( vertex );
        }
        var fboMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                "map": { type: "t", value: rtTexturePos },
                "width": { type: "f", value: fboWidth },
                "height": { type: "f", value: fboHeight },
                "pointSize": { type: "f", value: 1.3 }
            },
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            depthTest: false,
            transparent: true
        } );
        var fboMesh = new THREE.Points( geometry, fboMaterial);
        fboMesh.position.set(-300 , 500 - index * 60, -100 );
        fboMesh.frustumCulled = false;

        console.log("Adding Point Cloud: ", fboMesh);
        
        simulationShaders.push(simulationShader);
        fboParticlesArrays.push(fboParticlesArray);
        fboMaterials.push(fboMaterial);
        fboMeshes.push(fboMesh);

        scene.add( fboMesh );


}

function createText(text) {
    textGeo = new THREE.TextGeometry( text, {
        size: 100,
        height: 20,
        curveSegments: 4,

        font: "droid sans",
        weight: "normal",
        style: "normal",

        bevelThickness: 1,
        bevelSize: 0,
        bevelEnabled: false,

        material: 0,
        extrudeMaterial:0 
    });

    return textGeo;

}

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x00000, 1 );
    var element = renderer.domElement;
    var container = document.getElementById('ssotl');
    container.appendChild(element);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90,window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 300;
    camera.position.y = -100;
    camera.position.x = -100;
    scene.add(camera);


    control = new THREE.OrbitControls( camera, element);

    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );
    

    window.addEventListener('resize', resize, false);
    resize();
}
function resize() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
