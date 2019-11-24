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

// adding click listeners to the status buttons
var btn_healthy = document.getElementById("btn-healthy");
var btn_caries = document.getElementById("btn-caries");
var btn_damaged = document.getElementById("btn-damaged");
var btn_missing = document.getElementById("btn-missing");
var btn_golden = document.getElementById("btn-golden");
var btn_view = document.getElementById("btn-view");
var descriptionPanel = document.getElementById("description-panel");

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
    changeToothStatus(selectedTooth, "caries");
    setBtnActiveState(btn_caries);
    showDiv(descriptionPanel);
});
btn_damaged.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "damaged");
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

btn_view.addEventListener('click', e => {
    toggleGumsVisibility();
})