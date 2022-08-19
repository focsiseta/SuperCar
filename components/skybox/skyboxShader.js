const skybox_vs = `

    attribute vec3 aPos;
    
    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;
    
    varying vec3 vTexCoords;
    
    void main(){
        
        vTexCoords = aPos;
        gl_Position = uProjMatrix * uViewMatrix * vec4(aPos,1.0);
    
    }
`

const skybox_fs = `

        precision highp float;
        
        
        uniform samplerCube uSkybox;
        
        varying vec3 vTexCoords;
        
        void main(){
            vec4 color = textureCube(uSkybox,normalize(vTexCoords));
            gl_FragColor = color;
        
        }

    

`