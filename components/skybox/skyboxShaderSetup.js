function skyboxShader(c){
    let  skybox = c.spawnShader(skybox_vs,skybox_fs)
    skybox.useProgram()
    skybox.setUniform1Int("uSkybox",0)
    skybox.setEnableAttrFunc((shader) =>{
        let gl = shader.gl
        gl.enableVertexAttribArray(shader["aPos"])
    })
    skybox.setBindingFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        gl.bindBuffer(gl.ARRAY_BUFFER,shape.vBuffer)
        gl.vertexAttribPointer(shader["aPos"],3,gl.FLOAT,false,0,0)
    })
    let projMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14/4,1300/720,0.15,1000)
    skybox.setMatrixUniform("uProjMatrix",projMatrix)
    /*
        skybox.setDrawFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        camera.moveDrawable(handler,2)
        let viewMatrix = glMatrix.mat3.fromMat4(glMatrix.mat3.create(),camera.getViewMatrix())
        skybox.setMatrixUniform("uViewMatrix",[viewMatrix[0],viewMatrix[1],viewMatrix[2],0,
            viewMatrix[3],viewMatrix[4],viewMatrix[5],0,
            viewMatrix[6],viewMatrix[7],viewMatrix[8],0,
            0,0,0,1])
        gl.drawArrays(gl[shape.drawType],shape.vBuffer,shape.vertices.length / 3)
    })
    * */
    return skybox
}