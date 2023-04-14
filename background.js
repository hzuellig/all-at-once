//create tabs
let captureDone = false;
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {


    if (!tab.url.match(/^about:/) && !tab.url.match(/^moz-extension:/)) {

        let screenshotToStore = {};
        let capturing = browser.tabs.captureVisibleTab();
        capturing.then(onCaptured, onError);



        function onCaptured(imageUri) {
            if (!captureDone) {
                cropImg(imageUri,
                    function (result) {
                        storeVisit(result.src)
                    });
                captureDone = true;
            }
            // call crop function
            // https://cloudinary.com/guides/automatic-image-cropping/cropping-images-in-javascript
            // https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly





        }

        function onError(error) {
            console.log(`Error: ${error}`);
        }



        function cropImg(img, callback) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            let image = new Image();
            image.src = img;
            


            image.onload = function () {
                canvas.width = 100;
                canvas.height = image.height;
                context.drawImage(image, image.width / 2 - 50, 0, 100, image.height, 0, 0, 100, image.height);
                let croped = new Image();
                croped.src = canvas.toDataURL();

                /*canvas.toBlob(function(blob){ // download image for testing
                    var link = document.createElement("a");
                    link.download = "image.png";
                    link.href = URL.createObjectURL(blob);
                    link.click();
                   
                  },'image/png');*/

                callback(croped);
            }
        }

        function storeVisit(data) {

            screenshotToStore[tab.id] = { "screenshot": data, "open": Date.now(), "close": 0, "window": tab.windowId, "url": tab.url };
            browser.storage.local.set(screenshotToStore);

            captureDone = false; //make ready for new one
        }




    }
});

//close tab, set close timestamp
browser.tabs.onRemoved.addListener(handleRemoved);
let current;
function handleRemoved(tabId) {
    current = tabId;
    let storedScreenshots = browser.storage.local.get();
    
    storedScreenshots.then(onGotSingle, onError);

    function onGotSingle(data) {

        for (const [key, value] of Object.entries(data)) {
            if (parseInt(key) === tabId) {
                data[key].close = Date.now();
                console.log(data[key].close);
            }
        }

        browser.storage.local.set(data);
    }


}

//close window, set close timestamp on all tabs associated with this window
browser.windows.onRemoved.addListener((windowId) => {
    closeTabs(windowId);
});

function closeTabs(windowId) {
    let storedScreenshots = browser.storage.local.get();
    storedScreenshots.then(onGot, onError);

    function onGot(data) {

        for (const [key, value] of Object.entries(data)) {
            if (value.window == windowId) {
                data[key].close = Date.now();
            }
        }

        browser.storage.local.set(data);
    }
}

/*********************** */
/* Open new Tag, display */
/*********************** */

//display history
browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({
        url: browser.runtime.getURL("display.html")
    });

});


function onError(error) {
    console.log(`Error: ${error}`);
}


/*********************** */
/* Remove entries that are older than 10 days */
/*********************** */

let days = 10;
let storedScreenshots = browser.storage.local.get();
storedScreenshots.then((data) => {

    for (const [key, value] of Object.entries(data)) {
        if (data[key].open < Date.now() - days * 24 * 60 * 60 * 1000) {
            browser.storage.local.remove(key)
                .then(() => {
                    console.log("Item deleted successfully!");
                })
                .catch((error) => {
                    console.error(`Error deleting item: ${error}`);
                });
        }
    }

}, onError);