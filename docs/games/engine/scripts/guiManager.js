/**
 * Created by Devin on 2014-12-26.
 */

/********** Objects to be parented and added to a system ************/

function GUITextObject(wndRect, msg, style) {
    /// <signature>
    ///  <summary>Add a msg box to this system</summary>
    ///  <param name="wndRect" type="Rect">Pos x and y use viewport space, with (0,0) in the top-left</param>
    ///  <param name="msg" type="string"></param>
    ///  <param name="depth" type="int">Defines overlap position relative to other elements within this system</param>
    ///  <param name="style" type="MsgBoxStyle Object">A struct of various styke details that can be applied to this message box</param>
    /// </signature>
    this.rectLocal = wndRect.GetCopy();
    this.rectGlobal = wndRect.GetCopy();
    this.msg = msg;
    this.style = new MsgBoxStyle(style);
    this.active = true;

    /* Might be able to create a range of depth within the NDC, and in front
     * of everything else being affected by transformations. Maybe convert the
     * "depth" to a range of 0.00 to -0.10 */
}
GUITextObject.prototype = {
    UpdateGlobalRect: function(parentRect) {
        // Dimensions are checked to make sure parenting is upheld
        if(this.rectLocal.w > parentRect.w) {
            this.rectLocal.w = parentRect.w;
        }
        if(this.rectLocal.h > parentRect.h) {
            this.rectLocal.h = parentRect.h;
        }

        this.rectGlobal.SetValues(
            this.rectLocal.x + parentRect.x,
            this.rectLocal.y + parentRect.y,
            this.rectLocal.w,
            this.rectLocal.h
        );

        var contDiff = parentRect.ContainsWndRect(this.rectGlobal);
        if(contDiff.GetMagSqr() != 0) {

            this.rectGlobal.x -= contDiff.x;
            this.rectGlobal.y -= contDiff.y;
        }
    },
    InstantiateDisplay: function() {

        /****************** BOX ********************/

        // Convert sizes to account for NDC of viewport, -1 to 1
        var radialW = WndUtils.WndX_To_GLNDCX(this.rectLocal.w) / 2,
            radialH = WndUtils.WndY_To_GLNDCY(this.rectLocal.h) / 2,
            x = WndUtils.WndX_To_GLNDCX(this.rectGlobal.x) - 1,
            y = (WndUtils.WndY_To_GLNDCY(this.rectGlobal.y) - 1) * -1;

        // Divide
        var boxModel = new Primitives.Rect(new Vector2(radialW, radialH));
        var posCoords = boxModel.vertices.byMesh.posCoords;
        // Set box' pos to that defined in the rect

        for (var i = 0; i < posCoords.length; i += 3) {
            // Add width and subtract height because the model is built from the centre out,
            // while the rects measure from the top-left to the bottom-right.
            posCoords[i] += (x + radialW);
            posCoords[i + 1] += (y - radialH);
        }

        this.boxHdl = new GUIBoxHandler(boxModel.vertices.byMesh);
        this.boxHdl.SetTintRGB(this.style.bgColour);
        this.boxHdl.SetTintAlpha(this.style.bgAlpha);
        if (this.style.bgTextures.length > 0) {
            this.boxHdl.SetTextures(this.style.bgTextures, TextureFilters.linear);
        }


        /****************** TEXT ********************/

        if(this.msg) {

            // Adjust font width to good (readable) proportion
            var charW = this.style.fontSize * (2 / 3),
                charH = this.style.fontSize;

            // Get the exact dimensions of the text to be displayed
            var maxHeightPX = this.rectLocal.h - this.style.margin * 2;
            var maxWidthPX = charW * this.style.textMaxWidth - this.style.margin * 2;
            if (this.rectLocal.w < maxWidthPX || this.style.textMaxWidth == 0) {
                maxWidthPX = this.rectLocal.w - this.style.margin * 2;
            }

            // Turn given message into block of text within given restrictions
            var msgBlock = [];
            TextUtils.CreateBoundTextBlock(this.msg, charW, charH, this.style.textLineSpacing, maxWidthPX, maxHeightPX, msgBlock);

            // Convert sizes to NDC space
            this.charBlockModel = new StaticCharBlock(
                msgBlock,
                WndUtils.WndX_To_GLNDCX(charW),
                WndUtils.WndY_To_GLNDCY(charH),
                WndUtils.WndX_To_GLNDCX(this.style.margin),
                WndUtils.WndY_To_GLNDCY(this.style.margin),
                WndUtils.WndX_To_GLNDCX(maxWidthPX),
                WndUtils.WndY_To_GLNDCY(maxHeightPX),
                WndUtils.WndY_To_GLNDCY(this.style.textLineSpacing),
                this.style.textAlignWidth,
                this.style.textAlignHeight
            );

            // Set text block's pos to that defined in the rect
            for (var i = 0; i < this.charBlockModel.posCoords.length; i += 2) {
                // The text is built from top-left to bottom-right, so this works as-is.
                this.charBlockModel.posCoords[i] += x;
                this.charBlockModel.posCoords[i + 1] += y;
            }

            this.numChars = this.charBlockModel.count / 6;

            // Build text
            this.strHdl = new StringDisplayHandler(this.charBlockModel);
            this.strHdl.SetTintRGB(this.style.fontColour);
            this.strHdl.SetTintAlpha(this.style.fontAlpha);
            if (this.style.bold)
                this.strHdl.UseBoldTexture();
        }
        else {
            this.strHdl = new StringDisplayHandler({
                    count: 0,
                    posCoords: [],
                    colElems: [],
                    texCoords: [],
                    normAxes: []
            });
        }
    },
    UpdateMsg: function(msg) {
        if(this.active) {
            var newVerts = this.charBlockModel.posCoords;
            for (var i = 0; i < this.numChars; i++) {
                newVerts = newVerts.concat(FontMap.texCoords[msg[i] || ' ']);
            }
            this.strHdl.RewriteVerts(newVerts);
        }
    },
    AsButton: function(mousePos, clicked, Callback) {
        if(this.active) {
            this.boxHdl.SetTintRGB(this.style.bgColour);
            this.strHdl.SetTintRGB(this.style.fontColour);
            if (this.rectGlobal.ContainsPoint(mousePos)) {
                this.boxHdl.SetTintRGB(this.style.bgHoverColour);
                this.strHdl.SetTintRGB(this.style.fontHoverColour);
                if (clicked) {
                    Callback();
                }
            }
        }
    },
    FadeBackground: function(incr) {
        if(this.active) {
            this.boxHdl.tint.w = MathUtils.Clamp(this.boxHdl.tint.w + incr, 0.0, 1.0);
            return this.boxHdl.tint.w;
        }
    },
    FadeMsg: function(incr) {
        if(this.active) {
            this.strHdl.tint.w = MathUtils.Clamp(this.strHdl.tint.w + incr, 0.0, 1.0);
            return this.strHdl.tint.w;
        }
    },
    FadeObj: function(incr) {
        if(this.active) {
            this.boxHdl.tint.w = MathUtils.Clamp(this.boxHdl.tint.w + incr, 0.0, 1.0);
            this.strHdl.tint.w = MathUtils.Clamp(this.strHdl.tint.w + incr, 0.0, 1.0);
            return this.strHdl.tint.w;
        }
    },
    SetObjectFade: function(alpha) {
        this.boxHdl.tint.w = alpha;
        this.strHdl.tint.w = alpha;
    },
    UseTexture: function(index) {
        this.boxHdl.UseTexture(index);
    },
    SetActive: function(beActive) {
        this.active = beActive;
    }
};

