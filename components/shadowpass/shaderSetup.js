function shadowShaderSetup(lightPosition,scale = 1,w,h,c){
    let scaledPosition = glMatrix.vec3.scale(glMatrix.vec3.create(),lightPosition,-scale)
    let ortoProjMatrix = glMatrix.mat4.ortho([],-w,w,-h,h,-150,150)
    let viewMatrixLight = glMatrix.mat4.lookAt(glMatrix.mat4.create(),scaledPosition,[0,0,0],[0,1,-1])
    let lightCoordsMatrix = glMatrix.mat4.multiply(glMatrix.mat4.create(),ortoProjMatrix,viewMatrixLight)
   let sShader = c.spawnShader(shadow_vs,shadow_fs,"shadowShader")
    sShader.setEnableAttrFunc((shader) =>{
        let gl = shader.gl
        gl.enableVertexAttribArray(shader["aPos"])
    })
    sShader.setBindingFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        gl.bindBuffer(gl.ARRAY_BUFFER,shape.vBuffer)
        gl.vertexAttribPointer(shader["aPos"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,shape.iBuffer)
    })
    sShader.setDrawFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        shader.setMatrixUniform("uM",drawable.getFrame())
        gl.drawElements(gl[shape.drawType],shape.indices.length,gl.UNSIGNED_SHORT,0)

    })
    sShader.useProgram()
    sShader.setMatrixUniform("uLightMatrix",lightCoordsMatrix,false)
    sShader.lightCoordsMatrix = lightCoordsMatrix
    return sShader
}