/**
 * Created by Devin on 2015-03-30.
 */

function CreateHUD() {

    var hudSys = new GUISystem(new WndRect(20, 20, ViewMngr.wndWidth - 40, ViewMngr.wndHeight - 40), "in-game HUD");
    GUINetwork.AddSystem(hudSys, true);

    var style = new MsgBoxStyle();
    style.fontSize = 30;
    style.fontColour = new Vector3(0.0, 0.0, 0.0);
    style.textMaxWidth = 15;
    style.textAlignWidth = Alignment.right;
    style.textAlignHeight = Alignment.centre;
    style.bgColour = new Vector3(0.0, 0.0, 0.0);
    style.textLineSpacing = 0.0;
    style.margin = 15.0;
    style.bgAlpha = 1.0;
    style.bold = false;

    // Ammo Details
    style.bgTextures = [GameMngr.assets.textures['cowIcon']];
    hudSys.AddTextObject("caughtCowInfo", new GUITextObject(new WndRect(0, hudSys.sysRect.h - 64, 128, 64), "00", style));

    style.bgTextures = [GameMngr.assets.textures['baleIcon']];
    hudSys.AddTextObject("caughtBaleInfo", new GUITextObject(new WndRect(0, hudSys.guiTextObjs["caughtCowInfo"].rectLocal.y - 69, 128, 64), "00", style));

    // Abduction Details
    style.textAlignWidth = Alignment.centre;
    style.textAlignHeight = Alignment.bottom;
    style.fontSize = 24;
    // The images are 64 x 128, but with the bottom 28 clear, to not waste space,
    // Thus this margin needs to be here to elevate the text to compensate for the clear space.
    style.margin = 12.0;
    style.bgTextures = [GameMngr.assets.textures['rescueIcon']];
    hudSys.AddTextObject("rescueInfo", new GUITextObject(new WndRect(hudSys.sysRect.w - 64, 0, 64, 128), "00", style));

    style.bgTextures = [GameMngr.assets.textures['abductIcon']];
    hudSys.AddTextObject("abductionInfo", new GUITextObject(new WndRect(hudSys.guiTextObjs["rescueInfo"].rectLocal.x - 69, 0, 64, 128), "00", style));

    // Power info
    var powerBarStyle = new ProgressObjStyle();
    powerBarStyle.bgColour.SetValues(0.1, 0.1, 0.1);
    powerBarStyle.fgColour.SetValues(0.8, 0.5, 0.2);
    var barRect = new WndRect((hudSys.sysRect.w / 2) - 200, hudSys.sysRect.h - 30, 400, 20);
    hudSys.AddProgressObject("launchPowerBar", new GUIProgressBar(barRect, Axes.x, powerBarStyle));

    style.fontSize = 20;
    style.margin = 5.0;
    style.textMaxWidth = 25;
    style.textAlignHeight = Alignment.centre;
    style.bgTextures = [];
    style.bgAlpha = 0.5;
    style.bgColour.SetValues(1.0, 1.0, 1.0);
    style.fontColour.SetValues(0.0, 0.0, 0.0);
    hudSys.AddTextObject("launchPowerMsg", new GUITextObject(new WndRect(barRect.x + 110, barRect.y - 35, barRect.w - 220, 30), "Extra Power", style));

    style.fontSize = 18;
    style.margin = 1.0;
    style.bgAlpha = 0.0;
    style.fontColour.SetValues(1.0, 1.0, 1.0);
    style.textAlignWidth = Alignment.left;
    hudSys.AddTextObject("menuAccessMsg", new GUITextObject(new WndRect(0, 0, 200, 20), "P: Pause/Menu", style));

    // CountDownTimer
    barRect = new WndRect( 0, hudSys.sysRect.h/2 + 200, 30, -400);
    powerBarStyle.bgColour.SetValues(1.0, 1.0, 1.0);
    powerBarStyle.bgAlpha = 0.25;
    hudSys.AddProgressObject("countdownBar", new GUIProgressBar(barRect, Axes.y, powerBarStyle));

    hudSys.guiTextObjs["caughtCowInfo"].UpdateMsg('0');
    hudSys.guiTextObjs["caughtBaleInfo"].UpdateMsg('0');
    hudSys.guiTextObjs["rescueInfo"].UpdateMsg('0');
    hudSys.guiTextObjs["abductionInfo"].UpdateMsg('0');
    hudSys.guiProgObjs["launchPowerBar"].UpdateValue(0.0);
    hudSys.guiProgObjs["countdownBar"].UpdateValue(0.0);

    for (var i in hudSys.guiTextObjs)
        hudSys.guiTextObjs[i].SetActive(false);
    for (var i in hudSys.guiProgObjs)
        hudSys.guiProgObjs[i].SetActive(false);

    return hudSys;
}