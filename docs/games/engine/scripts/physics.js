
function RigidBody(objBaseTrfm, modelRadius) {
    /// <signature>
    ///  <summary>Add physics motion to gameobject</summary>
    ///  <param name="trfm" type="Transform">Transform of GameObject</param>
    ///  <returns type="RigidBody" />
    /// </signature>
    this.trfm = objBaseTrfm;
    this.modelRadius = modelRadius;

    this.active = true;

    this.velI = new Vector3();
    this.velF = new Vector3();
    this.acc = new Vector3();
    this.forceAccum = new Vector3();
    this.massInv = 0.0;
    this.dampening = 1.0;

    this.torqueAccum = new Vector3();
    this.angVel = new Vector3();
    this.angVelMag = new Vector3();
    this.angDisplace = 0.0;

    this.axisOfRotation = new Vector3();
    this.inertiaTensorInv = new Matrix3();
    this.radiusToPt = new Vector3();

    this.forceGenerators = [];
}
RigidBody.prototype = {
    SetMass: function(mass) {
        if (mass > INFINITESIMAL)
            this.massInv = 1.0 / mass;
    },
    GetMass: function() {
        return 1.0 / this.massInv;
    },
    HasFiniteMass: function() {
        return this.massInv > INFINITESIMAL;
    },
    AddForceGenerator: function(generator) {
        this.forceGenerators.push(generator);
    },
    AddForce: function(force) {
        this.forceAccum.SetAdd(force);
    },
    AddTorque: function(torque) {
        this.torqueAccum.SetAdd(torque);
    },
    ClearAccumulators: function() {
        this.forceAccum.SetZero();
        this.torqueAccum.SetZero();
    },
    ApplyGravity: function(gravity) {
        if (!this.HasFiniteMass())
            return;
        this.forceAccum.SetAdd(gravity.GetScaleByNum(this.GetMass()));
    },
    ApplyDrag: function(k1, k2)
    {
        var force = this.velF.GetCopy();

        var dragCoefficient = force.GetMag();
        dragCoefficient = (k1 * dragCoefficient) + (k2 * dragCoefficient * dragCoefficient);

        force.SetNormalized();
        force.SetScaleByNum(-dragCoefficient);

        this.forceAccum.SetAdd(force);
    },
    ApplySpring: function(anchorPos, springConstant, restLength) {
        var force = this.trfm.pos.GetSubtract(anchorPos);

        var mag = force.GetMag();
        mag -= restLength; // mag = Math.abs(magnitude - restLength); // for anchor in the middle
        mag *= springConstant;

        force.SetNormalized();
        force.SetScaleByNum(-mag);

        this.forceAccum.SetAdd(force);
    },
    ApplySpring_PullOnly: function(anchor, springConstant, restLength) {
        var force = this.trfm.pos.GetSubtract(anchor.trfm.pos);

        var mag = force.GetMagSqr();
        if (mag <= restLength * restLength)
            return;

        mag = Math.sqrt(mag);
        mag = springConstant * (mag - restLength);

        force.SetNormalized();
        force.SetScaleByNum(-mag);

        this.forceAccum.SetAdd(force);
    },
    ApplySpring_PushOnly: function(anchor, springConstant, restLength) {
        var force = this.trfm.pos.GetSubtract(anchor.trfm.pos);

        var mag = force.GetMagSqr();
        if (mag >= restLength * restLength)
            return;

        mag = Math.sqrt(mag);
        mag = springConstant * (mag - restLength);

        force.SetNormalized();
        force.SetScaleByNum(-mag);

        this.forceAccum.SetAdd(force);
    },
    ApplySpring_Stiff_Fake: function(anchorPos, springConstant, dampening) {
        if (!this.HasFiniteMass())
            return;

        var pos = this.trfm.pos.GetSubtract(anchorPos);

        var gamma = 0.5 * Math.sqrt(4 * springConstant - dampening * dampening);
        if (gamma == 0.0)
            return;

        var c = pos.GetScaleByNum(dampening / (2.0 * gamma)).SetAdd(this.velF.GetScaleByNum(1.0 / gamma));
        var target = pos.GetScaleByNum(Math.cos(gamma * Time.deltaMilli)).SetAdd(c.GetScaleByNum(Math.sin(gamma * Time.deltaMilli)));
        target.SetScaleByNum(Math.exp(-0.5 * Time.deltaMilli * dampening));

        var accel = (target.GetSubtract(pos).SetScaleByNum(1.0 / Time.deltaMilli * Time.deltaMilli)).SetSubtract(this.velF.GetScaleByNum(Time.deltaMilli));

        this.forceAccum.SetAdd(accel * this.GetMass());
    },
    ApplyBuoyancy: function(maxDepth, volume, liquidHeight, liquidDensity) {
        var depth = this.trfm.pos.y;

        if (depth >= liquidHeight + maxDepth)
            return;

        var force = new Vector3();

        if (depth <= liquidHeight - maxDepth) {
            force.y = liquidDensity * volume;
            this.forceAccum.SetAdd(force);
            return;
        }

        force.y = liquidDensity * volume * (depth - maxDepth - liquidHeight) / 2 * maxDepth;
        this.forceAccum.SetAdd(force);
    },
    ApplyTornadoMotion: function(objToEyeVec, objToEyeDistSqr, windspeed, c, drawScalar, maxForceMagSqr) {
        // c  = drag coefficient, uses rho, mass density
        // fv = viscous drag force

        // Combining laminar and turbulent flow
        var fv = (c * windspeed) + (c * windspeed * windspeed);

        // Finish Normalization
        var objToEyeDist = Math.sqrt(objToEyeDistSqr);
        var centripetal = objToEyeVec.GetScaleByNum(1.0 / objToEyeDist);

        // Control force application, so the velocity doesn't get out of hand.

        var objVelSqr = this.velF.GetMagSqr();
        var angVel = objVelSqr / objToEyeDistSqr;
        var angVelScalar = 1.0 - (angVel / windspeed);

        // Use the tangential direction to determine linear velocity, scaled by angular velocity
        var tanDir = new Vector2(-centripetal.y, centripetal.x);
        tanDir.SetScaleByNum(fv * angVelScalar);

        /* // Get circular displacement? Need opposite direction vector, or do reverse calculations
        this.angDisplace = Math.atan2(-eyeToObj.y, eyeToObj.x);
        if (this.angDisplace < 0) this.angDisplace += Math.PI * 2;

        var arc = windspeed / Time.deltaMilli;
        var theta = arc / radius;
        this.angDisplace += theta;
        */

        // Maybe get the normalized force direction, which is lerp between the tangent to the radius,
        // and the eye of the funnel, based on the object's velocity relative to the windspeed
        /*
        var t = this.velF.GetMagSqr() / (windspeed * windspeed);
        objToEye.SetNormalized();
        var force2D = tanDir.GetLerp(objToEye, t);
        force2D.SetNormalized();
        force2D.SetScaleByNum(forceScalar);
        */

        // Set centripetal force;
        centripetal.SetScaleByNum((this.GetMass() * objVelSqr) / objToEyeDist);
        // Scale for extra draw force
        centripetal.SetScaleByNum(drawScalar);

        // Apply the force to the object
        var force2D = tanDir.GetAdd(centripetal);
        var forceMagSqr = force2D.GetMagSqr();
        if(forceMagSqr > maxForceMagSqr)
            force2D.SetScaleByNum(maxForceMagSqr / forceMagSqr);

        this.forceAccum.SetAddByAxes(force2D.x, 0.0, force2D.y);
    },
    GetNetVelocity: function(rigidBody) {
        return this.velF.GetSubtract(rigidBody.velF);
    },
    GetForceFromVelocity: function() {
        // Commented is the proper way to get this force, but I believe getting the difference
        // in velocities is what's screwing up the results.
        //var accel = this.velF.GetSubtract(this.velI).SetScaleByNum(1.0 / Time.deltaMilli);
        //return accel.SetScaleByNum(this.GetMass());
        return this.velF.GetScaleByNum(this.GetMass());
    },
    OnCollisionHeadingWith: function(rigidBody) {
        var collisionDist = this.trfm.pos.GetSubtract(rigidBody.trfm.pos);
        var netVel = this.GetNetVelocity(rigidBody);
        if (netVel.GetDot(collisionDist) < 0) return true;
        return false;
    },
    SetInertiaTensor: function(radius) {
        this.inertiaTensorInv.SetInertiaTensorSphere(this.GetMass(), radius);
        this.inertiaTensorInv.Invert();
    },
    GetRestitution: function(velPreColl, velPostColl) {
        var netPreColl = this.velI.GetSubtract(velPreColl);
        var netPostColl = this.velF.GetSubtract(velPostColl);
        return -netPostColl.SetScaleByVec(netPreColl.SetConjugate()).GetMag();
    },
    CalculateImpulse: function(rigidBody, collisionDist, coefOfRest) {
        collisionDist.SetNormalized();
        var relative = collisionDist.GetDot(this.velI.GetSubtract(rigidBody.velI));
        // Calculate impulse
        var numerator = -relative * (coefOfRest + 1.0);
        var denomObj0 = collisionDist.GetDot((this.inertiaTensorInv.MultiplyVec3(this.radiusToPt.GetCross(collisionDist))).GetCross(this.radiusToPt));
        var denomObj1 = collisionDist.GetDot((rigidBody.inertiaTensorInv.MultiplyVec3(rigidBody.radiusToPt.GetCross(collisionDist))).GetCross(rigidBody.radiusToPt));
        var denominator = this.massInv + rigidBody.massInv + denomObj0 + denomObj1;
        var impulse = numerator / denominator;
        // Apply impulse
        //this.AddForce(collisionDist.GetScaleByNum(impulse));
        //rigidBody.AddForce(collisionDist.GetScaleByNum(-impulse));

        this.velF.SetCopy(this.velI.GetAddScaled(collisionDist, impulse * this.massInv));
        rigidBody.velF.SetCopy(rigidBody.velI.GetAddScaled(collisionDist, -impulse * rigidBody.massInv));
    },
    SetActive: function(boolActive) {
        this.active = boolActive;
        if(!boolActive) {
            this.ClearAccumulators();
            this.velI.SetZero();
            this.velF.SetZero();
        }
    },
    Reset: function() {
        this.ClearAccumulators();
        this.velI.SetZero();
        this.velF.SetZero();
    },
    Update: function() {

        if(this.active) {
            // Add forces this way, one time for the scene, or apply them directly in loop using Apply... methods
            for (var i = 0; i < this.forceGenerators.length; i++) {
                if (this.forceGenerators[i].active)
                    this.forceGenerators[i].Update(this);
            }

            // ROTATIONAL UPDATE
            //this.axisOfRotation = this.trfm.up.GetCross(this.velF);
            //this.axisOfRotation.SetNormalized();
            //this.angVelMag = this.velF.GetMag() / this.modelRadius;
            //this.angVel = this.axisOfRotation.SetScaleByNum(this.angVelMag);
            //this.trfm.SetOrientationAxisAngle(this.angVel, this.angVelMag);
            //dynObjs[i].qOrientation += (dynObjs[i].vAngularVelocity * dynObjs[i].qOrientation) * qTimeStep;

            // LINEAR UPDATE
            this.velI.SetCopy(this.velF);
            //this.trfm.TranslateBaseByVec(this.velF.GetScaleByNum(Time.deltaMilli));
            this.trfm.TranslateByVec((this.velI.GetScaleByNum(Time.deltaMilli)).SetAddScaled(this.acc, 0.5 * (Time.deltaMilli * Time.deltaMilli)));

            this.acc.SetZero();
            this.acc.SetAddScaled(this.forceAccum, this.massInv);
            this.ClearAccumulators();

            this.velF.SetCopy(this.velI.GetAddScaled(this.acc, Time.deltaMilli));
            this.velF.SetScaleByNum(Math.pow(this.dampening, Time.deltaMilli));

            if (this.velF.GetMagSqr() < INFINITESIMAL)
                this.velF.SetZero();
        }
    }
};


