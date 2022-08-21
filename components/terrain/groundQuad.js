function groundQuadGenerator(xyScale = 1,step){
    let vertices = []
    for(let x = -xyScale ;x < xyScale; x += step){
        for(let y = -xyScale; y < xyScale; y += step){
            vertices.push(x)
            vertices.push(0)
            vertices.push(y)
        }
    }
    //console.log("Real vertices",vertices.length / 3)
    //console.log("Expected vertices", (((xyScale * 2) / step) * ((xyScale * 2) / step)))
    console.log(vertices)
    let indices = indicesOrder(vertices,xyScale,step)
    let normals = buildNormals(vertices)
    let tex = texCoords(vertices,xyScale,step)
    return new Element("gridQuad",vertices,"TRIANGLES",null,indices,tex)


}

function texCoords(vertices,xyScale,step){
        let shift = 0
        let maxIndex = xyScale / step
        let texCoords = []
        for(let i = 0; i < vertices.length / 3; i++){
                if((i % maxIndex) === 0 && i !== 0)
                    shift++
                texCoords.push(shift)
                texCoords.push(i)
        }
        return texCoords

}
function indicesOrder(vertices,xyScale,step){

    let NofPoints = vertices.length / 3
    let maxIndex = xyScale / step
    let indices = []
    for(let x = 0;x < NofPoints;x += xyScale){
        for(let y = 0; y < maxIndex - 1; y++){
            let a = x + y
            let b = xyScale + a
            let c = a + 1
            let d = c + xyScale
            indices.push(a)
            indices.push(b)
            indices.push(c)
            indices.push(b)
            indices.push(d)
            indices.push(c)
        }
    }
    return indices
}

//GroundGeneration Prof's method because mine is written horribly and I think it's way too complex for something relatively easy

function pGroundGeneration(scale = 1){
    let bbox = [ -100, 0, -100, 100, 10, 100 ]
    let quad = [ bbox[0],  bbox[1] - 0.01,  bbox[5],
         bbox[3],  bbox[1] - 0.01,  bbox[5],
         bbox[3],  bbox[1] - 0.01,  bbox[2],
         bbox[0],  bbox[1] - 0.01,  bbox[2],
    ];
    //That's really clever
    let texCoords = [
            0.0,0.0,
        scale,0.0,
        scale,scale,
        0.0,scale
    ]
    let normals = buildNormals(quad)
    let indices = [0,1,2,0,2,3]
    return new Element("ground",quad,"TRIANGLES",normals,indices,texCoords)


}