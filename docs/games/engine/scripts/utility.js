// Basic error messaging
window.onerror = function(msg, url, lineno) {
    //alert(url + '\n(' + lineno + '): ' + msg);
    console.log(url + '\n(' + lineno + '): ' + msg);
};

window.onresize = function(event) {
    //wGL.ReshapeWindow(event.currentTarget.outerWidth, event.currentTarget.outerHeight);
    ViewMngr.Resize(event);
};

var FileUtils = {
    // Load external assets
    LoadFile: function(file, CompletionCallback, ProgressCallback, LoadedCallback, noCache, isJSON) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 1) {
                if (isJSON)
                    request.overrideMimeType('application/json');
                else
                    request.overrideMimeType('text/plain');

                request.send();
            }
            else if (request.readyState == 4) {
                if (request.status == 200) {
                    LoadedCallback();
                    CompletionCallback(request.responseText);
                }
                else if (request.status == 404) {
                    throw 'In loadFile(), File "' + file + '" does not exist.';
                }
                else {
                    alert(file + ": " + request.responseText);
                    throw 'XHR error ' + request.status + '.';
                }
            }
        };

        var url = file;
        if (noCache)
            url += '?' + (new Date()).getTime();

        request.addEventListener('progress', ProgressCallback, false);
        request.open('GET', url, true);
    },
    LoadShaders: function(nameFilePathSets, container, CompletionCallback, ProgressCallback, LoadedCallback) {
        /// <signature>
        ///  <summary>Load and map sets of two shader files</summary>
        ///  <param name="filePathSets" type="array2D [n][3]">name, vert, and frag filepath strings</param>
        ///  <param name="containerArray" type="array">An array to be filled with ShaderFilePair objects</param>
        ///  <param name="Callback" type="function">the function to call once loading has completed</param>
        /// </signature>
        var NAME = 0;
        var fileIndex = 1;
        var shaderIndex = -1;
        var msg_LoadFinished;

        function LoadRecursion(asset) {
            /// <signature>
            ///  <summary>Recursively load given assets</summary>
            ///  <param name="asset" type="string">the asset to be loaded into the map, send a load completion message first</param>
            /// </signature>
            if (shaderIndex == -1) {
                msg_LoadFinished = asset;
            }
            // fileindex will waver between 1 and 2, so the shader index increases only every other call to the function.
            else {
                if (fileIndex == 1) {
                    container[shaderIndex] = new ShaderFilePair();
                    container[shaderIndex].name = nameFilePathSets[shaderIndex][NAME];
                    container[shaderIndex].vert = asset;
                    shaderIndex--;
                    fileIndex++;
                }
                else {
                    container[shaderIndex].frag = asset;
                    fileIndex--;
                }
            }
            shaderIndex++;
            if (shaderIndex < nameFilePathSets.length)
                FileUtils.LoadFile(nameFilePathSets[shaderIndex][fileIndex], LoadRecursion, ProgressCallback, LoadedCallback, true, false);
            else {
                console.log(msg_LoadFinished);
                CompletionCallback();
            }
        }
        LoadRecursion('Loading Shaders Complete');
    },
    LoadTextures: function(nameFilePathPairs, containerObj, CompletionCallback, ProgressCallback, LoadedCallback) {
        /// <signature>
        ///  <summary>Load and map sets of two shader files</summary>
        ///  <param name="nameFilePathPairs" type="array2D" [n][2]>string names and filepaths</param>
        ///  <param name="containerObj" type="object">An empty object to be filled as map<string, texture></param>
        ///  <param name="Callback" type="function">the function to call once loading has completed</param>
        /// </signature>
        var NAME = 0, FILEPATH = 1;
        var textureIndex = -1;
        var msg_LoadFinished;

        function LoadRecursion(asset) {
            /// <signature>
            ///  <summary>Recursively load given assets</summary>
            ///  <param name="asset" type="string">the asset to be loaded into the map, send a load completion message first</param>
            /// </signature>
            if (textureIndex == -1)
                msg_LoadFinished = asset;
            else 
                containerObj[nameFilePathPairs[textureIndex][NAME]] = asset;

            textureIndex++;
            if (textureIndex < nameFilePathPairs.length) {
                var image = new Image();
                // Check progress
                image.onprogress = ProgressCallback;
                // function required to be inside this function call to act as a true callback
                image.onload = function() {
                    LoadedCallback();
                    LoadRecursion(image)
                };
                // Image dimensions must be power of 2 (32x32, 128x128, etc.)
                image.src = nameFilePathPairs[textureIndex][FILEPATH];
            }
            else {
                console.log(msg_LoadFinished);
                CompletionCallback();
            }
        }
        LoadRecursion('Loading Textures Complete');
    },
    LoadModels: function(nameFilePathPairs, containerObj, CompletionCallback, ProgressCallback, LoadedCallback) {
        /// <signature>
        ///  <summary>Load and map sets of two shader files</summary>
        ///  <param name="nameFilePathPairs" type="array2D [n][2]">string names and filepaths</param>
        ///  <param name="containerObj" type="object">An empty object to be filled as map<string, texture></param>
        ///  <param name="Callback" type="function">the function to call once loading has completed</param>
        /// </signature>
        var NAME = 0, FILEPATH = 1;
        var modelIndex = -1;
        var msg_LoadFinished;

        function LoadRecursion(asset) {
            /// <signature>
            ///  <summary>Recursively load given assets</summary>
            ///  <param name="asset" type="string">the asset to be loaded into the map, send a load completion message first</param>
            /// </signature>
            if (modelIndex == -1)
                msg_LoadFinished = asset;
            else
                containerObj[nameFilePathPairs[modelIndex][NAME]] = JSON.parse(asset);

            modelIndex++;
            if (modelIndex < nameFilePathPairs.length) {
                FileUtils.LoadFile(nameFilePathPairs[modelIndex][FILEPATH], LoadRecursion, ProgressCallback, LoadedCallback, true, true);
            }
            else {
                console.log(msg_LoadFinished);
                CompletionCallback();
            }
        }
        LoadRecursion('Loading Models Complete');
    }
};

