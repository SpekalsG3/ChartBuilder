var scrollArea = document.getElementById("scrollArea"),
	pointer = document.getElementById("pointer"),
	borderLeft = document.getElementById("left_border"),
	borderRight = document.getElementById("right_border");

var dataAnchores = document.getElementById("data").children,
	timeAnchores = document.getElementById("timeStamps");

var mainCharts = document.getElementById("main"),
	miniCharts = document.getElementById("scroll");

var buttons = document.getElementById("buttons"),
	hintBox = document.getElementById("hints");

var pillar = document.getElementById("pillar"),
	overcanvas = document.getElementById("overcanvas");

var night = document.getElementById("nightmode");

var selection = document.getElementById("charts"),
	chooseChart = selection.firstElementChild;

var blocker = document.getElementById("blocker");

var charts = [],
	charts_mini = [],
	ctx_main = [],
	ctx_mini = [],
	switchers = [],
	showFlag = [],
	hints = [],
	points = [],
	allKeys = [],
	colors = ["white", "rgba(0,0,0,.3)", "black", "Night"];

var min,
	data, xhr,
	max,
	step, step_mini,
	cnvsWidth,
	cnvsHeight = 300;

var ThisChart,
	timeline;

var direct, lastX;

if (window.innerWidth > 600) {
	min = 600;
} else {
	min = window.innerWidth;
}

