
var GameMngr = {
    canvas: null,
    assets: {
        textures: {},
        models: {},
        sounds: {}
    },
    paused: false,
    UserUpdate: function() {},
    Begin: function(canvasID, GameCallback, textureNamesFilepaths, modelNamesFilepaths, audioNamesFilepaths) {
        var that = this;
        var canvas = document.getElementById(canvasID);
        this.canvas = canvas.cloneNode(true);
        var ctx2D = canvas.getContext("2d");

        // 9 in the engine
        var numAssets = 15 +
            textureNamesFilepaths.length +
            modelNamesFilepaths.length +
            audioNamesFilepaths.length,
            itemPrct = 0,
            totalPrct = 0;
        function CheckProgress(event) {
            if(event.lengthComputable) {
                itemPrct = event.loaded / event.total;
                DrawLoadMsg(itemPrct, totalPrct);
            }
            else {
                // cannot compute because size is unknown
            }
        }

        var assetIdx = 0;
        function LoadComplete() {
            assetIdx++;
            totalPrct = assetIdx / numAssets;
            DrawLoadMsg(1.0, totalPrct);
        }
        function DrawLoadMsg(itemPrct, totalPrct) {
            ctx2D.clearRect(0, 0, 800, 800);
            ctx2D.fillStyle = "#FFFFFF";
            ctx2D.fillText("Loading " + Math.round(totalPrct * 100), 500, 700);
            ctx2D.fillRect(495, 725, 210, 20);
            ctx2D.fillRect(495, 755, 210, 20);
            ctx2D.fillStyle = "#191919";
            ctx2D.fillRect(500, 730, 200, 10);
            ctx2D.fillRect(500, 760, 200, 10);
            ctx2D.fillStyle = "#CC8033";
            ctx2D.fillRect(500, 730, itemPrct*200, 10);
            ctx2D.fillRect(500, 760, totalPrct*200, 10);
        }

        function UserContentLoadComplete() {
            ctx2D.fillRect(0, 0, 800, 800);

            // Clone the canvas for webGL implementation and destroy the old one
            canvas.parentNode.replaceChild(that.canvas, canvas);
            that.canvas.style.backgroundImage = "none";
            that.canvas.style.backgroundColor = "white";

            console.log("GAME STARTUP");
            wGL.Initialize(that.canvas.getContext('webgl'));
            ViewMngr.Initialize();
            Input.Initialize();
            DebugMngr.Initialize();

            GameCallback();
        }

        function LoadModels() {
            FileUtils.LoadModels(modelNamesFilepaths, that.assets.models, UserContentLoadComplete, CheckProgress, LoadComplete);
        }
        function EngineLoadComplete() {
            console.log("LOADING GAME CONTENT");

            // Load up audio quick and easy first
            for(var i = 0; i < audioNamesFilepaths.length; i++) {
                that.assets.sounds[audioNamesFilepaths[i][0]] = new Audio(audioNamesFilepaths[i][1]);
                LoadComplete();
            }
            console.log("Loading Audio Complete");

            FileUtils.LoadTextures(textureNamesFilepaths, that.assets.textures, LoadModels, CheckProgress, LoadComplete);
        }

        // Show loading animation components
        function RunLoadScreen() {
            canvas.removeEventListener("click", RunLoadScreen);
            ctx2D.clearRect(0, 0, 800, 800);
            ctx2D.fillText("Loading...", 500, 700);

            EL.PreLoad(EngineLoadComplete, CheckProgress, LoadComplete);
        }
        function ShowTornadoomTitle() {
            ctx2D.font = "30px Arial";
            ctx2D.fillStyle = "#FFFFFF";
            ctx2D.fillText("Click to load", 500, 700);
        }

        canvas.addEventListener("click", RunLoadScreen);
        ShowTornadoomTitle();
    },
    SetPaused: function(bePaused) {
        this.paused = bePaused;
    },
    BeginLoop: function() {
        var time_LastFrame;
        var that = this;

        function LoopGame() {
            requestAnimationFrame(LoopGame);
            var time_ThisFrame = new Date().getTime();
            var time_Delta = time_ThisFrame - (time_LastFrame || time_ThisFrame);
            time_LastFrame = time_ThisFrame;
            Time.deltaMilli = time_Delta / 1000;
            Time.fps = 1000 / time_Delta;

            // The time increment goes crazy when the window is out of focus.
            if(Time.deltaMilli > 0.018)
                Time.deltaMilli = 0.018;

            if(!that.paused) {
                Time.counter += Time.deltaMilli;
                // Updating Game World and Draw Calls
                SceneMngr.Update();
                DebugMngr.Update();
                ViewMngr.Update();
            }

            that.UserUpdate();
            wGL.RenderScene(ViewMngr.activeCam.mtxCam);
            wGL.RenderGUI();
        }
        LoopGame();
        //window.setInterval(function() {LoopGame()}, 16);
    }
};