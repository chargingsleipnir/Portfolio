
function Vector2(x, y) {
    /// <signature>
    ///  <summary>Container for decimals x, y</summary>
    ///  <param name="x" type="decimal"></param>
    ///  <param name="y" type="decimal"></param>
    ///  <returns type="Vector2" />
    /// </signature>
    /// <signature>
    ///  <summary>Container for decimals x, y</summary>
    ///  <returns type="Vector2" />
    /// </signature>
    this.x = x || 0.0;
    this.y = y || 0.0;
}
Vector2.prototype = {
    GetData: function() {
        /// <signature>
        ///  <summary>Get components in array format</summary>
        ///  <returns type="array" />
        /// </signature>
        return [this.x, this.y];
    },
    GetCopy: function() {
        /// <signature>
        ///  <summary>Send this out as new Vector</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector3(this.x, this.y);
    },
    SetCopy: function(vec2) {
        /// <signature>
        ///  <summary>Copy given vector2 into this object</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x = vec2.x;
        this.y = vec2.y;
        return this;
    },
    SetValues: function(x, y) {
        /// <signature>
        ///  <summary>Set x, y components</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x = x;
        this.y = y;
        return this;
    },
    SetZero: function() {
        /// <signature>
        ///  <summary>Set x, y to 0</summary>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x = this.y = 0.0;
        return this;
    },
    SetOne: function() {
        /// <signature>
        ///  <summary>Set x, y to 1</summary>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x = this.y = 1.0;
        return this;
    },
    SetInverse: function() {
        /// <signature>
        ///  <summary>Change the component's signs</summary>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x = -this.x;
        this.y = -this.y;
        return this;
    },
    GetInverse: function() {
        /// <signature>
        ///  <summary>Get a vec2 with the component's signs reversed</summary>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(-this.x, -this.y);
    },
    SetAdd: function(vec2) {
        /// <signature>
        ///  <summary>Add the passed vector</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x += vec2.x;
        this.y += vec2.y;
        return this;
    },
    GetAdd: function(vec2) {
        /// <signature>
        ///  <summary>Return this vector plus the passed vector</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(this.x + vec2.x, this.y + vec2.y);
    },
    SetSubtract: function(vec2) {
        /// <signature>
        ///  <summary>Subtract the passed vector</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x -= vec2.x;
        this.y -= vec2.y;
        return this;
    },
    GetSubtract: function(vec2) {
        /// <signature>
        ///  <summary>Return this vector minus the passed vector</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(this.x - vec2.x, this.y - vec2.y);
    },
    SetScaleByVec: function(vec2) {
        /// <signature>
        ///  <summary>Multiplies the caller's components by the passed vector's</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x *= vec2.x;
        this.y *= vec2.y;
        return this;
    },
    GetScaleByVec: function(vec2) {
        /// <signature>
        ///  <summary>Multiplies the caller's components by the passed vector's</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(this.x * vec2.x, this.y * vec2.y);
    },
    SetScaleByNum: function(scalar) {
        /// <signature>
        ///  <summary>Multiplies the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },
    GetScaleByNum: function(scalar) {
        /// <signature>
        ///  <summary>Multiplies the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(this.x * scalar, this.y * scalar);
    },
    SetAddScaled: function(vec2, scalar) {
        /// <signature>
        ///  <summary>Adds the scaled vector to the caller.</summary>
        ///  <param name="vec2" type="Vector2">The vector to scale, then add</param>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x += vec2.x * scalar;
        this.y += vec2.y * scalar;
        return this;
    },
    GetAddScaled: function(vec2, scalar) {
        /// <signature>
        ///  <summary>Get this plus the scaled vector provided</summary>
        ///  <param name="vec2" type="Vector2">The vector to scale.</param>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(this.x + (vec3.x * scalar), this.y + (vec3.y * scalar));
    },
    GetDot: function(vec2) {
        /// <signature>
        ///  <summary>Returns scalar dot-product of 2 vectors</summary>
        ///  <param name="vec2" type="Vector2"></param>
        ///  <returns type="decimal" />
        /// </signature>
        return (this.x * vec2.x) + (this.y * vec2.y);
    },
    SetDivide: function(scalar) {
        /// <signature>
        ///  <summary>Divides the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        this.x /= scalar;
        this.y /= scalar;
        return this;
    },
    GetDivide: function(scalar) {
        /// <signature>
        ///  <summary>Divides the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector3(this.x / scalar, this.y / scalar);
    },
    GetMagSqr: function() {
        /// <signature>
        ///  <summary>Returns the squared scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        return (this.x * this.x) + (this.y * this.y);
    },
    GetMag: function() {
        /// <signature>
        ///  <summary>Returns the scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        return Math.sqrt(this.GetMagSqr());
    },
    SetNormalized: function() {
        /// <signature>
        ///  <summary>Divides each component value by the magnitude</summary>
        ///  <returns type="Vector2" />
        /// </signature>
        var mag = this.GetMag();
        if (mag < INFINITESIMAL) {
            alert("Vec2 Normalize divide by zero");
            return;
        }
        mag = 1.0 / mag;
        this.x *= mag;
        this.y *= mag;
        return this;
    },
    GetNormalized: function() {
        /// <signature>
        ///  <summary>Divides each component value by the magnitude</summary>
        ///  <returns type="Vector2" />
        /// </signature>
        var mag = this.GetMag();
        if (mag < INFINITESIMAL) {
            alert("Vec2 Normalize divide by zero");
            return;
        }
        mag = 1.0 / mag;
        return (this.x * mag, this.y * mag);
    },
    GetDistAsVec: function(point) {
        /// <signature>
        ///  <summary>Gets the vector distance from the caller to the passed vector</summary>
        ///  <param name="point" type="Vector2"></param>
        ///  <param name="asScalar" type="bool">Optional: returns decimal length/magnitude if true</param>
        ///  <returns type="Vector2" />
        /// </signature>
        return new Vector2(point.x - this.x, point.y - this.y);
    },
    GetDistAsNum: function(point) {
        /// <signature>
        ///  <summary>Gets the vector distance from the caller to the passed vector</summary>
        ///  <param name="point" type="Vector2"></param>
        ///  <param name="asScalar" type="bool">Optional: returns decimal length/magnitude if true</param>
        ///  <returns type="decimal" />
        /// </signature>
        return (new Vector2(point.x - this.x, point.y - this.y)).GetMag();
    },
    GetDir: function(point) {
        /// <signature>
        ///  <summary>Gets the direction from the caller, to the given point</summary>
        ///  <param name="point" type="Vector2"></param>
        ///  <returns type="Vector2" />
        /// </signature>
        return (this.GetDistAsVec(point)).SetNormalized();
    },
    GetLerp: function(toVec2, t) {
        return new Vector2(
            this.x + ((toVec2.x - this.x) * t),
            this.y + ((toVec2.y - this.y) * t)
        );
    }
};

var Vector3 = function(x, y, z) {
    /// <signature>
    ///  <summary>Container for decimals x, y, z</summary>
    ///  <param name="x" type="decimal"></param>
    ///  <param name="y" type="decimal"></param>
    ///  <param name="z" type="decimal"></param>
    ///  <returns type="Vector3" />
    /// </signature>
    /// <signature>
    ///  <summary>Container for decimals x, y, z</summary>
    ///  <returns type="Vector3" />
    /// </signature>
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
};
Vector3.prototype = {
    GetData: function() {
        /// <signature>
        ///  <summary>Get components in array format</summary>
        ///  <returns type="array" />
        /// </signature>
        return [this.x, this.y, this.z];
    },
    GetCopy: function() {
        /// <signature>
        ///  <summary>Send this out as new vector</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(this.x, this.y, this.z);
    },
    SetCopy: function(vec3) {
        /// <signature>
        ///  <summary>Copy given vector3 into this object</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x = vec3.x;
        this.y = vec3.y;
        this.z = vec3.z;
        return this;
    },
    SetValues: function(x, y, z) {
        /// <signature>
        ///  <summary>Set x, y, z components</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },
    SetZero: function() {
        /// <signature>
        ///  <summary>Set x, y, z to 0</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x = this.y = this.z = 0.0;
        return this;
    },
    SetOne: function() {
        /// <signature>
        ///  <summary>Set x, y, z to 1</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x = this.y = this.z = 1.0;
        return this;
    },
    SetNegative: function() {
        /// <signature>
        ///  <summary>Change the component's signs</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    },
    GetNegative: function() {
        /// <signature>
        ///  <summary>Get a vec3 with the component's signs reversed</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(-this.x, -this.y, -this.z);
    },
    GetOrthoAxis: function() {
        // Is this sufficiently random enough?
        var otherAxis = new Vector3(this.z * 3, -this.x / 2, this.y * 2);
        var orthoAxis = this.GetCross(otherAxis);
        return orthoAxis.SetNormalized();
        /*
        var rotMtx = new Matrix2();
        rotMtx.SetRotation(90);
        var rotatedAxis = rotMtx.MultiplyVec2(new Vector2(this.x, this.y));
        return (new Vector3(rotatedAxis.x, rotatedAxis.y, this.z)).SetNormalized();
        */
    },
    SetAdd: function(vec3) {
        /// <signature>
        ///  <summary>Add the passed vector to this</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
        return this;
    },
    SetAddByAxes: function(x, y, z) {
        /// <signature>
        ///  <summary>Add the passed vector to this</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    },
    GetAdd: function(vec3) {
        /// <signature>
        ///  <summary>Return this vector plus the passed vector</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z);
    },
    SetSubtract: function(vec3) {
        /// <signature>
        ///  <summary>Subtract the passed vector</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x -= vec3.x;
        this.y -= vec3.y;
        this.z -= vec3.z;
        return this;
    },
    GetSubtract: function(vec3) {
        /// <signature>
        ///  <summary>Return this vector minus the passed vector</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(this.x - vec3.x, this.y - vec3.y, this.z - vec3.z);
    },
    SetScaleByVec: function(vec3) {
        /// <signature>
        ///  <summary>Multiplies the caller's components by the passed vector's</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x *= vec3.x;
        this.y *= vec3.y;
        this.z *= vec3.z;
        return this;
    },
    GetScaleByVec: function(vec3) {
        /// <signature>
        ///  <summary>Multiplies the caller's components by the passed vector's</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(this.x * vec3.x, this.y * vec3.y, this.z * vec3.z);
    },
    SetScaleByNum: function(scalar) {
        /// <signature>
        ///  <summary>Multiplies the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    },
    GetScaleByNum: function(scalar) {
        /// <signature>
        ///  <summary>Multiplies the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    },
    SetAddScaled: function(vec3, scalar) {
        /// <signature>
        ///  <summary>Adds the scaled vector to the caller.</summary>
        ///  <param name="vec3" type="Vector3">The vector to scale. This vector will not be changed, only it's values used.</param>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        this.x += vec3.x * scalar;
        this.y += vec3.y * scalar;
        this.z += vec3.z * scalar;
        return this;
    },
    GetAddScaled: function(vec3, scalar) {
        /// <signature>
        ///  <summary>Get this plus the scaled vector provided</summary>
        ///  <param name="vec3" type="Vector3">The vector to scale.</param>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(this.x + (vec3.x * scalar), this.y + (vec3.y * scalar), this.z + (vec3.z * scalar));
    },
    GetDot: function(vec3) {
        /// <signature>
        ///  <summary>Returns scalar dot-product of 2 vectors</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="decimal" />
        /// </signature>
        return (this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z);
    },
    GetCross: function(vec3) {
        /// <signature>
        ///  <summary>Returns Vector3 cross-product of this x vec3</summary>
        ///  <param name="vec3" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(
            (this.y * vec3.z) - (this.z * vec3.y),
            (this.z * vec3.x) - (this.x * vec3.z),
            (this.x * vec3.y) - (this.y * vec3.x)
        );
    },
    SetInverse: function() {
        /// <signature>
        ///  <summary>Divides the vector's values by 1</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        if(this.x > INFINITESIMAL || this.x < -INFINITESIMAL)
            this.x = 1.0 / this.x;
        if(this.y > INFINITESIMAL || this.y < -INFINITESIMAL)
            this.y = 1.0 / this.y;
        if(this.z > INFINITESIMAL || this.z < -INFINITESIMAL)
            this.z = 1.0 / this.z;
        return this;
    },
    GetInverse: function() {
        /// <signature>
        ///  <summary>Divides the vector's values by 1</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        var xInv = 0.0, yInv = 0.0, zInv = 0.0;
        if(this.x > INFINITESIMAL || this.x < -INFINITESIMAL)
            xInv = 1.0 / this.x;
        if(this.y > INFINITESIMAL || this.y < -INFINITESIMAL)
            yInv = 1.0 / this.y;
        if(this.z > INFINITESIMAL || this.z < -INFINITESIMAL)
            zInv = 1.0 / this.z;
        return new Vector3(xInv, yInv, zInv);
    },
    SetDivideByNum: function(scalar) {
        /// <signature>
        ///  <summary>Divides the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        if(scalar < INFINITESIMAL)
            return;
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
    },
    GetDivideByNum: function(scalar) {
        /// <signature>
        ///  <summary>Divides the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        if(scalar < INFINITESIMAL)
            return;
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    },
    GetMagSqr: function() {
        /// <signature>
        ///  <summary>Returns the squared scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    },
    GetMag: function() {
        /// <signature>
        ///  <summary>Returns the scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        var magSqr = this.GetMagSqr();
        if (magSqr < INFINITESIMAL)
            return 0;
        else if(magSqr > 1.0 - INFINITESIMAL && magSqr < 1.0 + INFINITESIMAL)
            return 1.0;
        else
            return Math.sqrt(magSqr);
    },
    GetMagInv: function() {
        /// <signature>
        ///  <summary>Returns the scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        var magSqr = this.GetMagSqr();
        if (magSqr < INFINITESIMAL)
            return 0;
        else if(magSqr > 1.0 - INFINITESIMAL && magSqr < 1.0 + INFINITESIMAL)
            return 1.0;
        else
            return 1.0 / Math.sqrt(magSqr);
    },
    SetNormalized: function() {
        /// <signature>
        ///  <summary>Divides each component value by the magnitude</summary>
        ///  <returns type="Vector3" />
        /// </signature>

        var magInv = this.GetMag();
        if (magInv < INFINITESIMAL)
            return;

        magInv = 1.0 / magInv;

        this.x *= magInv;
        this.y *= magInv;
        this.z *= magInv;
        return this;
    },
    GetNormalized: function() {
        /// <signature>
        ///  <summary>Get the vector with each component divided by the magnitude</summary>
        ///  <returns type="Vector3" />
        /// </signature>
        var mag = this.GetMag();

        if (mag < INFINITESIMAL) {
            alert("Vec3 Normalize divide by zero");
            return;
        }
        mag = 1.0 / mag;
        return new Vector3(this.x * mag, this.y * mag, this.z * mag);
    },
    GetDistAsVec: function(point) {
        /// <signature>
        ///  <summary>Gets the vector distance from the caller to the passed vector</summary>
        ///  <param name="point" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return new Vector3(point.x - this.x, point.y - this.y, point.z - this.z);
    },
    GetDistAsNum: function(point, asScalar) {
        /// <signature>
        ///  <summary>Gets the scalar distance from the caller to the passed vector</summary>
        ///  <param name="point" type="Vector3"></param>
        ///  <returns type="decimal" />
        /// </signature>
        return (new Vector3(point.x - this.x, point.y - this.y, point.z - this.z)).GetMag();
    },
    GetDir: function(point) {
        /// <signature>
        ///  <summary>Gets the direction from the caller, to the given point</summary>
        ///  <param name="point" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        return (this.GetDistAsVec(point)).SetNormalized();
    },
    SetRotated: function(thetaDeg, axis) {
        /// <signature>
        ///  <summary>SetOrientationAxisAngle around the given axis by degree specified</summary>
        ///  <param name="thetaDeg" type="decimal"></param>
        ///  <param name="axis" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>

        var norm;
        var magSqr = axis.GetMagSqr();
        if(magSqr > 1.0 + INFINITESIMAL || magSqr < 1 - INFINITESIMAL)
            norm = axis.GetScaleByNum(1.0 / Math.sqrt(magSqr));
        else
            norm = axis;

        var angle = thetaDeg * DEG_TO_RAD;
        var s = Math.sin(angle),
            c = Math.cos(angle);

        var last = (norm.GetCross(this)).SetScaleByNum(s);
        var middle = norm.GetScaleByNum(this.GetDot(norm) * (1.0 - c));
        var first = this.GetScaleByNum(c);

        this.SetCopy(first.SetAdd(middle.SetAdd(last)));
        return this;
    },
    GetRotated: function(thetaDeg, axis) {
        /// <signature>
        ///  <summary>Get a new vector rotated around the given axis by degree specified</summary>
        ///  <param name="thetaDeg" type="decimal"></param>
        ///  <param name="axis" type="Vector3"></param>
        ///  <returns type="Vector3" />
        /// </signature>
        var norm = axis.GetNormalized();

        var angle = thetaDeg * DEG_TO_RAD;
        var s = Math.sin(angle),
            c = Math.cos(angle);


        var last = (norm.GetCross(this)).GetScaleByNum(s);
        var middle = norm.GetScaleByNum(this.GetDot(norm) * (1.0 - c));
        var first = this.GetScaleByNum(c);

        return first.SetAdd(middle.SetAdd(last));
    }
};
/*
    FacingDirection: function(radRotation) {
        /// <signature>
        ///  <summary>Gets the direction the object is facing</summary>
        ///  <param name="radRotation" type="Vector3">Rotation in radians</param>
        ///  <returns type="Vector3" />
        /// </signature>
        var out = [
            Math.sin(radRotation[1]) + Math.cos(radRotation[2]),
            Math.sin(radRotation[0]) + Math.sin(radRotation[2]),
            Math.cos(radRotation[0]) + Math.cos(radRotation[1])
        ];
        return Vector3.Normalize(out);
    },
*/

function Vector4(x, y, z, w) {
    /// <signature>
    ///  <summary>Container for decimals x, y, z, w</summary>
    ///  <param name="x" type="decimal"></param>
    ///  <param name="y" type="decimal"></param>
    ///  <param name="z" type="decimal"></param>
    ///  <param name="w" type="decimal"></param>
    ///  <returns type="Vector4" />
    /// </signature>
    /// <signature>
    ///  <summary>Container for decimals x, y, z, w</summary>
    ///  <returns type="Vector4" />
    /// </signature>
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
    this.w = w || 0.0;
}
Vector4.prototype = {
    GetData: function() {
        /// <signature>
        ///  <summary>Get components in array format</summary>
        ///  <returns type="array" />
        /// </signature>
        return [this.x, this.y, this.z, this.w];
    },
    GetCopy: function() {
        /// <signature>
        ///  <summary>Send this out as new vector</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector3(this.x, this.y, this.z, this.w);
    },
    SetCopy: function(vec4) {
        /// <signature>
        ///  <summary>Copy given vector4 into this object</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = vec4.x;
        this.y = vec4.y;
        this.z = vec4.z;
        this.w = vec4.w;
        return this;
    },
    SetValues: function(x, y, z, w) {
        /// <signature>
        ///  <summary>Set x, y, z, w components</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <param name="w" type="decimal"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    },
    SetVec3: function(x, y, z) {
        /// <signature>
        ///  <summary>Set x, y, z components</summary>
        ///  <param name="x" type="decimal"></param>
        ///  <param name="y" type="decimal"></param>
        ///  <param name="z" type="decimal"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },
    SetW: function(w) {
        /// <signature>
        ///  <summary>Set w components</summary>
        ///  <param name="w" type="decimal"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.w = w;
        return this;
    },
    SetAxisAngle: function(axis, angle) {
        /// <signature>
        ///  <summary>Set x, y, z, w components from vec3 and w passed</summary>
        ///  <param name="axis" type="Vector3"></param>
        ///  <param name="angle" type="decimal"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = axis.x;
        this.y = axis.y;
        this.z = axis.z;
        this.w = angle;
        return this;
    },
    SetZero: function() {
        /// <signature>
        ///  <summary>Set x, y, z, w to 0</summary>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = this.y = this.z = this.w = 0.0;
        return this;
    },
    SetOne: function() {
        /// <signature>
        ///  <summary>Set x, y, z, w to 1</summary>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = this.y = this.z = this.w = 1.0;
        return this;
    },
    SetInverse: function() {
        /// <signature>
        ///  <summary>Change the component's signs</summary>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    },
    GetInverse: function() {
        /// <signature>
        ///  <summary>Get a vec4 with the component's signs</summary>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(-this.x, -this.y, -this.z, -this.w);
    },
    SetAdd: function(vec4) {
        /// <signature>
        ///  <summary>Add the passed vector to this</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x += vec4.x;
        this.y += vec4.y;
        this.z += vec4.z;
        this.w += vec4.w;
        return this;
    },
    GetAdd: function(vec4) {
        /// <signature>
        ///  <summary>Get this vector plus that passed</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(this.x + vec4.x, this.y + vec4.y, this.z + vec4.z, this.w + vec4.w);
    },
    SetSubtract: function(vec4) {
        /// <signature>
        ///  <summary>Subtract the passed vector</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x -= vec4.x;
        this.y -= vec4.y;
        this.z -= vec4.z;
        this.w -= vec4.w;
        return this;
    },
    GetSubtract: function(vec4) {
        /// <signature>
        ///  <summary>Return this vector minus the passed vector</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(this.x - vec4.x, this.y - vec4.y, this.z - vec4.z, this.w - vec4.w);
    },
    SetScaleByVec: function(vec4) {
        /// <signature>
        ///  <summary>Multiplies the caller's components by the passed vector's</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x *= vec4.x;
        this.y *= vec4.y;
        this.z *= vec4.z;
        this.w *= vec4.w;
        return this;
    },
    GetScaleByVec: function(vec4) {
        /// <signature>
        ///  <summary>Multiplies the caller's components by the passed vector's</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(this.x * vec4.x, this.y * vec4.y, this.z * vec4.z, this.w * vec4.w);
    },
    SetScaleByNum: function(scalar) {
        /// <signature>
        ///  <summary>Multiplies the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
        return this;
    },
    GetScaleByNum: function(scalar) {
        /// <signature>
        ///  <summary>Multiplies the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    },
    SetAddScaled: function(vec4, scalar) {
        /// <signature>
        ///  <summary>Adds the scaled vector to the caller.</summary>
        ///  <param name="vec4" type="Vector4">The vector to scale. This vector will not be changed, only it's values used.</param>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x += vec4.x * scalar;
        this.y += vec4.y * scalar;
        this.z += vec4.z * scalar;
        this.w += vec4.x * scalar;
        return this;
    },
    GetAddScaled: function(vec4, scalar) {
        /// <signature>
        ///  <summary>Adds the scaled vector to the caller.</summary>
        ///  <param name="vec4" type="Vector4">The vector to scale. This vector will not be changed, only it's values used.</param>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(this.x + (vec4.x * scalar), this.y + (vec4.y * scalar), this.z + (vec4.z * scalar), this.w + (vec4.w * scalar));
    },
    GetDot: function(vec4) {
        /// <signature>
        ///  <summary>Returns scalar dot-product of 2 vectors</summary>
        ///  <param name="vec4" type="Vector4"></param>
        ///  <returns type="decimal" />
        /// </signature>
        return (this.x * vec4.x) + (this.y * vec4.y) + (this.z * vec4.z) + (this.w * vec4.w);
    },
    SetDivide: function(scalar) {
        /// <signature>
        ///  <summary>Divides the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        this.w /= scalar;
        return this;
    },
    GetDivide: function(scalar) {
        /// <signature>
        ///  <summary>Divides the vector's values by the scalar</summary>
        ///  <param name="scalar" type="number"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
    },
    GetMagSqr: function() {
        /// <signature>
        ///  <summary>Returns the squared scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
    },
    GetMag: function() {
        /// <signature>
        ///  <summary>Returns the scalar length of the vector</summary>
        ///  <returns type="decimal" />
        /// </signature>
        return Math.sqrt(this.GetMagSqr());
    },
    SetNormalized: function() {
        /// <signature>
        ///  <summary>Divides each component value by the magnitude</summary>
        ///  <returns type="Vector4" />
        /// </signature>
        var mag = this.GetMag();
        if (mag < INFINITESIMAL) {
            alert("Vec4 Normalize divide by zero");
            return;
        }
        mag = 1.0 / mag;
        this.x *= mag;
        this.y *= mag;
        this.z *= mag;
        this.w *= mag;
        return this;
    },
    GetNormalized: function() {
        /// <signature>
        ///  <summary>Divides each component value by the magnitude</summary>
        ///  <returns type="Vector4" />
        /// </signature>
        var mag = this.GetMag();
        if (mag < INFINITESIMAL) {
            alert("Vec4 Normalize divide by zero");
            return;
        }
        mag = 1.0 / mag;
        return new Vector4(this.x * mag, this.y * mag, this.z * mag, this.w * mag);
    },
    GetDistAsVec: function(point) {
        /// <signature>
        ///  <summary>Gets the vector distance from the caller to the passed vector</summary>
        ///  <param name="point" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return new Vector4(point.x - this.x, point.y - this.y, point.z - this.z, point.w - this.w);
    },
    GetDistAsNum: function(point) {
        /// <signature>
        ///  <summary>Gets the scalar distance from the caller to the passed vector</summary>
        ///  <param name="point" type="Vector4"></param>
        ///  <returns type="decimal" />
        /// </signature>
        return (new Vector4(point.x - this.x, point.y - this.y, point.z - this.z, point.w - this.w)).GetMag();
    },
    GetDir: function(point) {
        /// <signature>
        ///  <summary>Gets the direction from the caller, to the given point</summary>
        ///  <param name="point" type="Vector4"></param>
        ///  <returns type="Vector4" />
        /// </signature>
        return (this.GetDistAsVec(point)).SetNormalized();
    }
}