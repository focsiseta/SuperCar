class Camera extends Transformations{
    constructor(position = [0,0,5],gimbalType = Transformations.gimbalT.XYZ) {
        super(gimbalType)
        //Position is used only to save the first position of the camera itself, for camera position use getCameraPosition
        this.speed = 0.3
        this.resetPosition = position
        //euler rotation (careful about gimbal lock)
        //this.viewMatrix = glMatrix.mat4.create()
        this.translate(this.resetPosition)
        this.update()
        this.transformationMatrix = this.getTransformation()
    }
// method for passing the inverted viewFrame to the shader
    getViewMatrix(){
        this.update()
        var tmp = glMatrix.mat4.create()
        //glMatrix.mat4.mul(tmp,this.translationMatrix,this.rotationMatrix)
        glMatrix.mat4.invert(tmp,this.frame)
        return tmp
    }
    resetCamera(){
        this.rotationMatrix = glMatrix.mat4.create()
        this.scaleMatrix = glMatrix.mat4.create()
        this.translationMatrix = glMatrix.mat4.create()
        this.viewMatrix = glMatrix.mat4.create()
        this.alpha=0
        this.beta=0
        this.gamma=0
        this.translate(this.resetPosition)
    }

    getCameraPosition(){
        var matrix = this.frame
        return [matrix[12],matrix[13],matrix[14]]
    }
    getCameraDirection(){
        var matrix = this.frame
        //d vector
        return [matrix[8],matrix[9],matrix[10]]
        //glMatrix.vec3.normalize(this.direction,this.direction)


    }

    processInput(inputHandler) {
        /*
        il cross product e' invertito perche' per come funziona la telecamera e' il mondo che ci
        viene incontro quindi se deve sembrare che stiamo andando a sinistra,il mondo andra' alla nostra destra

        Stesso principio si applica per quando si va avanti o indietro
        Per andare avanti il mondo si sta spostando vicino a noi, mantre tornare indietro il mondo si deve allontanare

        Sottosopra il verso di destra e sinistra viene invertito, cercare di sistemare questo problema con una
        flag per invertire  vorrebbe dire che dopo una certo angolo di rotazione Z dovremmo cambiare il verso e questo
        puo' non essere sempre la soluzione piu' corretta
        */

        /*funzione ausiliaria per mantenere il codice pulito: esegue il corpo degli if nei casi della traslazione
        a,b,c sono gli elementi da estrarre dalla matrice nelle operazioni, flag se va invertito il segno della velocità*/

        var rotation = glMatrix.quat.create()
        let translationOps = (a,b,c,flag) => {
            let tmp = glMatrix.mat4.create()
            glMatrix.mat4.invert(tmp,this.getViewMatrix())
            let vector = glMatrix.vec3.fromValues(tmp[a],tmp[b],tmp[c])
            glMatrix.vec3.scale(vector,vector,flag?-this.speed:this.speed)

            this.translate(vector)
        }

        if(inputHandler.getKeyStatus('w') === true) {translationOps(8,9,10, true)}
        if(inputHandler.getKeyStatus('s') === true) {translationOps(8,9,10,false)}
        if(inputHandler.getKeyStatus('a') === true) {translationOps(0,1,2,  true)}
        if(inputHandler.getKeyStatus('d') === true) {translationOps(0,1,2, false)}

        if(inputHandler.getKeyStatus('i') === true){this.lRotateAlpha(gradToRad( 2))}
        if(inputHandler.getKeyStatus('k') === true){this.lRotateAlpha(gradToRad(-2))}

        if(inputHandler.getKeyStatus('l') === true){this.lRotateBeta(gradToRad(-2))}
        if(inputHandler.getKeyStatus('j') === true){this.lRotateBeta(gradToRad( 2))}

        if(inputHandler.getKeyStatus('n') === true){this.lRotateGamma(gradToRad( 2))}
        if(inputHandler.getKeyStatus('m') === true){this.lRotateGamma(gradToRad(-2))}

        /*if(inputHandler.getKeyStatus('u') === true){
            this.translate([0,0.05,0])
        }*/
        /*if(inputHandler.getKeyStatus('h') === true){
            this.translate([0,-0.05,0])
        }*/



        if(inputHandler.getKeyStatus('p') === true){
            this.getCameraPosition()
            this.resetCamera()
        }

    }
}

