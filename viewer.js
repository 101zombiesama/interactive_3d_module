(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

let scene, camera, renderer;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var touch = new THREE.Vector2();

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
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.position.set(0.1,0,-0.2);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
};

// Matreials
var mat_master = new THREE.MeshStandardMaterial({
    // color: new THREE.Color('hsl(240, 50%, 75%)'),
    map: new THREE.TextureLoader().load( "./assets/models/teeth/Albedo(AO).png" ),
    metalness: 0,
    normalMap: new THREE.TextureLoader().load( "./assets/models/teeth/Normal.png" ),
    normalScale: new THREE.Vector2( 1, 1 ),
    roughnessMap: new THREE.TextureLoader().load( "./assets/models/teeth/Roughness.png" ),
    side: THREE.DoubleSide
});
var mat_gums = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load( "./assets/models/gum_COL.png" ),
    metalness: 0,
    normalMap: new THREE.TextureLoader().load( "./assets/models/gum_NRM.png" ),
    normalScale: new THREE.Vector2( 1, 1 ),
    roughness: 0.25,
    side: THREE.DoubleSide
});
var mat_botteeth = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load( "./assets/models/botteeth_COL.png" ),
    metalness: 0,
    roughness: 0.3,
    side: THREE.DoubleSide
});
var mat_topteeth = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load( "./assets/models/topteeth_COL.png" ),
    metalness: 0,
    roughness: 0.3,
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
        "./assets/models/teeth/bottom_teeth.obj",
        function ( object ) {
            lower_teeth_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].requiredMaterial = mat_master;
                object.children[i].material = object.children[i].requiredMaterial;
            }
            scene.add( object );

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

    loader.load(
        "./assets/models/teeth/upper_teeth.obj",
        function ( object ) {
            upper_teeth_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].requiredMaterial = mat_master;
                object.children[i].material = object.children[i].requiredMaterial;
            }
            scene.add( object );

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

    loader.load(
        "./assets/models/teeth/lower_gum.obj",
        function ( object ) {
            lower_gum_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].material = mat_master;
            }
            scene.add( object );

        },
        function ( xhr ) {},
        function ( error ) {
            console.log(error.target);
            console.log( 'An error happened' );

        }
    );

    loader.load(
        "./assets/models/teeth/upper_gum.obj",
        function ( object ) {
            upper_gum_model = object;
            for (i=0; i<object.children.length; i++ ) {
                object.children[i].material = mat_master;
            }
            scene.add( object );

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
    var leftLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.5);
    leftLight.position.set(-100, 0, 20);

    var rightLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.5);
    rightLight.position.set(100, 0, 100);

    var frontLight_r = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight_r.position.set(100, 0, -75).normalize();

    var frontLight_l = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight_l.position.set(-100, 0, -75).normalize();

    var ambLight = new THREE.AmbientLight( 0x404040, 1 );

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
const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );
}
animate();