function GUIProgressBar(wndRect, axis, style) {
    this.rectLocal = wndRect.GetCopy();
    this.rectGlobal = wndRect.GetCopy();
    this.axis = axis;
    this.style = new ProgressObjStyle(style);
    this.active = true;
    this.UpdateValue = function(){};
}
GUIProgressBar.prototype = {
    UpdateGlobalRect: function(sysRect) {
        // Dimensions are checked to make sure parenting is upheld
        if(this.rectLocal.w > sysRect.w) {
            this.rectLocal.w = sysRect.w;
        }
        if(this.rectLocal.h > sysRect.h) {
            this.rectLocal.h = sysRect.h;
        }

        this.rectGlobal.SetValues(
            this.rectLocal.x + sysRect.x,
            this.rectLocal.y + sysRect.y,
            this.rectLocal.w,
            this.rectLocal.h
        );

        var contDiff = sysRect.ContainsWndRect(this.rectGlobal);
        if(contDiff.GetMagSqr() != 0) {

            this.rectGlobal.x -= contDiff.x;
            this.rectGlobal.y -= contDiff.y;
        }
    },
    InstantiateDisplay: function() {
        // Convert sizes to account for NDC of viewport, -1 to 1
        var fullW = WndUtils.WndX_To_GLNDCX(this.rectLocal.w),
            fullH = WndUtils.WndY_To_GLNDCY(this.rectLocal.h),
            radialW = fullW / 2,
            radialH = fullH / 2,
            x = WndUtils.WndX_To_GLNDCX(this.rectGlobal.x) - 1,
            y = (WndUtils.WndY_To_GLNDCY(this.rectGlobal.y) - 1) * -1;


        /****************** BG Box ********************/
        var posCoords = [
            -radialW, radialH, 0.0,
            -radialW, -radialH, 0.0,
            radialW, -radialH, 0.0,
            radialW, radialH, 0.0
        ];
        // Set box' pos to that defined in the rect
        for (var i = 0; i < posCoords.length; i += 3) {
            // Add width and subtract height because the model is built from the centre out,
            // while the rects measure from the top-left to the bottom-right.
            posCoords[i] += (x + radialW);
            posCoords[i + 1] += (y - radialH);
        }
        var verts = {
            count: 4,
            posCoords: posCoords,
            colElems: [],
            texCoords: [],
            normAxes: [],
            indices: [
            0, 1, 2,
            0, 2, 3
            ]
        };
        this.bgBoxHdl = new GUIBoxHandler(verts);
        this.bgBoxHdl.SetTintRGB(this.style.bgColour);
        this.bgBoxHdl.SetTintAlpha(this.style.bgAlpha);


        /****************** FG Box ********************/

        var vert1 = [-radialW, radialH, 0.0],
            vert2 = [-radialW, -radialH, 0.0],
            vert4 = [radialW, radialH, 0.0];

        this.fgBoxHdl = new GUIBoxHandler(verts);
        this.fgBoxHdl.SetTintRGB(this.style.fgColour);
        this.fgBoxHdl.SetTintAlpha(this.style.fgAlpha);

        // Create functions, one of which will be assigned to this object
        var that = this;

        // Change verts 2 and 3
        function UpdateVertical(pct) {
            if(this.active) {
                var newVerts = vert1;
                newVerts = newVerts.concat([
                    -radialW, radialH - pct * fullH, 0.0,
                    radialW, radialH - pct * fullH, 0.0
                ]);
                newVerts = newVerts.concat(vert4);

                for (var i = 0; i < newVerts.length; i += 3) {
                    // Add width and subtract height because the model is built from the centre out,
                    // while the rects measure from the top-left to the bottom-right.
                    newVerts[i] += (x + radialW);
                    newVerts[i + 1] += (y - radialH);
                }
                that.fgBoxHdl.RewriteVerts(newVerts);
            }
        }
        // Change verts 3 and 4
        function UpdateHorizontal(pct) {
            if(this.active) {
                var newVerts = vert1;
                newVerts = newVerts.concat(vert2);
                newVerts = newVerts.concat([
                    -radialW + pct * fullW, -radialH, 0.0,
                    -radialW + pct * fullW, radialH, 0.0
                ]);

                for (var i = 0; i < newVerts.length; i += 3) {
                    // Add width and subtract height because the model is built from the centre out,
                    // while the rects measure from the top-left to the bottom-right.
                    newVerts[i] += (x + radialW);
                    newVerts[i + 1] += (y - radialH);
                }
                that.fgBoxHdl.RewriteVerts(newVerts);
            }
        }

        if(this.axis == Axes.x)
            this.UpdateValue = UpdateHorizontal;
        else
            this.UpdateValue = UpdateVertical;
    },
    SetActive: function(beActive) {
        this.active = beActive;
    }
};