class ChaseCamera{
    constructor(position = [0,1,-1],toChase = [0,0,0],referenceDrawable = null) {
        this.position = position
        this.up = [0,1,0]
        this.toChase = toChase
        this.refDrawable = referenceDrawable
        this.viewMatrix = glMatrix.mat4.create()
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
        //let front = glMatrix.vec3.sub([],this.toChase,this.position)
        return glMatrix.mat4.lookAt(this.viewMatrix, position, toChase, [0, 1, 0])

    }
    getPosition(){
        let viewMatrix = glMatrix.mat4.invert([],this.viewMatrix)
        return [viewMatrix[12],viewMatrix[13],viewMatrix[14]]
    }
    moveDrawable(handler,speed){
        if(this.refDrawable !== null){
            let matrix = this.refDrawable.getFrame()
            let front = glMatrix.vec3.scale([],[matrix[8],matrix[9],matrix[10]],0.5)
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
class QuadCamera {
    //Camera up needs to be orthogonal to orientation
    constructor(position = [0, 0, -1], speed = 0.2, yaw = -90, pitch = 0) {
        this.position = position
        this.resetPosition = position
        this.upQuat = glMatrix.quat.fromValues(0, 1, 0, 0)
        this.up = [0, 1, 0]
        this.resetUp = this.up
        this.yaw = yaw
        this.accYaw = yaw
        this.pitch = pitch
        this.accPitch = pitch
        this.front = [0, 0, -1]
        this.right = glMatrix.vec3.cross([], this.front, this.up)
        this.frontQuat = glMatrix.quat.fromValues(0, 0, -1, 0)
        this.rightQuat = glMatrix.quat.fromValues(...this.right, 0)
        this.viewMatrix = glMatrix.mat4.create()
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
    getPosition(){
        let viewMatrix = glMatrix.mat4.invert([],this.viewMatrix)
        return [viewMatrix[12],viewMatrix[13],viewMatrix[14]]
    }
    getViewMatrix() {
        let center = [
            this.position[0] + this.front[0],
            this.position[1] + this.front[1],
            this.position[2] + this.front[2]]
        return glMatrix.mat4.lookAt(this.viewMatrix, this.position, center, this.up)
    }

    processInput(handler) {
        if (handler.getKeyStatus('w') || handler.getKeyStatus('W')) {
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(), this.front, this.speed)
            this.position = glMatrix.vec3.add(this.position, this.position, step)

        }
        if (handler.getKeyStatus('s') || handler.getKeyStatus('S')) {
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(), this.front, -this.speed)
            this.position = glMatrix.vec3.add(this.position, this.position, step)

        }
        if (handler.getKeyStatus('a') || handler.getKeyStatus('A')) {
            this.right = glMatrix.vec3.cross(this.right, this.front, this.up)
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(), this.right, -this.speed)
            this.position = glMatrix.vec3.add(this.position, this.position, step)

        }
        if (handler.getKeyStatus('d') || handler.getKeyStatus('D')) {
            this.right = glMatrix.vec3.cross(this.right, this.front, this.up)
            let step = glMatrix.vec3.scale(glMatrix.vec3.create(), this.right, this.speed)
            this.position = glMatrix.vec3.add(this.position, this.position, step)

        }
        if (handler.getKeyStatus('i')) {
            this.pitch += gradToRad(this.speed)
            let rotation = glMatrix.quat.setAxisAngle([], this.right, this.pitch)
            glMatrix.quat.normalize(rotation, rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front, this.front, matrix)
            this.right = glMatrix.vec3.cross(this.right, this.front, this.up)
            this.accPitch += this.pitch

        }
        if (handler.getKeyStatus('k')) {
            this.pitch -= gradToRad(this.speed)
            let rotation = glMatrix.quat.setAxisAngle([], this.right, this.pitch)
            glMatrix.quat.normalize(rotation, rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.right = glMatrix.vec3.cross(this.right, this.front, this.up)
            this.front = glMatrix.vec3.transformMat3(this.front, this.front, matrix)

        }
        if (handler.getKeyStatus('j')) {
            this.yaw += gradToRad(this.speed)
            let rotation = glMatrix.quat.setAxisAngle([], this.up, this.yaw)
            glMatrix.quat.normalize(rotation, rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front, this.front, matrix)

        }
        if (handler.getKeyStatus('l')) {
            this.yaw -= gradToRad(this.speed)
            let rotation = glMatrix.quat.setAxisAngle([], this.up, this.yaw)
            glMatrix.quat.normalize(rotation, rotation)
            let matrix = QuatOp.mat3FromQuat(rotation)
            this.front = glMatrix.vec3.transformMat3(this.front, this.front, matrix)

        }
        this.yaw = 0
        this.pitch = 0

        //this.update()

    }
}

