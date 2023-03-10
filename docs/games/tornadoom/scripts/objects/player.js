/**
 * Created by Devin on 2015-01-16.
 */

// Extra object to help absorb ammo objects
function CaughtObj(centrePos, ammoObj, ammoType, rotAngleIncr, rotAngleAccIncr, hypDecr, yIncr) {

    var objToEyeVec = new Vector2(centrePos.x - ammoObj.trfmGlobal.pos.x, centrePos.z - ammoObj.trfmGlobal.pos.z);

    this.centrePos = centrePos;
    this.ammoObj = ammoObj;
    this.ammoType = ammoType;
    this.angle = Math.atan2(-objToEyeVec.x, -objToEyeVec.y);
    this.r = objToEyeVec.GetMag();

    this.rotAngleIncr = rotAngleIncr;
    this.rotAngleAccIncr = rotAngleAccIncr;
    this.hypDecr = hypDecr;
    // asin will be in error if -1 > value > 1
    this.yAngle = Math.asin(MathUtils.Clamp(this.ammoObj.trfmBase.pos.y - centrePos.y, -1.0, 1.0));
    this.yScale = (1.0 - ammoObj.shapeData.radii.y);
    this.yIncr = yIncr;
}
CaughtObj.prototype = {
    Update: function() {
        // Increment rotation angle and radius to draw in object
        this.rotAngleIncr += this.rotAngleAccIncr;
        this.angle += this.rotAngleIncr;

        this.r -= this.hypDecr;
        this.yAngle += this.yIncr;

        var newX = this.centrePos.x + (this.r * Math.sin(this.angle));
        var newY = this.centrePos.y + (Math.sin(this.yAngle) * this.yScale);
        var newZ = this.centrePos.z + (this.r * Math.cos(this.angle));
        this.ammoObj.trfmBase.SetPosByAxes( newX, newY,  newZ);
    }
};

