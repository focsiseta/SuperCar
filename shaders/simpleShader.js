const street_vs = `
    
    attribute vec3 aPos;
    //attribute vec3 aNormal;
    attribute vec2 aTex;
    
    
    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uM;
    
    varying vec3 vPos;
    varying vec2 vTex;
    
    
    void main(){
        vPos = vec3(uM * vec4(aPos,1.0));
        vTex = aTex;
        vec4 pos = uProjMatrix * uViewMatrix * vec4(vPos,1.0);
        gl_Position = pos.xyww;
    }
`

const street_fs = `

    precision highp float;
    varying vec3 vPos;
    varying vec2 vTex;
    uniform sampler2D uAlbedo;
    void main(){
        vec4 color = texture2D(uAlbedo,vTex);
        gl_FragColor  = color;
    
    }

`