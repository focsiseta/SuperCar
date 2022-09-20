function parallaxSetup(c){
    let gl = c.gl
    let fs = new ShaderSource(parallax_fs)
    let shader = c.spawnShader(parallax_vs,fs.source)
    shader.setEnableAttrFunc((shader) =>{
        let gl = shader.gl
        gl.enableVertexAttribArray(shader["aPos"])
        gl.enableVertexAttribArray(shader["aNormal"])
        gl.enableVertexAttribArray(shader["aTangent"])
        gl.enableVertexAttribArray(shader["aTex"])
    })
    shader.setBindingFunction((shader,drawable) => {
        var gl = shader.gl
        var shape = drawable.shape
        gl.bindBuffer(gl.ARRAY_BUFFER,shape.vBuffer)
        gl.vertexAttribPointer(shader["aPos"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,shape.nBuffer)
        gl.vertexAttribPointer(shader["aNormal"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,shape.texCoordBuffer)
        gl.vertexAttribPointer(shader["aTex"],2,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,shape.tBuffer)
        gl.vertexAttribPointer(shader["aTangent"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,shape.iBuffer)
    })
    shader.useProgram()
    shader.setUniform1Int("uAlbedo",0)
    shader.setUniform1Int("uNormal",1)
    shader.setUniform1Int("uDisp",2)
    shader.setVectorUniform("uLightPos",[0,-1,0])
    shader.setMatrixUniform("uProj",glMatrix.mat4.perspective(glMatrix.mat4.create(),Math.PI / 4,1300 / 720,0.15,1000))

    return shader

}