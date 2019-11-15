let scene, camera, renderer;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function initViews(){
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth/window.innerHeight,
        0.1,
        10000
    );
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.position.set(0.1,0,-0.2);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
};

// Matreials
var mat_gums = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load( "models/gum_COL.png" ),
    metalness: 0,
    normalMap: new THREE.TextureLoader().load( "models/gum_NRM.png" ),
    normalScale: new THREE.Vector2( 1, 1 ),
    roughness: 0.25,
    side: THREE.DoubleSide
});
var mat_botteeth = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load( "models/botteeth_COL.png" ),
    metalness: 0,
    roughness: 0.3,
    side: THREE.DoubleSide
});
var mat_topteeth = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load( "models/topteeth_COL.png" ),
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

// Loading External Mesh
var teethModel;

function initModel(){
    var loader = new THREE.OBJLoader();
    loader.load(
        "/models/teeth.obj",
        function ( object ) {
            teethModel = object;

            object.children[0].material = mat_gums; //gums lower
            object.children[1].material = mat_botteeth;  //teeth lower
            object.children[2].material = mat_gums;  //gums upper
            object.children[3].material = mat_topteeth;  //teeth upper
            scene.add( object );

        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
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

    var ambLight = new THREE.AmbientLight( 0x404040 );

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


// functions event listeners
function resetCameraView(){
    controls.target.copy(teethModel.position);
};

document.addEventListener('keydown', event => {
    if(event.key === 'f'){
        resetCameraView();
    }
});
window.addEventListener('resize', event => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})
// handling mouth open animation with slider
var slider = document.getElementById('animBlend');
slider.addEventListener('input', event => {
    teethModel.children[0].rotation.x = -slider.value/2;
    teethModel.children[0].position.y = -slider.value/30;
    teethModel.children[1].rotation.x = -slider.value/2;
    teethModel.children[1].position.y = -slider.value/30;
})
// onHover material change

window.addEventListener( 'mousemove', event => {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( teethModel.children );

    teethModel.children[0].material = mat_gums; //gums lower
    teethModel.children[1].material = mat_botteeth;  //teeth lower
    teethModel.children[2].material = mat_gums;  //gums upper
    teethModel.children[3].material = mat_topteeth;  //teeth upper

    if(intersects.length > 0){
        intersects[0].object.material = mat_highlight;
    }

});

function animate() {
    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );
}
animate();
