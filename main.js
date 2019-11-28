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

    // handling mouth open animation with slider
    var sliderLower = document.getElementById('sliderLowerJaw');
    sliderLower.addEventListener('input', event => {
        // opening both gums and teeth
        lower_teeth_model.rotation.x = -sliderLower.value*1.57;
        lower_gum_model.rotation.x = -sliderLower.value*1.57;
        upper_teeth_model.rotation.x = sliderLower.value*1.57;
        upper_teeth_model.position.y = -sliderLower.value / 60;
        upper_gum_model.rotation.x = sliderLower.value*1.57;
        upper_gum_model.position.y = -sliderLower.value / 60;
        // opening implant teeth
        lower_implant_teeth_model.rotation.x = -sliderLower.value*1.57;
        upper_implant_teeth_model.rotation.x = sliderLower.value*1.57;
        upper_implant_teeth_model.position.y = -sliderLower.value / 60;
    });

    // click in empty area to clear selection
    window.addEventListener('click', event => {

        var element = document.elementFromPoint(event.clientX, event.clientY);

        raycaster.setFromCamera(mouse, camera);
        var meshes = [];
        scene.traverse( (child) => {
            if (child.isMesh) {
                meshes.push(child)
            }
        } );
        var intersects = raycaster.intersectObjects(meshes);
        if (intersects.length <= 0 && JSON.stringify(mousePosBeforeClick) == JSON.stringify(mousePosAfterClick) && element.nodeName == 'CANVAS') {
            clearSelection();
        }

    });
    // selecting with touch
    // window.addEventListener('touchend', event => {
    //     touch.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     touch.y = -(event.clientY / window.innerHeight) * 2 + 1;
    //     console.log(event.clientX, event.clientY);
    //     var element = document.elementFromPoint(event.clientX, event.clientY);

    //     raycaster.setFromCamera(touch, camera);
    //     var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);
    //     if (intersects.length > 0 && JSON.stringify(touchStartPos) == JSON.stringify(touchEndPos) && element.nodeName == 'CANVAS') {
    //         updateSelectedTooth(intersects[0].object);
    //     }

    // });

    // hover highlighting with raycaster
    window.addEventListener('mousemove', event => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);
        if (intersects.length <= 0) {
            clearHighlight();
        } else {
            // when intersected with something
            if (selectedTooth) {
                if (!isMouseDown &&  intersects[0].object.name != selectedTooth.name) {
                    clearHighlight();
                    highlightHover(intersects[0].object);
                } else {
                    clearHighlight();
                }
            } 
            else if(!isMouseDown) {
                clearHighlight();
                highlightHover(intersects[0].object);
            }
        }

    });

    // adding event listeners to all teeth
    for (let tooth of lower_teeth_model.children) {
        // event for selecting tooth
        domEvents.addEventListener(tooth, 'click', event => {
            // if statement for excluding drag as a click
            if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)){
                updateSelectedTooth(tooth);
            }
            
        });

    }

    for (let tooth of upper_teeth_model.children) {
        // event for selecting tooth
        domEvents.addEventListener(tooth, 'click', event => {
            // if statement for excluding drag as a click
            if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)){
                updateSelectedTooth(tooth);
            }
            
        })

    }
}

modelState.registerListener(function(numMeshesLoaded) {
    if(numMeshesLoaded == 8){
        // addModelInteraction();
        scene.add(lower_gum_model);
        scene.add(lower_teeth_model);
        scene.add(upper_gum_model);
        scene.add(upper_teeth_model);
        scene.add(upper_implant_teeth_model);
        scene.add(lower_implant_teeth_model);

        hideDiv(document.getElementById("spinner"));
    }
  });