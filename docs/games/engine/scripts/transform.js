
function Transform() {
    this.pos = new Vector3();
    this.rot = new Quaternion();
    this.scale = new Vector3(1.0, 1.0, 1.0);

    this.active = false;
}
Transform.prototype = {
    SetDefault: function() {
        this.pos.SetZero();
        this.rot.SetIdentity();
        this.scale.SetOne();
        this.active = true;
    },
    GetLargestScaleValue: function() {
        if (this.scale.x > this.scale.y && this.scale.x > this.scale.z)
            return this.scale.x;
        else if (this.scale.y > this.scale.z)
            return this.scale.y;
        else
            return this.scale.z;
    },
    SetPosX: function(x) {
        ///  <summary>Set a new position</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.x = x;
        this.active = true;
    },
    SetPosY: function(y) {
        ///  <summary>Set a new position</summary>
        ///  <param name="y" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.y = y;
        this.active = true;
    },
    SetPosZ: function(z) {
        ///  <summary>Set a new position</summary>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.z = z;
        this.active = true;
    },
    SetPosXZ: function(x, z) {
        ///  <summary>Set a new x and z position</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.x = x;
        this.pos.z = z;
        this.active = true;
    },
    SetPosByAxes: function(x, y, z) {
        ///  <summary>Set a new position</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetValues(x, y, z);
        this.active = true;
    },
    SetPosByVec: function(newBaseTrans) {
        /// <signature>
        ///  <summary>Set a new position</summary>
        ///  <param name="position" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetCopy(newBaseTrans);
        this.active = true;
    },
    TranslateByAxes: function(x, y, z) {
        ///  <summary>Move position by amount given</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.x += x;
        this.pos.y += y;
        this.pos.z += z;
        this.active = true;
    },
    TranslateByVec: function(translation) {
        /// <signature>
        ///  <summary>Move position by amount given</summary>
        ///  <param name="translation" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(translation);
        this.active = true;
    },
    TranslateFwd: function(speed) {
        /// <signature>
        ///  <summary>Move position forward by amount given</summary>
        ///  <param name="speed" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(this.rot.GetMultiplyVec3(VEC3_FWD).GetScaleByNum(speed));
        this.active = true;
    },
    TranslateUp: function(speed) {
        /// <signature>
        ///  <summary>Move position forward by amount given</summary>
        ///  <param name="speed" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(this.rot.GetMultiplyVec3(VEC3_UP).GetScaleByNum(speed));
        this.active = true;
    },
    TranslateRight: function(speed) {
        /// <signature>
        ///  <summary>Move position forward by amount given</summary>
        ///  <param name="speed" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(this.rot.GetMultiplyVec3(VEC3_RIGHT).GetScaleByNum(speed));
        this.active = true;
    },
    SetRotByAxisAngle: function(axis, thetaDeg) {
        /// <signature>
        ///  <summary>Set Rotation around given axis by given angle</summary>
        ///  <param name="axis" type="Vector3">Axis around which to rotate</param>
        ///  <param name="thetaDeg" type="decimal">Angle in degrees</param>
        ///  <returns type="void" />
        /// </signature>
        this.rot.SetFromAxisAngle(axis, thetaDeg);
        this.active = true;
    },
    SetRotByQuat: function(quat) {
        this.rot.SetCopy(quat);
        this.active = true;
    },
    SetUpdatedRot: function(normAxis, thetaDeg) {
        this.rot.UpdateAxisAngle(normAxis, thetaDeg);
        this.active = true;
    },
    AddRotByAxisAngle: function(axis, thetaDeg) {
        /// <signature>
        ///  <summary>Apply Rotation around given axis by given angle</summary>
        ///  <param name="axis" type="Vector3">Axis around which to rotate</param>
        ///  <param name="thetaDeg" type="decimal">Angle in degrees</param>
        ///  <returns type="void" />
        /// </signature>
        var rotation = new Quaternion();
        this.rot.SetMultiplyQuat(rotation.SetFromAxisAngle(axis, thetaDeg));
        this.active = true;
    },
    GetFwd: function() {
        return this.rot.GetMultiplyVec3(VEC3_FWD);
    },
    GetRight: function() {
        return this.rot.GetMultiplyVec3(VEC3_RIGHT);
    },
    SetScaleAxes: function(x, y, z) {
        /// <summary>Set a new scale</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.scale.x = x;
        this.scale.y = y;
        this.scale.z = z;
        this.active = true;
    },
    SetScaleByVec: function(scaleVec) {
        /// <signature>
        ///  <summary>Set a new scale</summary>
        ///  <param name="scaleVec" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.scale.SetCopy(scaleVec);
        this.active = true;
    },
    ScaleByAxes: function(x, y, z) {
        /// <summary>Grow/shrink by value given</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.scale.x += x;
        this.scale.y += y;
        this.scale.z += z;
        this.active = true;
    },
    ScaleByVec3: function(scaleVec) {
        /// <signature>
        ///  <summary>Grow/shrink by value given</summary>
        ///  <param name="scaleVec" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.scale.SetAdd(scaleVec);
        this.active = true;
    },
    IsChanging: function() {
        if (this.active) {
            this.active = false;
            return true;
        }
        return false;
    }
};

