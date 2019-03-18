var scrollArea = document.getElementById("scrollArea"),
	pointer = document.getElementById("point"),
	borderLeft = document.getElementById("left_border"),
	borderRight = document.getElementById("right_border");

var dataAnchores = document.getElementById("data").children,
	timeAnchores = document.getElementById("timeStamps");

var switchJoined = document.getElementById("switchJoined"),
	switchLeft = document.getElementById("switchLeft");

var sumJoined = document.getElementById("sumJoined"),
	sumLeft = document.getElementById("sumLeft");

var mainCharts = document.getElementById("main"),
	miniCharts = document.getElementById("scroll");

var buttons = document.getElementById("buttons"),
	hintBox = document.getElementById("hints");

var charts = [],
	charts_mini = [],
	ctx_main = [],
	ctx_mini = [],
	switchers = [],
	showFlag = [],
	hints = [];

var min,
	data, xhr,
	max,
	step, step_mini,
	cnvsWidth,
	cnvsHeight = 400;

if (window.innerWidth > 600) {
	min = 600;
} else {
	min = window.innerWidth;
}

if (window.XMLHttpRequest) {
	xhr = new XMLHttpRequest();
} else {
	xhr = new ActiveXObject("Microsoft.XMLHTTP");
}

xhr.onreadystatechange = function() {
	if (xhr.status == 200 && xhr.readyState == 4) {
		data = xhr.response;
	}
}

xhr.open("GET", "chart_data.json");
xhr.responseType = "json";
xhr.send();

function InitCanvasProperties(cnvs, ctxt, leftGap, start, color, lineWidth) {
	cnvs.style.left = leftGap;
	//cnvs.height = cnvsHeight;
	cnvs.width = cnvsWidth;
	cnvs.style.width = cnvsWidth + "px";
	ctxt.strokeStyle = color;
	ctxt.lineWidth = lineWidth;
	ctxt.beginPath();
	ctxt.moveTo(0, cnvs.height - (start * cnvs.height) / (max*1.1));
}

function DrawBigChart(cnvs, ctxt, clmn, iter) {
	ctxt.lineTo(step * (iter), cnvs.height - 10 -
				(data[0].columns[clmn][iter] * cnvs.height) / (max*1.1));
}
function DrawMiniChart(cnvs, ctxt, clmn, iter) {
	ctxt.lineTo(step_mini * (iter), cnvs.height - 5 -
					(data[0].columns[clmn][iter] * cnvs.height) / (max*1.1));
}

setTimeout(function(){
	console.log(data);

	for (var i = 0; i < data[0].columns.length; i++) {
		data[0].columns[i].shift();

		if (i > 0) {
			var bigCanvas = document.createElement("canvas");
			bigCanvas.setAttribute("height", 400);
			bigCanvas.setAttribute("width", 24);
			//bigCanvas.style.top = -(bigCanvas.height * (i-1)) + "px";
			mainCharts.appendChild(bigCanvas);
			charts[i-1] = bigCanvas;
			ctx_main[i-1] = bigCanvas.getContext("2d");

			var smallCanvas = document.createElement("canvas");
			smallCanvas.setAttribute("height", 80);
			//smallCanvas.style.top = -(smallCanvas.height * (i-1)) + "px";
			miniCharts.appendChild(smallCanvas);
			charts_mini[i-1] = smallCanvas;
			ctx_mini[i-1] = smallCanvas.getContext("2d");

			var btn = document.createElement("div");
			btn.className = "switchers";
			var swtch = document.createElement("div");
			swtch.classList.add("swtchbtn", "flex");
			var led = document.createElement("div");
			led.classList.add("led", "flex");
			led.style.background = data[0].colors["y"+(i-1)];
			var name = document.createElement("span");
			name.innerHTML = data[0].names["y"+(i-1)];
			led.appendChild(document.createElement("div"));
			swtch.appendChild(led);
			swtch.appendChild(name);
			btn.appendChild(swtch);
			btn.setAttribute("index", i-1);
			switchers[i-1] = btn;
			showFlag[i-1] = true;
			buttons.appendChild(btn);

			var hint = document.createElement("div");
			hint.className = "sumContainer";
			var text = document.createElement("div");
			text.className = "flex";
			text.style.color = data[0].colors["y"+(i-1)];
			text.style.flexDirection = "column";
			var num = document.createElement("span");
			num.style.fontSize = "20px";
			num.innerHTML = 1111;
			text.appendChild(num);
			text.innerHTML += data[0].names["y"+(i-1)];
			hint.appendChild(text);
			hintBox.appendChild(hint);
			hints[i-1] = hint;
		}
	}

	maxJoined = Math.max.apply(null, data[0].columns[1]);
	maxLeft = Math.max.apply(null, data[0].columns[2]);
	max = Math.max(maxJoined, maxLeft);

	for (var i = 0; i < dataAnchores.length; i++) {
		dataAnchores[i].innerHTML = Math.floor((max / (dataAnchores.length-1)) * (i));
	}

	step = charts[0].width * 2.5;
	cnvsWidth = (data[0].columns[1].length-1) * step;
	step_mini = (step * min) / cnvsWidth;

	for (var j = 0; j < charts.length; j++) {
		InitCanvasProperties(charts[j], ctx_main[j], -cnvsWidth + min + "px", data[0].columns[j+1][0], data[0].colors["y"+j], 6);
		InitCanvasProperties(charts_mini[j], ctx_mini[j], 0, data[0].columns[j+1][0], data[0].colors["y"+j], 2);
	}

	for (var j = 0; j < charts.length; j++) {
		for (var i = 1; i < data[0].columns[0].length+1; i++) {

			/*var time = new Date(data[0].columns[0][i-1]);
			var timeStamp = document.createElement("div");
			timeStamp.innerHTML = time.toDateString().substr(4,6);

			timeAnchores.appendChild(timeStamp);*/

			DrawBigChart(charts[j], ctx_main[j], j+1, i);
			DrawMiniChart(charts_mini[j], ctx_mini[j], j+1, i);

		}
	}

	timeAnchores = timeAnchores.children;

	for (var i = 0; i < ctx_main.length; i++) {
		ctx_main[i].stroke();
		ctx_mini[i].stroke();
	}

	cnvsWidth /= 2.5;

	pointer.style.display = "block";
	pointer.style.width = (min * min) / cnvsWidth + "px";
	pointer.style.left = min - parseInt(pointer.style.width); + "px";

	ChangeGraphRatio();


	for (var i = 0; i < switchers.length; i++) {
		switchers[i].onclick = function(event) {
			event.preventDefault();
			var index = parseInt(this.getAttribute("index"));

			if (showFlag[index]) {
				HideChart(this, charts[index]);
				HideChart(this, charts_mini[index]);
				//ResizeChart(joinedShow, left);
				showFlag[index] = false;
			} else {
				ShowChart(this, charts[index]);
				ShowChart(this, charts_mini[index]);
				//ResizeChart(joinedShow, left);
				showFlag[index] = true;
			}
		}
	}
}, 500);


