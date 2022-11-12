
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
    wheelToChase.color = [0.0,0.0,0.8,1.0]
    lamp = new Element("Lampione",lampioneVertices,"TRIANGLES",lampioneNormals,lampioneIndices,null)
    lamp.color = [0.8,0.8,0.8,1.0]
    sBox = new Element("cubeMap",skyboxVertices)
    terrain = pGroundGeneration(20)
    street = buildStreet()
    c.loadElement(lamp)
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
    grass = c.loadTexture("texture/Stone/Stylized_Stone_Floor_005_basecolor.jpg")
    grassNormal = c.loadTexture("texture/Stone/Stylized_Stone_Floor_005_normal.jpg")
    step = c.loadTexture("texture/heightmaps/step.jpg")
    asphalt = c.loadTexture("texture/heightmaps/asphalt.jpg")
    fanalino = c.loadTexture("texture/fanalino.png")
    tetto = c.loadTexture("texture/roof.jpg")
    facciata1 = c.loadTexture("texture/facade1.jpg")
    facciata2 = c.loadTexture("texture/facade2.jpg")
    facciata3 = c.loadTexture("texture/facade3.jpg")
    facciata1Normal = c.loadTexture("texture/heightmaps/facade1_normal.png")
    facciata2Normal = c.loadTexture("texture/heightmaps/facade2_normal.png")
    facciata3Normal = c.loadTexture("texture/heightmaps/facade3_normal.png")

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
function on_mouseDown(e){
    handler.drag = true
    handler.startX = e.screenX
    handler.startY = e.screenY


}
function on_mouseDrag(e){
    if(handler.drag){
        let deltaX = e.screenX - handler.startX
        let deltaY = e.screenY - handler.startY
        handler.yaw = deltaX / 10;
        handler.pitch = -deltaY / 10;
    }
    handler.startX = e.screenX
    handler.startY = e.screenY

}
function on_mouseUp(e){
    handler.startX = e.screenX
    handler.startY = e.screenY
    handler.yaw = 0
    handler.pitch = 0
    handler.drag = false
}
function houseGeneration(position){
    let roof = new Drawable(quad,new Material(tetto))
    roof.isBuilding = true
    roof.translate([0.0,11.95,0.0])
    roof.translate(position)
    roof.scale([6,6,6])
    roof.wRotateX(gradToRad(90))
    roof.update()
    let wall1 = new Drawable(quad, new Material(facciata1,facciata1Normal))
    wall1.isBuilding = true
    wall1.wRotateX(gradToRad(90))
    wall1.wRotateZ(gradToRad(-180))
    wall1.wRotateY(gradToRad(-180))
    wall1.translate([0,1,1])
    wall1.update()
    let node = new Node(roof,streetShader)
    node.DrawableAsLeaf(wall1)
    let wall2 = new Drawable(quad)
    wall2.isBuilding = true
    wall2.translate([1,0,1])
    wall2.wRotateX(gradToRad(-90))
    wall2.wRotateY(gradToRad(-90))
    node.DrawableAsLeaf(wall2)
    let wall3 = new Drawable(quad)
    wall3.isBuilding = true
    wall3.wRotateX(gradToRad(-90))
    wall3.translate([0,-1,1])
    node.DrawableAsLeaf(wall3)
    let wall4 = new Drawable(quad)
    wall4.isBuilding = true
    wall4.wRotateX(gradToRad(-90))
    wall4.wRotateY(gradToRad(-90))
    wall4.translate([-1,0,1])
    node.DrawableAsLeaf(wall4)
    node.calc()
    node.shadowWall = wall4
    return node
}
function drawHouse(houseNode,material,shader){
    let gl = shader.gl
    let i = (Math.floor(Math.random() * 10)) % 3
    shader.draw(houseNode.drawable)
    houseNode.leafs.forEach((node) =>{
        material.bindAlbedo(shader)
        material.bindNormal(shader)
        shader.draw(node.drawable)
    })

}
function lampPositioning(){
    let lampStack = []
    lampsPosition.forEach((element) => {
        let lampPost = new Drawable(lamp)
        lampPost.scale([0.2,0.2,0.2])
        lampStack.push(lampPost)
        glMatrix.vec3.scale(element.position,element.position,1.9)
        lampPost.translate(element.position)
        lampPost.update()
    })
    return lampStack
}
function drawLamps(shader){
    lampStack.forEach((d) =>{
        shader.draw(d)
    })
}
function buildingFacades(){
    let stack = []
    stack.push(new Material(facciata1,facciata1Normal))
    stack.push(new Material(facciata2,facciata2Normal))
    stack.push(new Material(facciata3,facciata3Normal))
    return stack


}