function TransformAxes() {
    this.pos = new Vector3();
    this.fwd = (new Vector3()).SetCopy(VEC3_FWD);
    this.up = (new Vector3()).SetCopy(VEC3_UP);
    this.right = (new Vector3()).SetCopy(VEC3_RIGHT);
    this.active;
}
TransformAxes.prototype = {
    SetDefault: function() {
        this.pos.SetZero();
        this.fwd.SetCopy(VEC3_FWD);
        this.up.SetCopy(VEC3_UP);
        this.right.SetCopy(VEC3_RIGHT);
    },
    SetPosAxes: function(x, y, z) {
        ///  <summary>Set a new position</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
        this.active = true;
    },
    SetPosVec3: function(pos) {
        /// <signature>
        ///  <summary>Set a new position</summary>
        ///  <param name="position" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetCopy(pos);
        this.active = true;
    },
    TranslateAxes: function(x, y, z) {
        ///  <summary>Move position by amount given</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.x += x;
        this.pos.y += y;
        this.pos.z += z;
        this.active = true;
    },
    TranslateVec: function(translation) {
        /// <signature>
        ///  <summary>Move position by amount given</summary>
        ///  <param name="translation" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(translation);
        this.active = true;
    },
    TranslateFwd: function(speed) {
        /// <signature>
        ///  <summary>Move position forward by amount given</summary>
        ///  <param name="speed" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(this.fwd.GetScaleByNum(speed));
        this.active = true;
    },
    TranslateUp: function(speed) {
        /// <signature>
        ///  <summary>Move position forward by amount given</summary>
        ///  <param name="speed" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(this.up.GetScaleByNum(speed));
        this.active = true;
    },
    TranslateRight: function(speed) {
        /// <signature>
        ///  <summary>Move position forward by amount given</summary>
        ///  <param name="speed" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.pos.SetAdd(this.right.GetScaleByNum(speed));
        this.active = true;
    },
    RotateLocalView: function(axis, thetaDeg) {
        /// <signature>
        ///  <summary>SetOrientation around the given axis by degree specified</summary>
        ///  <param name="thetaDeg" type="decimal"></param>
        ///  <param name="axis" type="Vector3"></param>
        ///  <returns type="void" />
        /// </signature>
        this.fwd.SetRotated(thetaDeg, axis);
        this.up.SetRotated(thetaDeg, axis);
        this.right.SetRotated(thetaDeg, axis);
        this.active = true;
    },
    RotateLocalViewX: function(thetaDeg) {
        this.fwd.SetRotated(thetaDeg, this.right);
        this.up.SetRotated(thetaDeg, this.right);
        this.active = true;
    },
    SetRotatedLocalViewX: function(thetaDeg) {
        this.fwd.SetCopy(VEC3_FWD);
        this.fwd.SetRotated(thetaDeg, VEC3_RIGHT);
        this.up.SetCopy(VEC3_UP);
        this.up.SetRotated(thetaDeg, VEC3_RIGHT);
        this.active = true;
    },
    RotateLocalViewY: function(thetaDeg) {
        this.fwd.SetRotated(thetaDeg, this.up);
        this.right.SetRotated(thetaDeg, this.up);
        this.active = true;
    },
    RotateLocalViewZ: function(thetaDeg) {
        this.up.SetRotated(thetaDeg, this.fwd);
        this.right.SetRotated(thetaDeg, this.fwd);
        this.active = true;
    },
    IsChanging: function() {
        if (this.active) {
            this.active = false;
            return true;
        }
        return false;
    }
};