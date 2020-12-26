//Global variables
var priLabels = []; //This might be needed for number chrunching later

// Functions to Control Interactive Color Changes
function SwitchColor(pnt){
	var value = pnt.value;
	
	if (value == "Undecided"){
		pnt.style.backgroundColor = "#FFFFFF";
		pnt.style.color = "#000000";
	} else {
		pnt.style.backgroundColor = "#000000";
		pnt.style.color = "#FFFFFF";
	}
	
}

//Function to create DOM elements
	//Create list element for results
function Printer(output, pnt){
	let stuff1 = document.createElement('li');
	let stuff2 = document.createTextNode(output);
	
	stuff1.appendChild(stuff2);
	pnt.appendChild(stuff1);
}
	//Create Selection Boxes
function CreateCompair (k, halt, firstP, allP) {
	var numOp = [];
	
	for(let i=k+1; i<halt; i++){
		let box = document.createElement('select');
		let opDefault = document.createElement('option');
		let opFirst = document.createElement('option');
		let opVar = document.createElement('option');
		
		box.setAttribute('onchange', 'SwitchColor(this)');
		
		//Create the Option's Text
		opDefault.text = 'Undecided';
		opDefault.setAttribute('value', 'Undecided');
		box.add(opDefault);
		
		opFirst.text = firstP;
		opFirst.setAttribute('value', firstP);
		box.add(opFirst);
		
		opVar.text = allP[i];
		opVar.setAttribute('value', allP[i]);
		box.add(opVar);
		
		//create the array.
		numOp.push(box);
	}
	
	return numOp;
}

function CreateSelectBoxes(dis, pri){
	var cnt1 = pri.length;
	
	//remove stuff already in the HTML display element
	dis.innerHTML = " ";
	
	for (let i=0; i<cnt1; i++){
		//Creating HTML Elements
		let thing1 = document.createTextNode(pri[i]);
		let thing2 = document.createElement('h3');
		let thing3 = document.createElement('p');
			//Creating an Array of Selection Boxes
		let boxOp = CreateCompair(i, cnt1, pri[i], pri);
		
		//Arranging HTML Elements for Insertion
			//Entering Text into a H3 then the H3 into a Div display
		thing2.appendChild(thing1);
		dis.appendChild(thing2);
		
		//Enter selection boxes into a paragraph
		let cnt2 = boxOp.length;
		for(let i=0; i<cnt2; i++){	
		thing3.appendChild(boxOp[i]);
		}
			//Then the paragraph into the Div display
		dis.appendChild(thing3);	
	}
}

// Function to Collect Input About Priorites
function CollectLabels(){
	const pntD = document.getElementById('selection'); //Points to display DIV in HTML
	var priorities = [];
		//Tools to Get the Text Given by User
	var labels = document.getElementsByTagName('input');
	var cnt = labels.length;
	
	for(let i=0; i<cnt; i++) {
		if((labels[i].getAttribute('type')=='text')&&(labels[i].value != "")){
			let regex = /^\s+$/;
			if(regex.test(labels[i].value) !== true){
				priorities.push(labels[i].value);
			}
			
		}
	}
	
	document.getElementById('result').innerHTML = " "; //Clear any exsisting results list.
	
	CreateSelectBoxes(pntD, priorities); //Set-up for collecting further data from user
	priLabels = priorities; //Add to global variable, for numbercrunching later
}


//Number Crunching Functions
function TiedTwo(defend, chall, pnt){ //High is the heading that appears higher in the h3s. 
	let stop = defend.wins.length;
	for(let i=0; i<stop; i++){
		if(chall.label===defend.wins[i].match){
			if(defend.wins[i].vic){
				Printer(defend.label, pnt);
				Printer(chall.label, pnt);
			} else {
				Printer(chall.label, pnt);
				Printer(defend.label, pnt);
			}
		}
	}
}

function DeepClone(cloneMe){
	
	let grown = [];
	let stop = cloneMe.length;
	let halt = cloneMe[0].wins.length;
	
	for(let i=0; i<stop; i++){ //Loop cloneMe to Recreate Objects
				
		let shortWins = []; //To clone the array of objects in the object properties
		let objEl = { //To put into grown
					label: cloneMe[i].label,
					score: 0,
					tied: false,
					tiedType: -1,
					wins: []
				};
				
		//Fill in 'shortWins'
		for(let j=0; j<halt; j++){ //Loop through the wins-Array
			let objWin = { //to put into shortWins
				match: '',
				vic: false
			};
					
			for(let k=0; k<stop; k++){ //Loop Through CloneMe to Get Labels, Except its Own
				if ((cloneMe[i].wins[j].match===cloneMe[k].label)){
					objWin.match = cloneMe[i].wins[j].match;
					objWin.vic = cloneMe[i].wins[j].vic;
					shortWins.push(objWin);
				}
			}
		}
		//Attach completed 'shortWins' to objPri
		objEl.wins = shortWins;
		grown.push(objEl);
	}
	
	//Count New Score
	let reStop = grown.length;
	for(let i=0; i<reStop; i++){
		for(let j=0; j<(reStop-1); j++){ //the wins should have one less element than grown
			if(grown[i].wins[j].vic===true){
				grown[i].score++;
			}
		}
	}
	
	//Check for Ties
	for(let i=0; i<reStop; i++){
		for(let j=i+1; j<reStop; j++){
			if(grown[i].score===grown[j].score){
				grown[i].tied = true;
				grown[j].tied = true;
				break;
			}
		}
	}
	
	//Determine TiedType
	for(let i=0; i<reStop; i++){
		if(grown[i].tied===true){
			grown[i].tiedType = grown[i].tiedType + 2; //Get out of default value		
			for(let j=i+1; j<reStop; j++){
				if(grown[i].score===grown[j].score){
					grown[i].tiedType++;
					grown[j].tiedType++;
				}
			}
		}
	}
		
	return grown;
}

