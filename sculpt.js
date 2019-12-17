function sculptPush(camera, object, face, mag) {

    var camDirection = new THREE.Vector3();
    var faceNormal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);
    camera.getWorldDirection( camDirection );
    var angle = faceNormal.angleTo(camDirection);
    console.log(angle);
    // only forward facing faces will be affected
    if (angle > Math.PI/2) {

        var vertices = object.geometry.vertices;

        // pushing along vertex normals
        // vertices[face.a].x += mag*face.vertexNormals[0].x;
        // vertices[face.a].y += mag*face.vertexNormals[0].y;
        // vertices[face.a].z += mag*face.vertexNormals[0].z;

        // vertices[face.b].x += mag*face.vertexNormals[1].x;
        // vertices[face.b].y += mag*face.vertexNormals[1].y;
        // vertices[face.b].z += mag*face.vertexNormals[1].z;

        // vertices[face.c].x += mag*face.vertexNormals[2].x;
        // vertices[face.c].y += mag*face.vertexNormals[2].y;
        // vertices[face.c].z += mag*face.vertexNormals[2].z;

        // pushing vertices along face normals
        vertices[face.a].x += mag*face.normal.x;
        vertices[face.a].y += mag*face.normal.y;
        vertices[face.a].z += mag*face.normal.z;

        vertices[face.b].x += mag*face.normal.x;
        vertices[face.b].y += mag*face.normal.y;
        vertices[face.b].z += mag*face.normal.z;

        vertices[face.c].x += mag*face.normal.x;
        vertices[face.c].y += mag*face.normal.y;
        vertices[face.c].z += mag*face.normal.z;

        object.geometry.computeFaceNormals();
        object.geometry.computeVertexNormals();
        object.geometry.verticesNeedUpdate = true;
        object.geometry.normalNeedUpdate = true;
        

        // updating history of thre vertices of this face
        updateSculptHistory(object, face, face.a, mag);
        updateSculptHistory(object, face, face.b, mag);
        updateSculptHistory(object, face, face.c, mag);

    }

}

function initiateSculpt(object) {
    object.hasScupltHistory = true;
    object.sculptHistory = { offset: {}, normal: {} };
}

function resetSculpt(object) {
    if (object.hasScupltHistory) {
        var vertices = object.geometry.vertices;
        console.log(vertices);
        console.log(object.sculptHistory)
        for (let vertexId in object.sculptHistory.offset) {
            vertices[vertexId].x += -object.sculptHistory.offset[vertexId]*object.sculptHistory.normal[vertexId].x;
            vertices[vertexId].y += -object.sculptHistory.offset[vertexId]*object.sculptHistory.normal[vertexId].y;
            vertices[vertexId].z += -object.sculptHistory.offset[vertexId]*object.sculptHistory.normal[vertexId].z;

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

            // if (face.a == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[0];
            // if (face.b == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[1];
            // if (face.c == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[2];
            object.sculptHistory.normal[vertexId] = face.normal;

        } else {
            object.sculptHistory.offset[vertexId] = offset;

            // if (face.a == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[0];
            // if (face.b == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[1];
            // if (face.c == vertexId) object.sculptHistory.normal[vertexId] = face.vertexNormals[2];
            object.sculptHistory.normal[vertexId] = face.normal;

        }
    } else {
        initiateSculpt(object)
    }
}

function paint(object, face) {
    var color = new THREE.Color( 0x3250a8 );

    face.vertexColors[0].copy(color);
    face.vertexColors[1].copy(color);
    face.vertexColors[2].copy(color);

    object.geometry.colorsNeedUpdate = true;
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
                previuosFace = intersects[0].face;
                paint(intersects[0].object, intersects[0].face);
                sculptPush(camera, selectedTooth, intersects[0].face, -0.0001);

            } else if (!previuosFace) {
                previuosFace = intersects[0].face;
                paint(intersects[0].object, intersects[0].face);
                sculptPush(camera, selectedTooth, intersects[0].face, -0.0001);
                console.log(intersects[0].uv);
                
            }

        }

    }
});