var joined = document.getElementById("joined"),
	left = document.getElementById("left"),
	j_ctx = joined.getContext("2d"),
	l_ctx = left.getContext("2d");

var joined_mini = document.getElementById("joined_mini"),
	left_mini = document.getElementById("left_mini"),
	j_ctx_mini = joined_mini.getContext("2d"),
	l_ctx_mini = left_mini.getContext("2d");

var scrollArea = document.getElementById("scrollArea"),
	pointer = document.getElementById("point"),
	borderLeft = document.getElementById("left_border"),
	borderRight = document.getElementById("right_border");

var dataAnchores = document.getElementById("data").children,
	timeAnchores = document.getElementById("timeStamps");

var min,
	data, xhr,
	max,
	step, step_mini,
	width;

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

function InitCanvasProperties(cnvs, ctxt, leftGap, color, lineWidth) {
	cnvs.style.left = leftGap;
	cnvs.width = width;
	cnvs.style.width = width + "px";
	ctxt.strokeStyle = color;
	ctxt.lineWidth = lineWidth;
	ctxt.beginPath();
	ctxt.moveTo(0, cnvs.height -(data[0].columns[1][0] * cnvs.height)/(max*1.1));
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
	}

	max = Math.max( Math.max.apply(null, data[0].columns[1]),
					Math.max.apply(null, data[0].columns[2]));

	for (var i = 0; i < dataAnchores.length; i++) {
		dataAnchores[i].innerHTML = Math.floor((max / (dataAnchores.length-1)) * (i));
	}

	step = joined.width;
	width = (data[0].columns[1].length-1) * step;
	step_mini = (step * min) / width;

	pointer.style.display = "block";
	pointer.style.width = (min * min) / width + "px";
	pointer.style.left = min - parseInt(pointer.style.width); + "px";


	InitCanvasProperties(joined, j_ctx, -width + min + "px", data[0].colors.y0, 4);
	InitCanvasProperties(joined_mini, j_ctx_mini, 0, data[0].colors.y0, 2);

	InitCanvasProperties(left, l_ctx, -width + min + "px", data[0].colors.y1, 4);
	InitCanvasProperties(left_mini, l_ctx_mini, 0, data[0].colors.y1, 2);


	for (var i = 1; i < data[0].columns[0].length+1; i++) {

		var timeStamp = document.createElement("div");
		var time = new Date(data[0].columns[0][i-1]);
		timeStamp.className = "timeStamp";
		timeStamp.innerHTML = time.toDateString().substr(4,6);
		timeAnchores.appendChild(timeStamp);

		DrawBigChart(joined, j_ctx, 1, i);
		DrawMiniChart(joined_mini, j_ctx_mini, 1, i);

		DrawBigChart(left, l_ctx, 2, i);
		DrawMiniChart(left_mini, l_ctx_mini, 2, i);

	}

	j_ctx.stroke();
	j_ctx_mini.stroke();

	l_ctx.stroke();
	l_ctx_mini.stroke();
}, 500);


var scroll = false,
	moveFree = false,
	sizeFree = false,
	leftStart,
	x_start;

var widthStart,
	leftGrabber = false,
	rightGrabber = false;

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

function MoveGraph() {
	joined.style.left = -(parseInt(pointer.style.left) * width) / min + "px";

	left.style.left = -(parseInt(pointer.style.left) * width) / min + "px";
}

scrollArea.onmousemove = function(event) {

	if (scroll) {

		CheckPointerOut()

		if (moveFree) {
			pointer.style.left = leftStart - x_start + event.clientX + "px";
			MoveGraph();
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
	width = (min * min) / parseInt(pointer.style.width);
	joined.style.width = width + "px";
	joined.style.height = "400px";

	left.style.width = width + "px";
	left.style.height = "400px";

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

	if (leftGrabber) {

		CheckPointerSize();
		
		if (sizeFree) {
			pointer.style.width = widthStart + x_start - event.clientX + "px";
			pointer.style.left = leftStart - x_start + event.clientX + "px";
		}

		CheckPointerSize();

	}
});

scrollArea.addEventListener("mousemove", function(event) {

	if (rightGrabber) {

		CheckPointerSize();

		if (sizeFree) {
			pointer.style.width = widthStart - x_start + event.clientX + "px";
		}

		CheckPointerSize();

	}
});

scrollArea.onmouseout = function() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveFree = false;
	sizeFree = false;
	scrollArea.style.display = "none";
}

scrollArea.onmouseup = function() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveFree = false;
	sizeFree = false;
	scrollArea.style.display = "none";
}












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
		if (true) { //parseInt(joined.style.width) + 24 < width) {
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