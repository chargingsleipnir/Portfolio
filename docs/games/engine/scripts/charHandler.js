/**
 * Created by Devin on 2014-12-26.
 */

/********** Build text for rendering **********/

function StaticCharBlock(strBlock, charW, charH, marginW, marginH, maxW, maxH, lineSpace, alignW, alignH) {
    var x = 0.0,
        y = 0.0;

    var posCoords = [];
    var texCoords = [];
    var greatestWidth = 0.0;
    var blockHeight = strBlock.length * (charH + lineSpace);

    var count = 0;
    for (var i = 0; i < strBlock.length; i++) { // array of strings

        var lineW = strBlock[i].length * charW;
        if (greatestWidth < lineW) greatestWidth = lineW;

        for (var j = 0; j < strBlock[i].length; j++) { // char array
            x = (j * (charW)) - (lineW*alignW) + marginW;
            y = (i * charH) + (i * lineSpace) + marginH;
            posCoords = posCoords.concat(this.ShiftedPosCoords(x, -y, charW, charH));
            texCoords = texCoords.concat(FontMap.texCoords[strBlock[i][j]]);
            count+= 6;
        }
    }

    // After alignment, put all verts back into their proper rect space
    // Make changes to affect extra style attributes, like killing off the last line space
    for (var i = 0; i < posCoords.length; i+=2) {
        posCoords[i] += (maxW * alignW);
        posCoords[i+1] -= (maxH * alignH) - (blockHeight * alignH) + (lineSpace * alignH);
    }

    return {
        count: count,
        posCoords: posCoords,
        colElems: [],
        texCoords: texCoords,
        normAxes: []
    };
}
StaticCharBlock.prototype = {
    ShiftedPosCoords: function(x, y, w, h) {
        // Defines quad shape
        return [
            x,     y,
            x,     y -h,
            x + w, y -h,
            x,     y,
            x + w, y -h,
            x + w, y
        ];
    }
};

