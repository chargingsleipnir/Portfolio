/**
 * Created by Devin on 2015-04-01.
 */

function Probe(posArray, speed, CollisionCallback) {

    var that = this;
    var active = true;

    // Use simple motion mechanics to move around the level.
    var dir = new Vector3();
    var wpIdx = 0;

    this.obj = new GameObject('probe', Labels.none);
    var pos = this.obj.trfmGlobal.pos;
    this.obj.SetModel(GameMngr.assets.models['probe']);

    // particles -------------------------------------------------

    this.obj.AddComponent(Components.particleSystem);
    var effects = new PtclPhysicsEffects();
    effects.travelTime = 1.5;
    effects.startDist = 0.0;
    effects.dir.SetValues(0.0, 1.0, 0.0);
    effects.range = 30.0;
    effects.speed = 10.0;
    effects.acc.SetValues(0.0, -15.0, 0.0);
    effects.dampening = 0.9;
    effects.colourBtm.SetValues(0.7, 0.7, 0.7);
    effects.colourTop.SetValues(1.0, 1.0, 0.7);
    effects.lineLength = 0.0;
    effects.alphaStart = 1.0;
    effects.fadePoint = 0.75;
    effects.alphaEnd = 0.0;
    effects.size = 5.0;

    this.obj.ptclSys.AddAutoField(new ParticleFieldAutomated(100, true, 0.4, effects));

    // Collisions -------------------------------------------------

    this.obj.AddComponent(Components.collisionSystem);
    function ProbeCollCallback(collider) {
        if(CollisionCallback(collider, that))
            that.GetHit();
    }
    this.obj.collider.SetSphereCall(ProbeCollCallback);

    // Object methods -------------------------------------------------
    this.GetHit = function() {
        this.obj.ptclSys.RunField(0);
        GameMngr.assets.sounds['probeExplosion'].play();
    };
    this.SetVisible = function(isVisible) {
        this.obj.mdlHdlr.active = isVisible;
        for (var i in this.obj.components)
            this.obj.components[i].SetActive(isVisible);

        active = isVisible;
    };
    var angle = 0.0;
    this.Update = function() {
        if(active) {
            angle += 2.0;
            if (angle > 360.0)
                angle = 0.0;
            this.obj.trfmBase.SetUpdatedRot(VEC3_UP, angle);

            dir.SetValues(posArray[wpIdx][0] - pos.x, posArray[wpIdx][1] - pos.y, posArray[wpIdx][2] - pos.z);
            var magSqr = dir.GetMagSqr();
            if (magSqr < 1.0)
                wpIdx = (wpIdx + 1) % posArray.length;
            dir.SetScaleByNum(1.0 / Math.sqrt(magSqr));
            this.obj.trfmBase.TranslateByVec(dir.SetScaleByNum(speed * Time.deltaMilli));
        }
    };
}