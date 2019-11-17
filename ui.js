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
