/**
 * Created by Devin on 2015-04-12.
 */

function Tree(model, texture) {
    GameObject.call(this, 'tree', Labels.none);
    this.SetModel(GameMngr.assets.models['treeTrunk']);
    this.mdlHdlr.SetTexture(GameMngr.assets.textures['barkTex'], TextureFilters.mipmap);
    this.trfmBase.SetScaleAxes(2.0, 2.0, 2.0);
    this.trfmBase.SetUpdatedRot(VEC3_UP, Math.random() * 360.0);
    var treeBranches = new GameObject('branches', Labels.none);
    treeBranches.SetModel(model);
    treeBranches.mdlHdlr.SetTexture(texture, TextureFilters.mipmap);
    this.AddChild(treeBranches);
    treeBranches.trfmBase.SetPosByAxes(0.0, 0.3, 0.0);
}
Tree.prototype = GameObject.prototype;