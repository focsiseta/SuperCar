

function generatePoints(interval,until,func){
    let linePoints = []
    if(interval > until){
        console.log("interval bigger than destination\n")
        return linePoints
    }

    for(let x = 0; x <= until + interval - 2; x += interval ){ //<= Perche' altrimenti l'ultima linea non verrebbe disegnata
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
        vertices.push(sinNormalVector(points[i]))
    }
    console.log("vertices",vertices)
    return flatVertices(vertices)
}

function sinNormalVector(sinPoint) {
    if (sinPoint === null) {
        return null
    }
    let x0 = sinPoint[0]
    let fx0 = sinPoint[2]
    let fraction = -1 / Math.cos(x0)
    //Sampling al "limite" per controllare se aumentare o diminuire la x
    let y = fx0 + fraction * (1000 - x0)
    let flag = 1
    if (y < 0) {
        flag = -1
    }
    let w = glMatrix.vec3.create()
    let counter = 1
    //while(glMatrix.vec3.length(w) <= 40){
        w = glMatrix.vec3.clone([counter*flag,0,fx0 + fraction * (counter * flag - x0)])
        w = glMatrix.vec3.normalize(w,w)
        //w = glMatrix.vec3.scale(w,w,100)
        //console.log(w,x0,fx0,glMatrix.vec3.length(w))
    //}
    glMatrix.vec3.add(w,sinPoint,w)
    //console.log(w)
    return w
    //return w
    /*
    console.log(x0,y)
    let wide = glMatrix.vec3.clone([x0, 0, y])
    let counter = 0
    y = fx0 + fraction * (counter - x0)
    let vecLength = glMatrix.vec3.length(glMatrix.vec3.sub(glMatrix.vec3.create(), wide, sinPoint))

    if (flag) {
        do {
            y = fx0 + fraction * (counter - x0)
            glMatrix.vec3.copy(wide, [x0, 0, y])
            vecLength = glMatrix.vec3.length(glMatrix.vec3.sub(glMatrix.vec3.create(), wide, sinPoint))
            counter++
        }while(vecLength <= 1)
    }
    console.log("Here")
    */
}

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

        let vertices = generatePoints(0.5,15,(x) =>{

            return Math.sin(x)
        })
        let indices = indicesOrder(vertices)
        console.log(indices)
        let normals = buildNormals(vertices)
        return new Element("Street",vertices,"LINE_STRIP",normals,indices)
}

function guhewoiuhweog(c){


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
        ,Math.PI / 4,1300/720,0.15,1000)
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



























