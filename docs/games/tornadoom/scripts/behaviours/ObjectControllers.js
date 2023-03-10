
function TopDownController(obj, ctrlName, mouse) {
    var active = false,
        canRotate = true;

    var ctrl = new ControlScheme();
    var moveForceScalar = 3750;
    var yawAngle = 0.0,
        yawIncr = 2.0;

    // Control object
    var keyName = "Keys: " + ctrlName;
    Input.RegisterControlScheme(keyName, active, InputTypes.keyboard);
    ctrl.moveLeft = Input.CreateInputController(keyName, KeyMap.A);
    ctrl.moveRight = Input.CreateInputController(keyName, KeyMap.D);
    ctrl.moveBack = Input.CreateInputController(keyName, KeyMap.S);
    ctrl.moveForth = Input.CreateInputController(keyName, KeyMap.W);
    ctrl.yawLeft = Input.CreateInputController(keyName, KeyMap.ArrowLeft);
    ctrl.yawRight = Input.CreateInputController(keyName, KeyMap.ArrowRight);

    var dir;

    this.SetActive = function(isActive) {
        active = isActive;
        Input.SetActive(keyName, isActive);
    };
    this.CheckActive = function() {
        return Input.CheckKeysActive(keyName);
    };

    this.Reset = function() {
        yawAngle = 0.0;
    };

    this.SetCanRotate = function($canRotate) {
        canRotate = $canRotate;
    };


    this.Update = function() {

        if(active) {
            if (ctrl.moveLeft.pressed) {
                dir = obj.trfmGlobal.GetRight();
                obj.rigidBody.AddForce(dir.SetScaleByNum(-moveForceScalar));
            }
            else if (ctrl.moveRight.pressed) {
                dir = obj.trfmGlobal.GetRight();
                obj.rigidBody.AddForce(dir.SetScaleByNum(moveForceScalar));
            }
            if (ctrl.moveForth.pressed) {
                dir = obj.trfmGlobal.GetFwd();
                obj.rigidBody.AddForce(dir.SetScaleByNum(moveForceScalar));
            }
            else if (ctrl.moveBack.pressed) {
                dir = obj.trfmGlobal.GetFwd();
                obj.rigidBody.AddForce(dir.SetScaleByNum(-moveForceScalar));
            }
            if(canRotate) {
                if (mouse.dir.x < -2 || mouse.dir.x > 2) {
                    yawAngle += -mouse.dir.x * 0.3;
                    //console.log("mouseDirX: " + -mouse.dir.x * 0.3 + ", yawAngle: " + yawAngle);
                    obj.trfmBase.SetUpdatedRot(VEC3_UP, yawAngle);
                }
            }

            /*
            if(canRotate) {
                if (mouse.dir.x < -2) {
                    yawAngle += yawIncr;
                    obj.trfmBase.SetUpdatedRot(VEC3_UP, yawAngle);
                }
                else if (mouse.dir.x > 2) {
                    yawAngle -= yawIncr;
                    obj.trfmBase.SetUpdatedRot(VEC3_UP, yawAngle);
                }
            }
            */
        }
    }
}