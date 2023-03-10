/**
 * Created by Devin on 2015-03-30.
 */

function LevelCompleteMessage(game) {

    var msgSysName = "Level complete message";
    var msgSys = new GUISystem(new WndRect(ViewMngr.wndWidth/2 - 200, ViewMngr.wndHeight/2 - 130, 400, 260), msgSysName );
    var contW = msgSys.sysRect.w;
    var contH = msgSys.sysRect.h;
    GUINetwork.AddSystem(msgSys, false);

    var style = new MsgBoxStyle();
    style.bgColour.SetValues(0.9, 0.6, 0.3);
    style.bgAlpha = 1.0;
    msgSys.AddTextObject("backdrop", new GUITextObject(new WndRect(0, 0, msgSys.sysRect.w, msgSys.sysRect.h), "", style));

    style.margin = 5.0;
    style.fontSize = 40;
    style.fontColour.SetValues(1.0, 1.0, 1.0);
    style.textMaxWidth = 200;
    style.textAlignWidth = Alignment.centre;
    style.textAlignHeight = Alignment.centre;
    style.bgAlpha = 0.0;
    style.bold = true;
    msgSys.AddTextObject("header", new GUITextObject(new WndRect(20, 20, contW - 40, 50), "LEVEL CLEAR!", style));

    style.fontSize = 20;
    style.bold = false;
    style.textAlignWidth = Alignment.right;
    style.textAlignHeight = Alignment.bottom;
    msgSys.AddTextObject("nextScene", new GUITextObject(msgSys.sysRect, "Next Scene: Click", style));

    style.fontSize = 24;
    style.fontColour.SetValues(0.0, 0.0, 0.0);
    style.bgColour.SetValues(1.0, 1.0, 1.0);
    style.textMaxWidth = 200;
    style.textAlignWidth = Alignment.centre;
    style.textAlignHeight = Alignment.centre;
    style.bgAlpha = 1.0;
    style.bold = false;
    msgSys.AddTextObject("Cows total", new GUITextObject(new WndRect(20, 90, contW - 40, 35), "Cows Total: 00", style));
    msgSys.AddTextObject("Cows saved", new GUITextObject(new WndRect(20, 130, contW - 40, 35), "Cows Saved: 00", style));
    msgSys.AddTextObject("Cows lost", new GUITextObject(new WndRect(20, 170, contW - 40, 35), "Cows Lost: 00", style));

    this.UpdateInfo = function() {
        msgSys.guiTextObjs["Cows total"].UpdateMsg("Cows Total: " + game.GetCowsEncountered());
        msgSys.guiTextObjs["Cows saved"].UpdateMsg("Cows Saved: " + game.GetCowsSavedTotal());
        msgSys.guiTextObjs["Cows lost"].UpdateMsg("Cows Lost: " + game.GetCowsAbductedTotal());
    };
    this.SetActive = function(beActive) {
        if(beActive) {
            if(!GUINetwork.CheckActive(msgSysName)) {
                GUINetwork.SetActive(msgSysName, beActive);
            }
            this.UpdateInfo();
        }
        else {
            if(GUINetwork.CheckActive(msgSysName)) {
                GUINetwork.SetActive(msgSysName, beActive);
            }
        }
    };
}