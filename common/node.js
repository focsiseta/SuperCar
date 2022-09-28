class Node {
    static nodeList = []
    static counter = 0
    constructor(drawable = null,shader) {
        this.nodeID = "Node_"+ Node.counter
        if(drawable == null){
            console.log("Can't pass null drawable")
            return
        }
        this.drawable = drawable
        this.shape = this.drawable.shape
        //for now I think we will need only nodes with a drawable
        Node.nodeList.push(this)
        this.shader = shader
        this.leafs = []
        this.subNodes = null
        this.rootNode = null
        Node.counter++

    }
    calc(){
        Node.recCalc(this,glMatrix.mat4.create(),this.drawable.getDirty())
    }
    static recCalc(node,acc,dirty){
        node.drawable.update()
        acc = node.drawable.getFrame()
        node.leafs.forEach((leafNode) =>{
            let wasDirty = leafNode.drawable.getDirty()
            leafNode.drawable.update()
            leafNode.drawable.setFatherFrame(acc)
            Node.recCalc(leafNode,acc,wasDirty)
        })
    }
    drawFromNode(){
        Node.recDraw(this)
    }
    static recDraw(node){
        node.shader.draw(node.drawable)
        node.leafs.forEach((leaf) =>{
            Node.recDraw(leaf)
        })
    }
    drawFromNodeDifferentShader(shader){
        Node.recDrawDiffShader(shader,this)
    }
    static recDrawDiffShader(shader,node){
        shader.draw(node.drawable)
        node.leafs.forEach((leaf) => {
            Node.recDrawDiffShader(shader,leaf)
        })
    }

    DrawableAsLeaf(drawable){
        if(drawable == null){
            console.log("Can't pass null drawable")
            return
        }
        var returnNode = new Node(drawable,this.shader)
        this.leafs.push(returnNode)
        return returnNode
    }
    DrawableAsLeafAndShader(drawable,shader){
        if(drawable == null){
            console.log("Can't pass null drawable")
            return
        }
        var returnNode = new Node(drawable,shader)
        this.leafs.push(returnNode)
        return returnNode

    }
    // recover Node tree
    recoverNTree(){
        this.subNodes = Node.recRDT(this,[])
        this.subNodes.forEach((node) =>{
            node.rootNode = this
        })
        console.log(this.subNodes)
    }
    static recRDT(node,acc = []){
        if(node == null){
            console.log("Can't recover nodes")
            return
        }
        acc.push(node)
        node.leafs.forEach((leaf) =>{
            Node.recRDT(leaf,acc)
        })
        return acc
    }
    /*
    transformationCalc(){
        if(this.drawable != null){
            Node.recTransformCalc(this,this.drawable.frame,this.drawable.getDirty())
        }
    }
    static recTransformCalc(node,acc,flag){

        if(node == null || node.drawable == null){
            return
        }
        if(flag)
            node.drawable.update()

        node.leafs.forEach((leafNode) =>{
            var wasDirty = leafNode.drawable.getDirty()
            leafNode.drawable.setFatherFrame(acc)
            Node.recTransformCalc(leafNode,leafNode.drawable.frame,wasDirty)
        })

    }
     */

}