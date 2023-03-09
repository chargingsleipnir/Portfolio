/**
 * Created by Devin on 2015-04-13.
 */

var AnimateElement = (function() {

    var slideIntervalID = 0,
        sliderHeight = 0,
        sliding = false;

    function SlideOpenIntervalCall(elem, incr, endHeight, Callback) {
        sliderHeight += incr;
        if(sliderHeight >= endHeight) {
            sliding = false;
            sliderHeight = endHeight;
            clearInterval(slideIntervalID);
            Callback(sliderHeight);
        }
        elem.style.height = sliderHeight + 'px';
    }
    function SlideCloseIntervalCall(elem, incr, endHeight, Callback) {
        sliderHeight -= incr;
        if(sliderHeight <= endHeight) {
            sliding = false;
            sliderHeight = endHeight;
            clearInterval(slideIntervalID);
            Callback(sliderHeight);
        }
        elem.style.height = sliderHeight + 'px';
    }

    return {
        Slide: function(elem, incrAbs, rateMilli, endHeight, currHeight, Callback) {
            if(!sliding) {
                sliding = true;
                sliderHeight = currHeight;
                var SlideCall = (endHeight > sliderHeight) ? SlideOpenIntervalCall : SlideCloseIntervalCall;
                slideIntervalID = setInterval(function(){SlideCall(elem, incrAbs, endHeight, Callback);}, rateMilli);
            }
        }
    };
})();