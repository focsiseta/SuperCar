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
    handler = new Input()
    let gl = c.gl
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true)
    gl.clearColor(0,0,0,1)
    camera = new QuadCamera([0,1,0],0.2)
    albedo = c.loadTexture("texture/toybox/wood.png")
    normal = c.loadTexture("texture/toybox/toy_box_normal.png")
    disp = c.loadTexture("texture/toybox/toy_box_disp_1.png")
   // ground = pGroundGeneration(1)
    c.loadElement(quad)
    drawableGround = new Drawable(quad)
    drawableGround.wRotateX(gradToRad(90))
    drawableGround.update()
    parallaxShader = parallaxSetup(c)
    parallaxScale = 1.0
    parallaxShader.setDrawFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        shader.setVectorUniform("uCameraPos",camera.getPosition())
        shader.setUniform1Float("scaleFactor",parallaxScale)
        shader.setMatrixUniform("uView",camera.getViewMatrix())
        shader.setMatrixUniform("uM",drawable.getFrame())

        gl.drawElements(gl[shape.drawType],shape.indices.length,gl.UNSIGNED_SHORT,0)
    })
    parallaxShader.useProgram()
    gl.viewport(0,0,1300,720)

    renderLoop()




}

function renderLoop(){
    let gl = c.gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    camera.processInput(handler)
    gl.activeTexture(gl.TEXTURE0)
    albedo.bind()
    gl.activeTexture(gl.TEXTURE1)
    normal.bind()
    gl.activeTexture(gl.TEXTURE2)
    disp.bind()
   //drawableGround.wRotateY(gradToRad(0.1))
    drawableGround.update()
    parallaxShader.draw(drawableGround)
    window.requestAnimationFrame(renderLoop)
}

main()