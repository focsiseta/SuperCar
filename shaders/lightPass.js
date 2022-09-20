const lightpass_vs = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoords;
    attribute vec3 aTangent;
    
    uniform mat4 uProj;
    uniform mat4 uViewMatrix;
    uniform mat4 uLightMatrix;
    uniform mat4 uM;
    uniform mat4 cameraProj;
    uniform mat4 fanalinoSX;
    uniform mat4 fanalinoDX;
    varying vec4 vFanalinoFragPosSX;
    varying vec4 vFanalinoFragPosDX;
    varying vec2 oTex;
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec4 vLightFragPos;
    varying mat3 vTBN;


    
     mat3 transpose(mat3 inMatrix) {
        highp vec3 i0 = inMatrix[0];
        highp vec3 i1 = inMatrix[1];
        highp vec3 i2 = inMatrix[2];

        highp mat3 outMatrix = mat3(
                 vec3(i0.x, i1.x, i2.x),
                 vec3(i0.y, i1.y, i2.y),
                 vec3(i0.z, i1.z, i2.z)
                 );

        return outMatrix;
    }
    
    void main(){
        oTex = aTexCoords;
        vPos =  vec3((uM * vec4(aPosition,1.0)).xyz);
        vNormal = normalize( uM * vec4(aNormal,0.0)).xyz;
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
const lightpass_fs = `

    precision highp float;
    #include(dirlight)
    #include(dirShadow)
    #include(lightcalcs)
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 oTex;
    varying mat3 vTBN;
    //varying vec4 vFanalinoFragPos;
    varying vec4 vFanalinoFragPosSX;
    varying vec4 vFanalinoFragPosDX;
    varying vec4 vLightFragPos;
    uniform vec3 uView;
    uniform float hasTexture;
    uniform vec4 uColor;
    uniform sampler2D uAlbedo;
    uniform sampler2D uNormal;
    uniform sampler2D uShadow; //80~
    uniform sampler2D uFanalino;
    uniform sampler2D uDepthSX;
    uniform sampler2D uDepthDX;
    
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
        if(hasTexture == 0.0){
        
            float bias = max(0.01 * (1.0 - dot(normalize(vNormal), normalize(-dirLights[0].dir))), 0.001);
            float isShadow = shadowSampling(vLightFragPos,uShadow,bias);
            vec4 ambient = ambientComponent(uColor,dirLights[0].ambInt);
            vec4 diffuse = diffuseComponent(lightDir,normalize(vNormal),uColor);
            vec4 specular = specularComponent(viewDir,lightDir,vNormal,vec4(dirLights[0].color,1.0),1.0);
            outColor = ((specular * ambient + diffuse) * (1.0 - isShadow) + ambient) * uColor;
        
        }else{
        
            vec4 color = texture2D(uAlbedo,oTex);
            vec3 sampledNormal = normalize(vTBN * (texture2D(uNormal,oTex) * 2.0 - 1.0).xyz);
            vec3 finalNormal = sampledNormal + vNormal;
            float bias = max(0.01 * (1.0 - dot(finalNormal, normalize(-dirLights[0].dir))), 0.001);
            float isShadow = shadowSampling(vLightFragPos,uShadow,0.001);
            vec4 ambient = ambientComponent(color,dirLights[0].ambInt);
            vec4 specular = specularComponent(viewDir,lightDir,normalize(finalNormal),vec4(dirLights[0].color,1.0),10.0);
            vec4 diffuse = diffuseComponent(lightDir,finalNormal,color);
            
            outColor = ((specular * ambient + diffuse) * (1.0 - isShadow) + ambient) * color;
            
            
            //gl_FragColor = lightPass(dirLights[0],color,finalNormal,uView, vPos,isShadow);
            //gl_FragColor = vec4(finalNormal,1.0);
        }
        vec3 sx = vFanalinoFragPosSX.xyz / vFanalinoFragPosSX.w;
        vec3 dx = vFanalinoFragPosDX.xyz / vFanalinoFragPosDX.w;
        vec2 texCoordsDX = ((dx.xy) + 0.5) * 0.5;
        vec2 texCoordsSX = ((sx.xy) + 0.5) * 0.5;
        float depthSamplingSX = texture2D(uDepthSX,texCoordsSX).r;
        float isLit = shadowSampling(vFanalinoFragPosSX,uDepthSX,0.0005);
           
      //  /*
      //  if(vFanalinoFragPos.w >= 0.0 && vFanalinoFragPos.z <= 20.0 && fColor.a > 0.0){
      //      gl_FragColor = vec4(fColor.rgb,1.0);
      //  }
      //  */
      vec4 fColorSX = texture2D(uFanalino,texCoordsSX);
      vec4 fColorDX = texture2D(uFanalino,texCoordsDX);
        if(inRange(texCoordsSX) && (vFanalinoFragPosSX.w >= 0.0 && fColorSX.a > 0.0) && isLit == 0.0) {
            outColor += fColorSX * 0.5;
        }
        if(inRange(texCoordsDX) && (vFanalinoFragPosDX.w >= 0.0 && fColorDX.a > 0.0) && false){
            outColor += fColorDX * 0.5; 
        }
        gl_FragColor = vec4(outColor.rgb,1.0);
    }
`