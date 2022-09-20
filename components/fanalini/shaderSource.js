const fanalini_vs =
    `#version 300 es
    
    in vec3 aPos;
    out vec4 vFragPos;
    uniform mat4 uM;
    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;
    
    void main(){
        //vPos = uLightMatrix * uM * vec4(aPos,1.0); 
        vFragPos = uProjMatrix * uViewMatrix * uM * vec4(aPos,1.0);
        gl_Position = vFragPos;
    
    }
`
const fanalini_fs =
    `#version 300 es
    precision highp float;
    in vec4 vFragPos;
    out vec4 outColor;

float planeApprox(float depth) 
{   
    // Compute partial derivatives of depth.    
    float dx = dFdx(depth);   
    float dy = dFdy(depth);   
    // Compute second moment over the pixel extents.   
    return  depth*depth + 0.25*(dx*dx + dy*dy);
} 

void main()
{   
    outColor = vec4(vFragPos.xyz,1.0);
    //gl_FragColor = outColor;
}`