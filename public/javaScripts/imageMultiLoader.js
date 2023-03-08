/**
 * Created by Devin on 2015-04-16.
 */

function LoadImages(elems, srcs, count, Callback) {
    var imagesToLoad = count;
    function LoadingComplete() {
        imagesToLoad--;
        if(imagesToLoad <=0)
            Callback();
    }

    for(var i = 0; i < count; i++) {
        elems[i].onload = LoadingComplete;
        elems[i].src = srcs[i];
    }
}