function DoomFind(reduced){
	let amount = reduced.length;
	let doom = true;
	
	for(let i=0; i<amount; i++){
		if(reduced[i].tied===false){
			return false;
		}
	}
	
	for(let i=1; i<amount; i++){
		if(reduced[0].score!=reduced[i].score){
			return false;
		}
	}
	
	return true;
}

function Ranker(pri, pnt){
	const highest = pri.length-1; //highest score possible
	let stop = pri.length;
	
	for(let sc=highest; sc>=0; sc--){ //checking every score possible, highest to lowest
		
		//Find Elements with a score of sc
		for(let i=0; i<stop; i++){
			if(pri[i].score===sc){
				if(pri[i].tied===false){
					Printer(pri[i].label, pnt);
					break;
				} else {
					if(pri[i].tiedType===2){
						let other = {};
						for(let j=i+1; j<stop; j++){
							if(pri[j].score===sc){
								other = pri[j];
								break;
							}
						}
						TiedTwo(pri[i], other, pnt);
						break;
					} else if(pri[i].tiedType>=3){
						let holdsObj = [pri[i]];
						let holdsLabel = [pri[i].label];
						for(let j=i+1; j<stop; j++){
							if(pri[j].score===sc){
								holdsObj.push(pri[j]);
								holdsLabel.push(pri[j].label);
							}
						}
						//Printer(holdsLabel, pnt);
						//break;
						let cloned = DeepClone(holdsObj);
						let doomCheck = DoomFind(cloned); //Check for a Doom-Circle
						if(doomCheck){ 
							Printer(holdsLabel, pnt);
							break;
						} else {
							Ranker(cloned, pnt);
							break;
						}
					}
				}
			}
		}				
	}
}

		
function NumCrunch (priorityList, pntD, pntE){
		//Tools to get and hold data
	var priObjL = [];
	var listEl = document.getElementsByTagName('select');
		//Pointers to send messages
	var resultPnt = document.getElementById(pntD);
	var errorPnt = document.getElementById(pntE);
		//Tools to avoid unnessary computations
	var goFuther = true;
	
	//Clearing past messages
	resultPnt.innerHTML = "";
	errorPnt.innerHTML = "";
	
	//Check that all the Compairsons have been made.
	var	cnt1 = listEl.length;
	for(let i=0; i<cnt1; i++){
		if(listEl[i].value == 'Undecided'){
			errorPnt.innerHTML = 'Please Finish the Comparisons';
			goFuther = false;
			break;	
		}
	}
	
	if(goFuther){ //This will not be calculated if all comparisons have not been made
		
		//Objects of Priority Data put in an Array and Filled With Data from listEL
		var stop = priorityList.length;
		for(let i=0; i<stop; i++){ //Loop Through Priorities
			let stuff = {
				label: priorityList[i],
				score: 0,
				tied: false,
				tiedType: -1,
				wins: []
			};
			priObjL.push(stuff);
			
			//Set Array to track Wins
			for(let j=0; j<cnt1; j++){ //Loop Through All Comparisons
								
				let thing = { //Elements for Wins Array
					match: '',
					vic: false
				};
				let opVal = listEl[j].options; //Assume Collections Length is 3
				let attended = false; //To avoid unnessary computations
				
				//Find Out if This Selection j is a Comparison with priObjL[i] present
				for(let k=0; k<3; k++){ //Determin if attended Should be True
					if(priObjL[i].label===opVal[k].value){
						attended = true;
					}
				}
				
				//Set Value for Wins Array Elements and Store It
				if(attended){
					//Count Score for Each Element
					if(priObjL[i].label===listEl[j].value){
						priObjL[i].score++;
					}
					
					//Determine the Enemy
					for(let k=0; k<3; k++){
						if((opVal[k].value!="Undecided")&&(opVal[k].value!=priObjL[i].label)){
							thing.match = opVal[k].value;
						}
					}
					
					//Record if the Enemy was Defeated with TRUE
					if(thing.match!=listEl[j].value){ 
							thing.vic = true;
					}
					
					//Place Record in wins-Array
					priObjL[i].wins.push(thing);
				}
			}
		}
		
		//Check for Ties
		for(let i=0; i<stop; i++){
			for(let j=i+1; j<stop; j++){
				if(priObjL[i].score===priObjL[j].score){
					priObjL[i].tied = true;
					priObjL[j].tied = true;
					break;
				}
			}
		}
		
		//Determine Tie Types (With the wins Array this could be much less coding and loops within loops)
		for(let i=0; i<stop; i++){
			if(priObjL[i].tied===true){
				priObjL[i].tiedType = priObjL[i].tiedType + 2; // The inital value is -1.
				for(let j=i+1; j<stop; j++){
					if(priObjL[i].score===priObjL[j].score){
						priObjL[i].tiedType++;
						priObjL[j].tiedType++;
					}
				}
			}
		}
		
		Ranker(priObjL, resultPnt);
	}
}