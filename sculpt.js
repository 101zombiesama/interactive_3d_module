var strength = -0.0005;
var distanceMultiplier = 100;
var brushRadius = distanceMultiplier*0.004;
var brushExponent = 1;
var projectionPlane = new THREE.Plane();

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

    object.geometry.computeFaceNormals();
    object.geometry.computeVertexNormals();
    object.geometry.verticesNeedUpdate = true;
    object.geometry.normalsNeedUpdate = true;
    object.geometry.elementsNeedUpdate = true;
}


function flatten(intersectsArr, projectionPlane) {
    var toothNum = selectedTooth.name.split('_')[1];
    var angle = Number(toothNum) < 30 ? sliderLower.value*1.57 : -sliderLower.value*1.57;
    var offset_y = Number(toothNum) < 30 ? -sliderLower.value / 60 : 0;
    
    projectionPlane.constant = 0;
    projectionPlane.normal = new THREE.Vector3(1,0,0);
    var vertices = intersectsArr[0].object.geometry.vertices;
    var faces = intersectsArr[0].object.geometry.faces;

    // creating correlation matrix
    var vertexCorrMatrix = [['vindices', 'vertices', 'vertexNormals', 'distancesFromIntersection'], [], [], [], []];


    for (let face of faces) {
        var faceVertices = [face.a, face.b, face.c];
        for (let i = 0; i < faceVertices.length; i++) {
            var vindex = faceVertices[i];
            var point = vertices[vindex];
            var intersection = intersectsArr[0].point;
            var pointClone = point.clone().applyAxisAngle(new THREE.Vector3(1,0,0), angle);
            pointClone.y += offset_y;
            if (vertexCorrMatrix[1].indexOf(vindex) == -1) {
                var distance = pointClone.distanceTo(intersection)*distanceMultiplier;
                if (distance < brushRadius) {
                    vertexCorrMatrix[1].push(vindex);
                    vertexCorrMatrix[2].push(point);
                    vertexCorrMatrix[3].push(face.vertexNormals[i]);
                    vertexCorrMatrix[4].push(distance);
                }
            }
        }
    }

    if (vertexCorrMatrix[1].length == 0) return;

    var averageNormal = calculateAvergaeNormal(vertexCorrMatrix);
    projectionPlane.normal = averageNormal;

    // get the farthest point in the correlationMatrix and placing the projectionPlane
    var farthestPoint = vertexCorrMatrix[2][vertexCorrMatrix[4].indexOf(Math.max(...vertexCorrMatrix[4]))];
    var farthestPointClone = farthestPoint.clone().applyAxisAngle(new THREE.Vector3(1,0,0), angle);
    farthestPointClone.y += offset_y;
    var pToPlane = projectionPlane.distanceToPoint(farthestPointClone);
    projectionPlane.constant = -pToPlane;

    
    // get the max distance from a vertex to plane
    var distancesFromPlane = [];
    for (let vid of vertexCorrMatrix[1]) {
        var point = vertices[vid];
        var pointClone = point.clone().applyAxisAngle(new THREE.Vector3(1,0,0), angle);
        pointClone.y += offset_y;
        var dist = projectionPlane.distanceToPoint(pointClone);
        if (dist < 0) dist = 0;
        distancesFromPlane.push(dist);
    }
    var maxDist = Math.max(...distancesFromPlane);

    // looping through all vertices in radius to push towards the projectionPlane;
    for (let [i ,vid] of vertexCorrMatrix[1].entries()) {
        var point = vertices[vid];
        var pointClone = point.clone().applyAxisAngle(new THREE.Vector3(1,0,0), angle);
        pointClone.y += offset_y;
        var distPointToPlane = projectionPlane.distanceToPoint(pointClone);
        if (distPointToPlane < 0) distPointToPlane = 0;
        // mapping to range 0 - 1
        var distScaled = maxDist > 0 ? scale(distPointToPlane, 0, maxDist, 0, 1) : 0;
        var strengthFactor = (Math.pow(distScaled, brushExponent));
        if (strengthFactor < 0) strengthFactor = 0;
        sculptPushVertex(selectedTooth, averageNormal, point, strength*strengthFactor);

    }

}

// function to map a number to different range
function scale(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
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

function calculateAvergaeNormal (vertexCorrMatrix) {
    var normal_x = 0;
    var normal_y = 0;
    var normal_z = 0;
    var count = 0;
    for (let i = 0; i < vertexCorrMatrix[1].length; i++) {
        var normal = vertexCorrMatrix[3][i];
        normal_x += normal.x;
        normal_y += normal.y;
        normal_z += normal.z;
        count ++;
    }
    var avg = { x: normal_x/count, y: normal_y/count, z: normal_z/count };
    var averageNormal = new THREE.Vector3(avg.x, avg.y, avg.z);
    return averageNormal;
}

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
            flatten(intersects, projectionPlane);
            
        }

    }
});