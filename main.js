// functions event listeners

var isMouseDown = false;
// var isTouched = false;
var isTouchDragged = false;
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
});

window.addEventListener('touchmove', event => {
    console.log("Touch move", event);
    isTouchDragged = true;
});

var sliderLower = document.getElementById('sliderLowerJaw');
sliderLower.value = 0;
var sliderUpperOpacity = document.getElementById('sliderUpperOpacity');
var sliderLowerOpacity = document.getElementById('sliderLowerOpacity');
sliderUpperOpacity.value = 0;
sliderLowerOpacity.value = 0;

function resetCameraView() {    
    var resetCameraTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z,
                             tarx: controls.target.x, tary: controls.target.y, tarz: controls.target.z })
                            .to({ x: 0.15, y: 0.02, z: -0.3,
                                tarx: 0, tary: 0, tarz: -0.05 }, 1300)
                            .onUpdate((object) => {
                                camera.position.set(object.x, object.y, object.z);
                                controls.target.set(object.tarx, object.tary, object.tarz)
                            })
                            .easing(TWEEN.Easing.Cubic.InOut)
                            .start();
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

    // enable the status buttons
    disableStatusBtns(false);

    // set active states of button when selected new tooth
    setBtnActiveState(document.getElementById(`btn-${selectedTooth.toothDossier.status}`));

    // set the form states i.e description and checkboxes according to the selected tooth data
    if (selectedTooth.toothDossier.detailsAvailable == true) {
        setFormData(selectedTooth.toothDossier.details);
    } else {
        setFormData({ description: "", surfaces: [] })
    }

    // setting parodontal data
    setParoData(selectedTooth.toothDossier.parodontitis);

    if (!isImplantMode) {
        // make status ui visible
        // var statusPanel = document.getElementById("status-panel");
        var statusBtn = document.getElementById(`btn-${selectedTooth.toothDossier.status}`);
        var classList = [...statusBtn.classList];
        if(classList.indexOf("btn-simple") != -1){
            statusBtn.classList.remove("btn-simple")
        }
        // if(!isVisible(statusPanel)){
        //     showDiv(statusPanel);
        // }
        if(selectedTooth.toothDossier.status == "caries" || selectedTooth.toothDossier.status == "damaged"){
            showDiv(document.getElementById("description-panel"));
        } else {
            hideDiv(document.getElementById("description-panel"));
        }
    }
}

function clearSelection(){
    outlinePassSelected.selectedObjects = [];
    selectedTooth = null;

    // disbale the status buttons
    disableStatusBtns(true);

    // hide status ui
    // var statusPanel = document.getElementById("status-panel");
    var descriptionPanel = document.getElementById("description-panel");
    // if(isVisible(statusPanel)){
    //     hideDiv(statusPanel);
    // }
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
    // hideDiv(validationAlert);
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
    // setting the tooth status details
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

function setParoData(data) {
    for (var i = 0; i < 6; i++ ) {
        var input = document.getElementById(`parodata-${i+1}`);
        input.value = data[i+1];
    }
}

function switchViewMode(mode) {
    switch (mode) {
        case 'fullView':
            lower_teeth_model.visible = true;
            upper_teeth_model.visible = true;
            lower_bone_model.visible = true;
            upper_bone_model.visible = true;
            lower_gum_model.visible = true;
            upper_gum_model.visible = true;
            break;

        case 'boneView':
            lower_teeth_model.visible = true;
            upper_teeth_model.visible = true;
            lower_bone_model.visible = true;
            upper_bone_model.visible = true;
            lower_gum_model.visible = false;
            upper_gum_model.visible = false;
            break;
        
        case 'teethView':
            lower_teeth_model.visible = true;
            upper_teeth_model.visible = true;
            lower_bone_model.visible = false;
            upper_bone_model.visible = false;
            lower_gum_model.visible = false;
            upper_gum_model.visible = false;
            break;
    
        default:
            break;
    }
}

var isolated = false;

function toggleIsolateSelection(tooth) {

    if (!isolated) {
        // compute centroid of tooth in WS
        tooth.geometry.computeBoundingBox();
        var centroid = new THREE.Vector3();
        centroid.addVectors( tooth.geometry.boundingBox.min, tooth.geometry.boundingBox.max );
        centroid.multiplyScalar( 0.5 );
        centroid.applyMatrix4( tooth.matrixWorld );

        for(let childTooth of lower_teeth_model.children) {
            if (childTooth.name != tooth.name) childTooth.visible = false;
            else childTooth.visible = true;
        }
        for(let childTooth of upper_teeth_model.children) {
            if (childTooth.name != tooth.name) childTooth.visible = false;
            else childTooth.visible = true;
        }
        lower_gum_model.visible = false;
        lower_bone_model.visible = false;
        upper_gum_model.visible = false;
        upper_bone_model.visible = false;

        // focus on tooth
        var resetCameraTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z,
            tarx: controls.target.x, tary: controls.target.y, tarz: controls.target.z })
           .to({ x:centroid.x, y: centroid.y, z: centroid.z - 0.2,
               tarx: centroid.x, tary: centroid.y, tarz: centroid.z }, 1300)
           .onUpdate((object) => {
               camera.position.set(object.x, object.y, object.z);
               controls.target.set(object.tarx, object.tary, object.tarz)
           })
           .easing(TWEEN.Easing.Cubic.InOut)
           .start();

        isolated = true;
    }
    else {

        for(let childTooth of lower_teeth_model.children) {
            childTooth.visible = true;
        }
        for(let childTooth of upper_teeth_model.children) {
            childTooth.visible = true;
        }
        lower_gum_model.visible = true;
        lower_bone_model.visible = true;
        upper_gum_model.visible = true;
        upper_bone_model.visible = true;

        // reset camera view
        resetCameraView();

        isolated = false;
    }
}

