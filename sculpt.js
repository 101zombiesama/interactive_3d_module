var strength = -0.000125;

function sculptPush(camera, object, face, mag) {

    var camDirection = new THREE.Vector3();
    var faceNormal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);
    camera.getWorldDirection( camDirection );
    var angle = faceNormal.angleTo(camDirection);
    // only forward facing faces will be affected
    if (angle > Math.PI/2) {

        var vertices = object.geometry.vertices;

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

        // updating history of thre vertices of this face
        updateSculptHistory(object, face, face.a, mag);
        updateSculptHistory(object, face, face.b, mag);
        updateSculptHistory(object, face, face.c, mag);

        object.geometry.computeFaceNormals();
        object.geometry.computeVertexNormals();
        object.geometry.verticesNeedUpdate = true;
        object.geometry.normalNeedUpdate = true;
        

    }

}

function initiateSculpt(object) {
    object.hasScupltHistory = true;
    object.sculptHistory = {};
}

function resetSculpt(object) {
    if (object.hasScupltHistory) {
        var vertices = object.geometry.vertices;
        for (let vertexId in object.sculptHistory) {
            var directionHistory = object.sculptHistory[vertexId];
            for (var i = directionHistory.length - 1; i >= 0; i--) {
                vertices[vertexId].x += -strength*directionHistory[i].x;
                vertices[vertexId].y += -strength*directionHistory[i].y;
                vertices[vertexId].z += -strength*directionHistory[i].z;

                object.geometry.computeFaceNormals();
                object.geometry.computeVertexNormals();
                object.geometry.verticesNeedUpdate = true;
                object.geometry.normalNeedUpdate = true;

            }

        }

        object.hasScupltHistory = false;

    }
}

function updateSculptHistory(object, face, vertexId, offset) {
    if (object.hasScupltHistory) {
        if (object.sculptHistory[vertexId]) {
            object.sculptHistory[vertexId].push(face.normal);
        } else {
            object.sculptHistory[vertexId] = [face.normal];
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

var previuosFace;

window.addEventListener('mousemove', e => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (isMouseDown && sculptMode) {

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);

        if (intersects.length > 0 && intersects[0].object.name == selectedTooth.name) {

            // if (previuosFace && JSON.stringify(intersects[0].face) != JSON.stringify(previuosFace)) {
            //     previuosFace = intersects[0].face;
            //     // paint(intersects[0].object, intersects[0].face);
            //     sculptPush(camera, selectedTooth, intersects[0].face, -0.0001);
            //     console.log("if statement");

            // } else if (!previuosFace) {
            //     previuosFace = intersects[0].face;
            //     // paint(intersects[0].object, intersects[0].face);
            //     sculptPush(camera, selectedTooth, intersects[0].face, -0.0001);
            //     console.log("else statement");
                
            // }

            sculptPush(camera, selectedTooth, intersects[0].face, strength);

        }

    }
});