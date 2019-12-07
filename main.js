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

function toggleWireframe() {
    if (mat_master.wireframe) mat_master.wireframe = false;
    else mat_master.wireframe = true;
}

function saveToJson(object) {

}
var jsonArray = [];
var objToArray = {};
var tDown = false;

window.addEventListener('keypress', e => {
    if (e.key == 's') {
        addObjToArray();
        console.log(jsonArray);
    };
    if (e.key == 'd') {
        var data = { data: jsonArray };
        var json = JSON.stringify(data);
        var blob = new Blob([json], {type: "application/json"});

        var url  = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.download    = "backup.json";
        a.href        = url;
        a.textContent = "Download backup.json";

        document.getElementById('content').appendChild(a);
    }
});


function addObjToArray() {
    jsonArray.push(objToArray);
    objToArray = {};
}


function addModelInteraction() {

    var sliderLower = document.getElementById('sliderLowerJaw');
    sliderLower.addEventListener('input', event => {
        // opening both gums and teeth
        lower_teeth_model.rotation.x = -sliderLower.value*1.57;
        lower_gum_model.rotation.x = -sliderLower.value*1.57;
        upper_teeth_model.rotation.x = sliderLower.value*1.57;
        upper_gum_model.rotation.x = sliderLower.value*1.57;
    });

    // controls.enabled = false;

    window.addEventListener('click', event => {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)) {

            raycaster.setFromCamera( mouse, camera );
            var intersects = raycaster.intersectObjects([lower_gum_model, upper_gum_model, ...lower_teeth_model.children, ...upper_teeth_model.children]);
            if (intersects.length > 0){

                if (intersects[0].object.name.split('_')[0] == 't'){
                    console.log("tooth clicked");
                    objToArray.toothName = intersects[0].object.name;
                    objToArray.faces = [];
                }
                
                var face = intersects[0].face;
                var vertices = intersects[0].object.geometry.vertices;
                var mag = -0.002;

                var periodontitisMode = true;

                if (!periodontitisMode) {

                    vertices[face.a].x += mag*face.vertexNormals[0].x;
                    vertices[face.a].y += mag*face.vertexNormals[0].y;
                    vertices[face.a].z += mag*face.vertexNormals[0].z;

                } else {

                    vertices[face.a].x += mag*face.vertexNormals[0].x;
                    vertices[face.a].y += mag*face.vertexNormals[0].y*Math.cos(-sliderLower.value*1.57);
                    vertices[face.a].z += mag*face.vertexNormals[0].z*Math.sin(-sliderLower.value*1.57);

                    vertices[face.b].x += mag*face.vertexNormals[1].x;
                    vertices[face.b].y += mag*face.vertexNormals[1].y*Math.cos(-sliderLower.value*1.57);
                    vertices[face.b].z += mag*face.vertexNormals[1].z*Math.sin(-sliderLower.value*1.57);

                    vertices[face.c].x += mag*face.vertexNormals[2].x;
                    vertices[face.c].y += mag*face.vertexNormals[2].y*Math.cos(-sliderLower.value*1.57);
                    vertices[face.c].z += mag*face.vertexNormals[2].z*Math.sin(-sliderLower.value*1.57);

                    // adding the vertices to objTOarray object's vertices array
                    objToArray.faces.push(face);

                }

                intersects[0].object.geometry.computeFaceNormals();
                intersects[0].object.geometry.computeVertexNormals();
                intersects[0].object.geometry.verticesNeedUpdate = true;
                intersects[0].object.geometry.normalNeedUpdate = true;

            }

        }

    })

}

modelState.registerListener(function(numMeshesLoaded) {
    if(numMeshesLoaded == 4){
        addModelInteraction();
        scene.add(lower_gum_model);
        scene.add(lower_teeth_model);
        scene.add(upper_teeth_model);
        scene.add(upper_gum_model);

        hideDiv(document.getElementById("spinner"));
    }
  });