var MathUtils = {
    GetCofactor: function(tl, br, bl, tr) {
        return (tl * br) - (bl * tr);
    },
    GetGreatestDouble: function(value, startNum) {
        var out = startNum || 1;
        while (out < value) {
            out *= 2;
        }
        return out;
    },
    Clamp: function(n, min, max) {
        if(n < min) return min;
        if(n > max) return max;
        return n;
    }
};

var GeomUtils = {
     /*
     IsConvexQuad: function(quadPtA, quadPtB, quadPtC, quadPtD) {
     /// <signature>
     ///  <summary>Returns true is quad is convex</summary>
     ///  <returns type="bool" />
     /// </signature>

     var bda = Vector3.CrossProduct(Vector3.Subtract(quadPtD, quadPtB), Vector3.Subtract(quadPtA, quadPtB));
     var bdc = Vector3.CrossProduct(Vector3.Subtract(quadPtD, quadPtB), Vector3.Subtract(quadPtC, quadPtB));

     if (Vector3.DotProduct(bda, bdc) >= 0.0)
     return 0;

     var acd = Vector3.CrossProduct(Vector3.Subtract(quadPtC, quadPtA), Vector3.Subtract(quadPtD, quadPtA));
     var acb = Vector3.CrossProduct(Vector3.Subtract(quadPtC, quadPtA), Vector3.Subtract(quadPtB, quadPtA));

     return Vector3.DotProduct(acd, acb) < 0.0;
     },
     */
    GetShapeData3D: function (coords, centre) {
        /// <signature>
        ///  <summary>Returns the object provided, sized to wrap around the vertices provided</summary>
        ///  <param name="allPosCoords" type="[]">entire list of vertex positions, as decimals, in x, y, z order</param>
        ///  <returns type="Object" />
        /// </signature>
        var shape = new AAShapeData3D();
        shape.min.SetValues(coords[0], coords[1], coords[2]);
        shape.max.SetCopy(shape.min);
        var squaredLength = shape.min.GetMagSqr();
        for (var i = 0; i < coords.length; i += 3) {
            shape.max.x = (coords[i] > shape.max.x) ? coords[i] : shape.max.x;
            shape.min.x = (coords[i] < shape.min.x) ? coords[i] : shape.min.x;
            shape.max.y = (coords[i + 1] > shape.max.y) ? coords[i + 1] : shape.max.y;
            shape.min.y = (coords[i + 1] < shape.min.y) ? coords[i + 1] : shape.min.y;
            shape.max.z = (coords[i + 2] > shape.max.z) ? coords[i + 2] : shape.max.z;
            shape.min.z = (coords[i + 2] < shape.min.z) ? coords[i + 2] : shape.min.z;
        }

        shape.RecalculateDimensions();

        if(centre) {
            for (var i = 0; i < coords.length; i += 3) {
                coords[i] -= shape.centre.x;
                coords[i + 1] -= shape.centre.y;
                coords[i + 2] -= shape.centre.z;
            }
            shape.centre.SetZero();
            shape.RecalculateExtents();
        }

        // Go over all vertices again to get most accurate radius
        for (var i = 0; i < coords.length; i += 3) {
            var tempLength = (new Vector3(coords[i] - shape.centre.x, coords[i + 1] - shape.centre.y, coords[i + 2] - shape.centre.z)).GetMagSqr();
            squaredLength = (tempLength > squaredLength) ? tempLength : squaredLength;
        }
        shape.radius = Math.sqrt(squaredLength);

        return shape;
    },
    ClosestPntSegmentToPoint: function(segPntA, segPntB, pntC) {
        var ab = segPntB.GetSubtract(segPntA);
        var t = pntC.GetSubtract(segPntA).GetDot(ab);
        if(t <= 0.0)
            return segPntA.GetCopy();
        else {
            var denom = ab.GetDot(ab);
            if(t >= denom)
                return segPntB.GetCopy();
            else {
                t = t / denom;
                return segPntA.GetAdd(ab.SetScaleByNum(t));
            }
        }
    },
    DistPointSegmentSqr: function(segPntA, segPntB, pntC) {
        var ab = segPntB.GetSubtract(segPntA),
            ac = pntC.GetSubtract(segPntA),
            bc = pntC.GetSubtract(segPntB);

        var e = ac.GetDot(ab);

        // Handle cases of c projecting outside ab
        if(e <= 0.0)
            return ac.GetDot(ac);
        var f = ab.GetDot(ab);
        if(e >= f)
            return bc.GetDot(bc);

        // Handle case where c projects onto ab
        return ac.GetDot(ac) - e * e / f;
    },
    // Computes closet points C1 and C2 of S1(s) = P1 + s * (Q1 - P1) and S2(t) = P2 + t * (Q2 - P2),
    // returning s and t. Function result is squared dist between S1(s) ans S2(t).
    ClosestPntsSegmentToSegment: function(p1, q1, p2, q2, outVecST, outC1, outC2) {
        var d1 = q1.GetSubtract(p1), // Dir of segment 1
            d2 = q2.GetSubtract(p2), // Dir of segment 2
            r = p1.GetSubtract(p2);

        var a = d1.GetDot(d1), // Sqr length of segment 1
            e = d2.GetDot(d2), // Sqr length of segment 2
            f = d2.GetDot(r);

        var outS, outT, distVec;

        // Check if either or both points degenerate into points
        if(a <= INFINITESIMAL && e <= INFINITESIMAL) {
            outVecST.SetZero();
            outC1.SetCopy(p1);
            outC2.SetCopy(p2);
            distVec = outC1.GetSubtract(outC2);
            return distVec.GetDot(distVec);
        }
        if(a <= INFINITESIMAL) {
            // First segment degenerates into a point
            outS = 0.0;
            outT = f / e; // s = 0 => t = (b*s + f) / e = f / e
            outT = MathUtils.Clamp(outT, 0.0, 1.0);
        }
        else {
            var c = d1.GetDot(r);
            if(e <= INFINITESIMAL) {
                // Second segment degenerates into a point
                outT = 0.0;
                outS = MathUtils.Clamp(-c / a, 0.0, 1.0); // t = 0 => s = (b*t - c) / a = -c / a
            }
            else {
                // Start of general non-degenerate case
                var b = d1.GetDot(d2);
                var denom = a * e - b * b; // Always non-negative

                // If segments are not parallel, compute closest point on L1 and L2 and clamp to segment S1,
                // else pick arbitrary s (here 0)
                if(denom != 0.0)
                    outS = MathUtils.Clamp((b*f - c*e) / denom, 0.0, 1.0);
                else
                    outS = 0.0;

                // Compute point on L2 closest to S1(s) using t = Dot((P1 + D1*s) - P2,D2) / Dot(D2,D2) = (b*s + f) / e
                // Deffer the division by e until we know 0 < t < 1
                var tnom = b * outS + f;

                // If 0 < t < 1, done, else clamp t, and recompute s for the new value of t using
                // s = Dot((P2 + D2*t) - P1,D1) / Dot(D1,D1)= (t*b - c) / a and clamp 0 < s < 1
                if(tnom < 0.0) {
                    outT = 0.0;
                    outS = MathUtils.Clamp(-c / a, 0.0, 1.0);
                }
                else if(tnom > e) {
                    outT = 1.0;
                    outS = MathUtils.Clamp((b - c) / a, 0.0, 1.0);
                }
                else {
                    outT = tnom / e;
                }
            }
        }
        outC1.SetCopy(p1.GetAdd(d1.SetScaleByNum(outS)));
        outC2.SetCopy(p2.GetAdd(d2.SetScaleByNum(outT)));
        outVecST.SetValues(outS, outT);
        distVec = outC1.GetSubtract(outC2);
        return distVec.GetDot(distVec);
    }
};

