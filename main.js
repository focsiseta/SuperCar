
function loadElements(c){
    let gl = c.gl
    quad = new Element("quad",[
            -1, -1, 0,
            -1, 1, 0,
            1, -1, 0,
            1, 1, 0],
        "TRIANGLES",[0,1,0,
            0,1,0,
            0,1,0
            ,0,1,0],
        [2,3,0,0,3,1],
        [0, 0, 0, 1, 1, 0, 1, 1])
    //Rotating vertices beforehand because camera controls don't work properly if rotated and translated of front * speed
    let rotation = glMatrix.quat.setAxisAngle([],[1,0,0],gradToRad(90))
    let matrix = glMatrix.mat3.fromQuat([],rotation)
    elementToChase = new Element("car",rotatePoints(matrix,capVert),"TRIANGLES",rotatePoints(matrix,capNormals),capIndices,capTexCoords)
    wheelToChase = new Element("wheel",wheelVertices,"TRIANGLES",wheelNormal,wheelIndices,null)
    wheelToChase.color = [1.0,0.0,1.0,1.0]
    sBox = new Element("cubeMap",skyboxVertices)
    terrain = pGroundGeneration(20)
    street = buildStreet()
    c.loadElement(wheelToChase)
    c.loadElement(quad)
    c.loadElement(elementToChase)
    c.loadElement(sBox)
    c.loadElement(terrain)
    c.loadElement(street)

}
function loadTextures(c){
    let gl = c.gl
    bricks = c.loadTexture("texture/bricks.jpg")
    bricksNormal = c.loadTexture("texture/heightmaps/brickheight.jpg")
    let nissi = [
        "texture/cubemaps/nissi/posx.jpg",
        "texture/cubemaps/nissi/negx.jpg",
        "texture/cubemaps/nissi/posy.jpg",
        "texture/cubemaps/nissi/negy.jpg",
        "texture/cubemaps/nissi/posz.jpg",
        "texture/cubemaps/nissi/negz.jpg"
    ]
    textureSkybox = new CubeMaps(nissi,gl)
    streetTexture = c.loadTexture("texture/street.png")
    grass = c.loadTexture("texture/toybox/wood.png")
    grassNormal = c.loadTexture("texture/scifiground/HexagonTile_NRM.png")
    step = c.loadTexture("texture/heightmaps/step.jpg")
    asphalt = c.loadTexture("texture/heightmaps/asphalt.jpg")
    fanalino = c.loadTexture("texture/fanalino.png")

}
function CarNode(drawableToChase,weelElement,shaderT){
    d1 = new Drawable(weelElement)
    d1.translate([-0.5,-0.20,0.5])
    d1.scale([0.003,0.003,0.003])

     d2 = new Drawable(weelElement)
    d2.wRotateY(gradToRad(-180))
    d2.translate([-0.5,-0.20,-0.5])
    d2.scale([0.003,0.003,0.003])

    d3 = new Drawable(weelElement)
    d3.translate([0.5,-0.20,-0.5])
    d3.scale([0.003,0.003,0.003])

    d4 = new Drawable(weelElement)
    d4.translate([0.5,-0.20,0.5])
    d4.scale([0.003,0.003,0.003])

    let root = new Node(drawableToChase,shaderT)
    root.DrawableAsLeaf(d1)
    root.DrawableAsLeaf(d2)
    root.DrawableAsLeaf(d3)
    root.DrawableAsLeaf(d4)

    return root

}
//Car node, input handler, speed multiplier
acc = 0.0
wheelRotation = 0.0
function moveCar(cNode,handler,step) {
    let car = cNode.drawable
    let wheels = []
    if (cNode.leafs.length !== 0) {
        cNode.leafs.forEach((dWheelNode) => {
            wheels.push(dWheelNode.drawable)
        })
    }
    if (handler.getKeyStatus("w") || handler.getKeyStatus("W")) {
        acc += step
        if(acc > 1)
            acc = 1
    } else {
        acc -= step
        if (acc < 0.0)
            acc = 0.0
    }
    if (handler.getKeyStatus("s") || handler.getKeyStatus("S")) {
        acc -= step
        if(acc <= -1){
            acc = -1
        }
    }
    let matrix = car.getFrame()
    let front = glMatrix.vec3.scale([], [matrix[8], matrix[9], matrix[10]], 0.5)
    glMatrix.vec3.scale(front, front, acc)
    wheels.forEach((wheel) =>{
        wheel.wRotateX(gradToRad(acc * 3))
    })
    car.translate(front)
    car.update()
    if (handler.getKeyStatus("d")) {
        car.wRotateY(gradToRad(1.5 * acc))
        wheels.forEach((wheel) =>{
            wheelRotation += 0.5
            if(wheelRotation >= 75){
                wheelRotation = 75
            }else{
                wheel.lRotateBeta(gradToRad(0.5))
            }
            wheel.update()
        })
        //car.update()
    }
    if (handler.getKeyStatus("a")) {
        car.wRotateY(gradToRad(-1.5 * acc))
        wheels.forEach((wheel) =>{
            wheelRotation -= 0.5
            if(wheelRotation <= -75){
                wheelRotation = -75
            }else{
                wheel.lRotateBeta(gradToRad(-0.5))
            }
            wheel.update()
        })
    }

}
function main(){
    c = new Context()
    let gl = c.gl
    gl.enable(gl.DEPTH_TEST)
    //gl.enable(gl.CULL_FACE)
    loadElements(c)
    loadTextures(c)


    drawableToChase = new Drawable(elementToChase,new Material(bricks,bricksNormal))
    drawableToChase.scale([2,2,2])
    drawableToChase.translate([0,0.6,0])
    drawableToChase.update()
    dStreet = new Drawable(street,new Material(streetTexture,asphalt))
    dStreet.scale([2,1,2])
    dStreet.update()
    dGrid = new Drawable(terrain,new Material(grass,grassNormal))
    dQuad = new Drawable(quad)

    //To avoid z-fighting
    dGrid.translate([0,-0.02,0])

    dGrid.scale([1.8,1,1.9])
    dGrid.update()
    box = new Drawable(sBox)

    camera = new ChaseCamera([0,5,-5],[0,0,0],drawableToChase)
    //camera = new QuadCamera([0,1,5],0.3)
    streetShader = lightpassSetup(c)
    fanalinoCameraSX = fanaliniMatrix([0.3,0.0,0.3],drawableToChase,[0.5,0,5])
    fanalinoCameraDX = fanaliniMatrix([-0.3,0.0,1],drawableToChase,[-0.4,-1,10])
    fanalinoShader = fanaliniShaderSetup(c)
    fanalinoShader.setStaticUniforms((shader) =>{
        shader.setMatrixUniform("uProjMatrix",streetShader.perspectiveMatrix)
    })
    fanalinoShader.setDrawFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        shader.setMatrixUniform("uM",drawable.getFrame())
        shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
        gl.drawElements(gl[shape.drawType],shape.indices.length,gl.UNSIGNED_SHORT,0)
    })
    depthShader = shadowShaderSetup(dir.direction,1,230,230,c)
    depthFramebuffer = Framebuffers.shadowMap(gl,5000,5000)
    fanalinoSXFB = Framebuffers.shadowMap(gl,2048,2048)
    fanalinoDXFB = Framebuffers.shadowMap(gl,2048,2048)
    streetShader.useProgram()
    streetShader.setMatrixUniform("uLightMatrix",depthShader.lightCoordsMatrix)
    streetShader.setMatrixUniform("cameraProj",fanalinoCameraSX.perspectiveMatrix)
    streetShader.setMatrixUniform("fanalinoSX",fanalinoCameraSX.getViewMatrix())
    streetShader.setMatrixUniform("fanalinoDX",fanalinoCameraDX.getViewMatrix())
    streetShader.setDrawFunction((shader,drawable)=>{
        let gl = shader.gl
        let shape = drawable.shape
        if(shape.hasTexture){
            shader.setUniform1Float("hasTexture",1)
        }else{
            shader.setUniform1Float("hasTexture", 0)
            shader.setVector4Uniform("uColor",shape.color)
        }
        let viewMatrix = camera.getViewMatrix()
        //shader.setMatrixUniform("uViewMatrix",depthShader.lightCoordsMatrix)
        shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
        //shader.setMatrixUniform("uViewMatrix",fanalinoCameraSX.getViewMatrix())
        shader.setMatrixUniform("uM",drawable.getFrame())
        shader.setVectorUniform("uView",camera.getPosition())
        gl.drawElements(gl[shape.drawType],shape.indices.length,gl.UNSIGNED_SHORT,0)
    })
    shaderSkybox = skyboxShader(c)
    shaderSkybox.setDrawFunction((shader,drawable) => {
        let gl = shader.gl
        let shape = drawable.shape
        //camera.processInput(handler)2000
        //camera.moveDrawable(handler,1)
        let viewMatrix = glMatrix.mat3.fromMat4(glMatrix.mat3.create(),fanalinoCameraSX.getViewMatrix())
        shader.setMatrixUniform("uViewMatrix",[viewMatrix[0],viewMatrix[1],viewMatrix[2],0,
            viewMatrix[3],viewMatrix[4],viewMatrix[5],0,
            viewMatrix[6],viewMatrix[7],viewMatrix[8],0,
            0,0,0,1])
        gl.drawArrays(gl[shape.drawType],shape.vBuffer,shape.vertices.length / 3)

    })
    carNode = CarNode(drawableToChase,wheelToChase,streetShader)
    //
    DOOOH = new Drawable(quad)
    DOOOH.scale([3,3,3])
    DOOOH.update()
    //DEBUG
    debugShader = flatQuadST(c)
    scroon = new Drawable(quad)
    simpleSH = simpleSetup(c)
    simpleSH.useProgram()
    simpleSH.setMatrixUniform("uProj",fanalinoCameraSX.perspectiveMatrix)
    simpleSH.setDrawFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        shader.setMatrixUniform("uM",drawable.getFrame())
        shader.setMatrixUniform("uView",fanalinoCameraSX.getViewMatrix())
        gl.drawElements(gl[shape.drawType],shape.indices.length,gl.UNSIGNED_SHORT,0)

    })
    drawloop()

}

