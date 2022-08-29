function simpleSetup(c){
    let simSourceVS = new ShaderSource(simple_vs)
    let simSourceFS = new ShaderSource(simple_fs)
    console.log(simSourceFS.source)
    let shader = c.spawnShader(simSourceVS.source,simSourceFS.source)
    shader.useProgram()
    shader.setMatrixUniform("uProj",glMatrix.mat4.perspective(glMatrix.mat4.create(),Math.PI / 4,1300/720,0.15,1000))
    shader.setEnableAttrFunc((shader) =>{
        let gl = shader.gl
        gl.enableVertexAttribArray(shader["aPos"])
    })
    shader.setBindingFunction((shader,drawable) =>{
        let gl = shader.gl
        let shape = drawable.shape
        gl.bindBuffer(gl.ARRAY_BUFFER,shape.vBuffer)
        gl.vertexAttribPointer(shader["aPos"],3,gl.FLOAT,false,0,0)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,shape.iBuffer)
    })
    return shader
}