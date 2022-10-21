const lightpass_vs = `#version 300 es
    in vec3 aPosition;
    in vec3 aNormal;
    in vec2 aTexCoords;
    in vec3 aTangent;
    
    uniform mat4 uProj;
    uniform mat4 uViewMatrix;
    uniform mat4 uLightMatrix;
    uniform mat4 uM;
    uniform mat4 cameraProj;
    uniform mat4 fanalinoSX;
    uniform mat4 fanalinoDX;
    out vec4 vFanalinoFragPosSX;
    out vec4 vFanalinoFragPosDX;
    out vec2 oTex;
    out vec3 vPos;
    out vec3 vNormal;
    out vec4 vLightFragPos;
    out mat3 vTBN;
    
    void main(){
        oTex = aTexCoords;
        vPos =  vec3((uM * vec4(aPosition,1.0)).xyz);
        vNormal = normalize( inverse(transpose(uViewMatrix * uM)) * vec4(aNormal,0.0)).xyz;
        vec3 T = normalize(vec3(uM * vec4(aTangent,0.0)));
        vec3 B = normalize(cross(T,vNormal));
        vTBN = mat3(T,B,vNormal); 
        vLightFragPos = uLightMatrix * uM * vec4(aPosition,1.0);
        vFanalinoFragPosSX = cameraProj * fanalinoSX * uM * vec4(aPosition,1.0);
        vFanalinoFragPosDX = cameraProj * fanalinoDX * uM * vec4(aPosition,1.0);
        gl_Position = uProj * uViewMatrix * uM * vec4(aPosition,1.0);
        //gl_Position = vLightFragPos;
    
    }

`
const lightpass_fs = `#version 300 es
    precision highp float;
    #include(dirlight)
    #include(dirShadow)
    #include(lightcalcs)
    in vec3 vPos;
    in vec3 vNormal;
    in vec2 oTex;
    in mat3 vTBN;
    //in vec4 vFanalinoFragPos;
    in vec4 vFanalinoFragPosSX;
    in vec4 vFanalinoFragPosDX;
    in vec4 vLightFragPos;
    uniform vec3 uView;
    uniform float isOnDX;
    uniform float isOnSX;
    uniform float hasTexture;
    uniform float isBuilding;
    uniform float uBias;
    uniform vec4 uColor;
    uniform sampler2D uAlbedo;
    uniform sampler2D uNormal;
    uniform sampler2D uShadow; //80~
    uniform sampler2D uFanalino;
    uniform sampler2D uDepthSX;
    uniform sampler2D uDepthDX;
    out vec4 oColor;
    
    //In this shader we don't work in tangent space
    //infact we remove from tangent space the sampled normal
    bool inRange(vec2 texCoords){
       return !(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0);
    
    }
    float LinearizeDepth(float depth,float near_plane,float far_plane){
        float z = depth * 2.0 - 1.0; // Back to NDC 
        return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
    }
    void main(){
        vec4 outColor;
        vec3 lightDir = normalize(-dirLights[0].dir);
        vec3 viewDir = normalize(uView - vPos);
        vec3 sx = vFanalinoFragPosSX.xyz / vFanalinoFragPosSX.w;
        vec3 dx = vFanalinoFragPosDX.xyz / vFanalinoFragPosDX.w;
        vec2 texCoordsDX = ((dx.xy) * 0.5) + 0.5;
        vec2 texCoordsSX = ((sx.xy) * 0.5) + 0.5;
        
        float isLitSX = shadowSampling(vFanalinoFragPosSX,uDepthSX,0.0005);
        float isLitDX = shadowSampling(vFanalinoFragPosDX,uDepthDX,0.0005);
        if(hasTexture == 0.0){
        
            float bias = max(0.01 * (1.0 - dot(normalize(vNormal), normalize(-dirLights[0].dir))), 0.0005);
            float isShadow = shadowSampling(vLightFragPos,uShadow,0.001);
            
            vec4 ambient = ambientComponent(uColor,dirLights[0].ambInt);
            vec4 diffuse = diffuseComponent(lightDir,normalize(vNormal),uColor);
            vec4 specular = specularComponent(viewDir,lightDir,vNormal,vec4(dirLights[0].color,1.0),1.0);
            outColor = ((specular * ambient + diffuse) * (1.0 - isShadow) + ambient) * uColor;
        
        }else{
        
            vec4 color = texture(uAlbedo,oTex);
            vec3 sampledNormal = normalize(vTBN * (texture(uNormal,oTex) * 2.0 - 1.0).xyz);
            vec3 finalNormal = sampledNormal + vNormal;
            float bias = max(0.01 * (1.0 - dot(finalNormal, normalize(-dirLights[0].dir))), 0.001);
            float isShadow = shadowSampling(vLightFragPos,uShadow,0.0005);
            vec4 ambient = ambientComponent(color,dirLights[0].ambInt);
            vec4 specular = specularComponent(viewDir,lightDir,normalize(finalNormal),vec4(dirLights[0].color,1.0),10.0);
            vec4 diffuse = diffuseComponent(lightDir,finalNormal,color);
            
            outColor = ((specular * ambient + diffuse) * (1.0 - isShadow) + ambient) * color;
            
            
            //gl_FragColor = lightPass(dirLights[0],color,finalNormal,uView, vPos,isShadow);
            //gl_FragColor = vec4(finalNormal,1.0);
        }
       

           
      //  /*
      //  if(vFanalinoFragPos.w >= 0.0 && vFanalinoFragPos.z <= 20.0 && fColor.a > 0.0){
      //      gl_FragColor = vec4(fColor.rgb,1.0);
      //  }
      //  */
      vec4 fColorSX = texture(uFanalino,texCoordsSX);
      vec4 fColorDX = texture(uFanalino,texCoordsDX);
        if(inRange(texCoordsSX) && (vFanalinoFragPosSX.w >= 0.0 && fColorSX.a > 0.0) && isLitSX == 0.0 && isOnSX == 1.0) {
            outColor += fColorSX * 0.2;
        }
        if(inRange(texCoordsDX) && (vFanalinoFragPosDX.w >= 0.0 && fColorDX.a > 0.0) && isLitDX == 0.0 && isOnDX == 1.0){
            outColor += fColorDX * 0.2; 
        }
        outColor.rgb = pow( outColor.rgb, vec3(1.0/2.2) );
        oColor = vec4(outColor.rgb,1.0);
    }
`
