// functions event listeners

var isMouseDown = false;
var mousePosBeforeClick = {};
var mousePosAfterClick = {};
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

// set slider value to zero on window load
var slider = document.getElementById('animBlend');
slider.value = 0;


function resetCameraView() {
    controls.target.copy(upper_gum_model.position);
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
});

// handling mouth open animation with slider
var slider = document.getElementById('animBlend');
slider.addEventListener('input', event => {
    lower_teeth_model.rotation.x = -slider.value / 2;
    lower_teeth_model.position.y = -slider.value / 30;
    lower_gum_model.rotation.x = -slider.value / 2;
    lower_gum_model.position.y = -slider.value / 30;
});

var selectedTooth;

function updateSelectedTooth(tooth){
    for (let child of lower_teeth_model.children) {
        child.material = mat_master;
    }
    for (let child of upper_teeth_model.children) {
        child.material = mat_master;
    }
    tooth.material = mat_selected;
    selectedTooth = tooth;
}

function clearSelection(){
    for (let child of lower_teeth_model.children) {
        child.material = child.requiredMaterial
    }
    for (let child of upper_teeth_model.children) {
        child.material = child.requiredMaterial
    }
    selectedTooth = null;
}

function clearHighlight(){
    for (let child of lower_teeth_model.children) {
        child.material = child.requiredMaterial
    }
    for (let child of upper_teeth_model.children) {
        child.material = child.requiredMaterial
    }
}


window.onload = () => {

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

    // hover on no-teeth area to clear highlight
    window.addEventListener('mousemove', event => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);
        if (intersects.length <= 0) {
            // console.log("clearing highlight");
            clearHighlight();
            if(selectedTooth){
                selectedTooth.material = mat_selected;
            }
        }

    });

    // adding event listeners to all teeth
    for (let tooth of lower_teeth_model.children) {
        domEvents.addEventListener(tooth, 'click', event => {
            // if statement for excluding drag as a click
            if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)){
                updateSelectedTooth(tooth);
            }
            
        })

        domEvents.addEventListener(tooth, 'mouseover', event => {
            if (selectedTooth) {
                if (!isMouseDown &&  tooth.uuid != selectedTooth.uuid) {
                    clearHighlight();
                    tooth.material = mat_highlight;
                    selectedTooth.material = mat_selected;
                }
            } 
            else if(!isMouseDown) {
                clearHighlight();
                tooth.material = mat_highlight;
            }
        });

        // domEvents.addEventListener(tooth, 'mouseout', event => {
        //     if (selectedTooth) {
        //         // reverting back to required material when moouseout and this tooth is not selected tooth
        //         if (!isMouseDown &&  tooth.uuid != selectedTooth.uuid) {
        //             tooth.material = tooth.requiredMaterial;
        //         }
        //     } else {
        //         tooth.material = tooth.requiredMaterial;
        //     }
        // });
    }
    for (let tooth of upper_teeth_model.children) {

        domEvents.addEventListener(tooth, 'click', event => {
            // if statement for excluding drag as a click
            if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)){
                updateSelectedTooth(tooth);
            }
            
        })

        domEvents.addEventListener(tooth, 'mouseover', event => {
            if (selectedTooth) {
                if (!isMouseDown &&  tooth.uuid != selectedTooth.uuid) {
                    clearHighlight();
                    tooth.material = mat_highlight;
                    selectedTooth.material = mat_selected;
                }
            } else if(!isMouseDown) {
                clearHighlight();
                tooth.material = mat_highlight;
            }
        });

        // domEvents.addEventListener(tooth, 'mouseout', event => {
        //     if (selectedTooth) {
        //         if (!isMouseDown &&  tooth.uuid != selectedTooth.uuid) {
        //             tooth.material = tooth.requiredMaterial;
        //         }
        //     } else {
        //         tooth.material = tooth.requiredMaterial;
        //     }
        // });
    }
}