function Player() {

    var that = this;

    // Player characteristics -------------------------------------------------

    var windspeed = 10.0;
    var massDensity = 4.82;    // 1.205; Normal for air?

    var contactScale = 2.0;
    var drawScale = 1.05;
    var maxForceMagSqr = 750.0 * 750.0;
    this.captureRadius = 0.75;

    // Hard capture details
    var twistList = [];
    var rotAngleIncr = 0.01,
        rotAngleAccIncr = 0.001,
        hypDecr = 0.01,
        yIncr = 0.035;

    //var springConstant = 3.0;
    //var restLength = contactScale / 4.0;

    var LAUNCH_SCALAR_MIN = 400;
    var LAUNCH_SCALAR_MAX = 650;
    var launchScalarDiffMaxInv = 1.0 / (LAUNCH_SCALAR_MAX - LAUNCH_SCALAR_MIN);
    var launchScalar = LAUNCH_SCALAR_MIN;

    var MASS_EMPTY = 300.0;
    var massAccum = 0.0;

    var ammoCont = [];
    var ammoIdx = 0;
    var ammoTypeCount = 0;
    var AmmoSelectionCallback = function(){},
        AmmoCountChangeCallback = function(){},
        PowerChangeCallback = function(){};

    // The X and Y are just the mouses screen coords, assuming (0,0) at the centre
    // The Z and scalar are values used to try to control how steep the new direction becomes
    var isOverShoulderAiming = false;
    var mouseAimX = 0;
    var mouseAimY = 0;
    var AIM_INCR = 10.0;
    var AIM_XY_MAX = 250;
    var mouseAimZ = -25;
    var mouseAimScalar = 0.1;
    var crosshairLength = 5.0;

    // Basic player obj visual -------------------------------------------------

    this.obj = new GameObject('Player', Labels.player);
    var modelObj = new GameObject("Player model", Labels.none);
    modelObj.SetModel(GameMngr.assets.models['playerTornado']);
    modelObj.mdlHdlr.SetTexture(GameMngr.assets.textures['funnelTex'], TextureFilters.linear);

    this.obj.AddChild(modelObj);

    // Just to help in a few functions below
    var playerPos = this.obj.trfmGlobal.pos;
    this.height = modelObj.shapeData.radii.y * modelObj.trfmBase.scale.y * 2;

    this.obj.AddComponent(Components.rigidBody);
    this.obj.rigidBody.SetMass(MASS_EMPTY);
    this.obj.rigidBody.dampening = 0.2;
    var playerVel = this.obj.rigidBody.velF;

    // Tornado collisions -------------------------------------------------

    this.obj.AddComponent(Components.collisionSystem);
    this.obj.collider.ResizeBoundingShapes(modelObj.shapeData);
    this.obj.collider.ScaleSphere(contactScale);

    // Set capsule collider around funnel
    var funnelCapsuleCollider = new CollisionCapsule(modelObj);
    this.obj.collider.AddCollisionShape(BoundingShapes.capsule, funnelCapsuleCollider);

    // Add particle effects -------------------------------------------------

    this.obj.AddComponent(Components.particleSystem);

    var effects = new PtclSpiralEffects();
    effects.travelTime = 2.5;
    effects.startDist = 1.0;
    effects.dir = new Vector3(0.0, -1.0, 0.0);
    effects.range = 15.0;
    effects.scaleAngle = 5.0;
    effects.scaleDiam = 0.5;
    effects.scaleLen = 0.2;
    effects.colourBtm = new Vector3(0.5, 0.5, 0.5);
    effects.colourTop = new Vector3(0.5, 0.8, 0.8);
    effects.lineLength = 0.0;
    effects.size = 40.0;
    effects.texture = GameMngr.assets.textures['dustPtcl'];
    effects.alphaStart = 0.5;
    effects.fadePoint = 0.75;
    effects.alphaEnd = 0.0;

    // Inner dust effect
    var dustVisual1 = new ParticleFieldAutomated(40, true, null, effects);
    this.obj.ptclSys.AddAutoField(dustVisual1);
    dustVisual1.Run();

    // Outer dust effect
    effects.travelTime = 3.0;
    effects.scaleAngle = 2.5;
    effects.scaleDiam = 0.85;
    effects.scaleLen = 0.1;
    effects.size = 20.0;
    var dustVisual2 = new ParticleFieldAutomated(30, true, null, effects);
    this.obj.ptclSys.AddAutoField(dustVisual2);
    dustVisual2.Run();

    effects = new PtclPhysicsEffects();
    effects.travelTime = 0.5;
    effects.startDist = 0.5;
    effects.dir.SetValues(0.0, 1.0, 0.0);
    effects.range = 360.0;
    effects.speed = 1.5;
    effects.acc.SetValues(0.0, 0.0, 0.0);
    effects.dampening = 0.25;
    effects.colourBtm.SetValues(0.0, 0.5, 0.25);
    effects.colourTop.SetValues(0.0, 1.0, 1.0);
    effects.lineLength = 0.0;
    effects.alphaStart = 1.0;
    effects.fadePoint = 0.5;
    effects.alphaEnd = 0.0;
    effects.size = 5.0;
    var collectionVisual = new ParticleFieldAutomated(50, false, 0.25, effects);
    this.obj.ptclSys.AddAutoField(collectionVisual);

    effects = new PtclSimpleEffects();
    effects.colourBtm.SetValues(0.0, 0.0, 0.0);
    effects.colourTop.SetValues(0.0, 0.0, 0.0);
    effects.lineLength = 0.0;
    effects.size = 30.0;
    effects.texture = GameMngr.assets.textures['crosshair'];
    effects.alphaStart = 1.0;
    var aimDirVisual = new ParticleFieldControlled(10, effects);
    this.obj.ptclSys.AddCtrlField(aimDirVisual);


    // Add controls -------------------------------------------------

    this.obj.AddComponent(Components.camera);
    this.obj.camera.trfmAxes.SetPosAxes(0.0, 4.0, 8.0);
    that.obj.camera.trfmAxes.SetRotatedLocalViewX(-15);
    ViewMngr.SetActiveCamera(this.obj.camera);

    // Key controls
    var playerCtrlName = "PlayerCtrl";
    Input.RegisterControlScheme(playerCtrlName, true, InputTypes.keyboard);
    var btnAmmoScrollLeft = Input.CreateInputController(playerCtrlName, KeyMap.Q);
    var btnAmmoScrollRight = Input.CreateInputController(playerCtrlName, KeyMap.E);

    // Mouse controls
    var playerMouseCtrlName = "PlayerMouse";
    Input.RegisterControlScheme(playerMouseCtrlName, true, InputTypes.mouse);
    var playerMouse = Input.CreateInputController(playerMouseCtrlName);

    var ctrl = new TopDownController(this.obj, "Top-down player controls", playerMouse);
    ctrl.SetActive(true);
    var controlActive = true;

    // Allow player to press the right mouse button to go into a view where they use the mouse
    // to aim within a given window around the direction they are facing.
    function AimToggle() {
        isOverShoulderAiming = !isOverShoulderAiming;
        if(isOverShoulderAiming) {
            that.obj.camera.trfmAxes.SetPosAxes(0.85, 0.75, 5.0);
            that.obj.camera.trfmAxes.SetRotatedLocalViewX(10);
            ctrl.SetCanRotate(false);
            aimDirVisual.Run();
        }
        else {
            that.obj.camera.trfmAxes.SetPosAxes(0.0, 4.0, 8.0);
            that.obj.camera.trfmAxes.SetRotatedLocalViewX(-15);
            ctrl.SetCanRotate(true);
            aimDirVisual.Stop();
            DropLaunchPower();
        }
    }
    playerMouse.SetLeftBtnCalls(null, ShotReleased);
    playerMouse.SetRightBtnCalls(AimToggle, null);

    // When in this mode, the left mouse button can also be held to charge up the shot.
    // Shoot when released
    var aimDir = new Vector3();
    function ShotReleased() {
        if(ammoCont[ammoIdx] && controlActive)
            Shoot(aimDir);
    }

    // HELPER FUNCTIONS -------------------------------------------------

    var PrepAmmo = function(gameObj, isVisible) {
        if(gameObj.mdlHdlr)
            gameObj.mdlHdlr.active = isVisible;
        for (var i in gameObj.components)
            gameObj.components[i].SetActive(isVisible);
    };
    // Pop captured object from it's list and shoot forward from right on Tornado
    var RaiseLaunchPower = function() {
        launchScalar += 2.0;
        if(launchScalar > LAUNCH_SCALAR_MAX)
            launchScalar = LAUNCH_SCALAR_MAX;

        PowerChangeCallback((launchScalar - LAUNCH_SCALAR_MIN) * launchScalarDiffMaxInv);
    };
    var DropLaunchPower = function() {
        launchScalar = LAUNCH_SCALAR_MIN;
        PowerChangeCallback((launchScalar - LAUNCH_SCALAR_MIN) * launchScalarDiffMaxInv);
    };
    var Shoot = function(dir) {
        var ammoObj = ammoCont[ammoIdx].pop();
        if(ammoObj) {
            ammoObj.trfmBase.SetPosByVec(playerPos.GetAdd(dir.SetScaleByNum(contactScale + 2.0)));
            AdjustMass(-ammoObj.rigidBody.GetMass());
            AmmoCountChangeCallback(ammoIdx, ammoCont[ammoIdx].length);
            PrepAmmo(ammoObj, true);
            ammoObj.rigidBody.AddForce(dir.GetScaleByNum(windspeed * launchScalar));
            ammoObj.PlayLaunchSound();
        }
        DropLaunchPower();
    };

    var AdjustMass = function(mass) {
        // Adjusting player's mass will determine its movement speed,
        // So it can't just collect everything
        massAccum += mass;
        that.obj.rigidBody.SetMass(MASS_EMPTY + massAccum);
    };

    // PLAYER METHODS -------------------------------------------------
    var angle = 0.0;

    this.AddAmmoContainer = function(index) {
        ammoCont[index] = [];
        ammoTypeCount++;
    };
    this.RemoveAmmoContainer = function(index) {
        ammoCont[index] = null;
        ammoTypeCount--;
    };
    this.GetAmmoIdx = function(ammoTypeIdx, ammoObj) {
        return ammoCont[ammoTypeIdx].indexOf(ammoObj);
    };
    this.GetAmmoCount = function(ammoTypeIdx) {
        return ammoCont[ammoTypeIdx].length;
    };
    this.SetAmmoSelectionCallback = function(Callback) {
        AmmoSelectionCallback = Callback;
        AmmoSelectionCallback(ammoIdx);
    };
    this.SetAmmoCountChangeCallback = function(Callback) {
        AmmoCountChangeCallback = Callback;
    };
    this.SetPowerChangeCallback = function(Callback) {
        PowerChangeCallback = Callback;
    };
    this.GetAimToggleHeld = function() {
        if(controlActive)
            return isOverShoulderAiming;

        return false;
    };
    this.Capture = function(index, gameObj) {
        // Small particle visual
        collectionVisual.Run();
        // Determine object captured
        ammoCont[index].push(gameObj);
        AmmoCountChangeCallback(index, ammoCont[index].length);
        PrepAmmo(gameObj, false);
    };
    this.ReleaseAmmoAbove = function(ammoContIdx, ammoIdx) {
        var ammoObj = (ammoCont[ammoContIdx].splice(ammoIdx, 1)).pop();
        if(ammoObj) {
            ammoObj.trfmBase.SetPosByVec(playerPos.GetAdd(VEC3_UP.GetScaleByNum(this.height * 0.75)));
            AdjustMass(-ammoObj.rigidBody.GetMass());
            AmmoCountChangeCallback(ammoContIdx, ammoCont[ammoContIdx].length);
            PrepAmmo(ammoObj, true);
        }
    };
    this.ClearAmmo = function() {
        for(var i = 0; i < ammoCont.length; i++)
            ammoCont[i].splice(0, ammoCont[i].length);

        AdjustMass(-massAccum);
        twistList.splice(0, twistList.length);
    };
    this.SetControlActive = function(isActive) {
        controlActive = isActive;
        ctrl.SetActive(isActive);
        Input.SetActive(playerMouseCtrlName, isActive);
    };
    this.CheckControlActive = function() {
        return ctrl.CheckActive();
    };
    this.Twister = function(rigidBody, objToEyeVec, objToEyeDistSqr) {
        // Have objs keep relative velocity with tornado.
        //rigidBody.AddForce(this.obj.rigidBody.GetForceFromVelocity().SetScaleByNum(0.5));
        rigidBody.ApplyTornadoMotion(objToEyeVec, objToEyeDistSqr, windspeed, massDensity, drawScale, maxForceMagSqr);
        //rigidBody.ApplySpring(playerPos, springConstant, restLength);
        // Perfect lift right away, slowing once obj's gravity is re-applied.
        rigidBody.ApplyGravity(VEC3_GRAVITY.GetNegative());
    };
    this.Absord = function(ammoObj, ammoType) {
        for(var i = 0; i < twistList.length; i++)
            if(ammoObj == twistList[i].ammoObj)
                return;

        // Collider no longer needed while object is being absorbed
        ammoObj.collider.SetActive(false);
        ammoObj.PlayCaptureSound();
        GameMngr.assets.sounds['wind'].play();

        AdjustMass(ammoObj.rigidBody.GetMass());
        twistList.push(new CaughtObj(playerPos, ammoObj, ammoType, rotAngleIncr, rotAngleAccIncr, hypDecr, yIncr));
    };
    this.RemoveFromTwister = function(gameObj) {
        for(var i = 0; i < twistList.length; i++) {
            if(twistList[i].gameObj  == gameObj) {
                twistList.splice(twistList.indexOf(twistList[i]), 1);
            }
        }
    };
    this.ResetMotion = function() {
        this.obj.trfmBase.SetDefault();
        this.obj.rigidBody.Reset();
        ctrl.Reset();
    };
    this.ResetAll = function() {
        ammoCont.splice(0, ammoCont.length);
        twistList.splice(0, twistList.length);
        ammoIdx = 0;
        ammoTypeCount = 0;
        AdjustMass(-massAccum);
        AmmoSelectionCallback(ammoIdx);
        this.ResetMotion();
    };
    this.Update = function() {
        angle++;
        if(angle > 360.0)
            angle = 0.0;

        modelObj.trfmBase.SetUpdatedRot(VEC3_UP, angle * 7.5);
        this.obj.trfmBase.SetPosY(this.height * 0.5);

        // Update rotating objects
        for(var i = 0; i < twistList.length; i++) {
            twistList[i].Update();

            if(twistList[i].r < this.captureRadius) {
                this.Capture(twistList[i].ammoType, twistList[i].ammoObj);
                twistList.splice(twistList.indexOf(twistList[i]), 1);
            }
        }

        if(controlActive) {
            ctrl.Update();

            // Shooting mechanics
            // Trade-off here, more difficult control, but power can be built
            if (isOverShoulderAiming) {
                if(playerMouse.dir.x < -1 || playerMouse.dir.x > 1)
                    mouseAimX = MathUtils.Clamp(mouseAimX+playerMouse.dir.x * 2, -AIM_XY_MAX, AIM_XY_MAX);
                if(playerMouse.dir.y < -1 || playerMouse.dir.y > 1)
                    mouseAimY = MathUtils.Clamp(mouseAimY-playerMouse.dir.y * 2, -AIM_XY_MAX, AIM_XY_MAX);

                /*
                mouseAimX = playerMouse.pos.x - ViewMngr.wndWidth / 2.0;
                mouseAimY = (playerMouse.pos.y - ViewMngr.wndHeight / 2.0) * -1;
                */

                aimDir.SetValues(mouseAimX * mouseAimScalar, mouseAimY * mouseAimScalar, mouseAimZ);
                aimDir.SetNormalized();
                // Send these positions, as obj's model matrix is used to achieve pos and rot
                aimDirVisual.ApplyEvenLine(aimDir.GetScaleByNum(crosshairLength), VEC3_ZERO);
                // Finish aim adjustment for local force application
                aimDir = that.obj.trfmGlobal.rot.GetMultiplyVec3(aimDir);

                if (playerMouse.leftPressed)
                    RaiseLaunchPower();
            }
            else {
                aimDir.SetCopy(this.obj.trfmBase.GetFwd());
            }

            // Change ammo type
            if (btnAmmoScrollLeft.pressed) {
                ammoIdx = (ammoIdx > 0) ? ammoIdx - 1 : ammoTypeCount - 1;
                AmmoSelectionCallback(ammoIdx);
                btnAmmoScrollLeft.Release();
            }
            if (btnAmmoScrollRight.pressed) {
                ammoIdx = (ammoIdx + 1) % ammoTypeCount;
                AmmoSelectionCallback(ammoIdx);
                btnAmmoScrollRight.Release();
            }
        }

        // Keep all ammo positioned on player;
        for (var i = 0; i < ammoCont.length; i++) {
            for (var j = 0; j < ammoCont[i].length; j++) {
                ammoCont[i][j].trfmBase.SetPosByAxes(playerPos.x, playerPos.y, playerPos.z);
            }
        }
    }
}