var scroll = false,
	moveFree = true,
	sizeFree = true,
	leftStart,
	x_start;

var widthStart,
	leftGrabber = false,
	rightGrabber = false;


function MoveGraph() {
	var move = -(parseInt(pointer.style.left) * cnvsWidth) / min + "px";
	for (var i = 0; i < charts.length; i++) {
		charts[i].style.left = move;
	}
}

function CheckPointerOut() {
	if (parseInt(pointer.style.left) > min - parseInt(pointer.style.width)) {
		pointer.style.left = min - parseInt(pointer.style.width) + "px";
		moveFree = false;
	} else if (parseInt(pointer.style.left) < 0) {
		pointer.style.left = 0;
		moveFree = false;
	} else {
		moveFree = true;
	}
	
	MoveGraph();
}

pointer.onmousedown = function(event) {
	event.preventDefault();

	if (!(leftGrabber || rightGrabber)) {
		scroll = true;
		x_start = event.clientX;
		leftStart = parseInt(pointer.style.left);
		lastX = event.clientX;
		scrollArea.style.display = "block";
	}
}

scrollArea.onmousemove = function(event) {

	if (scroll) {

		CheckPointerOut();

		if (moveFree) {
			pointer.style.left = leftStart - x_start + event.clientX + "px";
		}

		CheckPointerOut();
	}
};

borderLeft.onmousedown = function(event) {
	event.preventDefault();

	leftGrabber = true;
	widthStart = parseInt(pointer.style.width);
	x_start = event.clientX;
	leftStart = parseInt(pointer.style.left);
	scrollArea.style.display = "block";

}
borderRight.onmousedown = function(event) {
	event.preventDefault();

	rightGrabber = true;
	widthStart = parseInt(pointer.style.width);
	x_start = event.clientX;
	leftStart = parseInt(pointer.style.left);
	scrollArea.style.display = "block";

}

function ChangeGraphRatio() {
	cnvsWidth = (min * min) / parseInt(pointer.style.width);
	for (var i = 0; i < charts.length; i++) {
		charts[i].style.width = cnvsWidth + "px";
		charts[i].style.height = cnvsHeight + "px";
	}

	MoveGraph();
}

function CheckPointerSize() {
	if (parseInt(pointer.style.width) < Math.floor(10 * step_mini)) {
		pointer.style.width = 10 * step_mini + "px";
		sizeFree = false;
	} else if (0 > parseInt(pointer.style.left)) {
		pointer.style.left = 0;
		sizeFree = false;
	} else if (parseInt(pointer.style.width) > min - parseInt(pointer.style.left)) {
		pointer.style.width = min - parseInt(pointer.style.left) + "px";
		sizeFree = false;
	} else {
		sizeFree = true;
	}

	ChangeGraphRatio();
}

