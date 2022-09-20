const parallax_vs =
    `#version 300 es
    
    in vec3 aPos;
    in vec3 aNormal;
    in vec3 aTangent;
    in vec2 aTex;
    
    uniform vec3 uLightPos;
    uniform vec3 uCameraPos;
    
    uniform mat4 uProj;
    uniform mat4 uView;
    uniform mat4 uM;
    //uniform mat4 uLightMatrix;
    
    
    out vec4 vFragPos;
    out vec3 tLightPos;
    out vec3 tCameraPos;
    out vec3 tFragPos;
    out vec2 vTex;
    
    out mat3 vTBN;
    //out vec4 vLightFragPos;
    
    
    
    void main(){
        vFragPos = uM * vec4(aPos,1.0);
        vTex = aTex;
        vec3 T = normalize(mat3(uM) * aTangent);
        vec3 N = normalize(mat3(uM) * aNormal);
        vec3 B = cross(N,T);
        B = normalize(B);
        mat3 toTangent = inverse(mat3(T,B,N));
        vTBN = toTangent;
        tLightPos = toTangent * uLightPos;
        tCameraPos = toTangent * uCameraPos;
        tFragPos = toTangent * vec3(vFragPos);
        
        gl_Position = uProj * uView * vFragPos;
    
    }`

const parallax_fs =
    `#version 300 es
    precision highp float;
    #include(parallax)
        in vec4 vFragPos;
        in vec3 tLightPos;
        in vec3 tCameraPos;
        in vec3 tFragPos;
        in vec2 vTex;
        in mat3 vTBN;
        
        uniform sampler2D uAlbedo;
        uniform sampler2D uNormal;
        uniform sampler2D uDisp;
        
        uniform float scaleFactor;
        
        
        out vec4 outColor;
        
    void main(){
        
        vec3 viewDir = normalize(tFragPos - tCameraPos);
        vec3 lightDir = normalize(-tLightPos);
        //Parallaxed texCoords
        vec2 texCoords = vTex;
    
        texCoords = parallaxMapping(uDisp,vTex, viewDir,scaleFactor);
        if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0){
            discard;       
        }
        vec4 color = texture(uAlbedo,texCoords);
        vec3 sNormal = texture(uNormal,texCoords).xyz; //29
        sNormal = normalize(sNormal * 2.0 - 1.0);
        vec4 ambient = color * 0.3;
        
        float diffuseC = max(dot(lightDir,sNormal),0.5);
        vec4 diffuse = diffuseC * color;
        
        
        vec3 halfway = normalize(lightDir + viewDir);
        float specC = pow(max(dot(sNormal,halfway),0.3),10.0);
        vec4 specular = specC  * vec4(1.0) * ambient;
        //outColor = color;
        vec3 oColor = vec3(specular + diffuse + ambient);
        outColor = vec4(oColor,1.0); 
        //outColor = vec4(sNormal,1.0); 
        
    }`