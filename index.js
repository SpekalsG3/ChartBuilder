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
	moveHit = false,
	sizeHit = false,
	xmove = 0,
	backX = 0,
	moveLastX,
	sizeLastX,
	start,
	lastX,
	leftStart;

var widthStart,
	leftGrabber = false,
	rightGrabber = false;

pointer.onmousedown = function(event) {
	if (!(leftGrabber || rightGrabber)) {
		scroll = true;
		x_start = event.clientX;
		leftStart = parseInt(pointer.style.left);
		lastX = event.clientX;
		scrollArea.style.visibility = "visible";
	}
}

function MoveGraph() {
	joined.style.left = -(parseInt(pointer.style.left) * width) / min + "px";

	left.style.left = -(parseInt(pointer.style.left) * width) / min + "px";
}

function MoveToBorder(event, side) {
	if (moveHit) {

		if (event.clientX * side > moveLastX * side) {
			pointer.style.left = leftStart - x_start + event.clientX + "px";
			moveHit = false;
		}

	} else {
		pointer.style.left = leftStart - x_start + event.clientX + "px";
	}
}

function StopAtBorder(event, val) {
	if (!moveHit) {
		moveHit = true;
		moveLastX = event.clientX;
	} else {
		pointer.style.left = val;
	}
}

scrollArea.onmousemove = function(event) {

	event.preventDefault();

	if (scroll) {

		if (lastX < event.clientX) {

			if (parseInt(pointer.style.left) < min - parseInt(pointer.style.width)) {
				MoveToBorder(event, 1);
			} else {
				StopAtBorder(event, min - parseInt(pointer.style.width) + "px");
			}

			MoveGraph();

		} else if (lastX > event.clientX) {

			if (parseInt(pointer.style.left) > 0) {
				MoveToBorder(event, -1);
			} else {
				StopAtBorder(event, 0);
			}

			MoveGraph();

		}

		lastX = event.clientX;
	}
};

borderLeft.onmousedown = function(event) {
	leftGrabber = true;
	widthStart = parseInt(pointer.style.width);
	x_start = event.clientX;
	leftStart = parseInt(pointer.style.left);
	scrollArea.style.visibility = "visible";
}
borderRight.onmousedown = function(event) {
	rightGrabber = true;
	widthStart = parseInt(pointer.style.width);
	x_start = event.clientX;
	leftStart = parseInt(pointer.style.left);
	scrollArea.style.visibility = "visible";
}

function ChangeGraphRatio() {
	width = (min * min) / parseInt(pointer.style.width);
	joined.style.width = width + "px";
	joined.style.height = "400px";

	left.style.width = width + "px";
	left.style.height = "400px";

	MoveGraph();
}

scrollArea.addEventListener("mousemove", function(event) {

	event.preventDefault();

	if (leftGrabber) {

		if (lastX < event.clientX) {

			if (parseInt(pointer.style.width) > 10 * step_mini) {

				if (sizeHit) {

					if (event.clientX > sizeLastX) {
						pointer.style.width = widthStart + x_start - event.clientX + "px";
						pointer.style.left = leftStart - x_start + event.clientX + "px";
						sizeHit = false;
					}

				} else {
					pointer.style.width = widthStart + x_start - event.clientX + "px";
					pointer.style.left = leftStart - x_start + event.clientX + "px";
				}

				ChangeGraphRatio();

			} else {

				if (!sizeHit) {
					sizeHit = true;
					sizeLastX = event.clientX;
				} else {
					pointer.style.width = 10 * step_mini + "px";
				}

			}
		} else if (lastX > event.clientX) {

			if (2 < parseInt(pointer.style.left)) {

				if (sizeHit) {

					if (event.clientX < sizeLastX) {
						pointer.style.width = widthStart + x_start - event.clientX + "px";
						pointer.style.left = leftStart - x_start + event.clientX + "px";
						sizeHit = false;
					}

				} else {
					pointer.style.width = widthStart + x_start - event.clientX + "px";
					pointer.style.left = leftStart - x_start + event.clientX + "px";
				}

				ChangeGraphRatio();

			} else {

				if (!sizeHit) {
					sizeHit = true;
					sizeLastX = event.clientX;
				} else {
					pointer.style.width = parseInt(pointer.style.left) + parseInt(pointer.style.width) + "px";
					pointer.style.left = 0;
				}

			}

		}

		lastX = event.clientX;

	}
});

scrollArea.addEventListener("mousemove", function(event) {

	event.preventDefault();

	if (rightGrabber) {

		if (lastX < event.clientX) {

			if (parseInt(pointer.style.width) < min - parseInt(pointer.style.left)) {

				if (sizeHit) {

					if (event.clientX > sizeLastX) {
						pointer.style.width = widthStart - x_start + event.clientX + "px";
					}

				} else {
					pointer.style.width = widthStart - x_start + event.clientX + "px";
				}

				ChangeGraphRatio();

			} else {

				if (!sizeHit) {
					sizeHit = true;
					sizeLastX = event.clientX;
				} else {
					pointer.style.width = min - parseInt(pointer.style.left) + "px";
				}

			}

		} else if (lastX > event.clientX) {

			if (parseInt(pointer.style.width) > 10 * step_mini) {

				if (sizeHit) {

					if (event.clientX > sizeLastX) {
						pointer.style.width = widthStart - x_start + event.clientX + "px";
					}
				} else {
					pointer.style.width = widthStart - x_start + event.clientX + "px";
				}

				ChangeGraphRatio();

			} else {

				if (!sizeHit) {
					sizeHit = true;
					sizeLastX = event.clientX;
				} else {
					pointer.style.width = 10 * step_mini + "px";
				}

			}
		}

		lastX = event.clientX;

	}
});

scrollArea.onmouseout = function() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveHit = 0;
	sizeHit = 0;
	scrollArea.style.visibility = "hidden";
}

scrollArea.onmouseup = function() {
	scroll = false;
	leftGrabber = false;
	rightGrabber = false;
	moveHit = 0;
	sizeHit = 0;
	scrollArea.style.visibility = "hidden";
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