window.onresize = function() {
	if (window.innerWidth > 600) {
		min = 600;
	} else {
		min = window.innerWidth;
	}

	pointer.style.left = min - parseInt(pointer.style.width); + "px";

	for (var i = 0; i < charts_mini.length; i++) {
		charts_mini[i].style.width = min + "px";
		charts_mini[i].style.height = 80 + "px";
	}

	ChangeGraphRatio();
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

function InitCanvasProperties(cnvs, ctxt, wdth, leftGap, fault, start, color, lineWidth) {
	cnvs.style.left = leftGap;
	cnvs.width = wdth;
	cnvs.style.width = wdth + "px";
	ctxt.strokeStyle = color;
	ctxt.lineWidth = lineWidth;
	ctxt.beginPath();
	ctxt.moveTo(0, cnvs.height - fault - (start * cnvs.height) / (max*1.1));
}

function DrawBigChart(cnvs, ctxt, clmn, iter) {
	ctxt.lineTo(step * (iter), cnvs.height - 10 -
				(data[ThisChart].columns[clmn][iter] * cnvs.height) / (max*1.1));
}
function DrawMiniChart(cnvs, ctxt, clmn, iter) {
	ctxt.lineTo(step_mini * (iter), cnvs.height - 5 -
					(data[ThisChart].columns[clmn][iter] * cnvs.height) / (max*1.1));
}

function StartGraph() {
	blocker.style.display = "block";

	for (var i = 0; i < data[ThisChart].columns.length; i++) {

		if (i > 0) {
			var bigCanvas = document.createElement("canvas");
			bigCanvas.setAttribute("height", cnvsHeight);
			bigCanvas.setAttribute("width", 24);
			mainCharts.lastElementChild.appendChild(bigCanvas);
			charts[i-1] = bigCanvas;
			ctx_main[i-1] = bigCanvas.getContext("2d");

			var smallKeysCanvas = document.createElement("canvas");
			smallKeysCanvas.setAttribute("height", 80);
			miniCharts.lastElementChild.appendChild(smallKeysCanvas);
			charts_mini[i-1] = smallKeysCanvas;
			ctx_mini[i-1] = smallKeysCanvas.getContext("2d");

			var btn = document.createElement("div");
			btn.className = "switchers";
			var swtch = document.createElement("div");
			swtch.classList.add("swtchbtn", "flex");
			var led = document.createElement("div");
			led.classList.add("led", "flex");
			led.style.background = data[ThisChart].colors["y"+(i-1)];
			var name = document.createElement("span");
			name.innerHTML = data[ThisChart].names["y"+(i-1)];
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
			text.style.color = data[ThisChart].colors["y"+(i-1)];
			text.style.flexDirection = "column";
			var num = document.createElement("span");
			num.style.fontSize = "20px";
			num.innerHTML = data[ThisChart].columns[i][data[ThisChart].columns[i].length-1];
			text.appendChild(num);
			text.innerHTML += data[ThisChart].names["y"+(i-1)];
			hint.appendChild(text);
			hintBox.lastElementChild.appendChild(hint);
			hints[i-1] = hint;

			var point = document.createElement("div");
			point.className = "point";
			point.style.border = "3px solid " + data[ThisChart].colors["y"+(i-1)];
			pillar.appendChild(point);
			points[i-1] = point;
		}
	}

	maxJoined = Math.max.apply(null, data[ThisChart].columns[1]);
	maxLeft = Math.max.apply(null, data[ThisChart].columns[2]);
	max = Math.max(maxJoined, maxLeft);

	var time = new Date(data[ThisChart].columns[0][data[ThisChart].columns[0].length-1]);
	hintBox.firstElementChild.innerHTML = time.toDateString().substr(0,10).replace(" ", ", ");

	for (var i = 0; i < dataAnchores.length; i++) {
		dataAnchores[i].innerHTML = Math.floor((max / (dataAnchores.length-1)) * (i));
	}

	step = charts[0].width * 2.5;
	cnvsWidth = (data[ThisChart].columns[1].length-1) * step;
	step_mini = (step * min) / cnvsWidth;

	mainCharts.style.width = cnvsWidth + "px";
	mainCharts.style.height = cnvsHeight + "px";

	for (var j = 0; j < charts.length; j++) {
		InitCanvasProperties(charts[j], ctx_main[j], cnvsWidth, 0, 10, data[ThisChart].columns[j+1][0], data[ThisChart].colors["y"+j], 6);
		InitCanvasProperties(charts_mini[j], ctx_mini[j], min, 0, 5, data[ThisChart].columns[j+1][0], data[ThisChart].colors["y"+j], 2);
	}

	for (var j = 0; j < charts.length; j++) {
		for (var i = 1; i < data[ThisChart].columns[0].length+1; i++) {

			if (j == 0) {
				var time = new Date(data[ThisChart].columns[0][i-1]);
				var timeStamp = document.createElement("div");

				timeStamp.style.width = "120px";
				timeStamp.innerHTML = time.toDateString().substr(4,6);

				timeAnchores.appendChild(timeStamp);
			}

			DrawBigChart(charts[j], ctx_main[j], j+1, i);
			DrawMiniChart(charts_mini[j], ctx_mini[j], j+1, i);

		}
	}

	for (var i = 0; i < switchers.length; i++) {
		switchers[i].onclick = function(event) {
			var index = parseInt(this.getAttribute("index"));

			if (showFlag[index]) {
				HideChart(charts[index]);
				HideChart(charts_mini[index]);
				this.children[0].children[0].children[0].style.width = "23px";
				this.children[0].children[0].children[0].style.height = "23px";
				points[index].style.opacity = 0;
				hints[index].style.opacity = 0;
				showFlag[index] = false;
			} else {
				ShowChart(charts[index]);
				ShowChart(charts_mini[index]);
				this.children[0].children[0].children[0].style.width = 0;
				this.children[0].children[0].children[0].style.height = 0;
				points[index].style.opacity = 1;
				hints[index].style.opacity = 1;
				showFlag[index] = true;
			}
		}
	}

	timeline = timeAnchores.children;

	for (var i = 0; i < ctx_main.length; i++) {
		ctx_main[i].stroke();
		ctx_mini[i].stroke();
	}

	cnvsWidth /= 2.5;

	pointer.style.display = "block";
	if ((min * min) / cnvsWidth > 60) {
		pointer.style.width = (min * min) / cnvsWidth + "px";
	} else {
		pointer.style.width = "60px";
	}
	pointer.style.left = min - parseInt(pointer.style.width); + "px";

	ChangeGraphRatio();

	blocker.style.display = "none";
}

function ShowEl(el, params = {}) {
	el.style.opacity = 1;
	el.style.visibility = "visible";
}
function HideEl(el, params = {}) {
	el.style.opacity = 0;
	el.style.visibility = "hidden";

}

function ClearAll() {
	dataAnchores.innerHTML = '';
	timeAnchores.innerHTML = '';
	mainCharts.lastElementChild.innerHTML = '';
	miniCharts.lastElementChild.innerHTML = '';
	buttons.innerHTML = '';
	hintBox.lastElementChild.innerHTML = '';
	pillar.innerHTML = '';

	charts = [];
	charts_mini = [];
	ctx_main = [];
	ctx_mini = [];
	switchers = [];
	showFlag = [];
	hints = [];
	points = [];
}


setTimeout(function() {

	var i = 0;
	for (var key of data.keys()) {

		if (i == 0) {
			ThisChart = key;
		}
		var select = document.createElement("div");
		select.innerHTML = key;
		select.setAttribute("tab", i);

		select.onclick = function() {
			ThisChart = allKeys[parseInt(this.getAttribute("tab"))];
			ClearAll();
			StartGraph();
			ChangeColor(colors[0], colors[1], colors[2], colors[3]);
		}

		chooseChart.appendChild(select);
		allKeys[i] = key;

		i++;
	}

	for (var j = 0; j < data.length; j++) {
		for (var i = 0; i < data[j].columns.length; i++) {
			data[j].columns[i].shift();
		}
	}

	StartGraph();

	blocker.style.display = "none";

}, 700);


function ShowChart(chart) {
	chart.style.opacity = 1;
}
function HideChart(chart) {
	chart.style.opacity = 0;
}


var scroll = false,
	moveFree = true,
	sizeFree = true,
	leftStart,
	x_start;

var widthStart,
	leftGrabber = false,
	rightGrabber = false,
	touchstarted = true;

function MoveGraph() {
	var move = -(parseInt(pointer.style.left) * cnvsWidth) / min + "px";
	mainCharts.style.left = move;
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

function PointerMoveStart(event) {
	if (!(leftGrabber || rightGrabber)) {
		scrollArea.style.display = "block";

		var X;
		if (event.clientX === undefined) {
			X = event.targetTouches[0].clientX;
		} else {
			X = event.clientX;
		}

		scroll = true;
		x_start = X;
		leftStart = parseInt(pointer.style.left);
	}
}

pointer.onmousedown = function(event) {
	PointerMoveStart(event);
}
pointer.ontouchstart = function(event) {
	scrollArea.style.display = "block";
}

function PointerMove(event) {

	if (scroll) {
		scrollArea.style.cursor = "grabbing";

		CheckPointerOut();

		var X;
		if (event.clientX === undefined) {
			X = event.targetTouches[0].clientX;
		} else {
			X = event.clientX;
		}

		if (moveFree) {
			pointer.style.left = leftStart - x_start + X + "px";
		}

		CheckPointerOut();
	}
}

scrollArea.onmousemove = function(event) {
	PointerMove(event);
}
scrollArea.ontouchmove = function(event) {
	event.preventDefault();

	if (!(leftGrabber || rightGrabber) && touchstarted) {

		var X;
		if (event.clientX === undefined) {
			X = event.targetTouches[0].clientX;
		} else {
			X = event.clientX;
		}

		scroll = true;
		touchstarted = false;
		x_start = X;
		leftStart = parseInt(pointer.style.left);
	}

	PointerMove(event);
}

function PointerResizeStart(event) {
	widthStart = parseInt(pointer.style.width);
	scrollArea.style.display = "block";

	var X;
	if (event.clientX === undefined) {
		X = event.targetTouches[0].clientX;
	} else {
		X = event.clientX;
	}

	x_start = X;
	lastX = X;
	leftStart = parseInt(pointer.style.left);
}

borderLeft.onmousedown = function(event) {
	PointerResizeStart(event);
	leftGrabber = true;
}
borderLeft.ontouchstart = function(event) {
	scrollArea.style.display = "block";
	leftGrabber = true;
}

borderRight.onmousedown = function(event) {
	PointerResizeStart(event);
	rightGrabber = true;
}
borderRight.ontouchstart = function(event) {
	scrollArea.style.display = "block";
	rightGrabber = true;
}

function ChangeGraphRatio() {
	cnvsWidth = (min * min) / parseInt(pointer.style.width);
	step = cnvsWidth / (data[ThisChart].columns[1].length-1);
	mainCharts.style.width = cnvsWidth + "px";
	for (var i = 0; i < charts.length; i++) {
		charts[i].style.width = cnvsWidth + "px";
		charts[i].style.height = cnvsHeight + "px";
	}

	var skip = Math.round(parseInt(timeline[0].style.width) / Math.floor(step));
	var isRelative = 0;

	for (var i = 0; i < timeline.length; i++) {
		if (i % skip != 0) {
			timeline[i].style.opacity = 0;
			timeline[i].style.display = "none";
		} else {
			timeline[i].style.opacity = 1;
			timeline[i].style.display = "inline-block";
			isRelative++;
		}
	}

	MoveGraph();
}

function CheckPointerSize() {
	sizeFree = true;

	if (parseInt(pointer.style.width) < 60) {
		pointer.style.width = "60px";
		sizeFree = false;
	} else if (0 > parseInt(pointer.style.left)) {
		pointer.style.left = 0;
		sizeFree = false;
	} else if (parseInt(pointer.style.width) > min - parseInt(pointer.style.left)) {
		pointer.style.width = min - parseInt(pointer.style.left) + "px";
		sizeFree = false;
	}

	ChangeGraphRatio();
}

function PointerResize(event) {

	var X;
	if (event.clientX === undefined) {
		X = event.targetTouches[0].clientX;
	} else {
		X = event.clientX;
	}

	CheckPointerSize();

	if (event.clientX > lastX) {
		direct = "right";
	} else if (event.clientX < lastX) {
		direct = "left";
	}

	if (leftGrabber) {

		scrollArea.style.cursor = "col-resize";

		if (sizeFree) {
			pointer.style.width = widthStart + x_start - X + "px";
			pointer.style.left = leftStart - x_start + X + "px";
		}

	} else if (rightGrabber) {

		scrollArea.style.cursor = "col-resize";

		if (sizeFree) {
			pointer.style.width = widthStart - x_start + X + "px";
		}

	}

	lastX = X;

	CheckPointerSize();
}

scrollArea.addEventListener("mousemove", function(event){
	PointerResize(event);
});
scrollArea.addEventListener("touchmove", function(event) {
	event.preventDefault();

	if (touchstarted) {
		widthStart = parseInt(pointer.style.width);

		var X;
		if (event.clientX === undefined) {
			X = event.targetTouches[0].clientX;
		} else {
			X = event.clientX;
		}

		x_start = X;
		lastX = X;
		leftStart = parseInt(pointer.style.left);
		touchstarted = false;
	}

	PointerResize(event);
});

function Reset() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveFree = true;
	sizeFree = true;
	scrollArea.style.display = "none";
}

scrollArea.onmouseout = Reset;
scrollArea.ontouchend = function(event) {
	event.preventDefault();
	Reset();
	touchstarted = true;
}
scrollArea.ontouchleave = function(event) {
	event.preventDefault();
	Reset();
	touchstarted = true;
}
scrollArea.onmouseup = Reset;

function ShowInfo(event) {

	var X;
	if (event.layerX === undefined) {
		X = event.targetTouches[0].clientX;
	} else {
		X = event.layerX;
	}

	pillar.style.opacity = 1;
	ShowEl(hintBox);

	var count = Math.round((-parseInt(mainCharts.style.left) + X) / step);
	for (var i = 0; i < hints.length; i++) {
		hints[i].firstElementChild.firstElementChild.innerHTML = data[ThisChart].columns[i+1][count];
		points[i].style.bottom = (data[ThisChart].columns[i+1][count] * charts[i].height) / (max*1.1) - 7;
	}
	pillar.style.left = count * step - 1 + "px";

	var time = new Date(data[ThisChart].columns[0][count]);
	hintBox.firstElementChild.innerHTML = time.toDateString().substr(0,10).replace(" ", ", ");
}

overcanvas.onmousemove = function(event) {
	ShowInfo(event);
}
overcanvas.ontouchmove = function(event) {
	ShowInfo(event);
}

overcanvas.onmouseout = function() {
	pillar.style.opacity = 0;
	HideEl(hintBox);
}

var day = true;

function ChangeColor(hex, rgba, color, text) {
	document.body.style.background = hex;

	for (var i = 0; i < points.length; i++) {
		points[i].style.background = hex;
		switchers[i].firstElementChild.firstElementChild.firstElementChild.style.background = hex;
		switchers[i].style.border = "1px solid " + rgba;
		switchers[i].style.color = color;
	}

	hintBox.style.background = hex;
	pointer.style.borderBottom = "1px solid " + rgba;
	pointer.style.borderTop = "1px solid " + rgba;
	borderLeft.style.background = rgba;
	borderRight.style.background = rgba;
	hintBox.firstElementChild.style.color = color;
	night.style.color = color;
	night.firstElementChild.innerHTML = text;
	pillar.style.background = rgba;
	mainCharts.style.color = rgba;
	selection.style.color = color;
	chooseChart.style.boxShadow = "1px 0 3px 0 " + rgba;
	chooseChart.style.background = hex;

	for (var i = 0; i < dataAnchores.length; i++) {
		dataAnchores[i].style.color = rgba;
		dataAnchores[i].style.borderBottom = "1px solid " + rgba;
	}

}

night.onclick = function() {
	if (day) {
		colors = ["#232F3D", "rgba(255,255,255,.3)", "white", "Day"];
		day = false;
	} else {
		colors = ["white", "rgba(0,0,0,.3)", "black", "Night"];
		day = true;
	}
	ChangeColor(colors[0], colors[1], colors[2], colors[3]);
}


var show = false;

selection.onclick = function() {
	if (show) {
		HideEl(chooseChart);
		chooseChart.style.top = "-10px";
		show = false;
	} else {
		ShowEl(chooseChart);
		chooseChart.style.top = "-20px";
		show = true;
	}
}