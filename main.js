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
    c.loadElement(sBox)
    c.loadElement(quad)
    c.loadElement(bigGrid)
    let nissi = [
        "texture/cubemaps/nissi/posx.jpg",
        "texture/cubemaps/nissi/negx.jpg",
        "texture/cubemaps/nissi/posy.jpg",
        "texture/cubemaps/nissi/negy.jpg",
        "texture/cubemaps/nissi/posz.jpg",
        "texture/cubemaps/nissi/negz.jpg"]
    textureSkybox = new CubeMaps(nissi,gl)
    streetShader = testShaderSetup(c)
    shaderSkybox = skyboxShader(c)
    street = buildStreet()
    streetTexture = c.loadTexture("texture/street.png")
    grass = c.loadTexture("texture/grassTexture.jpg")
    step = c.loadTexture("texture/heightmaps/step.jpg")
    c.loadElement(street)
    dStreet = new Drawable(street,new Material(streetTexture))
    dGrid = new Drawable(bigGrid,new Material(grass))
    dGrid.wRotateX(gradToRad(100))
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
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    //gl.activeTexture(gl.TEXTURE0)
    textureSkybox.bindCubemap(shaderSkybox)
    shaderSkybox.draw(box)
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    gl.depthMask(true)
    gl.clear(gl.DEPTH_BUFFER_BIT)
    streetShader.useProgram()
    dGrid.material.bindAlbedo(streetShader)
    streetShader.draw(dGrid)
    dStreet.material.bindAlbedo(streetShader)
    streetShader.draw(dStreet)


    window.requestAnimationFrame(drawloop)
}


main()