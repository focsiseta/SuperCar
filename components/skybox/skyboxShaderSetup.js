function skyboxShader(c){
    let gl = c.gl
    let handler = new Input()
    let  skybox = c.spawnShader(skybox_vs,skybox_fs)
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
    skybox.setDrawFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        //console.log(drawable.shape.vertices)
        camera.processInput(handler)
        //TODO to understand
        let viewMatrix = glMatrix.mat3.fromMat4(glMatrix.mat3.create(),camera.getViewMatrix())
        //viewMatrix = glMatrix.mat4.fromMat3()
        skybox.setMatrixUniform("uViewMatrix",[viewMatrix[0],viewMatrix[1],viewMatrix[2],0,
            viewMatrix[3],viewMatrix[4],viewMatrix[5],0,
            viewMatrix[6],viewMatrix[7],viewMatrix[8],0,
            0,0,0,1])
        gl.drawArrays(gl[shape.drawType],shape.vBuffer,shape.vertices.length / 3)
    })
    skybox.useProgram()
    let camera = new Camera([0,3,0])
    let projMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14/4,1300/720,0.15,1000)
    skybox.setMatrixUniform("uProjMatrix",projMatrix)
    skybox.setUniform1Int("uSkybox",0)
    return skybox
}