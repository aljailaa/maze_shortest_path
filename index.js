var from = true; //signals when a user added a starting point
var from_to = []; //an array which has the starting node and the destination
var places = []; //includes all of the nodes which are blocks
var cols_maze = 0; //The num of cols the node have
var rows_maze = 0; //the num of rows the node have
var used_path = [] //shortest path. Used path in the previous attempt

//represents a node in the A* algorithim path
function node(current, parent) {
    this.current = current.split(","),
    this.parent = parent,
    this.g = g(this.parent),
    this.h = h(this.current),
    this.f = f(this.g, this.h)
}

//the f score required for the algorithim
function f(x, y) {
	return x + y;
}

//the g score required for the algorithim
//represents the path from the starting point
function g(n) {
	if (from_to[1] != undefined && n != undefined) {
		return n.g + 10;
	}
	 return 0;
}

//the h score; represents the path from the current node to the destination
function h(n) {
	if (from_to[1] != undefined) {
		var value = (((n[0] - from_to[1].current[0]) * -1 ) + 
				((n[1] - from_to[1].current[1]) * -1 )) * 10;
			//console.log("undefine to: " + from_to[1]);
			if (value < 0) value = -value;
			return value;
	}
	 return 0;
}

//gets the adjacent nodes to the node n and return an array of adjacent nodes
function adjacent(n) {
	var adjacent_nodes = [];
	var node_row = parseInt(n.current[0]);
	var node_col = parseInt(n.current[1]);
	var left = node_col - 1;
	var right = node_col + 1;
	var up = node_row - 1;
	var down = node_row + 1;
	var val = [];
	if (up >= 0 ) val.push(up + "," + node_col);
	if (down <= rows_maze - 1) val.push(down + "," + node_col);
	if (left >= 0 )  val.push(node_row + ","+ left);
	if (right <= cols_maze - 1) val.push(node_row +","+ right);

	for (var i = 0; i < val.length; i++) {
		if (places.indexOf(val[i]) == -1)
			adjacent_nodes.push(new node(val[i], undefined));
	}

	return adjacent_nodes;
}

//sets up and generate the maze layout according to cols and rows
function generate(cols, rows){
	cols_maze = cols;
	rows_maze = rows;
	clear();
	var element = document.getElementById("table");
	element.innerHTML = "";
	for (var i = 0; i < rows; i++){

		var row = document.createElement("tr");
		for (var j = 0; j < cols; j++){

		 	var col = document.createElement("td");
		 	col.setAttribute("id", "" + i + "," + j);
		 	col.setAttribute("width", element.style.width/cols);
		 	col.setAttribute("height", element.style.height/rows);
		 	col.setAttribute("onClick", "isOver()");
		 	col.innerHTML = "";

		 	row.appendChild(col);
		}
		element.appendChild(row);
	}
	//console.log("Hello World");

}


//clears all of the colored path array. 
function clear() {
	//console.log("Iam in");
	for (var i = 0; i < from_to.length; i++) {
		//from_to[i].style.backgroundColor = '';
		document.getElementById("" + from_to[i].current[0] + "," + from_to[i].current[1]).style.backgroundColor = '';
	}

	for (var i = 0; i < used_path.length; i++) {
		//from_to[i].style.backgroundColor = '';
		document.getElementById(used_path[i]).style.backgroundColor = '';
	}
	from_to = [];
	used_path = [];
	from = true;
}


//generates a maze, add blocks and display that in the html document
function button(){
	//getting the value from user
	var e = document.getElementById("options");
	var value = e.options[e.selectedIndex].value;

	if (value != ""){
		var input = value.split("x");
		
		//generating a path
		generate(input[0], input[1]);
		//initializing the array which has the blocks randamly 
		places = [];
		//adds the blocks based on frequency increasing 5 will increase the frequency 
		var num = Math.round((input[0] * input[1]) / 5);
		for (var i = 0; i < num; i++) {
			//getting the first x and y
			var x = Math.ceil(Math.random() * input[0]) - 1;
			var y = Math.ceil(Math.random() * input[1]) - 1;
			var what = "" + x + "," + y;
			//making sure that that everything in places is unique
			while (places.indexOf(what) != -1) {
				x = Math.ceil(Math.random() * input[0]) - 1;
			    y = Math.ceil(Math.random() * input[1]) - 1;
			    what = "" + x + "," + y;
			}

			places.push(what);
		}
		//coloring the back ground color of each position in places with black
		for (var i = 0; i < places.length; i++){
			var element = document.getElementById(places[i]);
			element.style.backgroundColor = "black";
			element.style.borderColor = "black";
		}

	}
	else alert("input please");
}

