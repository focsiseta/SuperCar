//Class that will act as a container for all the type of buffers
class Element {
    static counter = 0
    constructor(id = "Element"+Element.counter,vertexArray,drawType = "TRIANGLES",normalArray = null,indexArray = null,texCoordArray = null,) {
        this.vertices = new Float32Array(vertexArray)
        this.hasNormals = normalArray != null
        if(this.hasNormals){
            this.normals = new Float32Array(normalArray)
        }else{
            this.normals = null
        }
        this.hasIndices = indexArray != null
        if(this.hasIndices){
            this.indices = new Uint16Array(indexArray)
        }else{
            this.indices = null
        }
        this.hasTexture = texCoordArray != null
        if(this.hasTexture){
            this.texCoords = new Float32Array(texCoordArray)
            if(this.hasNormals && this.hasIndices){
                this.tangents = []
                //this.calculateTBN()
                ComputeTangentFrame(this,this.vertices.length,this.indices.length / 3,this.indices)
            }
        }else{
            this.texCoords = null
        }
        this.drawType = drawType
        this.id = id
        Element.counter++
    }
    loadVertices(vertexArray){
        this.vertices = new Float32Array(vertexArray)
    }
    loadNormals(normalArray){
        this.normals = new Float32Array(normalArray)
    }
    loadIndices(indexArray){
        this.indices = new Uint16Array(indexArray)
    }
    loadTexCoords(texCoordArray){
        this.texCoords = new Float32Array(texCoordArray)
    }
    getId(){
        return this.id
    }
    calculateTBN(){
        var tangent = []
        var vertices = divideIntoPoints3D(this.vertices)
        var uvs = divideIntoPoints2D(this.texCoords)
        for(var i = 0; i < this.indices.length;i += 3){
            var v1 = vertices[this.indices[i]]
            var v2 = vertices[this.indices[i+1]]
            var v3 = vertices[this.indices[i+2]]

            var uv1 = uvs[this.indices[i]]
            var uv2 = uvs[this.indices[i+1]]
            var uv3 = uvs[this.indices[i+2]]
            //console.log("UVs :",uv1,uv2,uv3)
            var deltaP1 = glMatrix.vec3.sub(glMatrix.vec3.create(),v2,v1)
            var deltaP2 = glMatrix.vec3.sub(glMatrix.vec3.create(),v3,v1)
            var deltaUV1 = glMatrix.vec2.sub(glMatrix.vec2.create(),uv2,uv1)
            var deltaUV2 =  glMatrix.vec2.sub(glMatrix.vec2.create(),uv3,uv1)
            let f = 1 / (deltaUV1[0]*deltaUV2[1] - deltaUV1[1]*deltaUV2[0])
            //console.log("fractional part ",(deltaUV1[0]*deltaUV2[1] - deltaUV1[1]*deltaUV2[0]),deltaUV1,deltaUV2)
            var x = f * (deltaUV2[1] * deltaP1[0] - deltaUV1[1] * deltaP2[0])
            var y = f * (deltaUV2[1] * deltaP1[1] - deltaUV1[1] * deltaP2[1])
            var z = f * (deltaUV2[1] * deltaP1[2] - deltaUV1[1] * deltaP2[2])

            //console.log(x + "  " + y + "  " + z)
            var tan = [x,y,z]
            tangent.push(tan)
            tangent.push(tan)
            tangent.push(tan)

        }
        var flattenedTangents = []
        for(var i = 0; i < tangent.length;i++){
            tangent[i].forEach((value) =>{
                flattenedTangents.push(value)
            })
        }
        this.tangents = new Float32Array(flattenedTangents)
    }
}
function ComputeTangentFrame(element,numVertices,numTriangles,triangleIndices){

    element.tangents = new Float32Array(3* numVertices);
    var n_star =   Array(numVertices).fill(0);
    tangent = glMatrix.vec3.create();

    function TangentFrame(t0,t1,t2){
        t10 = glMatrix.vec2.create();
        t20 = glMatrix.vec2.create();

        var t = glMatrix.vec2.create();


        glMatrix.vec2.subtract(t10,t1,t0);
        glMatrix.vec2.subtract(t20,t2,t0);

        var area  = glMatrix.vec3.create();
        var area1 = glMatrix.vec3.create();
        var area2 = glMatrix.vec3.create();

        glMatrix.vec2.cross(area1,[1,0],t20);
        glMatrix.vec2.cross(area2,t10,[1,0]);
        glMatrix.vec2.cross(area,t10,t20);

        coord_u = area1[2]/area[2];
        coord_v = area2[2]/area[2];
        return [coord_u,coord_v];
    }

    for(it = 0; it < numTriangles;++it){
        var indices = triangleIndices.slice(3*it,3*(it+1));
        var pos = [];
        pos[0] = element.vertices.slice(3*indices[0],3*(indices[0]+1));
        pos[1] = element.vertices.slice(3*indices[1],3*(indices[1]+1));
        pos[2] = element.vertices.slice(3*indices[2],3*(indices[2]+1));
        var t = [];
        t[0] =   element.texCoords.slice(2*indices[0],2*(indices[0]+1));
        t[1] =   element.texCoords.slice(2*indices[1],2*(indices[1]+1));
        t[2] =   element.texCoords.slice(2*indices[2],2*(indices[2]+1));
        for(iv = 0; iv < 3;++iv)
        {
            n_star[indices[iv]]++;

            coords = TangentFrame(t[iv],t[(iv+1)%3],t[(iv+2)%3]);

            var pos10 = glMatrix.vec3.create();
            var pos20 = glMatrix.vec3.create();
            glMatrix.vec3.subtract(pos10,pos[(iv+1)%3],pos[ iv]);
            glMatrix.vec3.subtract(pos20,pos[(iv+2)%3],pos[ iv]);


            glMatrix.vec3.scale(pos10,pos10,coords[0]);
            glMatrix.vec3.scale(pos20,pos20,coords[1]);
            glMatrix.vec3.add(tangent,pos10,pos20);
            element.tangents[3*indices[iv]]   = tangent[0];
            element.tangents[3*indices[iv]+1] = tangent[1];
            element.tangents[3*indices[iv]+2] = tangent[2];
        }
    }
    for(iv = 0; iv <numVertices;++iv){
        tangent = element.tangents.slice(3*iv,3*(iv+1));
        glMatrix.vec3.scale(tangent,tangent,1.0/n_star[iv]);
        element.tangents[3*iv]   = tangent[0];
        element.tangents[3*iv+1] = tangent[1];
        element.tangents[3*iv+2] = tangent[2];
    }

}


class Drawable extends Transformations{
    constructor(shape = null,material = null) {
        super(Transformations.gimbalT.XYZ);
        this.shape = shape
        this.hasMaterial = material != null
        this.material = material
    }



}
