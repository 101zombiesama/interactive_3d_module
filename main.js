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
var sliderUpper = document.getElementById('sliderUpperJaw');
sliderUpper.value = 0;
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
});

var selectedTooth;

function updateSelectedTooth(tooth){
    outlinePassSelected.selectedObjects = [tooth];
    // for (let child of lower_teeth_model.children) {
    //     child.material = mat_master;
    // }
    // for (let child of upper_teeth_model.children) {
    //     child.material = mat_master;
    // }
    clearHighlight();
    // tooth.material = mat_selected;
    selectedTooth = tooth;

    // set active states of button when selected new tooth
    setBtnActiveState(document.getElementById(`btn-${selectedTooth.toothDossier.status}`));

    // set the form states i.e description and checkboxes according to the selected tooth data
    if (selectedTooth.toothDossier.detailsAvailable == true) {
        setFormData(selectedTooth.toothDossier.details);
    } else {
        setFormData({ description: "", surfaces: [] })
    }

    // make status ui visible
    var statusPanel = document.getElementById("status-panel");
    var statusBtn = document.getElementById(`btn-${selectedTooth.toothDossier.status}`);
    var classList = [...statusBtn.classList];
    if(classList.indexOf("btn-simple") != -1){
        statusBtn.classList.remove("btn-simple")
    }
    if(!isVisible(statusPanel)){
        showDiv(statusPanel);
    }
    if(selectedTooth.toothDossier.status == "caries" || selectedTooth.toothDossier.status == "damaged"){
        showDiv(document.getElementById("description-panel"));
    } else {
        hideDiv(document.getElementById("description-panel"));
    }
}

function clearSelection(){
    outlinePassSelected.selectedObjects = [];
    // for (let child of lower_teeth_model.children) {
    //     child.material = child.requiredMaterial
    // }
    // for (let child of upper_teeth_model.children) {
    //     child.material = child.requiredMaterial
    // }
    selectedTooth = null;

    // hide status ui
    var statusPanel = document.getElementById("status-panel");
    var descriptionPanel = document.getElementById("description-panel");
    if(isVisible(statusPanel)){
        hideDiv(statusPanel);
    }
    if(isVisible(descriptionPanel)){
        hideDiv(descriptionPanel);
    }
    // hiding validation error on clear selection
    hideDiv(validationAlert);
}

function clearHighlight(){
    outlinePassHighlight.selectedObjects = [];
    // this function sets the material of each tooth to its required material
    // for (let child of lower_teeth_model.children) {
    //     child.material = child.requiredMaterial
    // }
    // for (let child of upper_teeth_model.children) {
    //     child.material = child.requiredMaterial
    // }
}

function changeToothStatus(tooth, status){
    tooth.toothDossier.status = status;
    // when tooth status changes, its material also changes
    if(tooth.toothDossier.status == 'healthy'){
        tooth.material = mat_master;
        tooth.requiredMaterial = mat_master;
        tooth.toothDossier.detailsAvailable = false;
        tooth.toothDossier.details = {};
    }
    if(tooth.toothDossier.status == 'caries'){
        tooth.material = mat_caries;
        tooth.requiredMaterial = mat_caries;
        tooth.toothDossier.detailsAvailable = true;
        tooth.toothDossier.details.description = "";
        tooth.toothDossier.details.surfaces = [];
    }
    if(tooth.toothDossier.status == 'damaged'){
        tooth.material = mat_damaged;
        tooth.requiredMaterial = mat_damaged;
        tooth.toothDossier.detailsAvailable = true;
        tooth.toothDossier.details.description = "";
        tooth.toothDossier.details.surfaces = [];
    }
    if(tooth.toothDossier.status == 'missing'){
        tooth.material = mat_missing;
        tooth.requiredMaterial = mat_missing;
        tooth.toothDossier.detailsAvailable = false;
        tooth.toothDossier.details = {};
    }
    if(tooth.toothDossier.status == 'golden'){
        tooth.material = mat_golden;
        tooth.requiredMaterial = mat_golden;
        tooth.toothDossier.detailsAvailable = false;
        tooth.toothDossier.details = {};
    }
    // Hiding validation error after successful change of status
    hideDiv(validationAlert);
}

function changeToothDetails(tooth, details) {
    tooth.toothDossier.details = details;
}

function setBtnActiveState(btn){
    // setting all other button to not active first
    var statusBtns = document.getElementsByClassName("status-btn");
    for (let button of statusBtns){
        var buttonClassList = [...button.classList];
        if(buttonClassList.indexOf("btn-simple") == -1){
            button.classList.add("btn-simple");
        }
    }
    // setting this button to active
    var btnClassList = [...btn.classList];
    if(btnClassList.indexOf("btn-simple") != -1){
        btn.classList.remove("btn-simple");
    }
}

// following function is used to set the form data from the tooth object
function setFormData(details){
    var inputDescription = document.getElementById("inputDescription");
    var toothSurfaceChecks = document.getElementsByClassName("toothSurfaceCheck");
    inputDescription.value = details.description;
    for (let surfaceCheck of toothSurfaceChecks) {
        if (details.surfaces.indexOf(surfaceCheck.value.toLowerCase()) != -1) {
            surfaceCheck.checked = true;
        } else {
            surfaceCheck.checked = false;
        }
    }
}

function toggleGumsVisibility(){
    if(lower_gum_model.visible == false) lower_gum_model.visible = true;
    else lower_gum_model.visible = false;
    if(upper_gum_model.visible == false) upper_gum_model.visible = true;
    else upper_gum_model.visible = false;
}

function addModelInteraction() {

    // handling mouth open animation with slider
    var sliderUpper = document.getElementById('sliderUpperJaw');
    var sliderLower = document.getElementById('sliderLowerJaw');
    sliderLower.addEventListener('input', event => {
        lower_teeth_model.rotation.x = -sliderLower.value*1.57;
        lower_gum_model.rotation.x = -sliderLower.value*1.57;
    });
    sliderUpper.addEventListener('input', event => {
        upper_teeth_model.rotation.x = sliderUpper.value*1.57;
        upper_gum_model.rotation.x = sliderUpper.value*1.57;
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
            // if(selectedTooth){
            //     selectedTooth.material = mat_selected;
            // }
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
                    // tooth.material = mat_highlight;
                    // selectedTooth.material = mat_selected;
                    outlinePassHighlight.selectedObjects = [tooth]
                } else {
                    clearHighlight();
                }
            } 
            else if(!isMouseDown) {
                clearHighlight();
                // tooth.material = mat_highlight;
                outlinePassHighlight.selectedObjects = [tooth]
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
                    // tooth.material = mat_highlight;
                    // selectedTooth.material = mat_selected;
                    outlinePassHighlight.selectedObjects = [tooth]
                } else {
                    clearHighlight();
                }

            } else if(!isMouseDown) {
                clearHighlight();
                // tooth.material = mat_highlight;
                outlinePassHighlight.selectedObjects = [tooth]
            }
        });

    }
}

modelState.registerListener(function(numMeshesLoaded) {
    if(numMeshesLoaded == 4){
        addModelInteraction();
        scene.add(lower_gum_model);
        scene.add(lower_teeth_model);
        scene.add(upper_gum_model);
        scene.add(upper_teeth_model);
        hideDiv(document.getElementById("spinner"));
    }
  });