function main(){
    c = new Context()
    let gl = c.gl
    handler = new Input(c)
    handler.setMouseDownEvent(on_mouseDown)
    handler.setMouseMoveEvent(on_mouseDrag)
    handler.setMouseUpEvent(on_mouseUp)
    gl.enable(gl.DEPTH_TEST)
    loadElements(c)
    loadTextures(c)
    facedsStack = buildingFacades()
    house1 = facedsStack[(Math.floor(Math.random() * 10)) % 3]
    house2 = facedsStack[(Math.floor(Math.random() * 10)) % 3]
    house3 = facedsStack[(Math.floor(Math.random() * 10)) % 3]
    drawableToChase = new Drawable(elementToChase,new Material(bricks,bricksNormal))
    drawableToChase.scale([2,2,2])
    drawableToChase.translate([0,0.6,0])
    drawableToChase.shape.hasTexture = false
    drawableToChase.shape.color = [1.0,0.0,0.5,0.8]
    drawableToChase.update()
    dStreet = new Drawable(street,new Material(streetTexture,asphalt))
    dStreet.scale([2,1,2])
    dStreet.update()
    dGrid = new Drawable(terrain,new Material(grass,grassNormal))
    dQuad = new Drawable(quad)
    dLamp = new Drawable(lamp)
    dLamp.scale([0.2,0.2,0.2])
    dLamp.update()
    //To avoid z-fighting
    dGrid.translate([0,-0.02,0])

    dGrid.scale([1.8,1,1.9])
    dGrid.update()
    box = new Drawable(sBox)

    camera = new ChaseCamera([0,1,-5],[0,0,0],drawableToChase)
    //camera = new QuadCamera([0,1,5],0.3)
    streetShader = lightpassSetup(c)
    fanalinoCameraSX = fanaliniMatrix([0.4,0.0,0.2],drawableToChase,[0.2,0.2,5])
    fanalinoCameraDX = fanaliniMatrix([-0.4,0.0,0.2],drawableToChase,[-0.2,0.2,5])
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
            if(drawable.isBuilding)
                shader.setUniform1Float("isBuilding",1)
                shader.setUniform1Float("uBias",0.01)
        }else{
            shader.setUniform1Float("hasTexture", 0)
            shader.setUniform1Float("isBuilding",0)
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
        let viewMatrix = glMatrix.mat3.fromMat4(glMatrix.mat3.create(),camera.getViewMatrix())
        shader.setMatrixUniform("uViewMatrix",[viewMatrix[0],viewMatrix[1],viewMatrix[2],0,
            viewMatrix[3],viewMatrix[4],viewMatrix[5],0,
            viewMatrix[6],viewMatrix[7],viewMatrix[8],0,
            0,0,0,1])
        gl.drawArrays(gl[shape.drawType],shape.vBuffer,shape.vertices.length / 3)

    })
    carNode = CarNode(drawableToChase,wheelToChase,streetShader)
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
    lampStack = lampPositioning()
    houseB = houseGeneration([-10,0,0])
    houseB2 = houseGeneration([30,0,60])
    houseB3 = houseGeneration([100,0,100])
    houseB4 = houseGeneration([50,0,-50])
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

