/**
 * Created by Devin on 2014-12-29.
 */

var ViewMngr = {
    wndWidth: 0,
    wndHeight: 0,
    offsetLeft: 0,
    offsetTop: 0,
    inFullScreen: false,
    mtxProj: new Matrix4(),
    activeCam: null,
    usingWorldCam: true,
    frustum: null,
    farCullDist: 400.0,
    lightProps: {
        useFragLighting: false,
        model: LightModels.phong
    },
    SetLightProperties: function(useFragLighting, lightModel) {
        this.lightProps.useFragLighting = useFragLighting;
        this.lightProps.model = lightModel;
    },
    Initialize: function() {
        // Get and use wGL canvas window sizing
        var canvasStyles = window.getComputedStyle(GameMngr.canvas, null);
        this.wndWidth = parseFloat(canvasStyles.width);
        this.wndHeight = parseFloat(canvasStyles.height);
        this.offsetLeft = GameMngr.canvas.offsetLeft;
        this.offsetTop = GameMngr.canvas.offsetTop;

        //console.log(
        //    "VM: wndW = " + this.wndWidth +
        //    ", wndH = " + this.wndHeight +
        //    ", offL = " + this.offsetLeft +
        //    ", offT = " + this.offsetTop);

        //var ReqFullscreen =
        //    GameMngr.canvas.requestFullScreen ||
        //    GameMngr.canvas.webkitRequestFullScreen ||
        //    GameMngr.canvas.mozRequestFullScreen;
        //ReqFullscreen.call(GameMngr.canvas);

        //var ExitFullscreen

        //GameMngr.canvas.addEventListener("click", SetFS);
        //document.addEventListener('fullscreenchange', FullScreenChangeCallback, false);
        //document.addEventListener('mozfullscreenchange', FullScreenChangeCallback, false);
        //document.addEventListener('webkitfullscreenchange', FullScreenChangeCallback, false);

        //function FullScreenChangeCallback() {
        //    if (document.fullscreenElement === GameMngr.canvas ||
        //        document.mozFullScreenElement === GameMngr.canvas ||
        //        document.webkitFullscreenElement === GameMngr.canvas) {
        //
        //        inFullScreen = true;
        //        GameMngr.SetPaused(false);
        //        GameMngr.canvas.removeEventListener("click", SetFS);
        //    }
        //    else {
        //        inFullScreen = false;
        //        GameMngr.SetPaused(true);
        //        GameMngr.canvas.addEventListener("click", SetFS);
        //    }
        //}

        // Instantiate frustum and projection matrix together
        this.frustum = new Frustum(this.mtxProj, 45.0, this.wndWidth / this.wndHeight, 0.1, this.farCullDist);

        this.camera = new Camera();
        this.camera.SetFreeControls("Initial Camera Controller", true);
        this.activeCam = this.camera;
        this.SetActiveCamera(this.camera);

        //wGL.ReshapeWindow(this.wndWidth, this.wndHeight);
    },
    Resize: function(event) {
        if(GameMngr.canvas) {
            //var canvasStyles = window.getComputedStyle(GameMngr.canvas, null);
            //this.wndWidth = parseFloat(canvasStyles.width);
            //this.wndHeight = parseFloat(canvasStyles.height);
            this.offsetLeft = GameMngr.canvas.offsetLeft;
            this.offsetTop = GameMngr.canvas.offsetTop;
        }
    },
    SetActiveCamera: function(camera) {
        this.activeCam.active = false;
        if(camera) {
            this.usingWorldCam = false;
            camera.active = true;
            this.activeCam = camera;
        }
        else {
            this.usingWorldCam = true;
            this.camera.active = true;
            this.activeCam = this.camera;
        }
        this.activeCam.trfmAxes.active = true;
    },
    Update: function() {
        this.activeCam.Update();
    }
};