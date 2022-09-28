class Input{
    constructor(c){
        this.keys = []
        this.canvas = c.gl.canvas
        this.startX = 0
        this.startY = 0
        this.yaw = 0
        this.pitch = 0
        window.addEventListener("keydown",(event) => {
            this.keys[event.key] = true
            event.preventDefault()
        })

        window.addEventListener("keyup",(event) => {
            this.keys[event.key] = false
            event.preventDefault()
        })

    }
    setMouseUpEvent(fun){
        this.canvas.addEventListener("mouseup",fun,false)
    }
    setMouseDownEvent(fun){
        this.canvas.addEventListener("mousedown",fun,false)
    }
    setMouseMoveEvent(fun){
        this.canvas.addEventListener("mousemove",fun,false)
    }
    getKeyStatus(key = 'e'){
        return this.keys[key]
    }
}