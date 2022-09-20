function flatVertices(vertices){
    let flat = []
    vertices.forEach((point) =>{
        //console.log("Points",point)
        point.forEach((coord) => {
            flat.push(coord)
        })
    })
    return new Float32Array(flat)
}

function buildBuffer(leftPoints,rightPoints){

    let lPoints = divideIntoPoints3D(leftPoints)
    let rPoints = divideIntoPoints3D(rightPoints)
    /*merging points*/
    let tmp = []
    if(lPoints.length !== rPoints.length){
        console.log("The two buffers need to have the same lengths")
        return null
    }
    for(let i = 0; i < lPoints.length;i++){
        tmp.push(lPoints[i])
        tmp.push(rPoints[i])
    }

    return flatVertices(tmp)
}

function indicesOrd(vertices) {
    let indices = []

    let NofPoints = (vertices.length / 3) /*numero vertici presenti*/
    let NoOfTriangles = NofPoints - 2 /*numero triangoli presenti*/
    for (let i = 0; i < NoOfTriangles / 2; i++) {
        /* /2 perche' devo pensare solo a come avanzare tra i due set base di indici e non come passare
        * da uno all'altro */
        indices.push(1 + 2 * i)
        indices.push(2 + 2 * i)
        indices.push(2 * i)

        indices.push(1 + 2 * i)
        indices.push(3 + 2 * i)
        indices.push(2 + 2 * i)

    }
    return indices
}
function buildNormals(vertices) {
    let normal = []
    let NofPoints = (vertices.length / 3)
    for(let i = 0; i < NofPoints;i++){
        normal.push(0)
        normal.push(1)
        normal.push(0)
    }
    return normal
}
function buildCoords(vertices){
    let texCoord = []
    let NoOfPoints = (vertices.length / 3)
    for(let i = 0; i < NoOfPoints / 2;i++){
        texCoord.push(i)
        texCoord.push(0)
        texCoord.push(i)
        texCoord.push(1)

    }
    console.log(texCoord)
    return texCoord
}

function buildStreet(){
    let vertices = buildBuffer(leftCurb,rightCurb)
    let indices = indicesOrd(vertices)
    let normals = buildNormals(vertices)
    let texCoords = buildCoords(vertices)
    let element = new Element("Street",vertices,"TRIANGLES",normals,indices,texCoords)
    /*
    let scale = 1
    let nv = vertices.length / 3
    element.texCoords = new Float32Array((nv+1) * 2 * 2);
    var d = 0.0;
    var v = leftSideAt(0);
    var lp = [v[0],v[1],v[2]];

    let vertexOffset = 0;
    for (var i=0; i<nv+1; ++i) {
        lp = v;
        var v = leftSideAt(i%nv);
        d = d + Math.sqrt( ( lp[0]-v[0])*( lp[0]-v[0])+(lp[1]-v[1])*(lp[1]-v[1])+(lp[2]-v[2])*(lp[2]-v[2]));
        element.texCoords[vertexOffset] = 0.0;
        element.texCoords[vertexOffset + 1] = d*scale;
        vertexOffset += 2;
    }

    d = 0.0;
    v = leftSideAt(0);
    lp = [v[0],v[1],v[2]];
    for (var i=0; i<nv+1; ++i) {
        lp = v;
        var v = leftSideAt(i%nv);
        d = d + Math.sqrt( ( lp[0]-v[0])*( lp[0]-v[0])+(lp[1]-v[1])*(lp[1]-v[1])+(lp[2]-v[2])*(lp[2]-v[2]));
        element.texCoords[vertexOffset] = 1.0;
        element.texCoords[vertexOffset + 1] = d*scale;
        vertexOffset += 2;
    }
     */
    console.log(element.hasTexture)
    return element
}
function testShaderSetup(c){
    let gl = c.gl
    let input = new Input()
    let simpleShader = c.spawnShader(street_vs,street_fs,"StreetShader")
    let camera = new Camera([0,1,5])
    simpleShader.useProgram()
    simpleShader.setUniform1Int("uAlbedo",0)
    simpleShader.setEnableAttrFunc((shader) =>{
        let gl = shader.gl
        gl.enableVertexAttribArray(shader["aPos"])
       // gl.enableVertexAttribArray(shader["aNormal"])
        gl.enableVertexAttribArray(shader["aTex"])
    })
    simpleShader.setStaticUniformsFunction((shader) =>{
        let gl = shader.gl
        let projMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create()
            ,Math.PI / 4,1300/720,0.15,1000)
        shader.setMatrixUniform("uProjMatrix",projMatrix,false)
    })
    simpleShader.setBindingFunction((shader,drawable) => {
        let gl = shader.gl
        gl.bindBuffer(gl.ARRAY_BUFFER,drawable.shape.vBuffer)
        gl.vertexAttribPointer(shader["aPos"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,drawable.shape.texCoordBuffer)
        gl.vertexAttribPointer(shader["aTex"],2,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,drawable.shape.iBuffer)
    })

    simpleShader.setDrawFunction((shader,drawable) => {
        let gl = shader.gl
        camera.processInput(input)
        shader.setMatrixUniform("uM",drawable.frame)
        shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
        gl.drawElements(gl[drawable.shape.drawType],drawable.shape.indices.length,gl.UNSIGNED_SHORT,0)
    })
    return simpleShader

}
