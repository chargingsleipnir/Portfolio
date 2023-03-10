/**
 * Created by Devin on 2015-03-13.
 */

function Barn() {

    this.obj = new GameObject('barn', Labels.none);
    this.obj.SetModel(GameMngr.assets.models['barn']);
    this.obj.mdlHdlr.SetTexture(GameMngr.assets.textures['barnTex'], TextureFilters.linear);

    // Particle effects ----------------------------------------------------------
    var ptclRotObj = new GameObject("tail particle rotation", Labels.none);
    ptclRotObj.AddComponent(Components.particleSystem);
    ptclRotObj.trfmOffset.SetPosByAxes(3.0, -1.5, 0.0);

    var effects = new FlatTailEffects();
    effects.colour = new Vector3(1.0, 0.7, 0.9);
    effects.thickness = 0.5;
    effects.axis = Axes.y;
    effects.alphaStart = 0.5;
    effects.fadePoint = 0.25;
    effects.alphaEnd = 0.0;
    var barnTail = new FlatTail(100, null, effects);
    ptclRotObj.ptclSys.AddTail(barnTail);
    barnTail.Run();

    var ptclBurstObj = new GameObject("cow saved particle burst", Labels.none);
    ptclBurstObj.AddComponent(Components.particleSystem);
    ptclBurstObj.trfmBase.SetPosByAxes(0.75, 1.5, -1.30);

    effects = new PtclPhysicsEffects();
    effects.travelTime = 2.0;
    effects.startDist = 0.5;
    effects.dir.SetValues(0.0, 1.0, 0.0);
    effects.range = 30.0;
    effects.speed = 2.5;
    effects.acc.SetValues(0.0, -1.0, 0.0);
    effects.dampening = 0.25;
    effects.colourBtm.SetValues(0.0, 0.25, 0.5);
    effects.colourTop.SetValues(0.0, 1.0, 1.0);
    effects.lineLength = 0.0;
    effects.alphaStart = 1.0;
    effects.fadePoint = 0.5;
    effects.alphaEnd = 0.0;
    effects.size = 5.0;
    var chimneyBurstVisual = new ParticleFieldAutomated(100, true, 0.5, effects);
    ptclBurstObj.ptclSys.AddAutoField(chimneyBurstVisual);

    this.obj.AddChild(ptclRotObj);
    this.obj.AddChild(ptclBurstObj);

    this.obj.AddComponent(Components.collisionSystem);

    this.RunChimneyBurst = function() {
        chimneyBurstVisual.Run();
    };

    var angle = 0.00;
    this.Update = function() {
        angle += 2.0;
        if(angle > 360.0)
            angle = 0.0;

        ptclRotObj.trfmOffset.SetUpdatedRot(VEC3_UP, angle);
    }
}