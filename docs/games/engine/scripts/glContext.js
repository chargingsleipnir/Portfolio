var wGL = {
    ctx: null,
    Initialize: function(contextWebGL) {
        /// <signature>
        ///  <summary>Initialize webGL by establisking context and preparing viewport</summary>
        ///  <param name="contextWebGL" type="context">the webGL context call from the canvas element</param>
        /// </signature>
        this.ctx = contextWebGL;
        this.ctx.clearColor(0.5, 0.4, 0.6, 1.0);
        this.ctx.enable(this.ctx.DEPTH_TEST);
        this.ctx.depthFunc(this.ctx.LESS);
        this.ctx.enable(this.ctx.BLEND);
        this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
        //this.ctx.enable(this.ctx.CULL_FACE);
        this.ctx.lineWidth(3);

        this.CreateShaderPrograms(EL.assets.shaderStrings, EL.assets.shaderPrograms);
    },
    ReshapeWindow: function(width, height) {
        this.ctx.viewport(0.0, 0.0, width, height);
    },
    CreateShaderPrograms: function(shaderStrings, container) {
        /// <signature>
        ///  <summary>Create shader programs</summary>
        ///  <param name="shaderStrings" type="array2D [n][3]">name, vert, and frag strings</param>
        ///  <param name="container" type="object">An object to be mapped as <string, ShaderProgramIDs></param>
        /// </signature>

        // Always necessary to pass vars into private functions
        var ctx = this.ctx;

        function CreateShader(codeString, type) {
            var shader = ctx.createShader(type);
            ctx.shaderSource(shader, codeString);
            ctx.compileShader(shader);
            if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
                alert("in Program.createShader: \n" + codeString);
                throw ctx.getShaderInfoLog(shader);
            }
            return shader;
        }
        function CreateProgram(vertShaderString, fragShaderString) {
            var program = ctx.createProgram();
            var vertShader = CreateShader(vertShaderString, ctx.VERTEX_SHADER);
            var fragShader = CreateShader(fragShaderString, ctx.FRAGMENT_SHADER);
            ctx.attachShader(program, vertShader);
            ctx.attachShader(program, fragShader);
            ctx.linkProgram(program);
            if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
                alert("in createProgram");
                throw ctx.getProgramInfoLog(program);
            }

            var programData = new ShaderProgramData();

            programData.program = program;

            // Attributes will return their int location, -1 if not found
            programData.a_Pos = ctx.getAttribLocation(program, 'a_Pos');
            programData.a_Col = ctx.getAttribLocation(program, 'a_Col');
            programData.a_TexCoord = ctx.getAttribLocation(program, "a_TexCoord");
            programData.a_Norm = ctx.getAttribLocation(program, 'a_Norm');

            // Uniforms will return uniform object, null if not found
            programData.u_Tint = ctx.getUniformLocation(program, "u_Tint");
            programData.u_Sampler = ctx.getUniformLocation(program, "u_Sampler");
            programData.u_SamplerCube = ctx.getUniformLocation(program, "u_SamplerCube");
            programData.u_PntSize = ctx.getUniformLocation(program, "u_PntSize");
            // MATERIALS
            // Colour is multiplied by intensity immediately, before exporting model. No reason to hold values separately
            programData.u_DiffColWeight = ctx.getUniformLocation(program, "u_DiffColWeight");
            programData.u_SpecCol = ctx.getUniformLocation(program, "u_SpecCol");
            programData.u_SpecInt = ctx.getUniformLocation(program, "u_SpecInt");
            //ctx.getUniformLocation(program, "u_Specular_Hardness");
            //ctx.getUniformLocation(program, "u_Mirror_Color");
            //ctx.getUniformLocation(program, "u_Mirror_Distance");
            //ctx.getUniformLocation(program, "u_Mirror_Reflectivity");
            //ctx.getUniformLocation(program, "u_Shading_Ambient");
            //ctx.getUniformLocation(program, "u_Shading_Emit");
            //ctx.getUniformLocation(program, "u_Shading_Translucent");
            //ctx.getUniformLocation(program, "u_Darkness");
            // LIGHTS
            programData.u_AmbBright = ctx.getUniformLocation(program, "u_AmbBright");
            programData.u_DirBright = ctx.getUniformLocation(program, "u_DirBright");
            programData.u_DirDir = ctx.getUniformLocation(program, "u_DirDir");
            programData.u_PntBright = ctx.getUniformLocation(program, "u_PntBright");
            programData.u_PntPos = ctx.getUniformLocation(program, "u_PntPos");
            // For proper specular angling
            programData.u_CamPos = ctx.getUniformLocation(program, "u_CamPos");
            // MATRICES
            programData.u_MtxM = ctx.getUniformLocation(program, "u_MtxM");
            programData.u_MtxVP = ctx.getUniformLocation(program, "u_MtxVP");
            programData.u_MtxMVP = ctx.getUniformLocation(program, "u_MtxMVP");
            programData.u_MtxNorm = ctx.getUniformLocation(program, "u_MtxNorm");

            return programData;
        }

        if(container) {
            // Load each program and map it to the string name given
            for (var i = 0; i < shaderStrings.length; i++)
                container[shaderStrings[i].name] = CreateProgram(shaderStrings[i].vert, shaderStrings[i].frag);
        }
        else {
            return CreateProgram(shaderStrings.vert, shaderStrings.frag);
        }
    },
    CreateBufferObjects: function(vertData, bufferData, isDynamic) {
        /// <signature>
        ///  <summary>Creates appropriate buffers from given model data</summary>
        ///  <param name="model" type="object">May be primitive, or imported</param>
        /// </signature>
        var drawType = this.ctx.STATIC_DRAW;
        if(isDynamic)
            drawType = this.ctx.DYNAMIC_DRAW;

        // Get appropriate set of verts based on whether or not indices can/will be used
        bufferData.numVerts = vertData.count;
        if (vertData.indices) {
            // Create and populate EABO
            bufferData.EABO = this.ctx.createBuffer();
            this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferData.EABO);
            this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertData.indices), drawType);
            // Get total vertex count
            bufferData.numVerts = vertData.indices.length;
        }

        // Create one long vert array, so only one buffer needs to be created and used
        var vertArray = vertData.posCoords;
        vertArray = vertArray.concat(vertData.colElems);
        vertArray = vertArray.concat(vertData.texCoords);
        vertArray = vertArray.concat(vertData.normAxes);
        var VAO = new Float32Array(vertArray);

        // Create VBO
        bufferData.VBO = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, bufferData.VBO);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, VAO, drawType);

        bufferData.VAOBytes = VAO.BYTES_PER_ELEMENT;
        bufferData.lenPosCoords = vertData.posCoords.length;
        bufferData.lenColElems = vertData.colElems.length;
        bufferData.lenTexCoords = vertData.texCoords.length;
        bufferData.lenNormAxes = vertData.normAxes.length;

        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
    },
    RewriteVAO: function(VBO, VAO) {
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, VBO);
        this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, VAO);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
    },
    RewriteIndexBuffer: function(EABO, indices) {
        if(!EABO)
            EABO = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, EABO);
        //this.ctx.bufferSubData(this.ctx.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(indices));
        this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.ctx.STATIC_DRAW);
    },
    CreateTextureObject: function(texture, texFilter, outTexID) {
        var texID = outTexID ? outTexID : this.ctx.createTexture();
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texID);
        this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, true);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, texture);

        if (texFilter == TextureFilters.nearest) {
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.NEAREST);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.NEAREST);
        }
        else if (texFilter == TextureFilters.linear) {
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
        }
        else if (texFilter == TextureFilters.mipmap) {
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR_MIPMAP_NEAREST);
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        }

        this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
        return texID;


        /* Consider loading from an array of textures images
        for (var i in textureArray) {
            this.textures[i] = gl.createTexture();
            this.textures[i].image = textureArray[i];
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textures[i].image);
            // Might want to parameterize these to adjust quality.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }*/
    },
    CreateTextureCube: function(faceTextures) {

        var texCubeID = this.ctx.createTexture();
        this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, texCubeID);

        this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);

        var faces = [
            this.ctx.TEXTURE_CUBE_MAP_POSITIVE_X,
            this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.ctx.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.ctx.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        //this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, texCubeID);
        this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, true);
        for(var i = 0; i < 6; i++) {
            //this.ctx.texImage2D(faces[i], 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, null);
            this.ctx.texImage2D(faces[i], 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, faceTextures[i]);
        }

        // this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, null);
        return texCubeID;
    },
    CreateFrameBuffers: function() {
        var framebuffer = this.ctx.createFramebuffer();
        //this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, framebuffer);
        //framebuffer.width = 512;
        //framebuffer.height = 512;
        //
        //var texture = gl.createTexture();
        //this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        //this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
        //this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR_MIPMAP_NEAREST);
        //this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        //this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, framebuffer.width, framebuffer.height, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, null);
        //
        //var renderbuffer = this.ctx.createRenderbuffer();
        //this.ctx.bindRenderbuffer(this.ctx.RENDERBUFFER, renderbuffer);
        //this.ctx.renderbufferStorage(this.ctx.RENDERBUFFER, this.ctx.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);

        //this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, this.ctx.COLOR_ATTACHMENT0, this.ctx.TEXTURE_2D, texture, 0);
        //this.ctx.framebufferRenderbuffer(this.ctx.FRAMEBUFFER, this.ctx.DEPTH_ATTACHMENT, this.ctx.RENDERBUFFER, renderbuffer);

        //this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
        //this.ctx.bindRenderbuffer(this.ctx.RENDERBUFFER, null);
        //this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null);

        return framebuffer;
    },
    CreateTextureFrameBuffer: function() {

    },
    GetDrawMethod: function(drawMethod) {
        /// <signature>
        ///  <summary>Get webGL Drawtype enum value</summary>
        ///  <param name="drawMethod" type="enum">Defined in structsEnumsConsts.js</param>
        /// </signature>
        switch (drawMethod) {
            case DrawMethods.points:
                return this.ctx.POINTS;
            case DrawMethods.lines:
                return this.ctx.LINES;
            case DrawMethods.triangles:
                return this.ctx.TRIANGLES;
            case DrawMethods.triangleFan:
                return this.ctx.TRIANGLE_FAN;
            case DrawMethods.triangleStrip:
                return this.ctx.TRIANGLE_STRIP;
            default:
                return this.ctx.TRIANGLES;
        }
    },
    mtxModel: new Matrix4(),
    DrawElements: function(drawMethod, buff) {
        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
        this.ctx.drawElements(drawMethod, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);
        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
    },
    DrawArrays: function(drawMethod, buff) {
        this.ctx.drawArrays(drawMethod, 0, buff.numVerts);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
    },
    RenderJSONModels: function(jsonModels, light, mtxVP) {
        for (var i = 0; i < jsonModels.length; i++)
        {
            if (jsonModels[i].active)
            {
                if(ViewMngr.frustum.IntersectsSphere(jsonModels[i].drawSphere)) {
                    //frustumTestCount++;

                    this.mtxModel.SetIdentity();
                    this.mtxModel.Transform(jsonModels[i].trfm);

                    // These just allow everything to be better read
                    var shdr = jsonModels[i].shaderData;
                    var buff = jsonModels[i].bufferData;

                    // USE PROGRAM AND VBO
                    this.ctx.useProgram(shdr.program);
                    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                    // SEND VERTEX DATA FROM BUFFER - Position, Colour, TextureCoords, Normals
                    this.ctx.enableVertexAttribArray(shdr.a_Pos);
                    this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);
                    if (shdr.a_Col != -1) {
                        this.ctx.enableVertexAttribArray(shdr.a_Col);
                        this.ctx.vertexAttribPointer(shdr.a_Col, 4, this.ctx.FLOAT, false, 0, buff.lenPosCoords * buff.VAOBytes);
                    }
                    if (shdr.a_TexCoord != -1) {
                        this.ctx.enableVertexAttribArray(shdr.a_TexCoord);
                        this.ctx.vertexAttribPointer(shdr.a_TexCoord, 2, this.ctx.FLOAT, false, 0, (buff.lenPosCoords + buff.lenColElems) * buff.VAOBytes);
                        if (buff.texID) {
                            this.ctx.activeTexture(this.ctx.TEXTURE0);
                            this.ctx.bindTexture(this.ctx.TEXTURE_2D, buff.texID);
                            this.ctx.uniform1i(shdr.u_Sampler, 0);
                            // This 0 supposedly relates to the this.ctx.TEXTURE0, and up to 32 textures can be sent at once.
                        }
                    }
                    if (shdr.a_Norm != -1) {
                        this.ctx.enableVertexAttribArray(shdr.a_Norm);
                        this.ctx.vertexAttribPointer(shdr.a_Norm, 3, this.ctx.FLOAT, false, 0, (buff.lenPosCoords + buff.lenColElems + buff.lenTexCoords) * buff.VAOBytes);

                        // Cube mapping for reflections
                        if(buff.texCubeID) {
                            // Deactivate so as not to come back in here during recursion
                            //jsonModels[i].active = false;
                            //
                            //this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, buff.FBOs[0]);
                            //for(var j = 0; j < 6; j++ ) {
                            //    this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, this.ctx.COLOR_ATTACHMENT0, this.ctx.TEXTURE_CUBE_MAP_POSITIVE_X + j, buff.texCubeID, 0);
                            //    this.RenderScene(jsonModels[i].reflCamsMatrices[j]);
                            //}
                            //this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null);
                            //
                            this.ctx.activeTexture(this.ctx.TEXTURE0);
                            this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, buff.texCubeID);
                            this.ctx.uniform1i(shdr.u_SamplerCube, 0);
                            //
                            //jsonModels[i].active = true;

                            // Mirror
                            //gl.uniform3fv(shdr.u_Mirror_Color, renderers[i].materials[0].mirror.color);
                            //gl.uniform1f(shdr.u_Mirror_Distance, renderers[i].materials[0].mirror.distance);
                            //gl.uniform1f(shdr.u_Mirror_Reflectivity, renderers[i].materials[0].mirror.reflectivity);
                        }
                        // Diffuse
                        // Diff col and int are multiplied before exporting
                        this.ctx.uniform3fv(shdr.u_DiffColWeight, jsonModels[i].mat.diff.colWeight);
                        // Specular
                        this.ctx.uniform3fv(shdr.u_SpecCol, jsonModels[i].mat.spec.col);
                        this.ctx.uniform1f(shdr.u_SpecInt, jsonModels[i].mat.spec.int);
                        //gl.uniform1f(shdr.u_Specular_Hardness, renderers[i].materials[0].specular.hardness);
                        // Shading
                        //gl.uniform1f(shdr.u_Shading_Ambient, renderers[i].materials[0].shading.ambient);
                        //gl.uniform1f(shdr.u_Shading_Emit, renderers[i].materials[0].shading.emit);
                        //gl.uniform1f(shdr.u_Shading_Translucent, renderers[i].materials[0].shading.translucent);
                        // Other
                        this.ctx.uniform1f(shdr.u_Alpha, jsonModels[i].mat.alpha);
                        //gl.uniform1f(shdr.u_Darkness, renderers[i].materials[0].darkness);

                        this.ctx.uniform1f(shdr.u_AmbBright, light.amb.bright);
                        this.ctx.uniform1f(shdr.u_DirBright, light.dir.bright);
                        this.ctx.uniform3fv(shdr.u_DirDir, light.dir.dir.GetNegative().GetData());
                        this.ctx.uniform1f(shdr.u_PntBright, light.pnt.bright);
                        this.ctx.uniform3fv(shdr.u_PntPos, light.pnt.pos.GetData());
                        this.ctx.uniform3fv(shdr.u_CamPos, ViewMngr.activeCam.posGbl.GetData());

                        /* If there's lighting, than the model and view-proj matrices
                         * are sent up independently. The lighting calculations require
                         * holding onto the verts modified from the model-matrix. */
                        this.ctx.uniformMatrix4fv(shdr.u_MtxM, false, this.mtxModel.data);
                        this.ctx.uniformMatrix4fv(shdr.u_MtxVP, false, mtxVP.data);
                        // Normal Matrix  GetInvMtx3
                        var mtxNorm = this.mtxModel.GetInvMtx3();
                        mtxNorm.Transpose();
                        this.ctx.uniformMatrix3fv(shdr.u_MtxNorm, false, mtxNorm.data);
                    }
                    else {
                        this.mtxModel.SetMultiply(mtxVP);
                        this.ctx.uniformMatrix4fv(shdr.u_MtxMVP, false, this.mtxModel.data);
                    }
                    this.ctx.uniform4fv(shdr.u_Tint, jsonModels[i].tint.GetData());

                    // Draw calls
                    if (buff.EABO) {
                        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
                        this.ctx.drawElements(jsonModels[i].drawMethod, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);
                    }
                    else {
                        this.ctx.drawArrays(jsonModels[i].drawMethod, 0, buff.numVerts);
                    }

                    // Unbind buffers after use
                    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
                    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
                    this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
                }
            }
        }
    },
    RenderBasicModels: function(basicModels, mtxVP) {
        for (var i = 0; i < basicModels.length; i++)
        {
            if(basicModels[i].active && ViewMngr.frustum.IntersectsSphere(basicModels[i].drawSphere))
            {
                //frustumTestCount++;

                var shdr = basicModels[i].shaderData;
                var buff = basicModels[i].bufferData;

                // USE PROGRAM AND VBO
                this.ctx.useProgram(shdr.program);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                // SEND VERTEX DATA FROM BUFFER - Position, Colour, TextureCoords, Normals
                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);
                if (shdr.a_Col != -1) {
                    this.ctx.enableVertexAttribArray(shdr.a_Col);
                    this.ctx.vertexAttribPointer(shdr.a_Col, 4, this.ctx.FLOAT, false, 0, buff.lenPosCoords * buff.VAOBytes);
                }

                this.mtxModel.SetIdentity();
                this.mtxModel.Transform(basicModels[i].trfm);
                this.mtxModel.SetMultiply(mtxVP);

                // SEND UP UNIFORMS
                this.ctx.uniformMatrix4fv(shdr.u_MtxMVP, false, this.mtxModel.data);
                this.ctx.uniform4fv(shdr.u_Tint, basicModels[i].tint.GetData());

                // Draw calls
                if (buff.EABO) {
                    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
                    this.ctx.drawElements(basicModels[i].drawMethod, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);
                }
                else {
                    this.ctx.drawArrays(basicModels[i].drawMethod, 0, buff.numVerts);
                }

                // Unbind buffers after use
                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
            }
        }
    },
    RenderRays: function(rays, mtxVP) {

        var shdr = EL.assets.shaderPrograms['ray'];
        this.ctx.useProgram(shdr.program);
        this.ctx.uniformMatrix4fv(shdr.u_MtxVP, false, mtxVP.data);

        for (var i = 0; i < rays.length; i++) {
            if (rays[i].active) {

                buff = rays[i].bufferData;

                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                // SEND VERTEX DATA FROM BUFFER - Position, Colour, TextureCoords, Normals
                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);

                this.ctx.enableVertexAttribArray(shdr.a_Col);
                this.ctx.vertexAttribPointer(shdr.a_Col, 4, this.ctx.FLOAT, false, 0, buff.lenPosCoords * buff.VAOBytes);

                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
                this.ctx.drawElements(this.ctx.LINES, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);

                // Unbind buffers after use
                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
            }
        }
    },
    RenderParticleFields: function(fields, gblTrfm, mtxVP) {
        this.mtxModel.SetIdentity();
        this.mtxModel.Transform(gblTrfm);
        this.mtxModel.SetMultiply(mtxVP);

        // Used to shrink point size
        var dist = ViewMngr.activeCam.posGbl.GetSubtract(gblTrfm.pos).GetMag();
        var distCalc = 1 - (dist / ViewMngr.farCullDist);

        for (var j = 0; j < fields.length; j++)
        {
            if(fields[j].active) {
                //fieldCount++;

                // Covers points, lines, and textured points
                var shdr = fields[j].fieldHdlr.shaderData;
                var buff = fields[j].fieldHdlr.bufferData;

                this.ctx.useProgram(shdr.program);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                // SEND VERTEX DATA FROM BUFFER - Position, Colour, TextureCoords, Normals
                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);

                this.ctx.enableVertexAttribArray(shdr.a_Col);
                this.ctx.vertexAttribPointer(shdr.a_Col, 4, this.ctx.FLOAT, false, 0, buff.lenPosCoords * buff.VAOBytes);

                if(buff.texID) {
                    this.ctx.activeTexture(this.ctx.TEXTURE0);
                    this.ctx.bindTexture(this.ctx.TEXTURE_2D, buff.texID);
                    this.ctx.uniform1i(shdr.u_Sampler, 0);
                }

                this.ctx.uniform1f(shdr.u_PntSize, fields[j].fieldHdlr.pntSize * (distCalc * distCalc * distCalc));
                this.ctx.uniformMatrix4fv(shdr.u_MtxMVP, false, this.mtxModel.data);

                this.ctx.drawArrays(fields[j].fieldHdlr.drawMethod, 0, buff.numVerts);

                // Unbind buffers after use
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
                this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
            }
        }
    },
    RenderParticleTails: function(tails, mtxVP) {

        var shdr = EL.assets.shaderPrograms['ray'];
        this.ctx.useProgram(shdr.program);
        this.ctx.uniformMatrix4fv(shdr.u_MtxVP, false, mtxVP.data);

        for (var j = 0; j < tails.length; j++)
        {
            if(tails[j].active) {
                //fieldCount++;
                // These just allow everything to be better read
                var buff = tails[j].trailHdlr.bufferData;

                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                // SEND VERTEX DATA FROM BUFFER - Position, Colour, TextureCoords, Normals
                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);

                this.ctx.enableVertexAttribArray(shdr.a_Col);
                this.ctx.vertexAttribPointer(shdr.a_Col, 4, this.ctx.FLOAT, false, 0, buff.lenPosCoords * buff.VAOBytes);

                this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, buff.numVerts);

                // Unbind buffers after use
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
            }
        }
    },
    RenderGUITextBoxes: function(textObjs) {
        // Text and boxes are drawn in the same loop so as to ensure that proper overlapping takes place.
        for(var j in textObjs) {

            /******************* TEXT BOXES *************************/
            if(textObjs[j].active) {

                shdr = textObjs[j].boxHdl.shaderData;
                buff = textObjs[j].boxHdl.bufferData;

                this.ctx.useProgram(shdr.program);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);

                // MAY HAVE TEXTURES - NO VERT COLOURS
                if (shdr.a_TexCoord != -1) {
                    this.ctx.enableVertexAttribArray(shdr.a_TexCoord);
                    this.ctx.vertexAttribPointer(shdr.a_TexCoord, 2, this.ctx.FLOAT, false, 0, (buff.lenPosCoords + buff.lenColElems) * buff.VAOBytes);
                    if (buff.texID) {
                        this.ctx.activeTexture(this.ctx.TEXTURE0);
                        this.ctx.bindTexture(this.ctx.TEXTURE_2D, buff.texID);
                        this.ctx.uniform1i(shdr.u_Sampler, 0);
                        // This 0 supposedly relates to the this.ctx.TEXTURE0, and up to 32 textures can be sent at once.
                    }
                }

                this.ctx.uniform4fv(shdr.u_Tint, textObjs[j].boxHdl.tint.GetData());

                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
                this.ctx.drawElements(this.ctx.TRIANGLES, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);

                // Unbind buffers after use
                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
                this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);

                /******************* TEXT BLOCKS *************************/
                /* This shader is very specific to gui text, having no matrices, and with textures*/
                var shdr = EL.assets.shaderPrograms['guiText'];
                var buff = textObjs[j].strHdl.bufferData;

                this.ctx.useProgram(shdr.program);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                // SEND VERTEX DATA FROM BUFFER - Position, Colour, TextureCoords, Normals
                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 2, this.ctx.FLOAT, false, 0, 0);

                // ALWAYS HAS TEXTURES
                this.ctx.enableVertexAttribArray(shdr.a_TexCoord);
                this.ctx.vertexAttribPointer(shdr.a_TexCoord, 2, this.ctx.FLOAT, false, 0, (buff.lenPosCoords + buff.lenColElems) * buff.VAOBytes);

                this.ctx.activeTexture(this.ctx.TEXTURE0);
                this.ctx.bindTexture(this.ctx.TEXTURE_2D, buff.texID);
                this.ctx.uniform1i(shdr.u_Sampler, 0);

                this.ctx.uniform4fv(shdr.u_Tint, textObjs[j].strHdl.tint.GetData());

                this.ctx.drawArrays(this.ctx.TRIANGLES, 0, buff.numVerts);

                // Unbind buffers after use
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
                this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
            }
        }
    },
    RenderGUIProgressBars: function(progBarObjs) {
        for(var j in progBarObjs) {

            /******************* PROGRESS BAR BOXES *************************/
            if(progBarObjs[j].active) {

                // BG BOX ------------------------------------------------
                var shdr = progBarObjs[j].bgBoxHdl.shaderData;
                var buff = progBarObjs[j].bgBoxHdl.bufferData;

                this.ctx.useProgram(shdr.program);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);

                this.ctx.uniform4fv(shdr.u_Tint, progBarObjs[j].bgBoxHdl.tint.GetData());

                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
                this.ctx.drawElements(this.ctx.TRIANGLES, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);
                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);

                // FG BOX ------------------------------------------------
                shdr = progBarObjs[j].fgBoxHdl.shaderData;
                buff = progBarObjs[j].fgBoxHdl.bufferData;

                this.ctx.useProgram(shdr.program);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buff.VBO);

                this.ctx.enableVertexAttribArray(shdr.a_Pos);
                this.ctx.vertexAttribPointer(shdr.a_Pos, 3, this.ctx.FLOAT, false, 0, 0);

                this.ctx.uniform4fv(shdr.u_Tint, progBarObjs[j].fgBoxHdl.tint.GetData());

                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, buff.EABO);
                this.ctx.drawElements(this.ctx.TRIANGLES, buff.numVerts, this.ctx.UNSIGNED_SHORT, 0);
                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
            }
        }
    },
    RenderScene: function(mtxCam) {
        /// <signature>
        ///  <summary>Render every object in the scene</summary>
        /// </signature>

        // Clear the scene for new draw call
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
        var mtxVP = mtxCam.GetMultiply(ViewMngr.mtxProj);
        var scene = SceneMngr.GetActiveScene();

        /******************* GameObject Models *************************/
        this.RenderJSONModels(scene.models, scene.light, mtxVP);

        /******************* DEBUG DRAWING *************************/
        if (DebugMngr.active) {
            // Debug models
            var debugObjs = scene.debug.GetActiveDispObjs();
            if (DebugMngr.dispAxes)
                debugObjs.push(DebugMngr.axes);
            if (DebugMngr.dispGrid)
                debugObjs.push(DebugMngr.grid);

            this.RenderBasicModels(debugObjs, mtxVP);

            // Ray casts
            if(DebugMngr.dispRays)
                this.RenderRays(scene.debug.GetRays(), mtxVP);
        }

        /******************* GameObject Particle Systems *************************/
        for (var i = 0; i < scene.ptclSystems.length; i++)
        {
            this.RenderParticleFields(
                scene.ptclSystems[i].GetSimpleFields(),
                scene.ptclSystems[i].objGlobalTrfm,
                mtxVP);
            this.RenderParticleTails(scene.ptclSystems[i].GetTails(), mtxVP);
        }
    },
    RenderGUI: function() {
        var guiSystems = GUINetwork.GetActiveSystems();
        /* Disable depth testing to ensure proper message structure.*/
        this.ctx.disable(this.ctx.DEPTH_TEST);
        for(var sys in guiSystems) {
            this.RenderGUITextBoxes(guiSystems[sys].guiTextObjs);
            this.RenderGUIProgressBars(guiSystems[sys].guiProgObjs);
        }
        this.ctx.enable(this.ctx.DEPTH_TEST);
    }
};