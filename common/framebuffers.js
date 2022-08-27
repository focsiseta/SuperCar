class Framebuffers{


    constructor(gl){
        this.framebuffer = gl.createFramebuffer()
        this.renderBuffer = gl.createRenderbuffer()
        this.textureBuffer = gl.createTexture()
        this.gl = gl
    }

    static renderTarget(h,w,gl) {
        let fbo = new Framebuffers(gl)
        //this.framebuffer = gl.createFramebuffer()
        //this.texture = gl.createTexture()
        //this.depthbuffer = gl.createRenderbuffer()
        gl.bindTexture(gl.TEXTURE_2D,fbo.textureBuffer)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,fbo.textureBuffer,0)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,fbo.renderBuffer)
        if(gl.FRAMEBUFFER_COMPLETE !== gl.checkFramebufferStatus(gl.FRAMEBUFFER))
            console.log("error building framebuffer")
        gl.bindFramebuffer(gl.FRAMEBUFFER,null)
        gl.bindTexture(gl.TEXTURE_2D,null)
        gl.bindRenderbuffer(gl.RENDERBUFFER,null)
    }

    static shadowMap(gl,w,h){
        let fbo = new Framebuffers(gl)
        gl.bindTexture(gl.TEXTURE_2D, fbo.textureBuffer)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,w,h,0,gl.DEPTH_COMPONENT,gl.FLOAT,null)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT)

        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,fbo.textureBuffer,0)

        //Dobbiamo dire a WebGL che non facciamo il rendering dei colori su questo framebuffer e cio' si fa con
        gl.drawBuffers(gl.NONE)
        gl.readBuffer(gl.NONE)
        gl.bindFramebuffer(gl.FRAMEBUFFER,null)


    }

    bindFramebuffer(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer)
        //this.gl.viewport(0,0,this.w,this.h)
    }

    unbindFramebuffer(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer)
    }
}