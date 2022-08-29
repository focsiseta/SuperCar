//TODO Remove tony hawk assets
function main(){
    const quad = new Element("quad",[
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
    c = new Context()
    let gl = c.gl
    gl.enable(gl.DEPTH_TEST)
    cubeElement = new Element("car",cube.vertices[0].values,"TRIANGLES",cube.vertices[1].values,cube.connectivity[0].indices,cube.vertices[2].values)
    c.loadElement(quad)
    c.loadElement(cubeElement)
    bricks = c.loadTexture("texture/bricks.jpg")
    bricksNormal = c.loadTexture("texture/heightmaps/brickheight.jpg")
    drawableToChase = new Drawable(cubeElement,new Material(bricks,bricksNormal))
    drawableToChase.scale([0.5,0.5,0.5])
    //drawableToChase.wRotateX(gradToRad(90))
    drawableToChase.translate([0,1,0])
    drawableToChase.update()
    camera = new ChaseCamera([0,5,-40],[0,0,0],drawableToChase)
    //camera = new QuadCamera([0,1,0],0.5)
    let nissi = [
        "texture/cubemaps/nissi/posx.jpg",
        "texture/cubemaps/nissi/negx.jpg",
        "texture/cubemaps/nissi/posy.jpg",
        "texture/cubemaps/nissi/negy.jpg",
        "texture/cubemaps/nissi/posz.jpg",
        "texture/cubemaps/nissi/negz.jpg"
    ]
    streetShader = lightpassSetup(c)
    depthShader = shadowShaderSetup(dir.direction,1,1300,720,c)
    depthFramebuffer = Framebuffers.shadowMap(gl,5000,5000)
    streetShader.useProgram()
    streetShader.setMatrixUniform("uLightMatrix",depthShader.lightCoordsMatrix)
    streetShader.setDrawFunction((shader,drawable)=>{
        let gl = shader.gl
        let shape = drawable.shape
        //camera.processInput(handler)
        let viewMatrix = camera.getViewMatrix()
        shader.setMatrixUniform("uViewMatrix",viewMatrix)
        shader.setMatrixUniform("uM",drawable.getFrame())
        //shader.setMatrixUniform("uIViewMatrix",glMatrix.mat4.invert([],camera.viewMatrix))
        shader.setVectorUniform("uView",camera.getPosition())
        //shader.setMatrixUniform("uCameraPosition",[viewMatrix[12],viewMatrix[13],viewMatrix[14]])
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
    sBox = new Element("cubeMap",skyboxVertices)
    terrain = pGroundGeneration(10)
    c.loadElement(terrain)
    c.loadElement(sBox)
    textureSkybox = new CubeMaps(nissi,gl)
    street = buildStreet()
    streetTexture = c.loadTexture("texture/street.png")
    grass = c.loadTexture("texture/grass_tile.png")
    grassNormal = c.loadTexture("texture/heightmaps/grass.png")
    step = c.loadTexture("texture/heightmaps/step.jpg")
    asphalt = c.loadTexture("texture/heightmaps/asphalt.jpg")
    c.loadElement(street)
    dStreet = new Drawable(street,new Material(streetTexture,asphalt))
    dGrid = new Drawable(terrain,new Material(grass,grassNormal))
    dQuad = new Drawable(quad)
    dQuad.translate([0,5,0])
    dQuad.wRotateX(gradToRad(90))
    dQuad.update()
    dGrid.translate([0,-0.1,0])
    dGrid.update()
    box = new Drawable(sBox)
    //
    simpleS = simpleSetup(c)
    simpleS.useProgram()
    simpleS.setMatrixUniform("uLightMatrix",depthShader.lightCoordsMatrix,false)
    simpleS.setDrawFunction((shader,drawable)=>{

        let gl = shader.gl
        let shape = drawable.shape
        shader.setMatrixUniform("uView",camera.getViewMatrix())
        shader.setMatrixUniform("uM",drawable.getFrame())
        gl.drawElements(gl[shape.drawType],shape.indices.length,gl.UNSIGNED_SHORT,0)

    })
    //

    //testDepth()
    drawloop()

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
    camera.moveDrawable(handler,1)
    gl.viewport(0,0,5000,5000)
    depthFramebuffer.bindFramebuffer()
    gl.clear(gl.DEPTH_BUFFER_BIT)
    depthShader.useProgram()
    depthShader.draw(dStreet)
    depthShader.draw(dGrid)
    depthShader.draw(drawableToChase)
    depthShader.bindToDefaultFramebuffer()
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
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D,depthFramebuffer.textureBuffer)
    drawableToChase.material.bindAlbedo(streetShader)
    drawableToChase.material.bindNormal(streetShader)
    streetShader.draw(drawableToChase)
    dGrid.material.bindAlbedo(streetShader)
    dGrid.material.bindNormal(streetShader)
    streetShader.draw(dGrid)
    dStreet.material.bindAlbedo(streetShader)
    dStreet.material.bindNormal(streetShader)
    streetShader.draw(dStreet)




    window.requestAnimationFrame(drawloop)
}


main()