function depthTextureDebug(){
    let gl = c.gl
    gl.depthMask(false)
    gl.viewport(0,0,1300,720)
    //camera.processInput(handler)
    moveCar(carNode,handler,0.01)
    shaderSkybox.useProgram()
    gl.activeTexture(gl.TEXTURE0)
    textureSkybox.bindCubemap(shaderSkybox)
    shaderSkybox.draw(box)
    gl.depthMask(true)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.CULL_FACE)
    gl.clearColor(0,0,0,0.8)
    simpleSH.useProgram()
    //camera.processInput(handler)
    camera.processInput(handler)
    //console.log(fanalinoCameraSX.getViewMatrix())
    //fanalinoShader.draw(scroon)
    simpleSH.draw(dGrid)
    simpleSH.draw(DOOOH)




}

function testDepth(){


    let gl = c.gl
    gl.clear(gl.DEPTH_BUFFER_BIT)
    camera.processInput(handler)
    depthFramebuffer.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    depthShader.useProgram()
    depthShader.draw(dGrid)
    depthShader.draw(drawableToChase)
    depthShader.bindToDefaultFramebuffer()
    gl.clearColor(0,0,0,0.8)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    simpleS.useProgram()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D,depthFramebuffer.textureBuffer)
    simpleS.draw(drawableToChase)
    simpleS.draw(dGrid)

    window.requestAnimationFrame(testDepth)
    depthFramebuffer.bindFramebuffer()



}