scrollArea.addEventListener("mousemove", function(event) {

	CheckPointerSize();

	if (leftGrabber) {
		
		if (sizeFree) {
			pointer.style.width = widthStart + x_start - event.clientX + "px";
			pointer.style.left = leftStart - x_start + event.clientX + "px";
		}

	} else if (rightGrabber) {

		if (sizeFree) {
			pointer.style.width = widthStart - x_start + event.clientX + "px";
		}

	}
	
	CheckPointerSize();
});

scrollArea.onmouseout = function() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveFree = true;
	sizeFree = true;
	scrollArea.style.display = "none";
}

scrollArea.onmouseup = function() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveFree = true;
	sizeFree = true;
	scrollArea.style.display = "none";
}

function ResizeChart(flag, chart) {
	var lastHeight = cnvsHeight;

	if (flag) {
		max = Math.max(maxJoined, maxLeft);
		cnvsHeight = max * Math.min(maxJoined, maxLeft) / parseInt(chart.style.height);
		chart.style.top = max * 1.1 - cnvsHeight + "px";
		console.log("hide");
	} else {
		max = Math.min(maxJoined, maxLeft);
		cnvsHeight = max * Math.max(maxJoined, maxLeft) / parseInt(chart.style.height);
		chart.style.top = -chart.height + "px";
		console.log("show");
	}

	chart.style.height = cnvsHeight + "px";
}

function ShowChart(swticher, chart) {
	swticher.children[0].children[0].children[0].style.width = 0;
	swticher.children[0].children[0].children[0].style.height = 0;
	chart.style.opacity = 1;
}
function HideChart(swticher, chart) {
	swticher.children[0].children[0].children[0].style.width = "23px";
	swticher.children[0].children[0].children[0].style.height = "23px";
	chart.style.opacity = 0;
}

/*function ResizeLeftChart() {
	var lastHeight = cnvsHeight;

	if (joinedShow) {
		max = Math.max(maxJoined, maxLeft);
		cnvsHeight = max * Math.min(maxJoined, maxLeft) / parseInt(left.style.height);
		left.style.top = -(joined.height - lastHeight + cnvsHeight) + "px";
	} else {
		max = Math.min(maxJoined, maxLeft);
		cnvsHeight = max * Math.max(maxJoined, maxLeft) / parseInt(left.style.height);
		left.style.top = -joined.height + "px";
	}
	
	left.style.height = cnvsHeight + "px";
}*/









var keys = [false, false];

document.addEventListener("keydown", function(event) {

	if (event.keyCode == 37) {
		keys[0] = true;
	}
	if (event.keyCode == 39) {
		keys[1] = true;
	}
	if (event.keyCode == 38) {
		keys[2] = true;
	}
	if (event.keyCode == 40) {
		keys[3] = true;
	}

});

document.addEventListener("keyup", function(event) {

	if (event.keyCode == 37) {
		keys[0] = false;
	}
	if (event.keyCode == 39) {
		keys[1] = false;
	}
	if (event.keyCode == 38) {
		keys[2] = false;
	}
	if (event.keyCode == 40) {
		keys[3] = false;
	}
});

setInterval(function() {
	if (window.innerWidth > 600) {
		min = 600;
	} else {
		min = window.innerWidth;
	}

	if (keys[2]) {
		console.log("less");
		if (parseInt(joined.style.width) - 24 > min) {
			joined.style.width = parseInt(joined.style.width) - 24 + "px";
			joined.style.height = "400px";
		} else {
			joined.style.width = min + "px";
			joined.style.height = "400px";
		}
	}

	if (keys[3]) {
		console.log("more");
		if (true) { //parseInt(joined.style.width) + 24 < cnvsWidth) {
			joined.style.width = parseInt(joined.style.width) + 24 + "px";
			joined.style.height = "400px";
		} else {
			joined.style.width = width + "px";
			joined.style.height = "400px";
		}
	}


	if (keys[0]) {

		pointer.style.width = parseInt(pointer.style.width) + 5 + "px";

		console.log("right");
		/*if (parseInt(joined.style.left) + 24 < 0) {
			joined.style.left = parseInt(joined.style.left) + 24 + "px";
		} else {
			joined.style.left = 0;
		}*/
	}


	if (keys[1]) {

		pointer.style.width = parseInt(pointer.style.width) - 5 + "px";

		console.log("left");
		/*if (parseInt(joined.style.left) - 24 > -1 * (parseInt(joined.style.width)) + min) {
			joined.style.left = parseInt(joined.style.left) - 24 + "px";
		} else {
			joined.style.left = -1 * parseInt(joined.style.width) + min + "px";
		}*/
	}

}, 50);