var ModelUtils = {
    SelectVAOData: function(vertSets) {
        if (vertSets.byFaces.colElems.length > 0 || vertSets.byFaces.texCoords.length > 0) {
            return vertSets.byFaces;
        }
        return vertSets.byMesh;
    },
    AssignShaderProgram: function(vertData, materials) {
        /// <signature>
        ///  <summary>Examines the model's data and returns the last appropriate shader found</summary>
        ///  <param name="model" type="object"></param>
        ///  <returns type="shaderProgram" />
        /// </signature>

        // Decide on shader program here, based on data coming in
        var colour = false,
            texture = false,
            light = false;

        // Determine which attributes can even be supported
        if (vertData.colElems.length > 0) colour = true;
        if (vertData.texCoords.length > 0) texture = true;
        if (materials.length > 0) light = true;

        var matches = [];
        // Find best match - eliminate those shaders that DO have attributes we DON'T want
        for (var shdr in EL.assets.shaderPrograms) {
            if (!colour && EL.assets.shaderPrograms[shdr].a_Col != -1) continue;
            if (!texture && EL.assets.shaderPrograms[shdr].a_TexCoord != -1) continue;
            if (!light && EL.assets.shaderPrograms[shdr].a_Norm != -1) continue;
            matches.push(EL.assets.shaderPrograms[shdr]);
        }
        // Return the last match, for now.
        return matches[matches.length - 1];
    },
    BuildShaderProgram: function(vertData, materials, usesFragLighting, outShdrFilePair, dispShdrStr = false) {
        /// <signature>
        ///  <summary>Examines the model's data and build the appropriate shader program strings. Only for 3D GameObject models</summary>
        ///  <param name="vertData" type="object">Vertex data from model, either from entire mesh, or per face</param>
        ///  <param name="materials" type="object">Material from model</param>
        ///  <param name="usesFragLighting" type="bool">If false, light data will be calculated in the vertex shader</param>
        ///  <returns type="void" />
        /// </signature>

        var vshdrStr, fshdrStr;

        // Decide on shader program here, based on data coming in
        var colour = vertData.colElems.length > 0,
            texture = vertData.texCoords.length > 0,
            light = materials.length > 0;

        var reflection = false;
        if(light)
            reflection = materials[0].mirr.refl > 0.0;

        var declaration, mainFunc, fragColour;


        /******************** VERTEX SHADER ********************/

        declaration = ShdrLines.attr.pos;
        mainFunc = ShdrLines.main.start;
        mainFunc += ShdrLines.main.pntSize;

        if(colour) {
            declaration += ShdrLines.attr.col;
            declaration += ShdrLines.vary.col;
            mainFunc += ShdrLines.vary.sendCol;
        }
        if(texture) {
            declaration += ShdrLines.attr.tex;
            declaration += ShdrLines.vary.tex;
            mainFunc += ShdrLines.vary.sendTex;
        }
        if(!light) {
            declaration += ShdrLines.unif.mtxMVP;
            mainFunc += ShdrLines.main.glPos.MVP;
        }
        else {

            /*
            if(ViewMngr.lightProps.useFragLighting) {

            }
            if(ViewMngr.lightProps.model == LightModels.phong) {

            }
            else if(ViewMngr.lightProps.model == LightModels.blinnPhong) {

            }
            else if(ViewMngr.lightProps.model == LightModels.toon) {

            }
            */

            declaration += ShdrLines.attr.norm;

            if(!usesFragLighting) {

                declaration += ShdrLines.vary.light;
                declaration += ShdrLines.unif.lighting;
                declaration += ShdrLines.unif.camPos;

                mainFunc += "vec4 " + ShdrLines.vary.sendPos;
                mainFunc += ShdrLines.main.glPos.Split;
                mainFunc += "vec3 " + ShdrLines.vary.sendNorm;
                mainFunc += ShdrLines.main.lighting;
                mainFunc += ShdrLines.vary.sendLight;
            }
            else {
                declaration += ShdrLines.vary.pos;
                declaration += ShdrLines.vary.norm;

                mainFunc += ShdrLines.vary.sendPos;
                mainFunc += ShdrLines.main.glPos.Split;
                mainFunc += ShdrLines.vary.sendNorm;
            }


            declaration += ShdrLines.unif.mtxM;
            declaration += ShdrLines.unif.mtxVP;
            declaration += ShdrLines.unif.mtxNorm;
        }

        mainFunc += ShdrLines.main.end;

        vshdrStr = '' + declaration + mainFunc;

        if(dispShdrStr) {
            console.log("Vertex shader ==================================");
            console.log(vshdrStr);
            let vShdrWindow = window.open("about:blank", "", "_blank");
            if(vShdrWindow)
                vShdrWindow.document.write(vshdrStr);
        }

        /******************** FRAGMENT SHADER ********************/

        declaration = ShdrLines.prec.medF;

        mainFunc = ShdrLines.main.start;

        fragColour = ShdrLines.main.glFrag.start;
        fragColour += "(" + ShdrLines.main.glFrag.tintCol;

        if(colour) {
            declaration += ShdrLines.vary.col;
            fragColour += ShdrLines.main.glFrag.col;
        }
        if(texture) {
            declaration += ShdrLines.vary.tex;
            declaration += ShdrLines.unif.sampler2D;
            mainFunc += ShdrLines.main.tex2DCol;
            fragColour += ShdrLines.main.glFrag.tex2DCol;
        }
        if(reflection) {
            declaration += ShdrLines.unif.samplerCube;
            mainFunc += ShdrLines.main.texCubeCol;
            fragColour += ShdrLines.main.glFrag.texCubeCol;
        }
        if(!light) {
            fragColour += ")";
        }
        else {
            if(!usesFragLighting) {
                declaration += ShdrLines.vary.light;
            }

            else {
                declaration += ShdrLines.vary.pos;
                declaration += ShdrLines.vary.norm;
                declaration += ShdrLines.unif.lighting;
                declaration += ShdrLines.unif.camPos;

                mainFunc += ShdrLines.main.normalizeNorm;
                // This regex usage is unsafe, but necessary to replace ALL occurrences.
                mainFunc += ShdrLines.main.lighting.replace(/v_TrfmNorm/g, "normal");
                mainFunc += "vec3 " + ShdrLines.vary.sendLight;
            }
            fragColour += ")";
            fragColour += ShdrLines.main.glFrag.light;
        }

        fragColour += ShdrLines.main.glFrag.alphaStart;
        if(colour)
            fragColour += ShdrLines.main.glFrag.colA;
        if(texture)
            fragColour += ShdrLines.main.glFrag.texA;
        fragColour += ShdrLines.main.glFrag.end;

        declaration += ShdrLines.unif.tint;

        mainFunc += fragColour;
        mainFunc += ShdrLines.main.end;

        fshdrStr = '' + declaration + mainFunc;

        if(dispShdrStr) {
            console.log("Fragment shader ==================================");
            console.log(fshdrStr);
            let fShdrWindow = window.open("about:blank", "", "_blank");
            if(fShdrWindow)
                fShdrWindow.document.write(fshdrStr);
        }
        

        outShdrFilePair = new ShaderFilePair('', vshdrStr, fshdrStr);

        return wGL.CreateShaderPrograms(outShdrFilePair);
    }
};

