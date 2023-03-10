
// COLLISION SPHERE -----------------------------------------

function CollisionSphere(objTrfm, radius) {
    this.trfm = objTrfm
    //this.trfm.offsetRot = objTrfm.rot;
    // Possibly create collision enter, active, and exit events.
    //this.collidingLastFrame = false;
    //this.collidingThisFrame = false;
    Sphere.call(this, this.trfm.pos, radius);
}
CollisionSphere.prototype = new Sphere();
CollisionSphere.prototype.SetScale = function(scalar) {
    this.trfm.SetScaleAxes(scalar, scalar, scalar);
};
CollisionSphere.prototype.GetScaled = function() {
    return this.radius * this.trfm.scale.x;
};
CollisionSphere.prototype.SetOffsetTrans = function(x, y, z) {
    //this.trfm.SetOffsetTransByAxes(x, y, z);
};
CollisionSphere.prototype.IntersectsSphere = function(sphere) {
    var radiiSum = this.GetScaled() + sphere.GetScaled();
    return this.trfm.pos.GetSubtract(sphere.trfm.pos).GetMagSqr() <= radiiSum * radiiSum;
};
CollisionSphere.prototype.Callback = function(collider){};
CollisionSphere.prototype.Update = function(objTrfm) {
    // Must update here to make sure local trfm.pos is updated
    this.trfm.SetPosByVec(objTrfm.pos);
    this.SetScale(objTrfm.GetLargestScaleValue());
};

// COLLISION CAPSULE -----------------------------------------

function CollisionCapsule(obj) {
    this.trfm = obj.trfmGlobal;

    var longAxis = obj.shapeData.GetLongestAxis();
    var axis;
    var radius;
    var halfLength;
    if (longAxis == Axes.x) {
        axis = new Vector3(1.0, 0.0, 0.0);
        radius = obj.shapeData.radii.z;
        if(obj.shapeData.radii.y > obj.shapeData.radii.z)
            radius = obj.shapeData.radii.y;

        halfLength = obj.shapeData.radii.x - radius;
    }
    else if (longAxis == Axes.y) {
        axis = new Vector3(0.0, 1.0, 0.0);
        radius = obj.shapeData.radii.z;
        if(obj.shapeData.radii.x > obj.shapeData.radii.z)
            radius = obj.shapeData.radii.x;

        halfLength = obj.shapeData.radii.y - radius;
    }
    else {
        axis = new Vector3(0.0, 0.0, -1.0);
        radius = obj.shapeData.radii.y;
        if(obj.shapeData.radii.x > obj.shapeData.radii.y)
            radius = obj.shapeData.radii.x;

        halfLength = obj.shapeData.radii.z - radius;
    }

    Capsule.call(this, this.trfm.pos, radius, axis, halfLength, this.trfm.rot);
}
CollisionCapsule.prototype = Capsule.prototype;
/*
CollisionCapsule.prototype.Callback = function(collider){};
CollisionCapsule.prototype.Update = function(objTrfm) {};
 */

// COLLISION DONUT -----------------------------------------

function CollisionDonut(obj) {
    this.trfm = obj.trfmGlobal;

    var longAxis = obj.shapeData.GetLongestAxis();
    var shortAxis = obj.shapeData.GetShortestAxis();
    var planeNorm;
    var radius;
    var planarRadius;
    if (shortAxis == Axes.x) {
        planeNorm = new Vector3(1.0, 0.0, 0.0);
        radius = obj.shapeData.radii.x;
        switch(longAxis) {
            case Axes.y: planarRadius = obj.shapeData.radii.y - radius;
                break;
            case Axes.z: planarRadius = obj.shapeData.radii.z - radius;
                break;
        }
    }
    else if (shortAxis == Axes.y) {
        planeNorm = new Vector3(0.0, 1.0, 0.0);
        radius = obj.shapeData.radii.y;
        switch(longAxis) {
            case Axes.x: planarRadius = obj.shapeData.radii.x - radius;
                break;
            case Axes.z: planarRadius = obj.shapeData.radii.z - radius;
                break;
        }
    }
    else {
        planeNorm = new Vector3(0.0, 0.0, -1.0);
        radius = obj.shapeData.radii.z;
        switch(longAxis) {
            case Axes.x: planarRadius = obj.shapeData.radii.x - radius;
                break;
            case Axes.y: planarRadius = obj.shapeData.radii.y - radius;
                break;
        }
    }

    Donut.call(this, this.trfm.pos, radius, planeNorm, planarRadius, this.trfm.rot);
}
CollisionDonut.prototype = Donut.prototype;
/*
 CollisionDonut.prototype.Callback = function(collider){};
 CollisionDonut.prototype.Update = function(objTrfm) {};
 */

