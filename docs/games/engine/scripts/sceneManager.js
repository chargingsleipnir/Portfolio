/**
 * Created by Devin on 2014-12-29.
 */

/********** Scenes to be added to the Network ************/

function Scene(name, sceneType) {
    /// <signature>
    ///  <summary>Create a scene of models, lighting, etc</summary>
    ///  <param name="name" type="string">Scene identifier</param>
    /// </signature>
    this.name = name;
    this.type = sceneType;

    this.rootObj = new GameObject("Root", Labels.none);
    // This is just a placeholder, to avoid having to check at ever parent reference
    this.rootObj.parent = new GameObject("Root Parent", Labels.none);

    this.debug = new DebugHandler();

    //this.hier = new SphereHierarchyNode(new Sphere(new Vector3(), 1.0), null);
    //this.hier.children[0] = new SphereHierarchyNode(new Sphere(new Vector3(), 1.0), null);
    //this.hier.children[1] = new SphereHierarchyNode(new Sphere(new Vector3(), 1.0), null);

    /*
    this.allObjs = [];
    this.sphereHierRootNodes = [];
    this.drawIndices = [];
    */
    this.models = [];

    this.ptclSystems = [];

    this.collisionNetwork = new CollisionNetwork();

    this.light = {
        amb: {
            bright: 0.0
        },
        dir: {
            bright: 0.0,
            dir: new Vector3(1.0, -1.0, 0.0)
        },
        pnt: {
            bright: 0.0,
            pos: new Vector3(0.0, 0.5, -0.5)
        }
    };

    this.InitCall = function() {};
    this.LoopCall = function() {};
    this.ExitCall = function() {};
}
var testOnce = true;
Scene.prototype = {
    Add: function(gameObject) {
        //this.allObjs.push(gameObject);
        //this.hier.Insert(gameObject.sphere, this.allObjs.indexOf(gameObject));

        for(var i = 0; i < gameObject.children.length; i++)
            this.Add(gameObject.children[i]);
        if(!gameObject.parent || gameObject.parent.name == "Root")
            this.rootObj.AddChild(gameObject);
        if(gameObject.mdlHdlr) {
            this.models.push(gameObject.mdlHdlr);
            //this.drawHier.Insert(gameObject.sphere, gameObject.mdlHdlr);
        }
        if(gameObject.collider)
            this.collisionNetwork.AddBody(gameObject.collider);
        if(gameObject.ptclSys)
            this.ptclSystems.push(gameObject.ptclSys);

        if(DebugMngr.active) {
            // Visual for quaternion orientation
            var axesLengths = gameObject.shapeData.radii.GetScaleByVec(gameObject.trfmGlobal.scale.GetScaleByNum(1.25));
            this.debug.orientAxes.push(new ModelHandler(
                new Primitives.OrientAxes(axesLengths),
                gameObject.trfmGlobal,
                gameObject.shapeData.radius * gameObject.trfmBase.GetLargestScaleValue())
            );

            if(gameObject.collider) {
                // Visual for bounding sphere
                var sphereShell = new ModelHandler(
                    new Primitives.IcoSphere(2, gameObject.collider.collSphere.radius),
                    gameObject.collider.collSphere.trfm,
                    gameObject.collider.collSphere.radius * gameObject.trfmBase.GetLargestScaleValue()
                );
                sphereShell.MakeWireFrame();
                sphereShell.SetTintRGB(1.0, 1.0, 0.0);
                this.debug.collSpheres.push(sphereShell);

                // Visual for bounding box
                var boxShell = new ModelHandler(
                    new Primitives.WireCube(gameObject.collider.collBox.radii),
                    gameObject.collider.collBox.trfm,
                    gameObject.collider.collBox.radii.GetMag() * gameObject.trfmBase.GetLargestScaleValue()
                );
                boxShell.SetTintRGB(0.0, 1.0, 1.0);
                this.debug.collBoxes.push(boxShell);

                // Visual for capsules, donuts, and anything else that comes up
                var suppShapes = gameObject.collider.suppShapeList;
                for(var i = 0; i < suppShapes.length; i++) {
                    if(suppShapes[i].shapeType == BoundingShapes.capsule) {
                        var pillShell = new ModelHandler(
                            new Primitives.WireCapsule(
                                suppShapes[i].obj.radius,
                                suppShapes[i].obj.axis,
                                suppShapes[i].obj.halfLen, 20, 15),
                            suppShapes[i].obj.trfm,
                            (suppShapes[i].obj.halfLen + suppShapes[i].obj.radius) * gameObject.trfmBase.GetLargestScaleValue()
                        );
                        pillShell.SetTintRGB(1.0, 1.0, 1.0);
                        this.debug.collCapsules.push(pillShell);
                    }
                    else if(suppShapes[i].shapeType == BoundingShapes.donut) {
                        var donutShell = new ModelHandler(
                            new Primitives.WireDonut(
                                suppShapes[i].obj.radius,
                                suppShapes[i].obj.baseNormal,
                                suppShapes[i].obj.planarRadius, 20, 36),
                            suppShapes[i].obj.trfm,
                            (suppShapes[i].obj.planarRadius + suppShapes[i].obj.radius) * gameObject.trfmBase.GetLargestScaleValue()
                        );
                        donutShell.SetTintRGB(1.0, 0.6, 0.9);
                        this.debug.collDonuts.push(donutShell);
                    }
                }
            }
            if(gameObject.rigidBody) {
                // Visual for velocities
                this.debug.AddRayCast(new RayCastHandler(new Primitives.Ray()), gameObject.rigidBody.trfm.pos, gameObject.rigidBody.velF);
            }
        }
    },
    SortForDraw: function() {
        for(var i = 0; i < this.models.length; i++) {
            if(i > 0) {
                var idx = i;
                do {
                    var distThisModel = this.models[idx].trfm.pos.GetSubtract(ViewMngr.activeCam.posGbl).GetMagSqr();
                    var distPrevModel = this.models[idx-1].trfm.pos.GetSubtract(ViewMngr.activeCam.posGbl).GetMagSqr();

                    if (distThisModel > distPrevModel) {
                        RefUtils.Swap(this.models, idx, idx - 1);
                        idx--;
                    }
                    else
                        idx = 0;
                }
                while (idx > 0);
            }
        }
    },
    SetCallbacks: function(InitCallback, LoopCallback, ExitCallback) {
        this.InitCall = InitCallback;
        this.LoopCall = LoopCallback;
        this.ExitCall = ExitCallback;
    },
    SetLoopCallback: function(LoopCallback) {
        this.LoopCall = LoopCallback;
    },
    Update: function() {
        this.LoopCall();
        this.rootObj.Update();
        this.debug.Update();
        this.collisionNetwork.Update();
        /* Sort everything back to front. This is really needed just for
         * anything with an alpha < 1, but I cannot easily track that. */
        this.SortForDraw();
    }
};

