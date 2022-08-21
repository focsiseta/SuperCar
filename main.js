function main(){
    c = new Context()
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
    sBox = new Element("cubeMap",skyboxVertices)
    bigGrid = new Element("grid",gridVertices,"TRIANGLES",gridNormals,gridIndices,gridTexCoords)
    terrain = pGroundGeneration(5)
    c.loadElement(terrain)
    c.loadElement(sBox)
    c.loadElement(quad)
    c.loadElement(bigGrid)
    let nissi = [
        "texture/cubemaps/nissi/posx.jpg",
        "texture/cubemaps/nissi/negx.jpg",
        "texture/cubemaps/nissi/posy.jpg",
        "texture/cubemaps/nissi/negy.jpg",
        "texture/cubemaps/nissi/posz.jpg",
        "texture/cubemaps/nissi/negz.jpg"
    ]
    textureSkybox = new CubeMaps(nissi,gl)
    streetShader = lightpassSetup(c)//testShaderSetup(c)
    shaderSkybox = skyboxShader(c)
    //lightShader = lightpassSetup(c)
    street = buildStreet()
    streetTexture = c.loadTexture("texture/street.png")
    grass = c.loadTexture("texture/grass_tile.png")
    grassNormal = c.loadTexture("texture/heightmaps/grass.png")
    step = c.loadTexture("texture/heightmaps/step.jpg")
    bricks = c.loadTexture("texture/bricks.jpg")
    bricksNormal = c.loadTexture("texture/heightmaps/brickheight.jpg")
    asphalt = c.loadTexture("texture/heightmaps/asphalt.jpg")
    c.loadElement(street)
    dStreet = new Drawable(street,new Material(streetTexture,asphalt))
    dGrid = new Drawable(terrain,new Material(grass,grassNormal))
    //dGrid.wRotateX(gradToRad(100))
    //dGrid.scale([20,1,20])
    dGrid.update()
    box = new Drawable(sBox)
    drawloop()

}

function drawloop(){
    let gl = c.gl
    gl.clearColor(0,0,0,0.8)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.depthMask(false)
    shaderSkybox.useProgram()
    textureSkybox.bindCubemap(shaderSkybox)
    shaderSkybox.draw(box)
    streetShader.useProgram()
    dGrid.material.bindAlbedo(streetShader)
    dGrid.material.bindNormal(streetShader)
    streetShader.draw(dGrid)
    gl.depthMask(true)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    dStreet.material.bindAlbedo(streetShader)
    dStreet.material.bindNormal(streetShader)
    streetShader.draw(dStreet)


    window.requestAnimationFrame(drawloop)
}


main()