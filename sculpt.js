function sculptPush(object, face, mag) {

    var vertices = object.geometry.vertices;

    vertices[face.a].x += mag*face.vertexNormals[0].x;
    vertices[face.a].y += mag*face.vertexNormals[0].y;
    vertices[face.a].z += mag*face.vertexNormals[0].z;

    vertices[face.b].x += mag*face.vertexNormals[1].x;
    vertices[face.b].y += mag*face.vertexNormals[1].y;
    vertices[face.b].z += mag*face.vertexNormals[1].z;

    vertices[face.c].x += mag*face.vertexNormals[2].x;
    vertices[face.c].y += mag*face.vertexNormals[2].y;
    vertices[face.c].z += mag*face.vertexNormals[2].z;

    object.geometry.computeFaceNormals();
    object.geometry.computeVertexNormals();
    object.geometry.verticesNeedUpdate = true;
    object.geometry.normalNeedUpdate = true;

    // updating history of thre vertices of this face
    updateSculptHistory(object, face.a, mag);
    updateSculptHistory(object, face.b, mag);
    updateSculptHistory(object, face.c, mag);

}

function initiateSculpt(object) {
    object.hasScupltHistory = true;
    object.sculptHistory = { offset: {}, normal: {} };
}

function resetSculpt(object) {
    if (object.hasScupltHistory) {
        console.log(object);
        console.log(object.geometry);
        var vertices = object.geometry.vertices;
        for (let vertexId in object.sculptHistory.offset) {
            vertices[vertexId].x += -object.sculptHistory[vertexId]*object.sculptHistory.normal[vertexId].x;
            vertices[vertexId].y += -object.sculptHistory[vertexId]*object.sculptHistory.normal[vertexId].y;
            vertices[vertexId].z += -object.sculptHistory[vertexId]*object.sculptHistory.normal[vertexId].z;

            object.geometry.computeFaceNormals();
            object.geometry.computeVertexNormals();
            object.geometry.verticesNeedUpdate = true;
            object.geometry.normalNeedUpdate = true;
        }

        object.hasScupltHistory = false;

    }
}

function updateSculptHistory(object, face, vertexId, offset) {
    if (object.hasScupltHistory) {
        // if this vertex already has sculpting history then modify it otherwise create new history entry
        if (object.sculptHistory.offset[vertexId]) {

            object.sculptHistory.offset[vertexId] += offset;

            if (face.a == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[0];
            if (face.b == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[1];
            if (face.c == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[2];

        } else {
            object.sculptHistory.offset[vertexId] = offset;

            if (face.a == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[0];
            if (face.b == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[1];
            if (face.c == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[2];

        }
    } else {
        initiateSculpt(object)
    }
}

window.addEventListener('mousemove', e => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (isMouseDown && sculptMode) {

        var previuosFace;

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);

        if (intersects.length > 0 && intersects[0].object.name == selectedTooth.name) {

            if (previuosFace && JSON.stringify(intersects[0].face) != JSON.stringify(previuosFace)) {
                previuosFace = intersects[0].face
                sculptPush(selectedTooth, intersects[0].face, -0.0005);
            } else if (!previuosFace) {
                previuosFace = intersects[0].face
                sculptPush(selectedTooth, intersects[0].face, -0.0005);
            }

        }

    }
});