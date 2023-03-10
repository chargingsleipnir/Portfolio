
var DebugMngr = {
    active: false,
    dispOrientAxes: false,
    dispSpheres: false,
    dispCapsules: false,
    dispDonuts: false,
    dispBoxes: false,
    dispRays: false,
    dispAxes: false,
    dispGrid: false,
    dispInfo: false,
    axes: null,
    grid: null,
    dispName: "Performance Data",
    SetFullActive: function(active) {
        if(active) this.active = this.dispOrientAxes = this.dispShells = this.dispRays = this.dispAxes = this.dispGrid = true;
        else this.active = this.dispOrientAxes = this.dispShells = this.dispRays = this.dispAxes = this.dispGrid = false;

        GUINetwork.SetActive(this.dispName, active);
    },
    Initialize: function() {
        if(this.active) {
            var zeroPointAxes = new GameObject('zeroPointAxes', Labels.productionEnvironment);
            zeroPointAxes.SetModel(Primitives.axesZeroPoints);
            this.axes = zeroPointAxes.mdlHdlr;

            var grid = new GameObject('grid', Labels.productionEnvironment);
            grid.parent = new GameObject("Grid Parent", Labels.none);
            grid.trfmBase.SetScaleAxes(10.0, 0.0, 10.0);
            grid.trfmBase.TranslateByAxes(0.0, 0.05, 0.0);
            grid.SetModel(Primitives.grid);
            grid.Update();
            this.grid = grid.mdlHdlr;

            var performanceData = new GUISystem(new WndRect(ViewMngr.wndWidth - 370, ViewMngr.wndHeight - 140, 350, 120), this.dispName);

            var style = new MsgBoxStyle();
            style.fontSize = 20;
            style.fontColour = new Vector3(1.0, 1.0, 1.0);
            style.textMaxWidth = 0;
            style.textAlignWidth = Alignment.left;
            style.textAlignHeight = Alignment.top;
            style.bgTexture = null;
            style.bgColour = new Vector3(0.0, 0.0, 0.0);
            style.textLineSpacing = 0.0;
            style.margin = 5.0;
            style.bgAlpha = 0.5;
            style.bold = false;
            this.gameTimer = new GUITextObject(new WndRect(0, 0, 350, 30), "GameTime: 00.00", style);
            this.frameRateMsg = new GUITextObject(new WndRect(0, 30, 350, 30), "FrameRt", style);
            this.mousePosMsg = new GUITextObject(new WndRect(0, 60, 350, 30), "0000000000000000000000000", style);
            this.mouseDirMsg = new GUITextObject(new WndRect(0, 90, 350, 30), "0000000000000000000000000", style);
            performanceData.AddTextObject("gameTimer", this.gameTimer);
            performanceData.AddTextObject("frameRateMsg", this.frameRateMsg);
            performanceData.AddTextObject("mousePosMsg", this.mousePosMsg);
            performanceData.AddTextObject("mouseDirMsg", this.mouseDirMsg);
            GUINetwork.AddSystem(performanceData, false);

            Input.RegisterControlScheme("GUIMouseTracking", true, InputTypes.mouse);
            this.mouse = Input.CreateInputController("GUIMouseTracking");
        }
    },
    frameRateMsg: null,
    frameRateCapture: 0,
    counter: 0,
    Update: function() {
        if(this.active && this.dispInfo) {
            if (this.frameRateMsg != null) {
                this.counter += Time.deltaMilli;
                if (this.counter > 0.25) {
                    this.counter = 0.0;
                    this.frameRateCapture = Time.fps;
                }
                this.gameTimer.UpdateMsg("Game Time: " + Time.counter);
                this.frameRateMsg.UpdateMsg("FPS: " + this.frameRateCapture.toString());
                this.mousePosMsg.UpdateMsg("MousePos x: " + this.mouse.pos.x + ", y: " + this.mouse.pos.y);
                this.mouseDirMsg.UpdateMsg("MouseDir x: " + this.mouse.dir.x + ", y: " + this.mouse.dir.y);
            }
        }
    }
};

function DebugHandler() {
    this.orientAxes = [];
    this.collSpheres = [];
    this.collCapsules = [];
    this.collDonuts = [];
    this.collBoxes = [];
    this.velRays = {
        rays: [],
        pos: [],
        slopes: []
    };
    this.activeDispObjs = [];
}
DebugHandler.prototype =  {
    AddRayCast: function(ray, pos, slope) {
        this.velRays.rays.push(ray);
        this.velRays.pos.push(pos);
        this.velRays.slopes.push(slope);
    },
    UpdateActiveDispObjs: function() {
        this.activeDispObjs = [];
        if(DebugMngr.dispOrientAxes)
            this.activeDispObjs = this.activeDispObjs.concat(this.orientAxes);
        if(DebugMngr.dispSpheres)
            this.activeDispObjs = this.activeDispObjs.concat(this.collSpheres);
        if(DebugMngr.dispCapsules)
            this.activeDispObjs = this.activeDispObjs.concat(this.collCapsules);
        if(DebugMngr.dispDonuts)
            this.activeDispObjs = this.activeDispObjs.concat(this.collDonuts);
        if(DebugMngr.dispBoxes)
            this.activeDispObjs = this.activeDispObjs.concat(this.collBoxes);
    },
    GetActiveDispObjs: function() {
        return this.activeDispObjs.slice();
    },
    GetRays: function() {
        return this.velRays.rays;
    },
    Update: function () {
        if(DebugMngr.active) {
            if(DebugMngr.dispRays) {
                for (var i = 0; i < this.velRays.rays.length; i++) {
                    var newVertData = this.velRays.pos[i].GetData();
                    newVertData = newVertData.concat(this.velRays.pos[i].GetAdd(this.velRays.slopes[i]).GetData());
                    this.velRays.rays[i].RewriteVerts(newVertData);
                }
            }
        }
    }
};