//initializes the from_to array whenever the user clicks on the grid.
//add the starting and the ending point to the array from_to
//find the shortest path between them and display that in the html document
function isOver() {
	var x = event.clientX;     // Get the horizontal coordinate
	var y = event.clientY;	   // get the vertical coordinate 
    var elementMouseIsOver = document.elementFromPoint(x, y);
    
    //check if the clicked item is not an obstacle
    if (places.indexOf(elementMouseIsOver.id) == -1) {
    	//check if nothing is in the array from_to
	    if (from) {
	    	clear();
	    	elementMouseIsOver.style.backgroundColor = "red";
	    	from_to.push(new node(elementMouseIsOver.id));
	    	//inform the user to wait until the path is found
	    	//ask the user to wait
			var e = document.getElementById("path");
			e.innerHTML = "wait WAIT wait until the path is found. If it is 100x100 grid, it will take a while";
			e.style.color = "orange";
	    	from = false;
	    } else {
	    	elementMouseIsOver.style.backgroundColor = "green";
	    	from = true;
	    	from_to.push(new node(elementMouseIsOver.id));

	    	
	    	//find the shortest path using A* algorithim
	    	var arr = shortest_path(from_to[0], from_to[1]);
	
	    }
	} else {
		alert("not an obstacle!");
	}

}




function shortest_path(from, to) {
	
	//proceed with the path calculation
	var open_list = [from], close_list = [], path_exist = false;
	
    do {
    	
	// So now that you know how to compute the score of each square (we’ll call this F, which again is equal to G + H), 
	// let’s see how the A* algorithm works.
	// The cat will find the shortest path by repeating the following steps:
	// Get the square on the open list which has the lowest score. Let’s call this square S.
	 var lowest_sc = lowest_score(open_list); 
	 var lowest_s = lowest_sc[0];
	// Remove S from the open list and add S to the closed list.
	 open_list[lowest_sc[1]] = open_list[open_list.length - 1];
	 open_list[open_list.length - 1] = lowest_s;
	 console.log(lowest_s.current.join(","));	
	 close_list.push(open_list.pop());
    //get out of the loop when the close list includes the destination node
    if (contains(close_list, to)) {
		path_exist = true;
	  break;
	}
	// For each  T in S’s walkable adjacent tiles:
	//console.log("Hello");
	var adjacents = [];
	//console.log(lowest_s);
	adjacents = adjacent(lowest_s);


	 for (var i = 0; i < adjacents.length; i++) {
	 	var t = adjacents[i];
	 	// If T is in the closed list: Ignore it.
	 	if (contains(close_list, t)) continue;

		else if ( contains(open_list, t)) {
		// If T is already in the open list: Check if the F score is lower when we use the current 
		//generated path to get there.
			var up_f = lowest_s.g + 10 + t.h; 
			if ((t.g + t.h) > up_f) {
			// If it is, update its score and update its parent as well.
				t.g = lowest_s.g + 10;
				t.parent = lowest_s;
			}
		} else {
			// If T is not in the open list: Add it and compute its score.
			t.parent = lowest_s;
			t.g = lowest_s.g + 10;
			open_list.push(t);
		}

	 }
	  
   } while (open_list.length != 0); 

   //checking if path exists. If path does not exist alert the user 
	if (!path_exist) {
		clear();
		//get element id
		var e = document.getElementById("path");
		e.innerHTML = "path does not exist";
		e.style.color = "red";

		close_list = [];
	} else {
		//inform the user that a path exist
		var e = document.getElementById("path");
		e.innerHTML = "path exists";
		e.style.color = "green";

		//display the path
			var val = close_list.pop(), des;
	    	while (val != undefined) {
	    		used_path.push(val.current.join(","));
	    		des = val;
	    		val = val.parent;
	    		if (val != undefined) {
		    		var e = document.getElementById(val.current.join(","));
		    		e.style.backgroundColor = 'yellow';
		    	}
	    	} 
	    	var e = document.getElementById(des.current.join(","));
		    e.style.backgroundColor = 'red';
		    close_list.push(val);
	}

	return close_list;
}


function contains (list, val) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].current.join(",") == val.current.join(","))
			return true;
	}
	return false;
}

function lowest_score(list) {
	var lowest = list[0].g + list[0].h, lowest_s = list[0];
	var index = 0;
	for (var i = 1; i < list.length; i++) {
		var f = list[i].g + list[i].h;
		//console.log("f: " + f);
		if (f <= lowest) {
			lowest = f;
			lowest_s = list[i];
			index = i;
		}
	}
	return [lowest_s, index];
}





function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function change_color(lowest_s){
		  var e = document.getElementById(lowest_s.current.join(","));
		  e.style.backgroundColor = "orange";
		  console.log(e);
}

window.onload = button;