class ShaderSource{
    static VERT = 0
    static FRAG = 1

    static libList = [ //simple brackets because <> is reserved or something
        `#include()`,
        `#include(dirlight)`,
        `#include(pointlight)`,
        `#include(spotlight)`,
        `#include(structpl)`,
        `#include(structdl)`,
        `#include(dirShadow)`,
        `#include(parallax)`,
        `#include(lightcalcs)`
    ]

    constructor(source = null) {
        this.source = source
        this.parse()

    }
    parse(){
        if(this.source !== null){
            if(this.source.includes(ShaderSource.libList[1])){
                this.source = this.source.replace(ShaderSource.libList[1],DirectionalLight.includeDirectional())
            }
            if(this.source.includes(ShaderSource.libList[2])){
                this.source = this.source.replace(ShaderSource.libList[2],Pointlight.includePointlight())
            }
            if(this.source.includes(ShaderSource.libList[5])){
                this.source = this.source.replace(ShaderSource.libList[5],Pointlight.includePointlight())
            }
            if(this.source.includes(ShaderSource.libList[6])){
                this.source = this.source.replace(ShaderSource.libList[6],shIncludes[ShaderSource.libList[6]])
            }
            if(this.source.includes(ShaderSource.libList[7])){
                this.source = this.source.replace(ShaderSource.libList[7],parIncludes[ShaderSource.libList[7]])
            }
            if(this.source.includes(ShaderSource.libList[8])){
                this.source = this.source.replace(ShaderSource.libList[8],lightCalcs[ShaderSource.libList[8]])
            }
        }
    }
}