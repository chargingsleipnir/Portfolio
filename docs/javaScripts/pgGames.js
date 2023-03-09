/**
 * Created by Devin on 2015-04-14.
 */

function SetSlideCall(launchElem, slideElem) {
    var maxHeight = slideElem.offsetHeight;
    var currH = 0;

    function SlideComplete(height) {
        currH = height;
        if(currH <= 0)
            slideElem.style.display = 'none';
    }
    slideElem.style.height = 0 + 'px';
    SlideComplete(0);

    launchElem.addEventListener('click', function() {
        if(currH <= 0) {
            slideElem.style.display = 'block';
            AnimateElement.Slide(slideElem, 20, 16, maxHeight, currH, SlideComplete);
        }
        else if(currH >= maxHeight)
            AnimateElement.Slide(slideElem, 20, 16, 0, currH, SlideComplete);
    }, false);
}

var CopyChat = (function() {

    var chatLogFrame;
    var chatLogCopy;

    return {
        Init: () => {
            chatLogCopy = document.getElementById("ChatLogCopy");
            window.onmessage = (event) => {
                //console.log("Message recieved, event data:", event.data);
                chatLogCopy.innerHTML = event.data;
                chatLogCopy.scrollTop = chatLogCopy.scrollHeight;
            };

            chatLogFrame = document.getElementById("IFrameDoomLagoon");
            // Update the chat log to match what's in-game every second.
            setInterval(() => {
                chatLogFrame.contentWindow.postMessage("ReqChatLog", "*");
            }, 1000);
        }
    }
})();