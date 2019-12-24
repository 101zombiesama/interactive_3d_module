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

function disableMultipleButtons(buttonIds, bool){
    for (let btnId of buttonIds) {
        var btn = document.getElementById(btnId);
        btn.disabled = bool;
    }
}

function disableStatusBtns(bool){
    disableMultipleButtons([
        "btn-healthy",
        "btn-caries",
        "btn-damaged",
        "btn-missing",
        "btn-golden",
        "btn-implant",
    ], bool);

}

function disableModeCheckbox(mode, bool){
    var checkbox = document.getElementById(`${mode}Check`);
    checkbox.disabled = bool;
}

disableStatusBtns(true);
disableModeCheckbox('sculptMode', true);
disableModeCheckbox('paintMode', true);

// adding click listeners to the status buttons
var btn_healthy = document.getElementById("btn-healthy");
var btn_caries = document.getElementById("btn-caries");
var btn_damaged = document.getElementById("btn-damaged");
var btn_missing = document.getElementById("btn-missing");
var btn_golden = document.getElementById("btn-golden");
var btn_implant = document.getElementById("btn-implant");

var btn_open = document.getElementById("btn-open");
var btn_save = document.getElementById("btn-save");
var btn_fullViewMode = document.getElementById("btn-fullViewMode");
var btn_boneViewMode = document.getElementById("btn-boneViewMode");
var btn_teethViewMode = document.getElementById("btn-teethViewMode");
var btn_isolateSelect = document.getElementById("btn-isolateSelect");
var btn_resetCamera = document.getElementById("btn-resetCamera");

// var statusPanel = document.getElementById("status-panel");
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
    setBtnActiveState(btn_healthy, "status-btn");
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});
btn_caries.addEventListener('click', e => {
    // changeToothStatus(selectedTooth, "caries");
    futureStatus = "caries";
    setBtnActiveState(btn_caries, "status-btn");
    showDiv(descriptionPanel);
});
btn_damaged.addEventListener('click', e => {
    // changeToothStatus(selectedTooth, "damaged");
    futureStatus = "damaged";
    setBtnActiveState(btn_damaged, "status-btn");
    showDiv(descriptionPanel);
});
btn_missing.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "missing");
    setBtnActiveState(btn_missing, "status-btn");
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});
btn_golden.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "golden");
    setBtnActiveState(btn_golden, "status-btn");
    if(isVisible(descriptionPanel)){
        setTimeout(() => {
            hideDiv(descriptionPanel)
        }, 20);
    }
});
btn_implant.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "implant");
    setBtnActiveState(btn_implant, "status-btn");
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
        // hideDiv(descriptionPanel);
    } else {
        showDiv(validationAlert);
    }
})

// sculpt 

// btn_save.addEventListener('click', e => {
//     resetSculpt(selectedTooth);
// });

btn_fullViewMode.addEventListener('click', e => {
    switchViewMode('fullView');
});
btn_boneViewMode.addEventListener('click', e => {
    switchViewMode('boneView');
});
btn_teethViewMode.addEventListener('click', e => {
    switchViewMode('teethView');
});
btn_isolateSelect.addEventListener('click', e => {
    try {
        toggleIsolateSelection(selectedTooth);
    } catch (error) {
        
    }
})
btn_resetCamera.addEventListener('click', e => {
    resetCameraView();
});

// handling parodontal input
var paro_1 = document.getElementById("parodata-1");
paro_1.addEventListener('input', e => {
    if (selectedTooth && e.target.value <= 20 && e.target.value >= -5) {
        var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[1]);
        selectedTooth.toothDossier.parodontitis[1] = e.target.value;
        var result = parodontalPoints.find(obj => {
            return obj.toothName == selectedTooth.name;
        });
        morphGum(selectedTooth, result.faces[0], value);
    } else {
        e.target.value = selectedTooth.toothDossier.parodontitis[1];
    }
});

