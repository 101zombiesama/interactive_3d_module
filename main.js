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

var selectedTooth;

function updateSelectedTooth(tooth){
    clearSelection();
    highlightSelected(tooth);
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

function highlightHover(tooth){
    clearHighlight();
    outlinePassHighlight.selectedObjects = [tooth];
}
function highlightSelected(tooth){
    clearHighlight();
    outlinePassSelected.selectedObjects = [tooth];
}

function clearHighlight(){
    outlinePassHighlight.selectedObjects = [];
}

function changeToothStatus(tooth, status){
    // reset implant tooth if the previous status was implant and now changing
    if (tooth.toothDossier.status == 'implant') {
        resetImplantTooth(tooth);
    }
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
    if(tooth.toothDossier.status == 'implant'){
        implantTooth(tooth);
        tooth.toothDossier.detailsAvailable = false;
        tooth.toothDossier.details = {};
    }
    // Hiding validation error after successful change of status
    hideDiv(validationAlert);
}

function addScrew(tooth){
    // adds a screw at the position of tooth (tooth is NOT the implant tooth here)
    var toothNumber = tooth.name.split('_')[1];
    var implantTooth = scene.getObjectByName(`i_t_${toothNumber}`);

    implantTooth.geometry.computeBoundingSphere();
    var centroid = implantTooth.geometry.boundingSphere.center;

    var screwInst;
    if (Number(toothNumber) > 28) screwInst = screw_down_model.clone();
    else screwInst = screw_up_model.clone();
    screwInst.name = `s_${toothNumber}`;
    screwInst.position.x = centroid.x;
    screwInst.position.y = centroid.y;
    screwInst.position.z = centroid.z;

    tooth.add(screwInst);
}

function removeScrew(tooth){
    // removes screw from the tooth (tooth is NOT the implant tooth here)
    var toothNumber = tooth.name.split('_')[1];
    var requiredScrew = scene.getObjectByName(`s_${toothNumber}`);
    tooth.remove(requiredScrew);

}

function implantTooth(tooth){
    tooth.material = mat_missing;
    tooth.requiredMaterial = mat_missing;
    var toothNumber = tooth.name.split('_')[1];
    var requiredImplantTooth = scene.getObjectByName(`i_t_${toothNumber}`);
    requiredImplantTooth.visible = true;
    addScrew(tooth);
}
function resetImplantTooth(tooth){
    tooth.material = mat_master;
    tooth.requiredMaterial = mat_master;
    var toothNumber = tooth.name.split('_')[1];
    var requiredImplantTooth = scene.getObjectByName(`i_t_${toothNumber}`);
    requiredImplantTooth.visible = false;
    removeScrew(tooth);
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
    var sliderLower = document.getElementById('sliderLowerJaw');
    sliderLower.addEventListener('input', event => {
        // opening both gums and teeth
        lower_teeth_model.rotation.x = -sliderLower.value*1.57;
        lower_gum_model.rotation.x = -sliderLower.value*1.57;
        upper_teeth_model.rotation.x = sliderLower.value*1.57;
        upper_gum_model.rotation.x = sliderLower.value*1.57;
        // opening implant teeth
        lower_implant_teeth_model.rotation.x = -sliderLower.value*1.57;
        upper_implant_teeth_model.rotation.x = sliderLower.value*1.57;
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
        domEvents.addEventListener(tooth, 'touchend', event => {
            console.log('touched on tooth');
            // if statement for excluding drag as a click
            if (JSON.stringify(touchStartPos) == JSON.stringify(touchEndPos)){
                console.log('selected with touch');
                updateSelectedTooth(tooth);
            }
            
        })

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
        addModelInteraction();
        scene.add(lower_gum_model);
        scene.add(lower_teeth_model);
        scene.add(upper_gum_model);
        scene.add(upper_teeth_model);
        scene.add(upper_implant_teeth_model);
        scene.add(lower_implant_teeth_model);

        hideDiv(document.getElementById("spinner"));
    }
  });