/********** Systems to be added to the Network ************/

function GUISystem(wndRect, name) {
    /// <signature>
    ///  <summary>Create a system of contained Gui elements</summary>
    ///  <param name="name" type="string">System identifier</param>
    ///  <param name="wndRect" type="Rect">The size of the container. No elements added to the system will be outside this area</param>
    /// </signature>
    this.sysRect = wndRect;
    this.name = name;
    this.guiTextObjs = {};
    this.guiProgObjs = {};
}
GUISystem.prototype = {
    AddTextObject: function(name, textObj) {
        /// <signature>
        ///  <summary>Add GUI objects to be a part of this systems. Objects are updated and their visuals prepared when added</summary>
        ///  <param name="textObj" type="GUITextObject"></param>
        /// </signature>
        textObj.UpdateGlobalRect(this.sysRect);
        textObj.InstantiateDisplay();
        this.guiTextObjs[name] = textObj;
    },
    AddProgressObject: function(name, progressObj) {
        progressObj.UpdateGlobalRect(this.sysRect);
        progressObj.InstantiateDisplay();
        this.guiProgObjs[name] = progressObj;
    }
};

/********** Network that controls which systems to update and draw ************/

var GUINetwork = (function() {

    var activeSystems = {};
    var inactiveSystems = {};

    return {
        AddSystem: function(system, setActive) {
            if(setActive)
                activeSystems[system.name] = system;
            else
                inactiveSystems[system.name] = system;
        },
        RemoveSystem: function(sysName) {
            if (sysName in activeSystems)
                delete activeSystems[sysName];
            else if (sysName in inactiveSystems)
                delete inactiveSystems[sysName];
            else
                console.log("No system by that name to unregister");
        },
        SetActive: function(sysName, setActive) {
            if (!(sysName in activeSystems) && !(sysName in inactiveSystems))
                throw ("No system by that name to change active status");
            else if (sysName in activeSystems && setActive == false) {
                inactiveSystems[sysName] = activeSystems[sysName];
                delete activeSystems[sysName];
            }
            else if (sysName in inactiveSystems && setActive) {
                activeSystems[sysName] = inactiveSystems[sysName];
                delete inactiveSystems[sysName];
            }
            else
                console.log("Object is already where you want it");
        },
        CheckActive: function(sysName) {
            return sysName in activeSystems;
        },
        GetActiveSystems: function() {
            return activeSystems;
        },
        ListGUISystems: function() {
            for (var o in activeSystems)
                console.log('Active: ' + o + ' : ' + activeSystems[o]);
            for (var o in inactiveSystems)
                console.log('Inactive: ' + o + ' : ' + inactiveSystems[o]);
        }
    }
})();