var paro_2 = document.getElementById("parodata-2");
paro_2.addEventListener('input', e => {
    if (selectedTooth && e.target.value <= 20 && e.target.value >= -5) {
        var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[2]);
        selectedTooth.toothDossier.parodontitis[2] = e.target.value;
        var result = parodontalPoints.find(obj => {
            return obj.toothName == selectedTooth.name;
        });
        morphGum(selectedTooth, result.faces[1], value);
    } else {
        e.target.value = selectedTooth.toothDossier.parodontitis[2];
    }
});

var paro_3 = document.getElementById("parodata-3");
paro_3.addEventListener('input', e => {
    if (selectedTooth && e.target.value <= 20 && e.target.value >= -5) {
        var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[3]);
        selectedTooth.toothDossier.parodontitis[3] = e.target.value;
        var result = parodontalPoints.find(obj => {
            return obj.toothName == selectedTooth.name;
        });
        morphGum(selectedTooth, result.faces[2], value);
    } else {
        e.target.value = selectedTooth.toothDossier.parodontitis[3];
    }
});

var paro_4 = document.getElementById("parodata-4");
paro_4.addEventListener('input', e => {
    if (selectedTooth && e.target.value <= 20 && e.target.value >= -5) {
        var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[4]);
        selectedTooth.toothDossier.parodontitis[4] = e.target.value;
        var result = parodontalPoints.find(obj => {
            return obj.toothName == selectedTooth.name;
        });
        morphGum(selectedTooth, result.faces[3], value);
    } else {
        e.target.value = selectedTooth.toothDossier.parodontitis[4];
    }
});

var paro_5 = document.getElementById("parodata-5");
paro_5.addEventListener('input', e => {
    if (selectedTooth && e.target.value <= 20 && e.target.value >= -5) {
        var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[5]);
        selectedTooth.toothDossier.parodontitis[5] = e.target.value;
        var result = parodontalPoints.find(obj => {
            return obj.toothName == selectedTooth.name;
        });
        morphGum(selectedTooth, result.faces[4], value);
    } else {
        e.target.value = selectedTooth.toothDossier.parodontitis[5];
    }
});

var paro_6 = document.getElementById("parodata-6");
paro_6.addEventListener('input', e => {
    if (selectedTooth && e.target.value <= 20 && e.target.value >= -5) {
        var value = Number(e.target.value) - Number(selectedTooth.toothDossier.parodontitis[6]);
        selectedTooth.toothDossier.parodontitis[6] = e.target.value;
        var result = parodontalPoints.find(obj => {
            return obj.toothName == selectedTooth.name;
        });
        morphGum(selectedTooth, result.faces[5], value);
    } else {
        e.target.value = selectedTooth.toothDossier.parodontitis[6];
    }
});

// handling changing the action modes and their submodes
document.getElementById('sculptModeCheck').addEventListener('change', e => {
    setMode('sculptMode', e.target.checked);
    // for disabling the sculotmode checkbox when sculpting
    if (e.target.checked) disableModeCheckbox('paintMode', true);
    else disableModeCheckbox('paintMode', false);
});

document.getElementById('btn-sculptPush').addEventListener('click', e => {
    setBtnActiveState(e.target, 'sculptMode-btn');
    setMode('sculptPush', true);
});

document.getElementById('btn-sculptPull').addEventListener('click', e => {
    setBtnActiveState(e.target, 'sculptMode-btn');
    setMode('sculptPush', false);
});

document.getElementById('paintModeCheck').addEventListener('change', e => {
    setMode('paintMode', e.target.checked);
    // for disabling the sculotmode checkbox when painting
    if (e.target.checked) disableModeCheckbox('sculptMode', true);
    else disableModeCheckbox('sculptMode', false);
});

document.getElementById('btn-paintPaint').addEventListener('click', e => {
    setBtnActiveState(e.target, 'paintMode-btn');
    setMode('paintErase', false);
});

document.getElementById('btn-paintErase').addEventListener('click', e => {
    setBtnActiveState(e.target, 'paintMode-btn');
    setMode('paintErase', true);
});

// setting the paint Color after choosing the color
document.getElementById("inputPaintColor").addEventListener('change', e => {
    // set color value
    paintColor.set(`#${e.target.value}`);
})




