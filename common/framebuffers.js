class Framebuffers{
    /*
    constructor(width, height,gl) {
        this.gl = gl
        this.depthTexture = gl.createTexture();
        //gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // create a color texture of the same size as the depth texture
        this.colorTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // attach it to the framebuffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.CLAMP_TO_EDGE, this.colorTexture, 0);

        //gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

    }

     */


    constructor(gl){
        this.framebuffer = gl.createFramebuffer()
        this.renderBuffer = gl.createRenderbuffer()
        this.textureBuffer = gl.createTexture()
        this.gl = gl
    }

    static renderTarget(gl,w,h) {
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
        return fbo
    }

    static shadowMap(gl,w,h){
        let fbo = new Framebuffers(gl)
        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo.framebuffer)
        gl.bindTexture(gl.TEXTURE_2D, fbo.textureBuffer)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);

        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)

        gl.bindFramebuffer(gl.FRAMEBUFFER,fbo.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, fbo.textureBuffer, 0);

        //Dobbiamo dire a WebGL che non facciamo il rendering dei colori su questo framebuffer e cio' si fa con
        gl.bindFramebuffer(gl.FRAMEBUFFER,null)
        return fbo


    }


    bindFramebuffer(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer)
        //this.gl.viewport(0,0,this.w,this.h)
    }

    unbindFramebuffer(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.framebuffer)
    }
}