var FontMap = {
    texCoords: {},
    Initialize: function() {

        function GetCoordsByIndex(row, col) {
            // For textures, specify row and col from bottom-left to top-right
            var eighth = 0.1250,
                twelfth = 0.0833;
            return [
                row * twelfth, (col+1) * eighth,
                row * twelfth, col * eighth,
                (row+1) * twelfth, col * eighth,

                row * twelfth, (col+1) * eighth,
                (row+1) * twelfth, col * eighth,
                (row+1) * twelfth, (col+1) * eighth
            ];
        }

        this.texCoords['A'] = GetCoordsByIndex(0, 7);
        this.texCoords['B'] = GetCoordsByIndex(1, 7);
        this.texCoords['C'] = GetCoordsByIndex(2, 7);
        this.texCoords['D'] = GetCoordsByIndex(3, 7);
        this.texCoords['E'] = GetCoordsByIndex(4, 7);
        this.texCoords['F'] = GetCoordsByIndex(5, 7);
        this.texCoords['G'] = GetCoordsByIndex(6, 7);
        this.texCoords['H'] = GetCoordsByIndex(7, 7);
        this.texCoords['I'] = GetCoordsByIndex(8, 7);
        this.texCoords['J'] = GetCoordsByIndex(9, 7);
        this.texCoords['K'] = GetCoordsByIndex(10, 7);
        this.texCoords['L'] = GetCoordsByIndex(11, 7);
        this.texCoords['M'] = GetCoordsByIndex(0, 6);
        this.texCoords['N'] = GetCoordsByIndex(1, 6);
        this.texCoords['O'] = GetCoordsByIndex(2, 6);
        this.texCoords['P'] = GetCoordsByIndex(3, 6);
        this.texCoords['Q'] = GetCoordsByIndex(4, 6);
        this.texCoords['R'] = GetCoordsByIndex(5, 6);
        this.texCoords['S'] = GetCoordsByIndex(6, 6);
        this.texCoords['T'] = GetCoordsByIndex(7, 6);
        this.texCoords['U'] = GetCoordsByIndex(8, 6);
        this.texCoords['V'] = GetCoordsByIndex(9, 6);
        this.texCoords['W'] = GetCoordsByIndex(10, 6);
        this.texCoords['X'] = GetCoordsByIndex(11, 6);
        this.texCoords['Y'] = GetCoordsByIndex(0, 5);
        this.texCoords['Z'] = GetCoordsByIndex(1, 5);
        this.texCoords['a'] = GetCoordsByIndex(2, 5);
        this.texCoords['b'] = GetCoordsByIndex(3, 5);
        this.texCoords['c'] = GetCoordsByIndex(4, 5);
        this.texCoords['d'] = GetCoordsByIndex(5, 5);
        this.texCoords['e'] = GetCoordsByIndex(6, 5);
        this.texCoords['f'] = GetCoordsByIndex(7, 5);
        this.texCoords['g'] = GetCoordsByIndex(8, 5);
        this.texCoords['h'] = GetCoordsByIndex(9, 5);
        this.texCoords['i'] = GetCoordsByIndex(10, 5);
        this.texCoords['j'] = GetCoordsByIndex(11, 5);
        this.texCoords['k'] = GetCoordsByIndex(0, 4);
        this.texCoords['l'] = GetCoordsByIndex(1, 4);
        this.texCoords['m'] = GetCoordsByIndex(2, 4);
        this.texCoords['n'] = GetCoordsByIndex(3, 4);
        this.texCoords['o'] = GetCoordsByIndex(4, 4);
        this.texCoords['p'] = GetCoordsByIndex(5, 4);
        this.texCoords['q'] = GetCoordsByIndex(6, 4);
        this.texCoords['r'] = GetCoordsByIndex(7, 4);
        this.texCoords['s'] = GetCoordsByIndex(8, 4);
        this.texCoords['t'] = GetCoordsByIndex(9, 4);
        this.texCoords['u'] = GetCoordsByIndex(10, 4);
        this.texCoords['v'] = GetCoordsByIndex(11, 4);
        this.texCoords['w'] = GetCoordsByIndex(0, 3);
        this.texCoords['x'] = GetCoordsByIndex(1, 3);
        this.texCoords['y'] = GetCoordsByIndex(2, 3);
        this.texCoords['z'] = GetCoordsByIndex(3, 3);
        this.texCoords['0'] = GetCoordsByIndex(4, 3);
        this.texCoords['1'] = GetCoordsByIndex(5, 3);
        this.texCoords['2'] = GetCoordsByIndex(6, 3);
        this.texCoords['3'] = GetCoordsByIndex(7, 3);
        this.texCoords['4'] = GetCoordsByIndex(8, 3);
        this.texCoords['5'] = GetCoordsByIndex(9, 3);
        this.texCoords['6'] = GetCoordsByIndex(10, 3);
        this.texCoords['7'] = GetCoordsByIndex(11, 3);
        this.texCoords['8'] = GetCoordsByIndex(0, 2);
        this.texCoords['9'] = GetCoordsByIndex(1, 2);
        this.texCoords[','] = GetCoordsByIndex(2, 2);
        this.texCoords['.'] = GetCoordsByIndex(3, 2);
        this.texCoords['!'] = GetCoordsByIndex(4, 2);
        this.texCoords['?'] = GetCoordsByIndex(5, 2);
        this.texCoords['<'] = GetCoordsByIndex(6, 2);
        this.texCoords['>'] = GetCoordsByIndex(7, 2);
        this.texCoords['/'] = GetCoordsByIndex(8, 2);
        this.texCoords['\\'] = GetCoordsByIndex(9, 2);
        this.texCoords[';'] = GetCoordsByIndex(10, 2);
        this.texCoords[':'] = GetCoordsByIndex(11, 2);
        this.texCoords['\''] = GetCoordsByIndex(0, 1);
        this.texCoords['\"'] = GetCoordsByIndex(1, 1);
        this.texCoords['['] = GetCoordsByIndex(2, 1);
        this.texCoords[']'] = GetCoordsByIndex(3, 1);
        this.texCoords['{'] = GetCoordsByIndex(4, 1);
        this.texCoords['}'] = GetCoordsByIndex(5, 1);
        this.texCoords['('] = GetCoordsByIndex(6, 1);
        this.texCoords[')'] = GetCoordsByIndex(7, 1);
        this.texCoords['|'] = GetCoordsByIndex(8, 1);
        this.texCoords['&'] = GetCoordsByIndex(9, 1);
        this.texCoords['+'] = GetCoordsByIndex(10, 1);
        this.texCoords['-'] = GetCoordsByIndex(11, 1);
        this.texCoords['='] = GetCoordsByIndex(0, 0);
        this.texCoords['_'] = GetCoordsByIndex(1, 0);
        this.texCoords['*'] = GetCoordsByIndex(2, 0);
        this.texCoords['^'] = GetCoordsByIndex(3, 0);
        this.texCoords['%'] = GetCoordsByIndex(4, 0);
        this.texCoords['$'] = GetCoordsByIndex(5, 0);
        this.texCoords['#'] = GetCoordsByIndex(6, 0);
        this.texCoords['@'] = GetCoordsByIndex(7, 0);
        this.texCoords['`'] = GetCoordsByIndex(8, 0);
        this.texCoords['~'] = GetCoordsByIndex(9, 0);
        this.texCoords[' '] = GetCoordsByIndex(10, 0);
    }
};
