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

// handling parodontal input
var paro_1 = document.getElementById("parodata-1");
paro_1.addEventListener('input', e => {
    var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[1]);
    selectedTooth.toothDossier.parodontitis[1] = e.target.value;
    var result = parodontalPoints.find(obj => {
        return obj.toothName == selectedTooth.name;
    });
    morphGum(selectedTooth, result.faces[0], value);
});

var paro_2 = document.getElementById("parodata-2");
paro_2.addEventListener('input', e => {
    var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[2]);
    selectedTooth.toothDossier.parodontitis[2] = e.target.value;
    var result = parodontalPoints.find(obj => {
        return obj.toothName == selectedTooth.name;
    });
    morphGum(selectedTooth, result.faces[1], value);
});

var paro_3 = document.getElementById("parodata-3");
paro_3.addEventListener('input', e => {
    var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[3]);
    selectedTooth.toothDossier.parodontitis[3] = e.target.value;
    var result = parodontalPoints.find(obj => {
        return obj.toothName == selectedTooth.name;
    });
    morphGum(selectedTooth, result.faces[2], value);
});

var paro_4 = document.getElementById("parodata-4");
paro_4.addEventListener('input', e => {
    var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[4]);
    selectedTooth.toothDossier.parodontitis[4] = e.target.value;
    var result = parodontalPoints.find(obj => {
        return obj.toothName == selectedTooth.name;
    });
    morphGum(selectedTooth, result.faces[3], value);
});

var paro_5 = document.getElementById("parodata-5");
paro_5.addEventListener('input', e => {
    var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[5]);
    selectedTooth.toothDossier.parodontitis[5] = e.target.value;
    var result = parodontalPoints.find(obj => {
        return obj.toothName == selectedTooth.name;
    });
    morphGum(selectedTooth, result.faces[4], value);
});

var paro_6 = document.getElementById("parodata-6");
paro_6.addEventListener('input', e => {
    var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[6]);
    selectedTooth.toothDossier.parodontitis[6] = e.target.value;
    var result = parodontalPoints.find(obj => {
        return obj.toothName == selectedTooth.name;
    });
    morphGum(selectedTooth, result.faces[5], value);
});





