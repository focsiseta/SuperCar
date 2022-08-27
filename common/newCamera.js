//chaseCamera
class ChaseCamera{
    constructor(position = [0,1,-1],toChase = [0,0,0],referenceDrawable = null) {
        this.position = position
        this.up = [0,1,0]
        this.toChase = toChase
        this.refDrawable = referenceDrawable
        if(this.refDrawable === null){
            this.refSpace = glMatrix.mat4.create()

        }else{
            this.refSpace = this.refDrawable.getFrame()

        }
        //this.front = glMatrix.vec3.sub([],toChase,position)
    }
    getViewMatrix(){
        if(this.refDrawable !== null){
            this.refSpace = this.refDrawable.getFrame()
        }
        let position = glMatrix.vec3.transformMat4([],this.position,this.refSpace)
        let toChase = glMatrix.vec3.transformMat4([],this.toChase,this.refSpace)
        let front = glMatrix.vec3.sub([],this.toChase,this.position)
        let matrix = glMatrix.mat4.lookAt([],position,toChase,[0,1,0])
        return matrix//glMatrix.mat4.invert(matrix,matrix)

    }
    moveDrawable(handler,speed){
        if(this.refDrawable !== null){
            let matrix = this.refDrawable.getFrame()
            let front = glMatrix.vec3.scale([],[matrix[8],matrix[9],matrix[10]],0.1)
            if(handler.getKeyStatus("w")){
                glMatrix.vec3.scale(front,front,speed)
                this.refDrawable.translate(front)
                this.refDrawable.update()
            }
            if(handler.getKeyStatus("d")){
                this.refDrawable.wRotateY(gradToRad(1))
                this.refDrawable.update()
            }
            if(handler.getKeyStatus("a")){
                this.refDrawable.wRotateY(gradToRad(-1))
                this.refDrawable.update()
            }
        }
        //this.refDrawable.update()
    }

}




/*
attempt to create a quaternion camera
*/
class NewCamera{
    //Camera up needs to be orthogonal to orientation
    constructor(position = [0,0,-1],speed = 0.2,yaw = -90,pitch = 0) {
            this.position = position
            this.resetPosition = position
            this.upQuat = glMatrix.quat.fromValues(0,1,0,0)
            this.up = [0,1,0]
            this.resetUp = this.up
            this.yaw = yaw
            this.accYaw = yaw
            this.pitch = pitch
            this.accPitch = pitch
            this.front = [0,0,-1]
            this.right = glMatrix.vec3.cross([],this.front,this.up)
            this.frontQuat = glMatrix.quat.fromValues(0,0,-1,0)
            this.rightQuat = glMatrix.quat.fromValues(...this.right,0)
            this.speed = speed
    }
    /*
    update(){
        let rotX = QuatOp.rotationAroundAxis(this.up,-this.yaw)
        let rotY = []
        if(this.accPitch >= 89 || this.accPitch <= -89){
            rotY = QuatOp.rotationAroundAxis(this.right,0)
        }else{
            rotY = QuatOp.rotationAroundAxis(this.right,this.pitch)
        }

        let mrX = QuatOp.mat3FromQuat(rotX)
        let mrY = QuatOp.mat3FromQuat(rotY)
        this.up = glMatrix.vec3.transformMat3(this.up,this.up,mrX)
        let matrix = glMatrix.mat3.multiply([],mrX,mrY)
        this.front = glMatrix.vec3.transformMat3(this.front,this.front,matrix)
        this.yaw = 0
        this.pitch = 0
    }

     */
    getViewMatrix(){
        let center = [
            this.position[0] + this.front[0],
            this.position[1] + this.front[1],
            this.position[2] + this.front[2]]
        return glMatrix.mat4.lookAt(glMatrix.mat4.create(),this.position,center,this.up)
    }
    processInput(handler){
        if(handler.getKeyStatus('w') || handler.getKeyStatus('W')){
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(),this.front,this.speed)
            this.position = glMatrix.vec3.add(this.position,this.position,step)

        }
        if(handler.getKeyStatus('s') || handler.getKeyStatus('S')){
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(),this.front,-this.speed)
            this.position = glMatrix.vec3.add(this.position,this.position,step)

        }
        if(handler.getKeyStatus('a') || handler.getKeyStatus('A')){
            this.right = glMatrix.vec3.cross(this.right,this.front,this.up)
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(),this.right,-this.speed)
            this.position = glMatrix.vec3.add(this.position,this.position,step)

        }
        if(handler.getKeyStatus('d') || handler.getKeyStatus('D')){
            this.right = glMatrix.vec3.cross(this.right,this.front,this.up)
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(),this.right,this.speed)
            this.position = glMatrix.vec3.add(this.position,this.position,step)

        }
        if(handler.getKeyStatus('i')){
            this.pitch += gradToRad( this.speed)
            let rotation = glMatrix.quat.setAxisAngle([],this.right,this.pitch)
            glMatrix.quat.normalize(rotation,rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front,this.front,matrix)
            this.accPitch += this.pitch

        }
        if(handler.getKeyStatus('k')){
            this.pitch -= gradToRad( this.speed)
            let rotation = glMatrix.quat.setAxisAngle([],this.right,this.pitch)
            glMatrix.quat.normalize(rotation,rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front,this.front,matrix)

        }
        if(handler.getKeyStatus('j')){
            this.yaw += gradToRad(this.speed)
            let rotation = glMatrix.quat.setAxisAngle([],this.up,this.yaw)
            glMatrix.quat.normalize(rotation,rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front,this.front,matrix)

        }
        if(handler.getKeyStatus('l')){
            this.yaw -= gradToRad(this.speed)
            let rotation = glMatrix.quat.setAxisAngle([],this.up,this.yaw)
            glMatrix.quat.normalize(rotation,rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front,this.front,matrix)

        }
        this.yaw = 0
        this.pitch = 0

        //this.update()


    }

}