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
// window.addEventListener('touchstart', event => {
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

    // make status ui visible
    var statusPanel = document.getElementById("status-panel");
    var statusBtn = document.getElementById(`btn-${selectedTooth.status}`);
    var classList = [...statusBtn.classList];
    if(classList.indexOf("btn-simple") != -1){
        statusBtn.classList.remove("btn-simple")
    }
    if(!isVisible(statusPanel)){
        showDiv(statusPanel);
    }
}

function clearSelection(){
    for (let child of lower_teeth_model.children) {
        child.material = child.requiredMaterial
    }
    for (let child of upper_teeth_model.children) {
        child.material = child.requiredMaterial
    }
    selectedTooth = null;

    // hide status ui
    var statusPanel = document.getElementById("status-panel");
    if(isVisible(statusPanel)){
        hideDiv(statusPanel);
    }
}

function clearHighlight(){
    for (let child of lower_teeth_model.children) {
        child.material = child.requiredMaterial
    }
    for (let child of upper_teeth_model.children) {
        child.material = child.requiredMaterial
    }
}


function addModelInteraction() {

    // handling mouth open animation with slider
    var slider = document.getElementById('animBlend');
    slider.addEventListener('input', event => {
        lower_teeth_model.rotation.x = -slider.value / 2;
        lower_teeth_model.position.y = -slider.value / 30;
        lower_gum_model.rotation.x = -slider.value / 2;
        lower_gum_model.position.y = -slider.value / 30;
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
        // event for selecting tooth
        domEvents.addEventListener(tooth, 'click', event => {
            // if statement for excluding drag as a click
            if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)){
                updateSelectedTooth(tooth);
            }
            
        });
        domEvents.addEventListener(tooth, 'touchend', event => {
            console.log('touched on tooth');
            // if statement for excluding drag as a click
            if (JSON.stringify(touchStartPos) == JSON.stringify(touchEndPos)){
                console.log('selected with touch');
                updateSelectedTooth(tooth);
            }
            
        })

        // event for highlighting tooth
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

    }

    for (let tooth of upper_teeth_model.children) {
        // event for selecting tooth
        domEvents.addEventListener(tooth, 'click', event => {
            // if statement for excluding drag as a click
            if (JSON.stringify(mousePosAfterClick) == JSON.stringify(mousePosBeforeClick)){
                updateSelectedTooth(tooth);
            }
            
        })

        // event for highlighting tooth
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

    }
}

modelState.registerListener(function(numMeshesLoaded) {
    if(numMeshesLoaded == 4){
        addModelInteraction();
    }
  });