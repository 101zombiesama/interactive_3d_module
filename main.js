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
        var intersects = raycaster.intersectObjects(sphere_model.children);
        if (intersects.length > 0){
            var face = intersects[0].face;
            var obj = intersects[0].object;
            var geo = obj.geometry;
            // console.log(face);
            var p = geo.attributes.position.array;
            var n = geo.attributes.normal.array;
            // geo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( geo.attributes.position.count * 3 ), 3 ) );
            // var c = geo.attributes.color.array;
            // console.log(geo.attributes);
            var mag = 0.5;
            p[3*face.a] = mag*n[3*face.a];
            p[3*face.a + 1] = mag*n[3*face.a + 1];
            p[3*face.a + 2] = mag*n[3*face.a + 2];

            p[3*face.b] = mag*n[3*face.b];
            p[3*face.b + 1] = mag*n[3*face.b + 1];
            p[3*face.b + 2] = mag*n[3*face.b + 2];

            p[3*face.c] = mag*n[3*face.c];
            p[3*face.c + 1] = mag*n[3*face.c + 1];
            p[3*face.c + 2] = mag*n[3*face.c + 2];

            geo.computeFaceNormals();
            geo.attributes.position.needsUpdate = true;
            geo.attributes.normal.needsUpdate = true;
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