function fanaliniMatrix(from,refDrawanble,target){
    let perspectiveMatrix = glMatrix.mat4.perspective([],gradToRad(20),130/72, 0.01,30)
    let camera = new ChaseCamera(from,target,refDrawanble)
    camera.perspectiveMatrix = perspectiveMatrix
    return camera
}

function fanaliniShaderSetup(c){
    let gl = c.gl
    let sShader = c.spawnShader(fanalini_vs,fanalini_fs,"fanaliniShader")
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
    return sShader
}