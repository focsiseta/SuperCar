function lightpassSetup(c){
    handler = new Input()
    dir = new DirectionalLight(0.1,[1,0.7,0],[0,-1,1])
    var point = new Pointlight(0.2,[1,1,1],[0,5,0],0.22,0.0019)
    var source = new ShaderSource(lightpass_fs)
    let noLight = c.spawnShader(lightpass_vs,source.source,"noLight")
    noLight.useProgram()
    dir.bindStructUniform(noLight)
    point.bindStructUniform(noLight)
    point.loadLight(noLight)
    dir.loadLight(noLight)
    noLight.setUniform1Int("uAlbedo",0)
    noLight.setUniform1Int("uNormal",1)
    noLight.setEnableAttrFunc((shader) =>{
        var gl = shader.gl
        gl.enableVertexAttribArray(shader["aPosition"])
        gl.enableVertexAttribArray(shader["aTexCoords"])
        gl.enableVertexAttribArray(shader["aNormal"])
        gl.enableVertexAttribArray(shader["aTangent"])

    })
    let projMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14/4,1300/720,0.15,1000)
    noLight.setMatrixUniform("uProj",projMatrix)
    noLight.setBindingFunction((shader,drawable) => {
        var gl = shader.gl
        var shape = drawable.shape
        gl.bindBuffer(gl.ARRAY_BUFFER,shape.vBuffer)
        gl.vertexAttribPointer(shader["aPosition"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,shape.nBuffer)
        gl.vertexAttribPointer(shader["aNormal"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,shape.texCoordBuffer)
        gl.vertexAttribPointer(shader["aTexCoords"],2,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ARRAY_BUFFER,shape.tBuffer)
        gl.vertexAttribPointer(shader["aTangent"],3,gl.FLOAT,false,0,0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,shape.iBuffer)
    })

    /*
    *     let camera = new ChaseCamera([0,0,-1],[0,0,0])
    let projMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14/4,1300/720,0.15,1000)*/

    return noLight
}