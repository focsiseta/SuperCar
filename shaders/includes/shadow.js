//Shadow includes
var shIncludes = {
    "#include(dirShadow)" : `
         //Frag position light space
        float shadowSampling(vec4 fragPosLS,sampler2D shadowSamp,float bias){
            //Normalizziamo cosi' le coordinate sono in range -1~1
            vec3 projCoords = fragPosLS.xyz / fragPosLS.w;
            //Porto il range da -1~1 a 0~1 per poter fare il sampling
            projCoords = projCoords * 0.5 + 0.5;
            float closestDepth = texture2D(shadowSamp,projCoords.xy).r;
            float currentDepth = projCoords.z;
            return ((currentDepth - bias) >= closestDepth) ? 1.0 : 0.0;
        }
        float fanalinoSampling(vec4 fragPosLS,sampler2D shadowSamp,float bias){
            //Normalizziamo cosi' le coordinate sono in range -1~1
            vec3 projCoords = fragPosLS.xyz / fragPosLS.w;
            //Porto il range da -1~1 a 0~1 per poter fare il sampling
            projCoords = projCoords * 0.5 + 0.5;
            float closestDepth = texture2D(shadowSamp,projCoords.xy).r;
            float currentDepth = projCoords.z;
            return ((currentDepth - bias) < closestDepth) ? 1.0 : 0.0;
        }
        //vec4 
        
        vec4 lightPass(DirLight light,vec4 color,vec3 normal,vec3 cameraPos,vec3 fragPos,float shadow){
            vec3 lightDir = normalize(-light.dir);
            vec3 N = normalize(normal);
            vec3 viewDir = normalize(cameraPos - fragPos);
            
            vec4 ambientComp = color * light.ambInt;
            float diffuse = max(dot(N,lightDir),0.0);
            vec4 diffuseComp = color * diffuse;
            
            vec3 Halfway = normalize(lightDir + viewDir);
            float specular = max(pow(dot(N,Halfway),64.0),0.3);
            float shadowValue = shadow;
            vec4 specularComp = specular * vec4(light.color,1.0) * diffuse;
            
            vec4 outputC = ((specularComp + diffuseComp) * (1.0 - shadowValue) + ambientComp) * color;
            return vec4(outputC.rgb,1.0);
        }
    `
}

var lightCalcs = {
    "#include(lightcalcs)" : `
    
        vec4 specularComponent(vec3 viewDir,vec3 lightDir,vec3 normal,vec4 lightColor,float power){
            vec3 H = normalize(lightDir + viewDir);
            float specular = max(pow(dot(H,normal),power),0.3);
            return vec4((specular * lightColor).rgb,1.0);
        }
        
        vec4 diffuseComponent(vec3 lightDir,vec3 normal,vec4 diffuseColor){
            float diffuse = max(dot(normal,lightDir),0.2);
            return vec4((diffuse * diffuseColor).rgb,1.0);
        }
        
        vec4 ambientComponent(vec4 color, float ambIntensity){
            return vec4((color * ambIntensity).rgb,1.0); 
        }
        
    `
}
