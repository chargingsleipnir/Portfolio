
var EL = {
    assets: {
        shaderStrings: [],
        shaderPrograms: {},
        textures: {},
        models: {}
    },
    PreLoad: function (CompletionCallback, ProgressCallback, LoadedCallback) {
        console.log("LOADING ENGINE CONTENT");

        /********* Load other components *********/
        function InitEngineComponents() {

            // The font map is not dynamic - very specific to spritesheet I made.
            FontMap.Initialize();
            CompletionCallback();
        }

        /********* Load external files *********/

        // SHADERS
        var shaderNamesFilepaths = [
            // Specialty shaders
            ['ray', '../engine/assets/shaders/ray.vshdr', '../engine/assets/shaders/ray.fshdr'],
            ['guiBoxTint', '../engine/assets/shaders/guiBoxTint.vshdr', '../engine/assets/shaders/guiBoxTint.fshdr'],
            ['guiBoxTintTex', '../engine/assets/shaders/guiBoxTintTex.vshdr', '../engine/assets/shaders/guiBoxTintTex.fshdr'],
            ['guiText', '../engine/assets/shaders/guiText.vshdr', '../engine/assets/shaders/guiText.fshdr'],
            ['pntCol', '../engine/assets/shaders/pntCol.vshdr', '../engine/assets/shaders/pntCol.fshdr'],
            ['pntColTex', '../engine/assets/shaders/pntColTex.vshdr', '../engine/assets/shaders/pntColTex.fshdr'], // Special for textured particles
            ['cubeTex', '../engine/assets/shaders/cubeTex.vshdr', '../engine/assets/shaders/cubeTex.fshdr'] // Special for cube texture
        ];
        // TEXTURE ASSETS
        var textureNamesFilepaths = [
            ['fontMapBasic', '../engine/assets/images/FontSheetBasic.png'],
            ['fontMapBasicBold', '../engine/assets/images/FontSheetBasicBold.png']
        ];
        // JSON ASSETS
        var modelNamesFilepaths = [
            ['dimensionBox', '../engine/assets/models/DimensionTest_PositiveCube.json']
        ];

        var that = this;
        function LoadModels() {
            FileUtils.LoadModels(modelNamesFilepaths, that.assets.models, InitEngineComponents, ProgressCallback, LoadedCallback);
        }
        function LoadTextures() {
            FileUtils.LoadTextures(textureNamesFilepaths, that.assets.textures, LoadModels, ProgressCallback, LoadedCallback);
        }

        // Load up everything first
        FileUtils.LoadShaders(shaderNamesFilepaths, this.assets.shaderStrings, LoadTextures, ProgressCallback, LoadedCallback);
    }
};