function drawloop(){
    let gl = c.gl
    gl.clearColor(0,0,0,0.8)
    //camera.processInput(handler)
    //camera.moveDrawable(handler,1)
    moveCar(carNode,handler,0.01)
    carNode.calc()

    //shadow pass

    gl.viewport(0,0,5000,5000)
    depthFramebuffer.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    depthShader.useProgram()
    depthShader.draw(dGrid)
    gl.cullFace(gl.BACK)
    depthShader.draw(drawableToChase)
    gl.cullFace(gl.BACK)
    depthShader.draw(d1)
    depthShader.draw(d2)
    depthShader.draw(d3)
    depthShader.draw(d4)
    //Fanalino depth pass
    fanalinoSXFB.bindFramebuffer()
    gl.disable(gl.CULL_FACE)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.viewport(0,0,2048,2048)
    simpleSH.useProgram()
    simpleSH.setMatrixUniform("uViewMatrix",fanalinoCameraSX.getViewMatrix())
    simpleSH.draw(DOOOH)
    simpleSH.draw(dGrid)
    fanalinoDXFB.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    simpleSH.setMatrixUniform("uViewMatrix",fanalinoCameraDX.getViewMatrix())
    simpleSH.draw(DOOOH)
    simpleSH.draw(dGrid)
    simpleSH.bindToDefaultFramebuffer()
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.depthMask(false)
    gl.viewport(0,0,1300,720)
    shaderSkybox.useProgram()
    gl.activeTexture(gl.TEXTURE0)
    textureSkybox.bindCubemap(shaderSkybox)
    shaderSkybox.draw(box)
    gl.depthMask(true)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    streetShader.useProgram()
    streetShader.setMatrixUniform("fanalinoSX",fanalinoCameraSX.getViewMatrix())
    streetShader.setMatrixUniform("fanalinoDX",fanalinoCameraDX.getViewMatrix())
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D,depthFramebuffer.textureBuffer)
    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D,fanalino.textureBuffer)
    gl.activeTexture(gl.TEXTURE4)
    gl.bindTexture(gl.TEXTURE_2D,fanalinoSXFB.textureBuffer)
    gl.activeTexture(gl.TEXTURE5)
    gl.bindTexture(gl.TEXTURE_2D,fanalinoDXFB.textureBuffer)
    drawableToChase.material.bindAlbedo(streetShader)
    drawableToChase.material.bindNormal(streetShader)
    dGrid.material.bindAlbedo(streetShader)
    dGrid.material.bindNormal(streetShader)
    streetShader.draw(dGrid)
    dStreet.material.bindAlbedo(streetShader)
    dStreet.material.bindNormal(streetShader)
    streetShader.draw(dStreet)
    streetShader.draw(DOOOH)
    carNode.drawFromNode()





   window.requestAnimationFrame(drawloop)
}


main()