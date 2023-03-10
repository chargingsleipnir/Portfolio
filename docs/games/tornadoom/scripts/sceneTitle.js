function BuildSceneTitle(scene, gameMouse) {
    var titleScreen = new GUISystem(new WndRect(0, 0, ViewMngr.wndWidth, ViewMngr.wndHeight), "Title screen");

    var style = new MsgBoxStyle();
    style.fontSize = 40;
    style.fontColour = new Vector3(0.0, 0.0, 0.0);
    style.textMaxWidth = 200;
    style.textAlignWidth = Alignment.centre;
    style.textAlignHeight = Alignment.centre;
    style.fontAlpha = 1.0;
    style.bgColour = new Vector3(1.0, 1.0, 1.0);
    style.margin = 10.0;
    style.bgAlpha = 1.0;
    style.bold = true;

    var title = new GUITextObject(
        new WndRect(titleScreen.sysRect.w/2 + 25, titleScreen.sysRect.h/2 + 125, 300, 80),
        "TORNADOOM",
        style
    );

    style.fontSize = 30;
    style.bold = true;
    var catchPhraseRect = new WndRect(title.rectGlobal.x - 45, title.rectLocal.y + title.rectLocal.h + 20, title.rectGlobal.w + 90, 60);
    var catchPhraseMsg = new GUITextObject(catchPhraseRect, "Suck'm & Chuck'm!", style);

    style.fontAlpha = 0.0;
    style.bgAlpha = 0.0;
    style.bgColour = new Vector3(0.0, 0.0, 0.0);
    style.fontColour = new Vector3(1.0, 1.0, 1.0);
    style.bold = false;
    var nextSceneMsg = new GUITextObject(
        new WndRect(catchPhraseRect.x, catchPhraseRect.y + catchPhraseRect.h + 20, catchPhraseRect.w, 60),
        "Click to start!",
        style
    );

    style.bgAlpha = 1.0;
    style.bgTextures = [GameMngr.assets.textures['title']];
    var background = new GUITextObject(
        titleScreen.sysRect,
        "",
        style
    );

    titleScreen.AddTextObject("background", background);

    //* Leaving this out for now
    // titleScreen.AddTextObject("title", title);
    titleScreen.AddTextObject("catchPhrase", catchPhraseMsg);
    titleScreen.AddTextObject("nextSceneMsg", nextSceneMsg);

    GUINetwork.AddSystem(titleScreen, false);

    var fadingIn;

    function Start() {
        nextSceneMsg.boxHdl.SetTintAlpha(0.0);
        nextSceneMsg.strHdl.SetTintAlpha(0.0);
        fadingIn = true;
        GUINetwork.SetActive(titleScreen.name, true);
        GameMngr.assets.sounds['bgMusic'].play();
        GameMngr.assets.sounds['bgMusic'].loop = true;
    }

    function Update() {
        if(gameMouse.leftPressed) {
            gameMouse.LeftRelease();
            SceneMngr.SetActive("Level 01");
        }
        if(fadingIn)
            if(nextSceneMsg.FadeBackground(0.01) >= 1.0 && nextSceneMsg.FadeMsg(0.01) >= 1.0)
                fadingIn = false;

    }

    function End() {
        GUINetwork.SetActive(titleScreen.name, false);
        GameMngr.assets.sounds['bgMusic'].pause();
        GameMngr.assets.sounds['bgMusic'].currentTime = 0;
    }

    scene.SetCallbacks(Start, Update, End);
}