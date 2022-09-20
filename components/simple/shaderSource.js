

const simple_vs = `
    
    attribute vec3 aPos;
    uniform mat4 uM;
    uniform mat4 uView;
    uniform mat4 uProj;
    varying vec4 vPos;

    void main(){
        vPos = uProj * uView * uM * vec4(aPos,1.0);
        gl_Position =  vPos ;
    
    }
`
const simple_fs =
    `
    precision highp float;	
    	
    varying vec4 vPos;



void main(void)									
{	
    gl_FragColor = vec4(vPos.www / 10.0,1.0);
    
}`