/********** Network that controls which scene to update and draw ************/

var SceneMngr = (function() {

    var scenes = {};
    var activeScene = new Scene("null scene");

    return {
        AddScene: function(scene, setActive) {
            // Preliminary Update() to get everything in it's place
            // before running collisions, physics, etc.
            scene.rootObj.Update();

            scenes[scene.name] = scene;
            if(setActive) {
                activeScene.ExitCall();
                activeScene = scene;
                activeScene.InitCall();
            }
        },
        RemoveScene: function(sceneName) {
            if (sceneName in scenes)
                delete scenes[sceneName];
            else
                throw ("No scene by that name to remove");
        },
        SetActive: function(sceneName) {
            if (activeScene.name == sceneName) {
                throw(sceneName + " is already active.");
            }
            else if (sceneName in scenes) {
                activeScene.ExitCall();
                activeScene = scenes[sceneName];
                console.log("Switched scene to: " + sceneName);
                activeScene.debug.UpdateActiveDispObjs();
                activeScene.InitCall();
            }
            else
                throw ("No scene by that name to make active");
        },
        GetActiveScene: function() {
            return activeScene;
        },
        ListScenes: function() {
            for (var scene in scenes)
                console.log('Scene: ' + scene + ' : ' + scenes[scene]);
        },
        Update: function() {
            activeScene.Update();
        }
    }
})();