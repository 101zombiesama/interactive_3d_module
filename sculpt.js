var strength = -0.0005;
// 0.000125

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

function sculptPushVertex(object, direction, vertex, mag) {
    var vertices = object.geometry.vertices;

    // pushing vertices along face normals
    vertex.x += mag*direction.x;
    vertex.y += mag*direction.y;
    vertex.z += mag*direction.z;
    

    // updating history of thre vertices of this face
    // updateSculptHistory(object, face, face.a, mag);

    object.geometry.computeFaceNormals();
    object.geometry.computeVertexNormals();
    object.geometry.verticesNeedUpdate = true;
    object.geometry.normalsNeedUpdate = true;
    object.geometry.elementsNeedUpdate = true;
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

var distanceMultiplier = 100;
var brushRadius = distanceMultiplier*0.005;
var brushExponent = 3; 

var dragDist = 0; 
window.addEventListener('mousemove', e => {
    dragDist++;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (isMouseDown && sculptMode && dragDist > 3) {
        dragDist = 0;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);

        if (intersects.length > 0 && intersects[0].object.name == selectedTooth.name) {

            var ray = raycaster.ray;
            var vertices = intersects[0].object.geometry.vertices;
            // for (let point of vertices) {
            //     var dist = ray.distanceToPoint(point)*1000;
            //     if (dist < 100) {
            //         // affectedVerices.push(point);
            //         var strengthFactor = 1-Math.pow(dist, 5);
            //         if (strengthFactor < 0) strengthFactor = 0;
            //         sculptPushVertex(selectedTooth, intersects[0].face, point, strength*strengthFactor);
            //     }
            // }

            var faces = intersects[0].object.geometry.faces;
            var distDict = {};
            var normalDict = {};

            for (let face of faces) {
                var faceVertices = [face.a, face.b, face.c];
                for (let i = 0; i < faceVertices.length; i++) {
                    if (true) {
                        var distance = ray.distanceToPoint(vertices[faceVertices[i]])*distanceMultiplier;
                        if (distance < brushRadius) {
                            distDict[faceVertices[i]] = distance;
                            normalDict[faceVertices[i]] = face.vertexNormals[i];
                        }
                    }
                }
            }
            
            var normal_x = 0;
            var normal_y = 0;
            var normal_z = 0;
            var count = 0;
            for (let index in normalDict) {
                var normal = normalDict[index];
                normal_x += normal.x;
                normal_y += normal.y;
                normal_z += normal.z;
                count ++;
            }
            var averageNormal = { x: normal_x/count, y: normal_y/count, z: normal_z/count };

            for (let vertexIndex in distDict) {
                var point = vertices[vertexIndex];
                var vertexNormal = new THREE.Vector3(normalDict[vertexIndex].x, normalDict[vertexIndex].y, normalDict[vertexIndex].z);
                var faceNormal = new THREE.Vector3(intersects[0].face.normal.x, intersects[0].face.normal.y, intersects[0].face.normal.z);
                var dotProduct = vertexNormal.dot(faceNormal);
                if (dotProduct < 0) dotProduct = 0;
                var strengthFactor = (1-Math.pow(distDict[vertexIndex], brushExponent)) * dotProduct;
                if (strengthFactor < 0) strengthFactor = 0;
                sculptPushVertex(selectedTooth, intersects[0].face.normal, point, strength*strengthFactor);

            }

        }

    }
});