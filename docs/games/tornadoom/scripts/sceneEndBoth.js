/**
 * Created by Devin on 2015-03-30.
 */

function BuildSceneEndBoth(sceneWin, sceneLose, mouse, GameResetCallback) {
    var endScreen = new GUISystem(new WndRect(0, 0, ViewMngr.wndWidth, ViewMngr.wndHeight), "End screen");

    var style = new MsgBoxStyle();
    style.bgAlpha = 1.0;

    style.bgTextures = [GameMngr.assets.textures['endWin']];
    endScreen.AddTextObject("winBackground", new GUITextObject(endScreen.sysRect, "", style));

    style.bgTextures = [GameMngr.assets.textures['endLose']];
    endScreen.AddTextObject("loseBackground", new GUITextObject(endScreen.sysRect, "", style));

    style.bgTextures = [];
    style.fontSize = 40;
    style.fontColour.SetValues(0.0, 0.0, 0.0);
    style.textMaxWidth = 200;
    style.textAlignWidth = Alignment.centre;
    style.textAlignHeight = Alignment.centre;
    style.fontAlpha = 1.0;
    style.bgColour.SetValues(1.0, 1.0, 1.0);
    style.margin = 10.0;
    style.bgAlpha = 1.0;
    style.bold = true;

    var headingRect = new WndRect(endScreen.sysRect.w/2 - 225, 20, 450, 80);
    endScreen.AddTextObject("winHeading", new GUITextObject(headingRect, "CONGRATULATIONS!", style));

    headingRect.y = endScreen.sysRect.h/2 + 150;
    endScreen.AddTextObject("loseHeading", new GUITextObject(headingRect, "DAGNABBIT!", style));
    var rectGbl = endScreen.guiTextObjs["loseHeading"].rectGlobal;

    style.fontSize = 24;
    style.fontAlpha = 0.0;
    style.bgAlpha = 0.0;
    style.bgColour.SetValues(0.0, 0.0, 0.0);
    style.fontColour.SetValues(1.0, 1.0, 1.0);
    style.bold = false;
    var resetMsgRect = new WndRect(rectGbl.x - 25, endScreen.sysRect.h - 70, rectGbl.w + 50, 50);
    endScreen.AddTextObject("resetGameMsg", new GUITextObject(resetMsgRect, "Click to play again", style));

    style.fontAlpha = 1.0;
    style.bgAlpha = 1.0;
    style.bgColour.SetValues(1.0, 1.0, 1.0);
    style.fontColour.SetValues(0.0, 0.0, 0.0);
    style.bold = true;
    resetMsgRect.y -= 70;
    endScreen.AddTextObject("winFinalRemark", new GUITextObject(resetMsgRect, "You didn't lose too many cows", style));
    endScreen.AddTextObject("loseFinalRemark", new GUITextObject(resetMsgRect, "You lost way too many cows!", style));


    GUINetwork.AddSystem(endScreen, false);
    for(var i in endScreen.guiTextObjs) {
        endScreen.guiTextObjs[i].SetActive(false);
    }

    var fadingIn;
    function SharedStart() {
        endScreen.guiTextObjs["resetGameMsg"].boxHdl.SetTintAlpha(0.0);
        endScreen.guiTextObjs["resetGameMsg"].strHdl.SetTintAlpha(0.0);
        fadingIn = true;
        endCountUpdated = false;
        GUINetwork.SetActive(endScreen.name, true);
    }
    function StartWin() {
        endScreen.guiTextObjs["winBackground"].SetActive(true);
        endScreen.guiTextObjs["winHeading"].SetActive(true);
        endScreen.guiTextObjs["winFinalRemark"].SetActive(true);
        endScreen.guiTextObjs["resetGameMsg"].SetActive(true);
        GameMngr.assets.sounds['cattleMoo'].play();
        SharedStart();
    }
    function StartLose() {
        endScreen.guiTextObjs["loseBackground"].SetActive(true);
        endScreen.guiTextObjs["loseHeading"].SetActive(true);
        endScreen.guiTextObjs["loseFinalRemark"].SetActive(true);
        endScreen.guiTextObjs["resetGameMsg"].SetActive(true);
        GameMngr.assets.sounds['fail'].play();
        SharedStart();
    }

    function Update() {
        if(mouse.leftPressed) {
            mouse.LeftRelease();
            GameResetCallback();
        }
        if(fadingIn)
            if(endScreen.guiTextObjs["resetGameMsg"].FadeObj(0.01) >= 1.0)
                fadingIn = false;

    }

    function End() {
        for(var i in endScreen.guiTextObjs) {
            endScreen.guiTextObjs[i].SetActive(false);
        }
        GUINetwork.SetActive(endScreen.name, false);
    }

    sceneWin.SetCallbacks(StartWin, Update, End);
    sceneLose.SetCallbacks(StartLose, Update, End);
}