/*************************** MANAGE AND IMPLEMENT VARIOUS TYPES OF FORCES ****************************************/

var ForceGenerators = {
    Gravity: function(gravity)
    {
        /// <signature>
        ///  <summary>Generate force from acceleration due to gravity</summary>
        ///  <param name="gravity" type="Vector3">Gravitaional acceleration</param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {
            if (!rb.HasFiniteMass())
                return;
            rb.AddForce(gravity.GetScaleByNum(rb.GetMass()));
        }
    },
    Drag: function(k1, k2)
    {
        /// <signature>
        ///  <summary>Generate force from drag coefficients, as determined by the object and type of drag</summary>
        ///  <param name="k1" type="decimal">Linear drag coefficient</param>
        ///  <param name="k2" type="decimal">Quadratic drag coefficient</param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {
            var force = rb.velF.GetCopy();

            var dragCoefficient = force.GetMag();
            dragCoefficient = (k1 * dragCoefficient) + (k2 * dragCoefficient * dragCoefficient);

            force.SetNormalized();
            force.SetScaleByNum(-dragCoefficient);

            rb.AddForce(force);
        }
    },
    Spring: function(anchor, springConstant, restLength) {
        /// <signature>
        ///  <summary>
        ///    Generate a spring force between two objects.
        ///    If both objects are dynamic, both need to generate a force from each other with this function.
        ///  </summary>
        ///  <param name="anchor" type="ParticlePhysics">The object on the other end of the spring</param>
        ///  <param name="springConstant" type="decimal"></param>
        ///  <param name="restLength" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {
            var force = rb.trfm.pos.GetSubtract(anchor.trfm.pos);

            var mag = force.GetMag();
            mag -= restLength; // mag = Math.abs(magnitude - restLength); // for anchor in the middle
            mag *= springConstant;

            force.SetNormalized();
            force.SetScaleByNum(-mag);

            rb.AddForce(force);
        }
    },
    Spring_PullOnly: function(anchor, springConstant, restLength) {
        /// <signature>
        ///  <summary>
        ///    Generate a pulling spring force between two objects.
        ///    If both objects are dynamic, both need to generate a force from each other with this function.
        ///  </summary>
        ///  <param name="anchor" type="ParticlePhysics">The object on the other end of the spring</param>
        ///  <param name="springConstant" type="decimal"></param>
        ///  <param name="restLength" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {

            var force = rb.trfm.pos.GetSubtract(anchor.trfm.pos);

            var mag = force.GetMagSqr();
            if (mag <= restLength * restLength)
                return;

            mag = Math.sqrt(mag);
            mag = springConstant * (mag - restLength);

            force.SetNormalized();
            force.SetScaleByNum(-mag);

            rb.AddForce(force);
        }
    },
    Spring_PushOnly: function(anchor, springConstant, restLength) {
        /// <signature>
        ///  <summary>
        ///    Generate a pushing spring force between two objects.
        ///    If both objects are dynamic, both need to generate a force from each other with this function.
        ///  </summary>
        ///  <param name="anchor" type="ParticlePhysics">The object on the other end of the spring</param>
        ///  <param name="springConstant" type="decimal"></param>
        ///  <param name="restLength" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {
            var force = rb.trfm.pos.GetSubtract(anchor.trfm.pos);

            var mag = force.GetMagSqr();
            if (mag >= restLength * restLength)
                return;

            mag = Math.sqrt(mag);
            mag = springConstant * (mag - restLength);

            force.SetNormalized();
            force.SetScaleByNum(-mag);

            rb.AddForce(force);
        }
    },
    Spring_Stiff_Fake: function(anchorPos, springConstant, dampening) {
        /// <signature>
        ///  <summary>
        ///    Generate a fake stiff spring force between two objects.
        ///    If both objects are dynamic, both need to generate a force from each other with this function.
        ///  </summary>
        ///  <param name="anchorPos" type="Vector3">The object on the other end of the spring</param>
        ///  <param name="springConstant" type="decimal"></param>
        ///  <param name="dampening" type="decimal"></param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {
            if (!rb.HasFiniteMass())
                return;

            var pos = rb.trfm.pos.GetSubtract(anchorPos);

            var gamma = 0.5 * Math.sqrt(4 * springConstant - dampening * dampening);
            if (gamma == 0.0)
                return;

            var c = pos.GetScaleByNum(dampening / (2.0 * gamma)).SetAdd(rb.velF.GetScaleByNum(1.0 / gamma));
            var target = pos.GetScaleByNum(Math.cos(gamma * Time.deltaMilli)).SetAdd(c.GetScaleByNum(Math.sin(gamma * Time.deltaMilli)));
            target.SetScaleByNum(Math.exp(-0.5 * Time.deltaMilli * dampening));

            var accel = (target.GetSubtract(pos).SetScaleByNum(1.0 / Time.deltaMilli * Time.deltaMilli)).SetSubtract(rb.velF.GetScaleByNum(Time.deltaMilli));

            rb.AddForce(accel * rb.GetMass());
        }
    },
    Buoyancy: function(maxDepth, volume, liquidHeight, liquidDensity) {
        /// <signature>
        ///  <summary>Generate a buoancy force</summary>
        ///  <param name="maxDepth" type="decimal">The max submerge depth before the max buoancy is applied</param>
        ///  <param name="volume" type="decimal"></param>
        ///  <param name="liquidHeight" type="decimal"></param>
        ///  <param name="liquidDensity" type="decimal">1000 for water</param>
        ///  <returns type="void" />
        /// </signature>
        this.active = true;
        this.Update = function(rb) {
            var depth = rb.trfm.pos.y;

            if (depth >= liquidHeight + maxDepth)
                return;

            var force = new Vector3();

            if (depth <= liquidHeight - maxDepth) {
                force.y = liquidDensity * volume;
                rb.AddForce(force);
                return;
            }

            force.y = liquidDensity * volume * (depth - maxDepth - liquidHeight) / 2 * maxDepth;

            rb.AddForce(force);
        }
    }
};