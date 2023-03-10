/**
 * Created by Devin on 2015-03-29.
 */

var InGameMsgr = (function() {
    var msgSequences = {};
    var currSqncName = "";
    var iterator = 0;
    var msgFadeStart = 0.25;
    var msgFadeRate = 0.025;
    var iterate = false;

    var msgBoard = null;
    var style = new MsgBoxStyle();
    style.fontSize = 24;
    style.fontColour = new Vector3(0.0, 0.0, 0.0);
    style.textMaxWidth = 200;
    style.textAlignWidth = Alignment.centre;
    style.textAlignHeight = Alignment.centre;
    style.bgAlpha = msgFadeStart;
    style.fontAlpha = msgFadeStart;
    style.bgColour = new Vector3(0.0, 0.0, 0.0);
    style.margin = 15.0;
    style.bold = true;
    var msgRect = new WndRect(0, 0, 500, 200);

    return {
        Initialize: function() {
            msgBoard = new GUISystem(new WndRect(ViewMngr.wndWidth/2 - 250, ViewMngr.wndHeight/2 - 200, 500, 200), "Message Board");
            GUINetwork.AddSystem(msgBoard, true);

            style.bgTextures = [GameMngr.assets.textures['cowBorderClick']];
        },
        SetActive: function(beActive) {
            GUINetwork.SetActive(msgBoard.name, beActive);
            if(!beActive) {
                // Should return the first key name
                currSqncName = Object.keys(msgSequences)[0];
                iterator = 0;
                iterate = false;
            }
        },
        AddMsgSequence: function(name, msgArray) {
            currSqncName = name;
            msgSequences[name] = [];
            for(var i = 0; i < msgArray.length; i++) {
                msgSequences[name].push(new GUITextObject(msgRect, msgArray[i], style));
                msgBoard.AddTextObject(name + "msg" + i, msgSequences[name][i]);
                msgSequences[name][i].SetActive(false);
            }
        },
        ChangeMsgSequence: function(name) {
            currSqncName = name;
            iterator = 0;
            iterate = false;
        },
        NextMsg: function() {
            iterate = true;
        },
        FadeMsgsWithinLimit: function(idxLimit) {
            if(iterate) {
                if(msgSequences[currSqncName][iterator].FadeObj(-msgFadeRate) <= msgFadeStart) {
                    msgSequences[currSqncName][iterator].SetActive(false);
                    iterate = false;
                    iterator++;
                    if (iterator >= idxLimit)
                        return false;
                }
            }
            else {
                msgSequences[currSqncName][iterator].SetActive(true);
                msgSequences[currSqncName][iterator].FadeObj(msgFadeRate);
            }
            return true;
        }
    };
})();