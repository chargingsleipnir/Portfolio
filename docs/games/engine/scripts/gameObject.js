
function GameObject(name, label) {
    this.name = name;
    this.label = label;
    this.active = true;

    this.parent = null;
    this.children = [];
    this.components = [];
    this.loopCalls = [];

    this.trfmBase = new Transform();
    this.trfmOffset = new Transform();
    this.trfmGlobal = new Transform();

    this.shapeData = new AAShapeData3D();
}
GameObject.prototype = {
    AddChild: function(gameObject) {
        /// <signature>
        ///  <summary>Add a gameObject as a child of the caller</summary>
        ///  <param name="gameObject" type="GameObject">child GameObject to add</param>
        ///  <returns type="void" />
        /// </signature>
        gameObject.parent = this;
        this.children.push(gameObject);
    },
    RemoveChild: function(name) {
        /// <signature>
        ///  <summary>Remove a gameObject from the child list of the caller</summary>
        ///  <param name="name" type="string">name of child object</param>
        ///  <returns type="void" />
        /// </signature>
        //var index = this.children.indexOf(name);
        //this.children.splice(index - 1, 1);
    },
    RemoveChildren: function() {
        /// <signature>
        ///  <summary>Remove all gameObject children from the caller</summary>
        ///  <returns type="void" />
        /// </signature>
        this.children = [];
    },
    /* This will act as a component factory so as to give control of the component
     to the gameobject, as well as having it listed for easy updating */
    AddComponent: function(component) {
        /// <signature>
        ///  <summary>Add a component to the game object</summary>
        ///  <param name="component" type="enum">component to add</param>
        ///  <returns type="void" />
        /// </signature>
        if(component == Components.camera) {
            this.camera = new Camera(this.trfmGlobal);
        }
        else if (component == Components.rigidBody) {
            this.rigidBody = new RigidBody(this.trfmBase, this.shapeData.radius);
            if(this.collider)
                this.collider.SetRigidBody(this.rigidBody);
            this.components.push(this.rigidBody);
        }
        else if (component == Components.collisionSystem) {
            this.collider = new CollisionSystem(this.shapeData, this);
            if(this.rigidBody)
                this.collider.SetRigidBody(this.rigidBody);
            this.components.push(this.collider);
        }
        else if (component == Components.particleSystem) {
            this.ptclSys = new ParticleSystem(this.trfmGlobal);
            this.components.push(this.ptclSys);
        }
    },
    RemoveComponent: function(name) {
        /// <signature>
        ///  <summary>Remove a component from the child list of the caller</summary>
        ///  <param name="name" type="string">name of componemt</param>
        ///  <returns type="void" />
        /// </signature>
        //var index = this.children.indexOf(name);
        //this.children.splice(index - 1, 1);
    },
    RemoveComponents: function() {
        /// <signature>
        ///  <summary>Remove all component children from the caller</summary>
        ///  <returns type="void" />
        /// </signature>
        this.components = [];
    },
    AddLoopCall: function(Callback) {
        /// <signature>
        ///  <summary>Script must have Initialize(gameObject) and Update() functions</summary>
        ///  <param name="Callback" type="function"></param>
        ///  <returns type="void" />
        /// </signature>
        this.loopCalls.push(Callback);
    },
    RemoveLoopCall: function(index) {
        this.loopCalls.splice(index, 1);
    },
    SetModel: function(model, showShdrStr = false, shaderData = null) {
        /// <signature>
        ///  <summary>Add model to gameobject. Required before several components can be added</summary>
        ///  <param name="model" type="object">JSON import or Primitive model</param>
        ///  <returns type="void" />
        /// </signature>
        this.model = model;
        // Make sure the correct set of vertices are being centred.
        var vertData = ModelUtils.SelectVAOData(this.model.vertices);
        this.shapeData = GeomUtils.GetShapeData3D(vertData.posCoords, true);

        this.mdlHdlr = new ModelHandler(this.model, this.trfmGlobal, this.shapeData.radius, showShdrStr, shaderData);
        /*
        if(this.model.materials[0]) {
            if(this.model.materials[0].mirr.refl > 0.0) {
                var reflectionCams = [];
                for(var i = 0; i < 6; i++) {
                    reflectionCams[i] = new Camera();
                    // The "dir" parameter takes the Dir enum values, which are 0 - 5 anyway, so using i within loop
                    reflectionCams[i].AsReflectiveCam(this.trfmGlobal.pos, i);
                    this.components.push(reflectionCams[i]);
                }
                this.mdlHdlr.SetReflectionCams(reflectionCams);
            }
        }
        */
        if(this.collisionSystem) {
            this.collisionSystem.ResizeBoundingShapes(this.shapeData);
        }
    },
    SetActive: function(boolActive) {
        this.trfmBase.SetDefault();
        this.trfmGlobal.SetDefault();
        if(this.mdlHdlr)
            this.mdlHdlr.active = boolActive;
        for (var i in this.components)
            this.components[i].SetActive(boolActive);
    },
    Destroy: function() {

    },
    Update: function() {
        /// <signature>
        ///  <summary>Update all components, children, and their children</summary>
        ///  <param name="trfmParentGlobal" type="Transform">The transform data of the parent</param>
        ///  <returns type="void" />
        /// </signature>

        // GLOBAL UPDATING
        // Note that the values are being used directly, not the Transform functions.
        // Not using any kind of offset scaling

        if(this.trfmBase.IsChanging || this.trfmOffset.IsChanging() || this.parent.trfmGlobal.active) {

            this.trfmGlobal.SetPosByVec(
                this.parent.trfmGlobal.pos.GetAdd(
                    this.parent.trfmGlobal.rot.GetMultiplyVec3(this.trfmBase.pos).SetAdd(
                        this.trfmOffset.rot.GetMultiplyVec3(this.trfmOffset.pos))));

            this.trfmGlobal.SetRotByQuat(
                this.parent.trfmGlobal.rot.GetMultiplyQuat(
                    this.trfmBase.rot.GetMultiplyQuat(this.trfmOffset.rot)));

            this.trfmGlobal.SetScaleByVec(
                this.parent.trfmGlobal.scale.GetScaleByVec(this.trfmBase.scale));
        }

        if (this.mdlHdlr && this.trfmGlobal.active)
            this.mdlHdlr.drawSphere.radius = this.shapeData.radius * this.trfmGlobal.GetLargestScaleValue();

        // Scripts first?? Sure...
        for (var i in this.loopCalls)
            this.loopCalls[i]();

        // Put this into movement check? Could work out.
        for (var i in this.components)
            if(this.components[i].active)
                this.components[i].Update();

        for (var i in this.children) {
            // Have each gameObject hold it's own model matrix, and multiply each childs matrix into it's parents.
            // Hopefully this will create relative child transformations
            //this.children[i].transform.SetParentMatrix(this.transform.matrix_Model);
            this.children[i].Update();
        }
    }
};