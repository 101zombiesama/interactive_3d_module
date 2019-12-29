var emptyColor = new THREE.Color();

function paint(intersectsArr, color) {

    var toothNum = selectedTooth.name.split('_')[1];
    var angle = Number(toothNum) < 30 ? sliderLower.value*1.57 : -sliderLower.value*1.57;
    var offset_y = Number(toothNum) < 30 ? -sliderLower.value / 60 : 0;

    var vertices = intersectsArr[0].object.geometry.vertices;
    var faces = intersectsArr[0].object.geometry.faces;
    var face = intersectsArr[0].face;
    var faceVertices = [face.a, face.b, face.c];

    // creating vertexCorrMatrix
    var vertexCorrMatrix = [['vindices', 'distanceFromIntersestion'], [], []];
    for (let [i, vertex] of vertices.entries()) {
        var vertexClone = vertex.clone().applyAxisAngle(x_directionVector, angle);
        vertexClone.y += offset_y;
        var dist = vertexClone.distanceTo(intersectsArr[0].point)*100;
        if (dist < 0.2) {
            vertexCorrMatrix[1].push(i);
            vertexCorrMatrix[2].push(dist);
        }
    }

    // getting distances of each face vertex from the intersection
    var distances = [];
    for (let vindex of faceVertices) {
        var distance = vertices[vindex].distanceTo(intersectsArr[0].point);
        distances.push(distance);
    }

    for (let vindex of vertexCorrMatrix[1]) {

        // getting all the faces for which this vertex is shared
        var affectedfacesCorrMatrix = [['face', 'faceVertexIndex'], [], []];
        for (let f of faces) {
            if (f.a == vindex) {
                affectedfacesCorrMatrix[1].push(f);
                affectedfacesCorrMatrix[2].push(0);
            }
            if (f.b == vindex) {
                affectedfacesCorrMatrix[1].push(f);
                affectedfacesCorrMatrix[2].push(1);
            }
            if (f.c == vindex) {
                affectedfacesCorrMatrix[1].push(f);
                affectedfacesCorrMatrix[2].push(2);
            }
        }
        
        // paintEraseMode
        if (paintErase) {
            for (let [i, affectedface] of affectedfacesCorrMatrix[1].entries()) {
                affectedface.vertexColors[affectedfacesCorrMatrix[2][i]].copy(emptyColor);
            }
        }
        else {
            for (let [i, affectedface] of affectedfacesCorrMatrix[1].entries()) {
                affectedface.vertexColors[affectedfacesCorrMatrix[2][i]].copy(color);
            }
        }
        

        intersectsArr[0].object.geometry.colorsNeedUpdate = true;

    }
    
}

var dragDist = 0;
window.addEventListener('mousemove', e => {
    dragDist++;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (isMouseDown && paintMode && dragDist > 3) {
        dragDist = 0;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects([...lower_teeth_model.children, ...upper_teeth_model.children]);
        if (intersects.length > 0 && intersects[0].object.name == selectedTooth.name) {
            paint(intersects, paintColor);
            
        }

    }
    
});