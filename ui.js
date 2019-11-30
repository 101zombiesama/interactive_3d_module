function showDiv(element){
    element.style["display"] = "block"
}
function hideDiv(element){
    element.style["display"] = "none"
}
function isVisible(element){
    if (element.style["display"] != "none") return true;
    else return false;
}
function validateForm(){
    if(inputSurfacePalatal.checked + 
        inputSurfaceMesial.checked +
        inputSurfaceBuccal.checked +
        inputSurfaceDistal.checked +
        inputSurfaceOcclusal.checked
        >= 1 
        ) {
            return true;
        }
    else return false;
}

// adding click listeners to the status buttons
var btn_healthy = document.getElementById("btn-healthy");
var btn_caries = document.getElementById("btn-caries");
var btn_damaged = document.getElementById("btn-damaged");
var btn_missing = document.getElementById("btn-missing");
var btn_golden = document.getElementById("btn-golden");
var btn_implant = document.getElementById("btn-implant");

var btn_fullViewMode = document.getElementById("btn-fullViewMode");
var btn_boneViewMode = document.getElementById("btn-boneViewMode");
var btn_teethViewMode = document.getElementById("btn-teethViewMode");

var statusPanel = document.getElementById("status-panel");
var descriptionPanel = document.getElementById("description-panel");
var inputDescription = document.getElementById("inputDescription");
var inputSurfaceMesial = document.getElementById("inputSurfaceMesial");
var inputSurfaceBuccal = document.getElementById("inputSurfaceBuccal");
var inputSurfaceDistal = document.getElementById("inputSurfaceDistal");
var inputSurfaceOcclusal = document.getElementById("inputSurfaceOcclusal");
var inputSurfacePalatal = document.getElementById("inputSurfacePalatal");
var btn_confirm = document.getElementById("btn-confirm");
var validationAlert = document.getElementById("validationAlert");

var btn_implantMode = document.getElementById("btn-implantMode");

var futureStatus;

btn_healthy.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "healthy");
    setBtnActiveState(btn_healthy);
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});
btn_caries.addEventListener('click', e => {
    // changeToothStatus(selectedTooth, "caries");
    futureStatus = "caries";
    setBtnActiveState(btn_caries);
    showDiv(descriptionPanel);
});
btn_damaged.addEventListener('click', e => {
    // changeToothStatus(selectedTooth, "damaged");
    futureStatus = "damaged";
    setBtnActiveState(btn_damaged);
    showDiv(descriptionPanel);
});
btn_missing.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "missing");
    setBtnActiveState(btn_missing);
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});
btn_golden.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "golden");
    setBtnActiveState(btn_golden);
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});
btn_implant.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "implant");
    setBtnActiveState(btn_implant);
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});

btn_confirm.addEventListener('click', e => {   
    var surfaces = [];
    var toothSurfaceChecks = document.getElementsByClassName("toothSurfaceCheck");
    for (let surfaceCheck of toothSurfaceChecks) {
        if(surfaceCheck.checked) surfaces.push(surfaceCheck.value);
    }
    if (validateForm()){
        changeToothStatus(selectedTooth, futureStatus);
        changeToothDetails(selectedTooth, {
            description: inputDescription.value,
            surfaces: surfaces
        });
        hideDiv(validationAlert);
        hideDiv(descriptionPanel);
        hideDiv(statusPanel);
        clearSelection();
    } else {
        showDiv(validationAlert);
    }
})

btn_fullViewMode.addEventListener('click', e => {
    switchViewMode('fullView');
});
btn_boneViewMode.addEventListener('click', e => {
    switchViewMode('boneView');
});
btn_teethViewMode.addEventListener('click', e => {
    switchViewMode('teethView');
});




