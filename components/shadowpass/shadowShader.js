const shadow_vs =
    `#version 300 es
    
    in vec3 aPos;
    uniform mat4 uM;
    uniform mat4 uLightMatrix;
    void main(){
        //vPos = uLightMatrix * uM * vec4(aPos,1.0); 
        gl_Position = uLightMatrix * uM * vec4(aPos,1.0); 
    
    }
`
const shadow_fss =
    `
precision highp float;					


void main(void)									
{	
    //gl_FragColor = vec4(gl_FragCoord.z, planeApprox(gl_FragCoord.z),0.0,1.0);
    //gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}`

const shadow_fs =
    `#version 300 es
precision highp float;
out vec4 outColor;
float planeApprox(float depth) 
{   
    // Compute partial derivatives of depth.    
    float dx = dFdx(depth);   
    float dy = dFdy(depth);   
    // Compute second moment over the pixel extents.   
    return  depth*depth + 0.25*(dx*dx + dy*dy);
} 

void main(void)
{
    outColor = vec4(gl_FragCoord.z, planeApprox(gl_FragCoord.z),0.0,1.0);
    //outColor = vec4(1.0, 0.0, 1.0, 1.0);
}`