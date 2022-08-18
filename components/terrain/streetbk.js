

function generatePoints(interval,until,func){
    let linePoints = []
    if(interval > until){
        console.log("interval bigger than destination\n")
        return linePoints
    }

    for(let x = 0; x <= until + interval; x += interval ){ //<= Perche' altrimenti l'ultima linea non verrebbe disegnata
        let point = []
        point.push(x)
        point.push(0)
        point.push(func(x))
        linePoints.push(point)
    }

    return buildRectangles(linePoints,2)
    //let indices = indicesOrder(vertices)

}

function buildRectangles(points,wide){
    let vertices = []
    if(points == null || points.length  === 0){
        console.log("points are empty or null")
        return vertices
    }
    //Costruisce i punti soprastanti la sinusoide cosi' da poter avere un modo per creare
    // dei triangoli
    for(let i = 0; i < points.length; i++){
        vertices.push(points[i])
        //let second = [points[i][0],0,points[i][2] + wide]
        //let downV = glMatrix.vec3.clone([0,-1,0])
        //vertices.push(second)
    }
    let wideVectors = []
    for(let i = 0; i < vertices.length - 2;i++){
        let pointA = glMatrix.vec3.clone(vertices[i])
        let pointB = glMatrix.vec3.clone(vertices[i+1])
        let direction = glMatrix.vec3.normalize(glMatrix.vec3.create(),glMatrix.vec3.sub(glMatrix.vec3.create(),pointB,[0,0,0]))
        let downV = glMatrix.vec3.clone([0,-1,0])
        let wideVector = glMatrix.vec3.cross(glMatrix.vec3.create(),downV,direction)
        glMatrix.vec3.normalize(wideVector,wideVector)
        glMatrix.vec3.add(wideVector,pointA,wideVector)
        glMatrix.vec3.scale(wideVector,wideVector,wide)
        wideVectors.push(wideVector)
    }

    let finalV = []
    for(let i = 0; i < vertices.length;i++){
        finalV.push(vertices[i])
        if(i < wideVectors.length)
            finalV.push(wideVectors[i])
    }
    console.log(finalV)
    return flatVertices(finalV)
}

function flatVertices(vertices){
    let flat = []
    vertices.forEach((point) =>{
        point.forEach((coord) => {
            flat.push(coord)
        })
    })
    return flat
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

function indicesOrder(vertices) {
    let indices = []

    let NofPoints = (vertices.length / 3) /*numero vertici presenti*/
    let NoOfTriangles = NofPoints - 2 /*numero triangoli presenti*/
    for (let i = 0; i < NoOfTriangles / 2; i++) {
        /* /2 perche' devo pensare solo a come avanzare tra i due set base di indici e non come passare
        * da uno all'altro */
        indices.push(2 * i)
        indices.push(2 + 2 * i)
        indices.push(1 + 2 * i)

        indices.push(2 + 2 * i)
        indices.push(3 + 2 * i)
        indices.push(1 + 2 * i)
    }
    return indices
}

function buildStreet(){

        let vertices = generatePoints(0.1,100,(x) =>{

            return 3 * x + 2
        })
        let indices = indicesOrder(vertices)
        let normals = buildNormals(vertices)
        return new Element("Street",vertices,"LINE_STRIP",normals,indices)
}

function ourgowiueg(c){


    let gl = c.gl
    input = new Input()
    let simpleShader = c.spawnShader(street_vs,street_fs)
    let camera = new Camera([0,1,5])
    simpleShader.setEnableAttrFunc((shader) =>{
        let gl = shader.gl
        gl.enableVertexAttribArray(shader["aPos"])
        gl.enableVertexAttribArray(shader["aNormal"])
    })
    simpleShader.setStaticUniformsFunction((shader) =>{
        let gl = shader.gl
        let projMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create()
        ,Math.PI / 4,1300/720,1,1000)
        shader.setMatrixUniform("uProjMatrix",projMatrix,false)
    })
    simpleShader.setBindingFunction((shader,drawable) => {
        let gl = shader.gl
        gl.bindBuffer(gl.ARRAY_BUFFER,drawable.shape.vBuffer)
        gl.vertexAttribPointer(shader["aPos"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,drawable.shape.nBuffer)
        gl.vertexAttribPointer(shader["aNormal"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,drawable.shape.iBuffer)
    })

    simpleShader.setDrawFunction((shader,drawable) => {
        let gl = shader.gl
        camera.processInput(input)
        shader.setMatrixUniform("uM",drawable.frame,false)
        shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
        gl.drawElements(gl[drawable.shape.drawType],drawable.shape.indices.length,gl.UNSIGNED_SHORT,0)
    })
    return simpleShader

}



