// COLLISION OBB -----------------------------------------

function CollisionBox(objTrfm, radii) {
    this.trfm = objTrfm;
    //this.trfm.scale = objTrfm.scale;
    //this.trfm.offsetRot = objTrfm.rot;
    OBB.call(this, this.trfm.pos, radii, objTrfm.rot);
}
CollisionBox.prototype = new OBB();
CollisionBox.prototype.SetScale = function(x, y, z) {
    this.trfm.SetScaleAxes(x, y, z);
};
CollisionBox.prototype.GetScaled = function() {
    return this.radii.GetScaleByVec(this.trfm.scale);
};
CollisionBox.prototype.SetOffsetTrans = function(x, y, z) {
    //this.trfm.SetOffsetTransByAxes(x, y, z);
};
CollisionBox.prototype.IntersectsOBB = function(box) {

};
CollisionBox.prototype.Callback = function(collider){};
CollisionBox.prototype.Update = function(objTrfm) {
    // Must update here to make sure local trfm.pos is updated
    this.trfm.SetPosByVec(objTrfm.pos);
};



// -----------------------------------------

function CollisionSystem(shapeData, obj) {
    /// <signature>
    ///  <summary>Add collision body to gameobject</summary>
    ///  <param name="shapeData" type="object">Data container describing the object's relative shapeData</param>
    ///  <param name="trfm" type="Transform">Transform of GameObject</param>
    ///  <returns type="CollisionSystem" />
    /// </signature>

    this.gameObj = obj;

    this.trfm = obj.trfmGlobal;

    // Sphere is first tier of detection
    this.collSphere = new CollisionSphere(this.trfm, shapeData.radius);
    // OBB is second tier of detection off the start
    this.collBox = new CollisionBox(this.trfm, shapeData.radii.GetCopy());

    this.active = true;

    this.rigidBody = new RigidBody(new Transform(), 1.0);

    this.suppShapeList = [];
}
CollisionSystem.prototype = {
    AddCollisionShape: function(collisionShapeType, obj) {
        this.suppShapeList.push({
            shapeType: collisionShapeType,
            obj: obj
        });
    },
    SetRigidBody: function(rigidBody) {
        /// <signature>
        ///  <summary>Adding rigidbody will automatically switch detectOnly off and use collision response as well as detection</summary>
        ///  <param name="rigidbody" type="object">physics object to be used in collision response</param>
        ///  <returns type="void" />
        /// </signature>
        this.rigidBody = rigidBody;
    },
    /*
    SetTier1Shape: function(shape) {
        if(shape == BoundingShapes.sphere) {
            this.collSphere = new Sphere();
        }
        else if(shape == BoundingShapes.aabb) {
            this.collSphere = new AABB();
        }
        else if(shape == BoundingShapes.obb) {
            this.collSphere = new OBB();
        }
        else if(shape == BoundingShapes.cylinder) {
            this.collSphere = new Cylinder();
        }
    },
    SetTier2Shape: function(shape) {
        if(shape == BoundingShapes.sphere) {
            this.collSphere = new Sphere();
        }
        else if(shape == BoundingShapes.aabb) {
            this.collSphere = new Sphere();
        }
        else if(shape == BoundingShapes.obb) {
            this.collBox = new OBB();
        }
        else if(shape == BoundingShapes.cylinder) {
            this.collBox = new Cylinder();
        }
    },
    */
    ResizeBoundingShapes: function(shapeData) {
        this.collSphere.radius = shapeData.radius;
        this.collBox.radii.SetCopy(shapeData.radii);
    },
    /* Restricting ability to choose from various shapes for now, while I implement partitioning and phase systems.
    SetBoundingShape: function(shape) {

        var index = GameMngr.models.indexOf(this.activeFrame);

        if (shape == BoundingShapes.collBox) {
            this.activeShape = this.collBox;
            GameMngr.models[index] = this.activeFrame = new ModelHandler(new Primitives.Cube(this.collBox.radii, false), this.shapeData);
        }
        else if (shape == BoundingShapes.sphere) {
            this.activeShape = this.sphere;
            GameMngr.models[index] = this.activeFrame = new ModelHandler(new Primitives.IcoSphere(1, this.sphere.radius), this.shapeData);
        }
        this.activeFrame.MakeWireFrame();
        this.activeFrame.tint.SetValues(1.0, 1.0, 0.0);

        // DO A DM.REPLACEMODEL...
    },
    */
    SetSphereCall: function(Callback) {
        /// <signature>
        ///  <summary>Will be called every frame for every object in the collision area</summary>
        ///  <param name="Callback" type="function">should include collider param which will be the object that entered the collision area</param>
        ///  <returns type="void" />
        /// </signature>
        this.collSphere.Callback = Callback;
    },
    OffsetSpherePosAxes: function(x, y, z) {
        this.collSphere.SetOffsetTrans(x, y, z);
    },
    ScaleSphere: function(scalar) {
        this.collSphere.radius *= scalar;
    },
    SetOBBCall: function(Callback) {
        /// <signature>
        ///  <summary>Will be called every frame for every object in the collision area</summary>
        ///  <param name="Callback" type="function">should include collider param which will be the object that entered the collision area</param>
        ///  <returns type="void" />
        /// </signature>
        this.collBox.Callback = Callback;
    },
    OffsetBoxPosAxes: function(x, y, z) {
        this.collBox.SetOffsetTrans(x, y, z);
    },
    ScaleBox: function(x, y, z) {
        this.collBox.radii.x *= x;
        this.collBox.radii.y *= y;
        this.collBox.radii.z *= z;
    },
    SetActive: function(boolActive) {
        this.active = boolActive;
        if(!boolActive){
            //this.collSphere.trfm.SetDefault();
            //this.collBox.trfm.SetDefault();

            //this.collSphere.SetActive(boolActive);
            //this.collBox.SetActive(boolActive);
        }
    },
    Update: function() {
        this.collSphere.Update(this.trfm);
        this.collBox.Update(this.trfm);
    }
};


