//Shadow includes
var shIncludes = {
    "#include(dirShadow)" : `
         //Frag position light space
        float shadowSampling(vec4 fragPosLS){
            return 0.0;
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
            float specular = max(pow(dot(N,Halfway),25.0),0.0);
            float shadowValue = shadow;
            vec4 specularComp = specular * diffuseComp * vec4(light.color,1.0);
            
            vec4 outputC = (1.0 - shadowValue) * (specularComp + diffuseComp) + ambientComp;
            return outputC;
        }
    `
}