var flagSX = false
var flagDX = false
function drawloop(){
    let gl = c.gl
    gl.enable(gl.CULL_FACE)
    gl.clearColor(0,0,0,0.8)
    //camera.processInput(handler)
    //camera.moveDrawable(handler,1)
    //choose mode
    if(handler.getKeyStatus("m")){
        camera.processMouseAndKeyboard(handler)
    }else{
        moveCar(carNode,handler,0.01)
    }
    carNode.calc()

    //shadow pass

    gl.viewport(0,0,5000,5000)
    depthFramebuffer.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    depthShader.useProgram()
    depthShader.draw(dGrid)

    gl.cullFace(gl.FRONT)
    depthShader.draw(drawableToChase)
    gl.cullFace(gl.FRONT)
    depthShader.draw(d1)
    depthShader.draw(d2)
    depthShader.draw(d3)
    depthShader.draw(d4)


    //carNode.drawFromNodeDifferentShader(depthShader)
    drawLamps(depthShader)
    //Trying to remove peter panning
    gl.cullFace(gl.FRONT)
    houseB.drawFromNodeDifferentShader(depthShader)
    houseB2.drawFromNodeDifferentShader(depthShader)
    houseB3.drawFromNodeDifferentShader(depthShader)
    houseB4.drawFromNodeDifferentShader(depthShader)
    gl.cullFace(gl.BACK)
    //Fanalino depth pass
    fanalinoSXFB.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.viewport(0,0,2048,2048)
    simpleSH.useProgram()
    simpleSH.setMatrixUniform("uViewMatrix",fanalinoCameraSX.getViewMatrix())
    simpleSH.draw(dGrid)
    gl.cullFace(gl.FRONT)
    drawLamps(simpleSH)
    gl.cullFace(gl.BACK)
    houseB.drawFromNodeDifferentShader(simpleSH)
    houseB2.drawFromNodeDifferentShader(simpleSH)
    houseB3.drawFromNodeDifferentShader(simpleSH)
    houseB4.drawFromNodeDifferentShader(simpleSH)
    fanalinoDXFB.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    simpleSH.setMatrixUniform("uViewMatrix",fanalinoCameraDX.getViewMatrix())
    simpleSH.draw(dGrid)
    gl.cullFace(gl.FRONT)
    drawLamps(simpleSH)
    gl.cullFace(gl.BACK)
    houseB.drawFromNodeDifferentShader(simpleSH)
    houseB2.drawFromNodeDifferentShader(simpleSH)
    houseB3.drawFromNodeDifferentShader(simpleSH)
    houseB4.drawFromNodeDifferentShader(simpleSH)
    simpleSH.bindToDefaultFramebuffer()
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.depthMask(false)
    gl.viewport(0,0,1300,720)
    gl.cullFace(gl.BACK)
    shaderSkybox.useProgram()
    gl.activeTexture(gl.TEXTURE0)
    textureSkybox.bindCubemap(shaderSkybox)
    shaderSkybox.draw(box)
    gl.depthMask(true)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.CULL_FACE)
    streetShader.useProgram()

    //Spegni e accendi i fanalini a piacimento
    if(handler.getKeyStatus("q") || handler.getKeyStatus("Q")) {
        flagSX = !flagSX;
    }
    if(handler.getKeyStatus("p") || handler.getKeyStatus("P")) {
        flagDX = !flagDX;
    }

    streetShader.setUniform1Float("isOnSX", flagSX ? 1 : 0)
    streetShader.setUniform1Float("isOnDX",flagDX ? 1 : 0)
    //Setup delle viewMatrix dei fanalini che verranno moltiplicate per la proj matrix gia' passata come uniform prima del render loop
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
    dGrid.material.bindAlbedo(streetShader)
    dGrid.material.bindNormal(streetShader)
    streetShader.draw(dGrid)
    dStreet.material.bindAlbedo(streetShader)
    dStreet.material.bindNormal(streetShader)
    streetShader.draw(dStreet)
    drawLamps(streetShader)
    carNode.drawFromNode()
    drawHouse(houseB,house1,streetShader)
    drawHouse(houseB2,house2,streetShader)
    drawHouse(houseB3,house3,streetShader)
    drawHouse(houseB4,house1,streetShader)




   window.requestAnimationFrame(drawloop)
}


main()