function CollisionNetwork() {

    this.dynamicColls = [];
    this.staticColls = [];
}
CollisionNetwork.prototype = {
    AddBody: function (collisionBody) {
        this.dynamicColls.push(collisionBody);
    },
    Update: function () {
        for (var i = 0; i < this.dynamicColls.length; i++) {
            if (this.dynamicColls[i].active) {
                for (var j = i + 1; j < this.dynamicColls.length; j++) {
                    if (this.dynamicColls[j].active) {

                        // BROAD-PHASE DETECTION
                        if (this.dynamicColls[i].collSphere.IntersectsSphere(this.dynamicColls[j].collSphere)) {

                            //console.log(this.dynamicColls[i].collSphere.radius);
                            //console.log(this.dynamicColls[j].collSphere.radius);
                            this.dynamicColls[i].collSphere.Callback(this.dynamicColls[j]);
                            this.dynamicColls[j].collSphere.Callback(this.dynamicColls[i]);
                            // MID-PHASE DETECTION
                            //var contactPnt = this.dynamicColls[i].collBox.Intersects(this.dynamicColls[j].collBox);
                            /*
                            if(contactPnt) {
                                this.dynamicColls[i].collBox.Callback(this.dynamicColls[j]);
                                this.dynamicColls[j].collBox.Callback(this.dynamicColls[i]);
                            }
                            */
                        }
                    }
                }
            }
        }
    }
};
