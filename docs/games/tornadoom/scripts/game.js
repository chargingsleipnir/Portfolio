/**
 * Created by Devin on 2014-12-29.
 */

function BuildGame() {
    /*====================================== GLOBAL GAME SETUP ======================================*/

    /********************************** Fields **********************************/

    var that = this;

    var cowsEncountered = 0,
        cowsSavedByLevel = 0,
        cowsSavedTotal = 0,
        cowsAbductedByLevel = 0,
        cowsAbductedTotal = 0;

    var fadeRate = -0.025;

    this.AmmoTypes = { cow: 0, hayBale: 1 };

    /********************************** Environment Init **********************************/

    // This is temporary, just to view the world and build scenes easier.
    ViewMngr.camera.trfmAxes.SetPosAxes(0.0, 5.0, 0.0);
    ViewMngr.camera.trfmAxes.RotateLocalViewX(-10);
    ViewMngr.camera.FreeControlUpdate();

    /********************************** Global Input **********************************/

    var gameMouseCtrlName = "GameMouse";
    Input.RegisterControlScheme(gameMouseCtrlName, true, InputTypes.mouse);
    var gameMouse = Input.CreateInputController(gameMouseCtrlName);

    var gameKeyCtrlName = "SceneAndMenuNav";
    Input.RegisterControlScheme(gameKeyCtrlName, true, InputTypes.keyboard);
    var menuBtn = Input.CreateInputController(gameKeyCtrlName, KeyMap.P);


    /********************************** In-Game GUI Systems **********************************/
    // HUD ------------------------------------------------------------------
    var hud = CreateHUD();

    var hudAmmoMsgs = [
        hud.guiTextObjs["caughtCowInfo"],
        hud.guiTextObjs["caughtBaleInfo"]
    ];

    /********************************** Global Objects **********************************/

    // Player ------------------------------------------------------------------
    var player = new Player();

    function PlayerCollCallback(collider) {
        if (collider.gameObj.label == Labels.ammo) {
            if (collider.trfm.pos.y < player.height)
                player.Absord(collider.gameObj, that.GetAmmoType(collider.gameObj.name));
        }
    }
    var UpdateHUDAmmoSelection = function (ammoIdx) {
        for (var i = 0; i < hudAmmoMsgs.length; i++) {
            hudAmmoMsgs[i].SetObjectFade(0.66);
        }
        hudAmmoMsgs[ammoIdx].SetObjectFade(1.0);
    };
    var UpdateHUDAmmoCount = function (ammoIdx, count) {
        hudAmmoMsgs[ammoIdx].UpdateMsg("" + count);
    };
    var UpdateHUDPowerLevel = function (power) {
        hud.guiProgObjs["launchPowerBar"].UpdateValue(power);
    };
    player.obj.collider.SetSphereCall(PlayerCollCallback);
    player.SetAmmoSelectionCallback(UpdateHUDAmmoSelection);
    player.SetAmmoCountChangeCallback(UpdateHUDAmmoCount);
    player.SetPowerChangeCallback(UpdateHUDPowerLevel);
    // -------------------------------------------------------------------------

    var ufo = new UFO();
    var barn = new Barn();
    barn.obj.trfmBase.SetPosByAxes(0.0, 0.0, -20.0);
    barn.obj.trfmBase.SetUpdatedRot(VEC3_UP, -45);

    var alienBarrier = new GameObject('alien barrier', Labels.none);
    alienBarrier.SetModel(new Primitives.AlienBarrier(0.15, 8, 8));
    alienBarrier.trfmBase.TranslateByAxes(0.0, 999.0, 0.0);
    alienBarrier.mdlHdlr.SetTintAlpha(0.0);

    var cows = [];
    var MAX_COWS = 10;
    for (var i = 0; i < MAX_COWS; i++)
        cows[i] = new Cow();

    var haybales = [];
    var MAX_BALES = 10;
    for (var i = 0; i < MAX_BALES; i++)
        haybales[i] = new HayBale();

    // Decorative Objects ------------------------------------------------------------------
    var skyBoxTextures = [
        GameMngr.assets.textures['skyTexXPos'],
        GameMngr.assets.textures['skyTexXNeg'],
        GameMngr.assets.textures['skyTexYPos'],
        GameMngr.assets.textures['skyTexYNeg'],
        GameMngr.assets.textures['skyTexZPos'],
        GameMngr.assets.textures['skyTexZNeg']
    ];
    var skyBox = new GameObject('skyBox', Labels.none);
    var skyBoxModel = new Primitives.Cube(new Vector3(1.0, 1.0, 1.0), false);
    skyBoxModel.SetForCubeTexturing();
    skyBox.SetModel(skyBoxModel, false, EL.assets.shaderPrograms['cubeTex']);
    skyBox.mdlHdlr.SetCubeTextures(skyBoxTextures);

    // var newWindow = window.open("about:blank", "", "_blank");
    // if(newWindow)
    //     newWindow.document.write(skyBox.mdlHdlr.shdrFilePair.vert);

    // var newWindow2 = window.open("about:blank", "", "_blank");
    // if(newWindow2)
    //     newWindow2.document.write(skyBox.mdlHdlr.shdrFilePair.frag);


    skyBox.trfmBase.SetScaleAxes(150.0, 150.0, 150.0);
    skyBox.trfmBase.TranslateByAxes(0.0, 25.0, 0.0);

    var hillyHorizon = new GameObject('horizon', Labels.none);
    hillyHorizon.SetModel(GameMngr.assets.models['horizon']);
    hillyHorizon.mdlHdlr.SetTexture(GameMngr.assets.textures['groundTex'], TextureFilters.mipmap);

    var NUM_BUSHY_TREES = 12,
        NUM_TALL_TREES = 15;
    var bushyTreeXZPos = [
        [-48.0, -40.0], [-46.0, -41.0], [-45.0, -42.0],
        [-44.5, 61.0], [54.5, -68.0], [0.0, 70.0],
        [50.0, 20.0], [50.5, 21.0], [49.0, 23.0],
        [52.0, 20.5], [52.5, 22.0], [52.0, 23.5]
    ],
        tallTreeXZPos = [
        [-47.0, -44.0], [-48.5, -42.0], [-44, -40.0],
        [-45.0, 60.0], [-49.0, 59.0], [-46.5, 58.0],
        [-48.0, 57.0], [-45.0, 57.0], [-46.5, 56.0],
        [-48.5, 60.0], [-45.5, 59.0], [-47.0, 58.0],
        [49.5, 21.5], [50.0, 24.0], [2.0, 71.5]
    ];
    var bushyTrees = [],
        tallTrees = [];
    for(var i = 0; i < NUM_BUSHY_TREES; i++) {
        bushyTrees[i] = new Tree(GameMngr.assets.models['treeBranches2'], GameMngr.assets.textures['foliageTexBright']);
        bushyTrees[i].trfmBase.SetPosXZ(bushyTreeXZPos[i][0], bushyTreeXZPos[i][1]);
    }
    for(var i = 0; i < NUM_TALL_TREES; i++) {
        tallTrees[i] = new Tree(GameMngr.assets.models['treeBranches'], GameMngr.assets.textures['foliageTexDark']);
        tallTrees[i].trfmBase.SetPosXZ(tallTreeXZPos[i][0], tallTreeXZPos[i][1]);
    }

    var pen = new GameObject('pen', Labels.none);
    pen.SetModel(GameMngr.assets.models['pen']);
    var penRadii = pen.shapeData.radii;
    pen.mdlHdlr.SetTintRGB(0.3, 0.225, 0.0);
    pen.trfmBase.SetPosXZ(38.0 + penRadii.x, -15.0);

    var NUM_WAGONS = 3,
        NUM_CHICKENS = 6,
        NUM_SHEEP = 3;

    var wagons = [],
        chickens = [],
        sheep = [];

    var wagonPos = [[10.0, -40.0], [12.0, -40.0], [40.0, -15.0 + penRadii.z * 1.5]],
        chickenPos = [[-1.25, -1.0], [0.25, 0.0], [1.5, -1.5], [-1.5, 0.5], [0.0, 2.0], [2.0, 1.0]],
        sheepPos = [[0.0, -1.5], [-1.0, 1.0], [1.0, 1.5]];

    for(var i = 0; i < NUM_WAGONS; i++) {
        wagons[i] = new GameObject('wagon', Labels.none);
        wagons[i].SetModel(GameMngr.assets.models['wagon']);
        wagons[i].mdlHdlr.SetTexture(GameMngr.assets.textures['wagonTex'], TextureFilters.mipmap);
        wagons[i].trfmBase.SetPosXZ(wagonPos[i][0], wagonPos[i][1]);
        wagons[i].trfmBase.SetUpdatedRot(VEC3_UP, Math.random() * 360.0);
    }

    for(var i = 0; i < NUM_CHICKENS; i++) {
        chickens[i] = new GameObject('chicken', Labels.none);
        pen.AddChild(chickens[i]);
        chickens[i].SetModel(GameMngr.assets.models['chicken']);
        chickens[i].mdlHdlr.SetTexture(GameMngr.assets.textures['chickenTex'], TextureFilters.mipmap);
        chickens[i].trfmBase.SetPosByAxes(chickenPos[i][0], -penRadii.y, chickenPos[i][1]);
        chickens[i].trfmBase.SetUpdatedRot(VEC3_UP, Math.random() * 360.0);
    }
    for(var i = 0; i < NUM_SHEEP; i++) {
        sheep[i] = new GameObject('chicken', Labels.none);
        pen.AddChild(sheep[i]);
        sheep[i].SetModel(GameMngr.assets.models['sheep']);
        sheep[i].trfmBase.SetPosByAxes(sheepPos[i][0], -penRadii.y, sheepPos[i][1]);
        sheep[i].trfmBase.SetUpdatedRot(VEC3_UP, Math.random() * 360.0);
    }

    // -------------------------------------------------------------------------

    /********************************** Helper functions **********************************/

    function Init() {
        that.RaiseToGroundLevel(barn.obj);
        that.RaiseToGroundLevel(hillyHorizon);
        hillyHorizon.trfmBase.TranslateByAxes(0.0, -0.14, 0.0);

        that.RaiseToGroundLevel(pen);
        // Make sure all children have appropriate global positions before adjusting
        pen.Update();

        for(var i = 0; i < NUM_CHICKENS; i++)
            that.RaiseToGroundLevel(chickens[i]);
        for(var i = 0; i < NUM_SHEEP; i++)
            that.RaiseToGroundLevel(sheep[i]);
        for(var i = 0; i < NUM_WAGONS; i++)
            that.RaiseToGroundLevel(wagons[i]);
        for(var i = 0; i < NUM_BUSHY_TREES; i++)
            that.RaiseToGroundLevel(bushyTrees[i]);
        for(var i = 0; i < NUM_TALL_TREES; i++)
            that.RaiseToGroundLevel(tallTrees[i]);
    }
    function GameUpdate() {
        if (SceneMngr.GetActiveScene().type == SceneTypes.gameplay) {

            inGameMenu.Update();

            if (menuBtn.pressed) {
                inGameMenu.ToggleActive();
                menuBtn.Release();
            }

            if(!GameMngr.paused) {
                if(alienBarrier.mdlHdlr.active)
                    if(alienBarrier.mdlHdlr.FadeTintAlpha(fadeRate) < INFINITESIMAL)
                        alienBarrier.mdlHdlr.active = false;

                //GameMngr.canvas.requestPointerLock;
            }
            else {
                //document.exitPointerLock;
            }
        }
    }
    function ResetGame() {
        player.ResetAll();
        that.RaiseToGroundLevel(player.obj);

        Time.counter =
        cowsEncountered =
        cowsSavedByLevel =
        cowsSavedTotal =
        cowsAbductedByLevel =
        cowsAbductedTotal = 0;

        hud.guiTextObjs["caughtCowInfo"].UpdateMsg('0');
        hud.guiTextObjs["caughtBaleInfo"].UpdateMsg('0');
        hud.guiTextObjs["rescueInfo"].UpdateMsg('0');
        hud.guiTextObjs["abductionInfo"].UpdateMsg('0');
        hud.guiProgObjs["launchPowerBar"].UpdateValue(0.0);
        hud.guiProgObjs["countdownBar"].UpdateValue(0.0);

        for (var i in hud.guiTextObjs)
            if(hud.guiTextObjs[i].active)
                hud.guiTextObjs[i].SetActive(false);
        for (var i in hud.guiProgObjs)
            if(hud.guiProgObjs[i].active)
                hud.guiProgObjs[i].SetActive(false);

        lvlCompMsg.SetActive(false);
        InGameMsgr.SetActive(false);
        SceneMngr.SetActive("Title Screen");
    }

    /********************************** Game Functions **********************************/

    this.RaiseToGroundLevel = function (gameObj) {
        if(gameObj.trfmGlobal.pos.y < INFINITESIMAL && gameObj.trfmGlobal.pos.y > -INFINITESIMAL)
            gameObj.trfmBase.TranslateByAxes(0.0, gameObj.shapeData.radii.y * gameObj.trfmBase.scale.y, 0.0);
    };

    // Level Boundaries
    var leftWall, rightWall, backWall, frontWall;
    this.SetLevelBounds = function(gameObj) {
        leftWall = gameObj.shapeData.min.x;
        rightWall = gameObj.shapeData.max.x;
        backWall = gameObj.shapeData.max.z;
        frontWall = gameObj.shapeData.min.z;
    };
    this.ContainInLevelBoundsUpdate = function(gameObj) {
        if(gameObj.trfmGlobal.pos.x < leftWall + gameObj.shapeData.radii.x && gameObj.rigidBody.velF.x < 0) {
            gameObj.rigidBody.velF.x = -gameObj.rigidBody.velF.x;
            alienBarrier.trfmBase.SetPosByAxes(leftWall, gameObj.trfmGlobal.pos.y, gameObj.trfmGlobal.pos.z);
            alienBarrier.trfmBase.SetUpdatedRot(VEC3_UP, 90);
            alienBarrier.mdlHdlr.SetTintAlpha(1.0);
            alienBarrier.mdlHdlr.active = true;
        }
        else if(gameObj.trfmGlobal.pos.x > rightWall - gameObj.shapeData.radii.x && gameObj.rigidBody.velF.x > 0) {
            gameObj.rigidBody.velF.x = -gameObj.rigidBody.velF.x;
            alienBarrier.trfmBase.SetPosByAxes(rightWall, gameObj.trfmGlobal.pos.y, gameObj.trfmGlobal.pos.z);
            alienBarrier.trfmBase.SetUpdatedRot(VEC3_UP, 90);
            alienBarrier.mdlHdlr.SetTintAlpha(1.0);
            alienBarrier.mdlHdlr.active = true;
        }
        if(gameObj.trfmGlobal.pos.z < frontWall + gameObj.shapeData.radii.z && gameObj.rigidBody.velF.z < 0) {
            gameObj.rigidBody.velF.z = -gameObj.rigidBody.velF.z;
            alienBarrier.trfmBase.SetPosByAxes(gameObj.trfmGlobal.pos.x, gameObj.trfmGlobal.pos.y, frontWall);
            alienBarrier.trfmBase.SetUpdatedRot(VEC3_UP, 0);
            alienBarrier.mdlHdlr.SetTintAlpha(1.0);
            alienBarrier.mdlHdlr.active = true;
        }
        else if(gameObj.trfmGlobal.pos.z > backWall - gameObj.shapeData.radii.z && gameObj.rigidBody.velF.z > 0) {
            gameObj.rigidBody.velF.z = -gameObj.rigidBody.velF.z;
            alienBarrier.trfmBase.SetPosByAxes(gameObj.trfmGlobal.pos.x, gameObj.trfmGlobal.pos.y, backWall);
            alienBarrier.trfmBase.SetUpdatedRot(VEC3_UP, 0);
            alienBarrier.mdlHdlr.SetTintAlpha(1.0);
            alienBarrier.mdlHdlr.active = true;
        }
    };

    this.GetCowsEncountered = function() {
        return cowsEncountered;
    };
    this.CowsEncounteredAdd = function(numCows) {
        cowsEncountered += numCows;
    };
    this.GetCowsSavedByLevel = function() {
        return cowsSavedByLevel;
    };
    this.GetCowsSavedTotal = function() {
        return cowsSavedTotal;
    };
    this.CowsSavedIncr = function() {
        cowsSavedByLevel++;
        cowsSavedTotal++;
    };
    this.CowsSavedByLevelZero = function() {
        cowsSavedByLevel = 0;
    };
    this.GetCowsAbductedByLevel = function() {
        return cowsAbductedByLevel;
    };
    this.GetCowsAbductedTotal = function() {
        return cowsAbductedTotal;
    };
    this.CowsAbductedIncr = function() {
        cowsAbductedByLevel++;
        cowsAbductedTotal++;
    };
    this.CowsAbductedAdd = function(numCows) {
        cowsAbductedByLevel += numCows;
        cowsAbductedTotal += numCows;
    };
    this.CowsAbductedByLevelZero = function() {
        cowsAbductedByLevel = 0;
    };
    this.GetAmmoType = function(name) {
        switch(name) {
            case "cow": return this.AmmoTypes.cow;
            case "hay bale": return this.AmmoTypes.hayBale;
            default: return -1;
        }
    };
    this.CheckWin = function() {
        return cowsSavedTotal >= Math.ceil(cowsEncountered / 2);
    };

    /********************************** In-Game GUI Systems **********************************/

    // Level complete message -----------------------------------------------------
    var lvlCompMsg = new LevelCompleteMessage(this);

    // Menu ------------------------------------------------------------------
    var inGameMenu = new InGameMenu(gameMouse, player, ResetGame);

    // Messenger ------------------------------------------------------------------
    InGameMsgr.Initialize();

    /********************************** Scenes **********************************/

    // Title screen just has gui elements
    var title = new Scene("Title Screen", SceneTypes.menu);
    BuildSceneTitle(title, gameMouse);
    SceneMngr.AddScene(title, false);

    this.test = function() {
        console.log("no problem");
    };

    // Teach player how to pick up a cow and shoot it into the barn
    // Once they do one, place 3 others - get them in the barn before the time runs out!
    var lvl01 = new Scene("Level 01", SceneTypes.gameplay);
    lvl01.Add(player.obj);
    lvl01.Add(barn.obj);
    lvl01.Add(alienBarrier);
    lvl01.Add(skyBox);
    lvl01.Add(hillyHorizon);
    lvl01.Add(pen);
    for(var i = 0; i < NUM_WAGONS; i++)
        lvl01.Add(wagons[i]);
    for(var i = 0; i < NUM_BUSHY_TREES; i++)
        lvl01.Add(bushyTrees[i]);
    for(var i = 0; i < NUM_TALL_TREES; i++)
        lvl01.Add(tallTrees[i]);
    BuildLvl01(this, lvl01, player, barn, cows.slice(0, 3), hud, gameMouse, lvlCompMsg);
    SceneMngr.AddScene(lvl01, false);

    // Teach player how to shoot a hay bale vertically
    // Once they launch one cow, knock out the force field generator with 3 shots to access the barn!
    var lvl02 = new Scene("Level 02", SceneTypes.gameplay);
    lvl02.Add(player.obj);
    lvl02.Add(barn.obj);
    lvl02.Add(ufo.obj);
    lvl02.Add(alienBarrier);
    lvl02.Add(skyBox);
    lvl02.Add(hillyHorizon);

    lvl02.Add(pen);
    for(var i = 0; i < NUM_WAGONS; i++)
        lvl02.Add(wagons[i]);
    for(var i = 0; i < NUM_BUSHY_TREES; i++)
        lvl02.Add(bushyTrees[i]);
    for(var i = 0; i < NUM_TALL_TREES; i++)
        lvl02.Add(tallTrees[i]);
    BuildLvl02(this, lvl02, player, barn, cows.slice(0, 7), haybales.slice(0, 5), ufo, hud, gameMouse, lvlCompMsg);
    SceneMngr.AddScene(lvl02, false);

    // End screens just have gui elements
    var endWin = new Scene("End Screen Win", SceneTypes.menu);
    var endLose = new Scene("End Screen Lose", SceneTypes.menu);
    BuildSceneEndBoth(endWin, endLose, gameMouse, ResetGame);
    SceneMngr.AddScene(endWin, false);
    SceneMngr.AddScene(endLose, false);

    /********************************** Run Game Loop **********************************/

    Init();
    GameMngr.UserUpdate = GameUpdate;
    ResetGame();
    GameMngr.BeginLoop();
}