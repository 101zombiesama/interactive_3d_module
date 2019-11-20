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
var btn_sick = document.getElementById("btn-sick");
var btn_damaged = document.getElementById("btn-damaged");
var btn_missing = document.getElementById("btn-missing");
var btn_view = document.getElementById("btn-view");

btn_healthy.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "healthy");
    setBtnActiveState(btn_healthy);
});
btn_sick.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "sick");
    setBtnActiveState(btn_sick);
});
btn_damaged.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "damaged");
    setBtnActiveState(btn_damaged);
});
btn_missing.addEventListener('click', e => {
    changeToothStatus(selectedTooth, "missing");
    setBtnActiveState(btn_missing);
});

btn_view.addEventListener('click', e => {
    toggleGumsVisibility();
})