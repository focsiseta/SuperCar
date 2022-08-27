const shadow_vs = `

    attribute vec3 aPos;
    uniform mat4 uM;
    uniform mat4 uLightMatrix;
    void main(){
    
        gl_Position = uLightMatrix * uM * vec4(aPos,1.0); 
    
    }
`
const shadow_fs =
    `void main(){
    
    }`