function toggleImplantMode() {
    if(isImplantMode) isImplantMode = false;
    else isImplantMode = true;

    var implantPanel = document.getElementById("implant-panel");
    if(isImplantMode) {
        showDiv(implantPanel);
    } else {
        hideDiv(implantPanel);
    }
    
}

function morphGum(tooth, face, value) {
    var object;
    if(Number(tooth.name.split('_')[1]) > 30){
        object = lower_gum_model;
    } else {
        object = upper_gum_model;
    }
    var vertices = object.geometry.vertices;
    var mag = -0.00075*value;
    vertices[face.a].x += mag*face.vertexNormals[0].x;
    vertices[face.a].y += mag*face.vertexNormals[0].y*Math.cos(-sliderLower.value*1.57);
    vertices[face.a].z += mag*face.vertexNormals[0].z*Math.sin(-sliderLower.value*1.57);

    vertices[face.b].x += mag*face.vertexNormals[1].x;
    vertices[face.b].y += mag*face.vertexNormals[1].y*Math.cos(-sliderLower.value*1.57);
    vertices[face.b].z += mag*face.vertexNormals[1].z*Math.sin(-sliderLower.value*1.57);

    vertices[face.c].x += mag*face.vertexNormals[2].x;
    vertices[face.c].y += mag*face.vertexNormals[2].y*Math.cos(-sliderLower.value*1.57);
    vertices[face.c].z += mag*face.vertexNormals[2].z*Math.sin(-sliderLower.value*1.57);

    object.geometry.computeFaceNormals();
    object.geometry.computeVertexNormals();
    object.geometry.verticesNeedUpdate = true;
    object.geometry.normalNeedUpdate = true;
}

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
        // opening bones
        lower_bone_model.rotation.x = -sliderLower.value*1.57;
        upper_bone_model.rotation.x = sliderLower.value*1.57;
        upper_bone_model.position.y = -sliderLower.value / 60;
    });

    // handling gum and bone opacity with slider for implant mode
    var sliderUpperOpacity = document.getElementById('sliderUpperOpacity');
    var sliderLowerOpacity = document.getElementById('sliderLowerOpacity');
    sliderUpperOpacity.addEventListener('input', event => {
        upper_gum_model.material.opacity = 1 - sliderUpperOpacity.value;
        upper_bone_model.children[0].material.opacity = 1 - sliderUpperOpacity.value;
    });
    sliderLowerOpacity.addEventListener('input', event => {
        lower_gum_model.material.opacity = 1 - sliderLowerOpacity.value;
        lower_bone_model.children[0].material.opacity = 1 - sliderLowerOpacity.value;
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
    window.addEventListener('touchend', event => {
        console.log(event);
        touch.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
        touch.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
        console.log(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        var element = event.target;

        raycaster.setFromCamera(touch, camera);
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);
        if (intersects.length > 0 && !isTouchDragged && element.nodeName == 'CANVAS') {
            updateSelectedTooth(intersects[0].object);
        } else if (intersects.length <= 0) {
            clearSelection();
        }

        isTouchDragged = false;

    });

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
    if(numMeshesLoaded == 10){
        addModelInteraction();
        scene.add(lower_gum_model);
        scene.add(lower_teeth_model);
        scene.add(upper_gum_model);
        scene.add(upper_teeth_model);
        scene.add(upper_implant_teeth_model);
        scene.add(lower_implant_teeth_model);
        scene.add(upper_bone_model);
        scene.add(lower_bone_model);

        hideDiv(document.getElementById("spinner"));
    }
  });