var TextUtils = {
    MeasureText: function(string, fontSizeW) {
        return string.length * fontSizeW;
    },
    CreateBoundTextBlock: function(string, charW, charH, lineSpacing, maxW, maxH, outArray) {
        var strToParse = string.replace("\n", " ");

        var charMax = (maxW / charW);
        charMax = Math.floor(charMax);

        var lineToAdd = '';
        var lastSpaceIdx = 0;

        var maxLines = maxH / (charH + lineSpacing);
        maxLines = Math.floor(maxLines);
        var numLines = 0;

        while(numLines < maxLines) {
            numLines++;
            // max line of text that could be used
            var fullLine = strToParse.substr(0, charMax);

            // For the final line
            if(fullLine.length < charMax) {
                outArray.push(fullLine);
                break;
            }

            // Use full line if next char is a space
            if(strToParse.charAt(charMax) == ' ') {
                outArray.push(fullLine);
                lastSpaceIdx = charMax + 1;
            }
            else {
                // Otherwise find the last space and use everything up to there
                lastSpaceIdx = fullLine.lastIndexOf(' ') + 1;
                // Comes up zero if there are no more spaces\
                if (lastSpaceIdx == 0) {
                    // This means there's no other space detected just because the word is too long
                    if(strToParse.length >= charMax)
                        lastSpaceIdx = charMax;
                    else {
                        outArray.push(strToParse.slice(0, charMax));
                        break;
                    }
                    lineToAdd = strToParse.slice(0, charMax);
                }
                else {
                    // Subtract 1 to eliminate the space that was found, making right-alignment possible
                    lineToAdd = strToParse.substr(0, lastSpaceIdx-1);
                }
                outArray.push(lineToAdd);
            }

            strToParse = strToParse.slice(lastSpaceIdx);
        }
    }
};

var WndUtils = {
    WndX_To_GLNDCX: function(wndX) {
        return wndX / (0.5 * ViewMngr.wndWidth);
    },
    WndY_To_GLNDCY: function(wndY) {
        return wndY / (0.5 * ViewMngr.wndHeight);
    }
};

var RefUtils = {
    Swap: function(arr, idx1, idx2) {
        var temp = arr[idx1];
        arr[idx1] = arr[idx2];
        arr[idx2] = temp;
    }
};