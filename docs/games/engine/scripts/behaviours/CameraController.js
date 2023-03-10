
function CameraController(trfmAxes, ctrlSchemeName) {
    this.trfmAxes = trfmAxes;

    this.ctrl = new ControlScheme();
    this.moveSpeed = 10;
    this.turnSpeed = 1.0;

    // Control camera
    this.camRegName = ctrlSchemeName;
    Input.RegisterControlScheme(this.camRegName, true, InputTypes.keyboard);

    this.ctrl.moveLeft = Input.CreateInputController(this.camRegName, KeyMap.A);
    this.ctrl.moveRight = Input.CreateInputController(this.camRegName, KeyMap.D);
    this.ctrl.moveDown = Input.CreateInputController(this.camRegName, KeyMap.Q);
    this.ctrl.moveUp = Input.CreateInputController(this.camRegName, KeyMap.E);
    this.ctrl.moveBack = Input.CreateInputController(this.camRegName, KeyMap.S);
    this.ctrl.moveForth = Input.CreateInputController(this.camRegName, KeyMap.W);
    this.ctrl.pitchDown = Input.CreateInputController(this.camRegName, KeyMap.ArrowDown);
    this.ctrl.pitchUp = Input.CreateInputController(this.camRegName, KeyMap.ArrowUp);
    this.ctrl.yawLeft = Input.CreateInputController(this.camRegName, KeyMap.ArrowLeft);
    this.ctrl.yawRight = Input.CreateInputController(this.camRegName, KeyMap.ArrowRight);
}
CameraController.prototype = {
    SetInputActive: function(isActive) {
        Input.SetActive(this.camRegName, isActive);
    },
    Update: function() {
        if (this.ctrl.moveLeft.pressed) {
            this.trfmAxes.TranslateRight(-this.moveSpeed * Time.deltaMilli);
        }
        else if (this.ctrl.moveRight.pressed) {
            this.trfmAxes.TranslateRight(this.moveSpeed * Time.deltaMilli);
        }
        if (this.ctrl.moveUp.pressed) {
            this.trfmAxes.TranslateUp(this.moveSpeed * Time.deltaMilli);
        }
        else if (this.ctrl.moveDown.pressed) {
            this.trfmAxes.TranslateUp(-this.moveSpeed * Time.deltaMilli);
        }
        if (this.ctrl.moveForth.pressed) {
            this.trfmAxes.TranslateFwd(this.moveSpeed * Time.deltaMilli);
        }
        else if (this.ctrl.moveBack.pressed) {
            this.trfmAxes.TranslateFwd(-this.moveSpeed * Time.deltaMilli);
        }
        if (this.ctrl.pitchUp.pressed) {
            this.trfmAxes.RotateLocalViewX(this.turnSpeed);
            //this.trfm.Rotate(this.trfm.right, -this.turnSpeed);
        }
        else if (this.ctrl.pitchDown.pressed) {
            this.trfmAxes.RotateLocalViewX(-this.turnSpeed);
            //this.trfm.Rotate(this.trfm.right, this.turnSpeed);
        }
        if (this.ctrl.yawLeft.pressed) {
            this.trfmAxes.RotateLocalView(VEC3_UP, this.turnSpeed);
            //this.trfm.Rotate(VEC3_UP, this.turnSpeed);
        }
        else if (this.ctrl.yawRight.pressed) {
            this.trfmAxes.RotateLocalView(VEC3_UP, -this.turnSpeed);
            //this.trfm.Rotate(VEC3_UP, -this.turnSpeed);
        }
    }
};
