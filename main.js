// functions event listeners

var isMouseDown = false;
var isTouched = false;
var mousePosBeforeClick = {};
var mousePosAfterClick = {};
var touchStartPos = {};
var touchEndPos = {};
window.addEventListener('mousedown', event => {
    isMouseDown = true;
    mousePosBeforeClick.x = event.clientX;
    mousePosBeforeClick.y = event.clientY;
})
window.addEventListener('mouseup', event => {
    isMouseDown = false;
    mousePosAfterClick.x = event.clientX;
    mousePosAfterClick.y = event.clientY;
})
// window.addEventListener('touchend', event => {
//     console.log(event);
//     isTouched = true;
//     touchStartPos.x = event.touches[0].clientX;
//     touchStartPos.y = event.touches[0].clientY;
// })
window.addEventListener('touchmove', event => {
    console.log(event);
    // isTouched = false;
    // touchEndPos.x = event.touches[0].clientX;
    // touchEndPos.y = event.touches[0].clientY;
})

// set slider value to zero on window load
// var sliderUpper = document.getElementById('sliderUpperJaw');
// sliderUpper.value = 0;
var sliderLower = document.getElementById('sliderLowerJaw');
sliderLower.value = 0;


function resetCameraView() {
    controls.target = new THREE.Vector3(0,0,-0.05);
};

// reset orbit pivot
document.addEventListener('keydown', event => {
    if (event.key === 'f') {
        resetCameraView();
    }
});

// handle viewer resize when window resized
window.addEventListener('resize', event => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    composer.setSize(window.innerWidth, window.innerHeight);

});



function addModelInteraction() {

    // controls.enabled = false;

    window.addEventListener('click', event => {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects([sphere_model]);
        if (intersects.length > 0){
            var face = intersects[0].face;
            // console.log(intersects[0].object.geometry);
            var vertices = intersects[0].object.geometry.vertices;
            var mag = -0.05;

            vertices[face.a].x += mag*face.normal.x;
            vertices[face.a].y += mag*face.normal.y;
            vertices[face.a].z += mag*face.normal.z;

            intersects[0].object.geometry.computeFaceNormals();
            intersects[0].object.geometry.computeVertexNormals();
            intersects[0].object.geometry.verticesNeedUpdate = true;
            intersects[0].object.geometry.normalNeedUpdate = true;

        }

    })

}

modelState.registerListener(function(numMeshesLoaded) {
    if(numMeshesLoaded == 1){
        addModelInteraction();
        scene.add(sphere_model);

        hideDiv(document.getElementById("spinner"));
    }
  });