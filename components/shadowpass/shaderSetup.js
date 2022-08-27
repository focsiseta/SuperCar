function shadowShaderSetup(lightPosition,scale = 1,c){
    let scaledPosition = glMatrix.vec3.scale([],lightPosition,-scale)
    let ortoProjMatrix = glMatrix.mat4.ortho([],10,-10,-10,10,0.15,1000)
    let viewMatrixLight = glMatrix.mat4.lookAt([],scaledPosition,[0,0,0],[0,1,0])
    let lightCoordsMatrix = glMatrix.mat4.multiply([],ortoProjMatrix,viewMatrixLight)
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
        shader.setMatrixUniform("uM",drawable.shape.getFrame())
        gl.drawElements(gl[shape.drawType],shape.indices.length / 3,gl.UNSIGNED_SHORT,0)

    })
    sShader.lightCoordsMatrix = lightCoordsMatrix
    return sShader
}