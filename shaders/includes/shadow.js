//Shadow includes
var shIncludes = {
    "#include(dirShadow)" : `
         //Frag position light space
        float shadowSampling(vec4 fragPosLS,sampler2D shadowSamp){
            //Normalizziamo cosi' le coordinate sono in range -1~1
            vec3 projCoords = fragPosLS.xyz / fragPosLS.w;
            //Porto il range da -1~1 a 0~1 per poter fare il sampling
            projCoords = projCoords * 0.5 + 0.5;
            float closestDepth = texture2D(shadowSamp,projCoords.xy).r;
            float currentDepth = projCoords.z;
            float bias = 0.001;
            return ((currentDepth - bias) > closestDepth) ? 1.0 : 0.0;
        }
        //TODO new approach where sampling occurs outside of the light calc functions
        vec4 shadowPass(DirLight light,vec4 color,vec3 normal,vec3 cameraPos,vec3 fragPos,float shadow){
            vec3 lightDir = normalize(-light.dir);
            vec3 N = normalize(normal);
            vec3 viewDir = normalize(cameraPos - fragPos);
            
            vec4 ambientComp = color * light.ambInt;
            float diffuse = max(dot(N,lightDir),0.0);
            vec4 diffuseComp = color * diffuse;
            
            vec3 Halfway = normalize(lightDir + viewDir);
            float specular = max(pow(dot(N,Halfway),1.0),0.0);
            float shadowValue = shadow;
            vec4 specularComp = specular * diffuseComp;
            
            vec4 outputC = ((specularComp + diffuseComp) * (1.0 - shadowValue) + ambientComp) * color;
            return vec4(outputC.rgb,1.0);
        }
    `
}