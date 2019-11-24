(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

// import { HDRCubeTextureLoader } from './three.js-master/HDRCubeTextureLoader.js';

let scene, camera, renderer;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var touch = new THREE.Vector2();

// initiating modelState with listenable implementation
modelState = {
    numMeshesLoadedInternal: 0,
    numMeshesLoadedListener: function(val) {},
    set numMeshesLoaded(val) {
      this.numMeshesLoadedInternal = val;
      this.numMeshesLoadedListener(val);
    },
    get numMeshesLoaded() {
      return this.numMeshesLoadedInternal;
    },
    registerListener: function(listener) {
      this.numMeshesLoadedListener = listener;
    }
  }

function initViews(){
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth/window.innerHeight,
        0.01,
        10000
    );
    camera.lookAt(new THREE.Vector3(0,0,-0.05));
    camera.position.set(0.1,0,-0.25);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
};

// var hdrCubeMap = new HDRCubeTextureLoader()
// 					.setPath( './assets/exr' )
// 					.setDataType( THREE.UnsignedByteType )
// 					.load( "studio_small_05_1k.hdr", function () {
// 						var pmremGenerator = new PMREMGenerator( hdrCubeMap );
// 						pmremGenerator.update( renderer );
// 						var pmremCubeUVPacker = new PMREMCubeUVPacker( pmremGenerator.cubeLods );
// 						pmremCubeUVPacker.update( renderer );
// 						hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
// 						hdrCubeMap.magFilter = THREE.LinearFilter;
// 						hdrCubeMap.needsUpdate = true;
// 						pmremGenerator.dispose();
// 						pmremCubeUVPacker.dispose();
// 					} );

// importing cubemaps

var t_albedo = new THREE.TextureLoader().load( "./assets/models/teeth/Albedo(AO).jpg" );
var t_normal = new THREE.TextureLoader().load( "./assets/models/teeth/Normal.jpg" );
var t_roughness = new THREE.TextureLoader().load( "./assets/models/teeth/Roughness.jpg" );
var r = "./assets/maps/";
var urls = [ r + "px.png", r + "nx.png",
                        r + "py.png", r + "ny.png",
                        r + "pz.png", r + "nz.png" ];

var textureCube = new THREE.CubeTextureLoader().load( urls );
textureCube.format = THREE.RGBFormat;

// Matreials
var mat_master = new THREE.MeshStandardMaterial({
    // color: new THREE.Color(0x96de8e),
    map: t_albedo,
    metalness: 0,
    normalMap: t_normal,
    normalScale: new THREE.Vector2( 1, 1 ),
    roughnessMap: t_roughness,
    envMap: textureCube,
    envMapIntensity: 1,
    side: THREE.DoubleSide
});
var mat_caries = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xb5b45c),
    map: t_albedo,
    metalness: 0,
    normalMap: t_normal,
    normalScale: new THREE.Vector2( 8, 8 ),
    roughnessMap: t_roughness,
    side: THREE.DoubleSide
});
var mat_damaged = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4c200),
    metalness: 0,
    normalMap: t_normal,
    normalScale: new THREE.Vector2( 1, 1 ),
    roughnessMap: t_roughness,
    side: THREE.DoubleSide
});
var mat_missing = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xb5000f),
    metalness: 0,
    normalMap: t_normal,
    normalScale: new THREE.Vector2( 1, 1 ),
    roughnessMap: t_roughness,
    side: THREE.DoubleSide
});
var mat_golden = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffe380),
    metalness: 1,
    normalMap: t_normal,
    normalScale: new THREE.Vector2( 1, 1 ),
    roughnessMap: t_roughness,
    envMap: textureCube,
    envMapIntensity: 1,
    side: THREE.DoubleSide
});

var mat_highlight = new THREE.MeshStandardMaterial({
    color: new THREE.Color( 0xbffdff ),
    metalness: 0,
    roughness: 0.5,
    emissive: new THREE.Color( 0xffffff ),
    emissiveIntensity: 0.0,
    side: THREE.DoubleSide
});
var mat_selected = new THREE.MeshStandardMaterial({
    color: new THREE.Color( 0xbbff99 ),
    metalness: 0,
    roughness: 0.5,
    emissive: new THREE.Color( 0xffffff ),
    emissiveIntensity: 0.0,
    side: THREE.DoubleSide
});

// Loading External Mesh
var upper_teeth_model;
var lower_teeth_model;
var upper_gum_model;
var lower_gum_model;

function initModel(){
    var loader = new THREE.OBJLoader();
    loader.load(
        "./assets/models/teeth/bottom_teeth_offset.obj",
        function ( object ) {
            lower_teeth_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].requiredMaterial = mat_master;
                object.children[i].material = object.children[i].requiredMaterial;
                object.children[i].toothDossier = { status: "healthy" }
            }
            modelState.numMeshesLoaded ++;

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

    loader.load(
        "./assets/models/teeth/upper_teeth_offset.obj",
        function ( object ) {
            upper_teeth_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].requiredMaterial = mat_master;
                object.children[i].material = object.children[i].requiredMaterial;
                object.children[i].toothDossier = { status: "healthy" }
            }
            modelState.numMeshesLoaded ++;

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

    loader.load(
        "./assets/models/teeth/lower_gum_offset.obj",
        function ( object ) {
            lower_gum_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].material = mat_master;
            }
            modelState.numMeshesLoaded ++;

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

    loader.load(
        "./assets/models/teeth/upper_gum_offset.obj",
        function ( object ) {
            upper_gum_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].material = mat_master;
            }
            modelState.numMeshesLoaded ++;

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

}


function initLights(){
    // Lights
    var topLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.5);
    topLight.position.set(0, 10, 0);

    var leftLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.5);
    leftLight.position.set(-100, 0, 20);

    var rightLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.5);
    rightLight.position.set(100, 0, 100);

    var frontLight_r = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight_r.position.set(100, 0, -75).normalize();

    var frontLight_l = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight_l.position.set(-100, 0, -75).normalize();

    var ambLight = new THREE.AmbientLight( 0x404040, 1.75 );

    scene.add(topLight);
    scene.add(leftLight);
    scene.add(rightLight);
    scene.add(frontLight_r);
    scene.add(frontLight_l);
    scene.add(ambLight);

    var axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );
}

// initiating
initViews();
initModel();
initLights();

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target = new THREE.Vector3(0,0,-0.05);
const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );
}
animate();
