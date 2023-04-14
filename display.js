let storedScreenshots = browser.storage.local.get();
storedScreenshots.then(onGot, onError);



let orderedbyDay = new Array();
let day = new Array();
let curTimestr = "";
let length;
let totalTime = 0;
let m_names = new Array("Jan", "Feb", "März",
  "April", "Mai", "Juni", "Juli", "Aug", "Sep",
  "Okt", "Nov", "Dez");
let w_days = new Array("So", "Mo", "Di", "Mi", "Do", "Fr", "Sa");

let firstEntryDay = "";

const shadow = document.getElementById("wrapper");



function onGot(data) {
  
    data = Object.fromEntries(Object.entries(data).reverse())
    orderbyDay(data);
 
  
}

function orderbyDay(data) {
  let n = 0;
  for (const [key, value] of Object.entries(data)) {
    let timestamp = new Date(value.open);
    let timestr = w_days[timestamp.getDay()] + ", " + timestamp.getDate() + "." + m_names[timestamp.getMonth()] + " " + timestamp.getFullYear().toString().substring(2, 4);
    if (n == 0) {
      firstEntryDay = timestr;
    }
    if (timestr != curTimestr) {
      curTimestr = timestr;
      day = new Array();
      orderedbyDay.push({ 'day': timestr, 'entries': day })

    }
    let result = orderedbyDay.find(obj => obj.day === timestr);
    value.staytime = Math.max((parseInt(value.close) - parseInt(value.open)), 1000);
    day.push(value);
    result.entries = day;


    n++;
  }

  if(orderedbyDay.length > 0){
    createMenu();
    displayData(firstEntryDay);
  }
 



}

function createMenu() {

  let menuNode = document.getElementById("menu").querySelector('.menu');
  for (let d = 0; d < orderedbyDay.length; d++) {

    let a = document.createElement('a');
    a.classList.add("menu-item")
    a.addEventListener("click", function () {
      displayData(orderedbyDay[d].day);
    });

    let dataLink = document.createTextNode(orderedbyDay[d].day);
    a.appendChild(dataLink);

    let attr = document.createAttribute("date-value");
    attr.value = orderedbyDay[d].day;
    a.setAttributeNode(attr);

    menuNode.appendChild(a);

  }

}

function displayData(day) {
  let result = orderedbyDay.find(obj => obj.day === day);
  //console.log(result)

  

  const elements = document.getElementsByClassName("screenshot");
  while (elements.length > 0) elements[0].remove();

  totalTime = 0;

  for (let s = 0; s < result.entries.length; s++) {
    let value = result.entries[s];
    totalTime += value.staytime;
    let bitmap = new Image();
    bitmap.src = value.screenshot;
    let div = document.createElement('div');
    bitmap.onload = function () {
      bitmap.style.width = window.innerWidth + "px";

      div.style.backgroundImage = "url('" + bitmap.src + "')";
      div.style.backgroundSize = "50px auto";
      div.style.backgroundRepeat = "repeat-x";
    }

    div.classList.add("screenshot");
    let staytime = document.createAttribute("staytime");
    staytime.value = value.staytime;
    div.setAttributeNode(staytime);

    let url = document.createAttribute("url");
    url.value = value.url;
    div.setAttributeNode(url);

    shadow.appendChild(div);
  }


  
 /*=======show active menu item ========*/
  let naventries = document.querySelectorAll(".menu-item");
  naventries.forEach((entry) => {
    entry.classList.remove("selected");
  });


  let nav = document.querySelector('[date-value="'+day+'"]');
  nav.classList.add("selected");


 /*=======set width========*/
  setSizes();
}





function setSizes() {
  let slices = document.getElementsByClassName("screenshot")

  
  for (let e = 0; e < slices.length; e++) {
    element = slices[e];

    let t = parseInt(element.getAttribute("staytime"));
    let p = t / (totalTime / 100); //in percent

    element.style.width = Math.round(p) + "vw";

  };
}

function onError(error) {
  console.log(`Error: ${error}`);
}


function showURL(e) {

  let tooltip = document.getElementById("tooltip");

  let node = e.target.parentElement;
  let nodeText = node.getAttribute("url")

  tooltip.appendChild(document.createTextNode(nodeText));
  tooltip.style.top = e.pageX + "px";
  tooltip.style.left = e.pageY + "px";
  tooltip.classList.remove("hidden");


  e.preventDefault();
}


/*=======make menu draggable========*/
dragElement(document.getElementById("menu"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


/*=======clear history========*/

let button = document.getElementById("clear");
button.addEventListener("click", (event) => {
  let clearStorage = browser.storage.local.clear();
  clearStorage.then(onCleared, onError);
  event.preventDefault();
});

function onCleared() {
  console.log("OK");
}

function onError(e) {
  console.log(e);
}


