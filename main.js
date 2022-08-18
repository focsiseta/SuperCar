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
    c.loadElement(quad)
    streetShader = testShaderSetup(c)
    street = buildStreet()
    streetTexture = c.loadTexture("texture/street.png")
    step = c.loadTexture("texture/heightmaps/step.jpg")
    c.loadElement(street)
    dStreet = new Drawable(street,new Material(streetTexture))
    drawloop()

}

function drawloop(){
    let gl = c.gl
    gl.clearColor(0,0,0,0.8)
    gl.clear(gl.COLOR_BUFFER_BIT)
    streetShader.useProgram()
    dStreet.material.bindAlbedo(streetShader)
    streetShader.draw(dStreet)


    window.requestAnimationFrame(drawloop)
}


main()