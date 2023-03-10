/**
 * Created by Devin on 2015-03-27.
 */

function BuildLvl02(game, scene, player, barn, cows, haybales, ufo, hud, mouse, lvlCompMsg) {

    scene.light.amb.bright = 0.5;
    scene.light.dir.bright = 0.25;
    scene.light.dir.dir.SetValues(-1.0, -1.0, 1.0);
    scene.light.pnt.bright = 0.0;
    scene.light.pnt.pos.SetValues(0.0, 0.0, 0.0);

    // Objects ==========================================================================================

    var fence = new GameObject('fence', Labels.none);
    fence.SetModel(GameMngr.assets.models['lvl02Fence']);
    fence.mdlHdlr.SetTintRGB(0.3, 0.225, 0.0);
    game.RaiseToGroundLevel(fence);

    var barrierRadius = 5.0,
        fadeRate = -0.01;
    var barnBarrier = new GameObject('barnBarrier', Labels.none);
    barnBarrier.SetModel(new Primitives.IcoSphere(4, barrierRadius));
    barnBarrier.mdlHdlr.SetTintRGB(1.0, 1.0, 0.0);
    barnBarrier.mdlHdlr.MakeWireFrame();
    barnBarrier.mdlHdlr.active = false;
    barnBarrier.trfmBase.SetPosByVec(barn.obj.trfmGlobal.pos);
    barnBarrier.trfmBase.TranslateByAxes(0.0, 1.0, 0.0);
    barnBarrier.AddComponent(Components.collisionSystem);


    var abductee = null,
        ufoToCowDirVec2D = new Vector2(),
        tempDirVec = new Vector3();

    var NUM_COWS_PHASE_1 = 3,
        NUM_COWS_PHASE_2 = 7;
    var phase1CowPos = [
        [33.0, 0.0, -12.0],
        [-24.0, 0.0, -30.0],
        [20.0, 0.0, -10.0]
    ];
    var phase2CowPos = [
        [19.0, 0.0, -29.0],
        [-27.0, 0.0, 19.0],
        [27.0, 0.0, 21.0],
        [-31.0, 0.0, -30.0],
        [-16.0, 0.0, -3.0],
        [8.0, 0.0, -15.0],
        [0.0, 0.0, 0.0]
    ];
    var balePos = [
        [23.0, 0.0, 8.0],
        [-17.0, 0.0, 33.0],
        [30.0, 0.0, -26.0],
        [9.0, 0.0, -14.0],
        [-13.0, 0.0, -28.0],
        [-4.0, 0.0, -21.0],
        [2.0, 0.0, -36.0],
        [14.0, 0.0, 31.0],
        [25.0, 0.0, -8.0],
        [-11.0, 0.0, 6.0]
    ];
    var activeCows = [],
        activeHaybales = [];

    var MAX_PROBES = 3;
    var allProbes = [];
    var activeProbes = [];
    var probePos = [
        [0.0, 4.0, 0.0],
        [0.0, 5.0, 15.0],
        [0.0, 6.0, -10.0]
    ];
    var probeSpeeds = [
        0.5, 1.0, 1.5
    ];
    var probeWaypointSets = [
        [[-5.0, 6.0, 0.0], [-5.0, 4.0, 10.0], [5.0, 6.0, 10.0], [5.0, 4.0, 0.0]],
        [[-10.0, 5.0, 15.0], [-10.0, 7.0, -5.0], [10.0, 5.0, -5.0], [10.0, 7.0, 15.0]],
        [[-15.0, 6.0, -10.0], [-15.0, 8.0, 20.0], [15.0, 6.0, 20.0], [15.0, 8.0, -10.0]]
    ];

    function ProbeCollisionCallback(collider, probe) {
        var index = -1;
        var collide = false;
        if (collider.gameObj.name == "cow") {
            index = activeCows.indexOf(collider.gameObj);
            if(index > -1) {
                activeCows[index].RunImpactBurst();
                player.RemoveFromTwister(collider.gameObj);
                activeCows[index].SetVisible(false);
                activeCows.splice(index, 1);
                game.CowsAbductedIncr();
                collide = true;
            }
        }
        else if (collider.gameObj.name == "hay bale") {
            index = activeHaybales.indexOf(collider.gameObj);
            if(index > -1) {
                activeHaybales[index].RunImpactBurst();
                player.RemoveFromTwister(collider.gameObj);
                activeHaybales[index].SetVisible(false);
                activeHaybales.splice(index, 1);
                collide = true;
            }
        }

        if(collide) {
            index = activeProbes.indexOf(probe);
            activeProbes[index].SetVisible(false);
            activeProbes.splice(index, 1);
        }

        return collide;
    }
    for(var i = 0; i < MAX_PROBES; i++)
        allProbes[i] = new Probe(probeWaypointSets[i], probeSpeeds[i], ProbeCollisionCallback);

    // Barn collisions
    function BarnCollCallback(collider) {
        if(collider.gameObj.name == "cow") {
            // Loop needed to compare GameObjects before using cow's GameObject wrapper
            for (var i = 0; i < activeCows.length; i++)
                if (activeCows[i] == collider.gameObj) {
                    player.RemoveFromTwister(collider.gameObj);
                    barn.RunChimneyBurst();
                    activeCows[i].SetVisible(false);
                    activeCows.splice(activeCows.indexOf(activeCows[i]), 1);
                    game.CowsSavedIncr();
                    hud.guiTextObjs["rescueInfo"].UpdateMsg("" + game.GetCowsSavedByLevel());
                }
        }
        else if(collider.gameObj.name != 'barnBarrier') {
            if(collider.suppShapeList[0].obj.IntersectsSphere(barn.obj.collider.collSphere)) {
                collider.rigidBody.velF = collider.trfm.pos.GetSubtract(barn.obj.trfmGlobal.pos);
            }
        }
    }

    // Barrier Collisions
    var coefOfRest = 0.5;
    function BarrierCollCallback(collider) {
        if(collider.gameObj.name != "barn") {
            var collisionDist = barnBarrier.trfmGlobal.pos.GetSubtract(collider.trfm.pos);
            var netVel = barnBarrier.collider.rigidBody.GetNetVelocity(collider.rigidBody);
            if (netVel.GetDot(collisionDist) < 0) {
                if (collider.suppShapeList[0].obj.IntersectsSphere(barnBarrier.collider.collSphere)) {
                    barnBarrier.collider.rigidBody.CalculateImpulse(collider.rigidBody, collisionDist, coefOfRest);
                }
            }
        }
    }

    // Pulling cow from Player
    var cowSoughtFromPlayerIdx = -1;
    var cowSceneListIdx = -1;
    var ReleaseCowCallback = function() {
        if(cowSoughtFromPlayerIdx != -1) {
            player.ReleaseAmmoAbove(game.AmmoTypes.cow, cowSoughtFromPlayerIdx);
            activeCows[cowSceneListIdx].SetGravBlock(true);
            activeCows[cowSceneListIdx].gravForce.active = false;
        }
    };

    // Level Phases ==========================================================================================

    var msgs = [
        // Part 1
        "I knew I felt somethin' comin'... what's happened to my barn?!",
        "I'll bet those crazy lookin' probe things put that wall up. Maybe if you shoot'em down, we can get my cows in here!",
        "Press the Q or E keys to switch what you want to shoot.",
        "Not sure how to get them up that high? You'll have to put some extra power behind it!",
        "Click the right mouse button to get ready for a power-shot.",
        "In this view, move the mouse to aim, hold the left mouse button to build extra power, and release to fire!",
        // Part 2
        "Uh-oh, here she comes, the Mother Ship... Don't let it take my cattle!!",
        "It doesn't look as sharp as those probes, so I don't think I'll lose any cows or hay bales if you fire at that thing!",
        "Check the top-right to see how many cows have been abducted."
    ];
    InGameMsgr.AddMsgSequence("level02", msgs);
    var msgLimit,
        lvlPhases;

    // Level Repeat functions ==========================================================================================

    function Start() {
        barn.obj.collider.SetSphereCall(BarnCollCallback);
        game.CowsSavedByLevelZero();
        game.SetLevelBounds(fence);

        barnBarrier.mdlHdlr.active = true;
        barnBarrier.mdlHdlr.SetTintAlpha(1.0);
        barnBarrier.collider.SetActive(true);
        barnBarrier.collider.SetSphereCall(BarrierCollCallback);

        ufo.SetTractorBeamingCallback(ReleaseCowCallback);
        ufo.SetActive(false);
        ufo.SetVisible(false);
        ufo.SetAlpha(0.0);

        player.ResetMotion();
        player.obj.trfmBase.SetPosByAxes(0.0, 0.0, 20);
        game.RaiseToGroundLevel(player.obj);
        player.AddAmmoContainer(game.AmmoTypes.hayBale);

        for(var i = 0; i < cows.length; i++ ) {
            cows[i].SetVisible(false);
            cows[i].trfmBase.SetUpdatedRot(VEC3_UP, Math.random() * 360.0);
        }
        // Start off with just three cows.
        for(var i = 0; i < NUM_COWS_PHASE_1; i++ ) {
            cows[i].SetVisible(true);
            cows[i].trfmBase.SetPosByAxes(phase1CowPos[i][0], phase1CowPos[i][1], phase1CowPos[i][2]);
            game.RaiseToGroundLevel(cows[i]);
            activeCows.push(cows[i]);
        }
        game.CowsEncounteredAdd(activeCows.length);

        for(var i = 0; i < haybales.length; i++ ) {
            haybales[i].SetVisible(true);
            haybales[i].trfmBase.SetPosByAxes(balePos[i][0], balePos[i][1], balePos[i][2]);
            game.RaiseToGroundLevel(haybales[i]);
        }
        activeHaybales = haybales.slice();

        for(var i = 0; i < MAX_PROBES; i++) {
            allProbes[i].SetVisible(true);
            allProbes[i].obj.trfmBase.SetPosByAxes(probePos[i][0], probePos[i][1], probePos[i][2]);
        }
        activeProbes = allProbes.slice();

        InGameMsgr.ChangeMsgSequence("level02");
        scene.SetLoopCallback(MsgUpdate);
        player.SetControlActive(false);
        msgLimit = 6;
        lvlPhases = 0;

        hud.guiTextObjs["caughtBaleInfo"].SetActive(true);

        GameMngr.assets.sounds['windSoft'].play();
        GameMngr.assets.sounds['windSoft'].loop = true;
    }

    function ObjectsLessCowUpdate() {
        player.Update();
        barn.Update();
        game.ContainInLevelBoundsUpdate(player.obj);
        for(var i = 0; i < activeProbes.length; i++) {
            activeProbes[i].Update();
        }
        for (var i = 0; i < activeHaybales.length; i++) {
            game.ContainInLevelBoundsUpdate(activeHaybales[i]);
        }
    }
    function CowUpdate() {
        for (var i = 0; i < activeCows.length; i++) {
            game.ContainInLevelBoundsUpdate(activeCows[i]);
        }
    }
    function AimUpdate() {
        if(player.GetAimToggleHeld()) {
            hud.guiProgObjs["launchPowerBar"].SetActive(true);
            hud.guiTextObjs["launchPowerMsg"].SetActive(true);
        }
        else {
            hud.guiProgObjs["launchPowerBar"].SetActive(false);
            hud.guiTextObjs["launchPowerMsg"].SetActive(false);
        }
    }

    function MsgUpdate() {
        ObjectsLessCowUpdate();
        CowUpdate();
        if(InGameMsgr.FadeMsgsWithinLimit(msgLimit)) {
            if (mouse.leftPressed) {
                InGameMsgr.NextMsg();
                mouse.LeftRelease();
            }
        }
        else {
            scene.SetLoopCallback(GameplayUpdate);
            if(!ViewMngr.usingWorldCam)
                player.SetControlActive(true);
        }
    }
    function GameplayUpdate() {
        switch(lvlPhases) {
            case 0:
                ObjectsLessCowUpdate();
                CowUpdate();
                AimUpdate();
                if(activeProbes.length <= 0) {
                    lvlPhases++;
                }
                break;
            case 1:
                ObjectsLessCowUpdate();
                CowUpdate();
                AimUpdate();
                if(barnBarrier.mdlHdlr.FadeTintAlpha(fadeRate) < INFINITESIMAL) {
                    barnBarrier.mdlHdlr.active = false;
                    barnBarrier.collider.SetActive(false);
                    lvlPhases++;
                }
                break;
            case 2:
                ObjectsLessCowUpdate();
                CowUpdate();
                AimUpdate();
                if(activeCows.length <= 0) {
                    ufo.SetVisible(true);
                    lvlPhases++;
                }
                break;
            case 3:
                ObjectsLessCowUpdate();
                CowUpdate();
                AimUpdate();
                if(ufo.FadeAlpha(-fadeRate) == 1.0) {
                    msgLimit = 9;
                    lvlPhases++;
                    scene.SetLoopCallback(MsgUpdate);
                    player.SetControlActive(false);
                }
                break;
            case 4:
                // This is in it's own stage because I want it happening only after the messages have finished
                ufo.SetActive(true);
                hud.guiTextObjs["abductionInfo"].SetActive(true);
                lvlPhases++;

                // Add 4 more in the second phase
                for(var i = 0; i < NUM_COWS_PHASE_2; i++ ) {
                    cows[i].SetVisible(true);
                    cows[i].trfmBase.SetPosByAxes(phase2CowPos[i][0], phase2CowPos[i][1], phase2CowPos[i][2]);
                    game.RaiseToGroundLevel(cows[i]);
                    activeCows.push(cows[i]);
                }
                game.CowsEncounteredAdd(activeCows.length);
                break;
            case 5:
                ObjectsLessCowUpdate();
                AimUpdate();
                ufo.Update();
                if (activeCows.length > 0) {
                    var ufoToCowDistSqr3D = 999999;
                    for (var i = 0; i < activeCows.length; i++) {
                        game.ContainInLevelBoundsUpdate(activeCows[i]);

                        // Which cow to go after in 3D space (to account for height, as well as x & z dimensions)
                        tempDirVec.SetCopy(activeCows[i].trfmGlobal.pos);
                        tempDirVec.SetSubtract(ufo.obj.trfmGlobal.pos);
                        var tempDistSqr = tempDirVec.GetMagSqr();
                        if (tempDistSqr < ufoToCowDistSqr3D) {
                            ufoToCowDistSqr3D = tempDistSqr;
                            // Convert 3D to 2D
                            ufoToCowDirVec2D.SetValues(tempDirVec.x, tempDirVec.z);
                            if (!ufo.tractoring)
                                abductee = activeCows[i];
                        }
                    }
                    if (!ufo.tractoring) {
                        // If abductee is in the tornado, remove from tornado's ammo
                        cowSoughtFromPlayerIdx = player.GetAmmoIdx(game.AmmoTypes.cow, abductee);
                        cowSceneListIdx = (cowSoughtFromPlayerIdx != -1) ? activeCows.indexOf(abductee) : -1;
                    }

                    if (ufo.Abduct(abductee, ufoToCowDirVec2D)) {
                        game.CowsAbductedIncr();
                        hud.guiTextObjs["abductionInfo"].UpdateMsg("" + game.GetCowsAbductedByLevel());
                        activeCows.splice(activeCows.indexOf(abductee), 1);
                        abductee.SetVisible(false);
                    }
                }
                else {
                    player.SetControlActive(false);
                    lvlCompMsg.SetActive(true);
                    lvlPhases++;
                }
                break;
            case 6:
                if (mouse.leftPressed) {
                    lvlCompMsg.SetActive(false);
                    player.SetControlActive(true);
                    mouse.LeftRelease();
                    if(game.CheckWin())
                        SceneMngr.SetActive("End Screen Win");
                    else
                        SceneMngr.SetActive("End Screen Lose");
                }
                break;
        }
    }

    function End() {
        activeCows.splice(0, activeCows.length);
        activeHaybales.splice(0, activeHaybales.length);
        activeProbes.splice(0, activeProbes.length);
        barnBarrier.mdlHdlr.active = false;
        barnBarrier.collider.SetActive(false);
        player.ClearAmmo();
        ufo.SetActive(false);
        ufo.SetVisible(false);
        ufo.SetAlpha(0.0);
        game.CowsSavedByLevelZero();
        game.CowsAbductedByLevelZero();
        hud.guiTextObjs["rescueInfo"].UpdateMsg("0");
        hud.guiTextObjs["abductionInfo"].UpdateMsg('0');
        hud.guiTextObjs["caughtCowInfo"].UpdateMsg('0');
        hud.guiTextObjs["caughtBaleInfo"].UpdateMsg('0');

        GameMngr.assets.sounds['windSoft'].pause();
        GameMngr.assets.sounds['windSoft'].currentTime = 0;
    }

    for(var i = 0; i < MAX_PROBES; i++)
        scene.Add(allProbes[i].obj);
    for(var i = 0; i < cows.length; i++ )
        scene.Add(cows[i]);
    for(var i = 0; i < haybales.length; i++ )
        scene.Add(haybales[i]);
    scene.Add(fence);
    scene.Add(barnBarrier);
    scene.SetCallbacks(Start, GameplayUpdate, End);
}