const simple_vs = `
    
    attribute vec3 aPos;
    uniform mat4 uM;
    uniform mat4 uView;
    uniform mat4 uProj;
    uniform mat4 uLightMatrix;

    varying vec4 vLightPos;
    void main(){
        //vPos = uLightMatrix * uM * vec4(aPos,1.0); 
        mat4 NDC = uProj * uView;
        vLightPos = uLightMatrix * uM * vec4(aPos,1.0);
        gl_Position = uLightMatrix * uM * vec4(aPos,1.0); 
    
    }
`
const simple_fs =
    `
    precision highp float;
    
    #include(dirlight)
    #include(dirShadow)			
    		
    varying vec4 vLightPos;
    uniform sampler2D uShadow;



void main(void)									
{	
    //gl_FragColor = vec4(gl_FragCoord.z, planeApprox(gl_FragCoord.z),0.0,1.0);
    if(shadowSampling(vLightPos,uShadow) != 1.0){
        gl_FragColor = vec4(1.0,0.0,1.0,1.0);
    }else{
        gl_FragColor = vec4(vLightPos.zzz,1.0);
        
    }
    
}`