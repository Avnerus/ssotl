"use strict";
console.log("SSOTL");

var THREE = require('three');
var glslify = require('glslify')

var camera;
var renderer;
var scene;
var textGeo;
var control;

var clock = new THREE.Clock();

var fboWidth = 128, fboHeight = 128;

var simulationVertexShader = glslify(__dirname + '/glsl/simulation_vertex.glsl')
var simulationFragmentShader = glslify(__dirname + '/glsl/simulation_fragment.glsl')
var particlesVertexShader = glslify(__dirname + '/glsl/particles_vertex.glsl')
var particlesFragmentShader = glslify(__dirname + '/glsl/particles_fragment.glsl')


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
