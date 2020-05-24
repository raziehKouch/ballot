/****************************

SINGLETON CLASS on how to COUNT UP THE BALLOTS
and RENDER IT INTO THE CAPTION

*****************************/

var Election = {};

var us2br = function(winner) {
	ppl = {"square": "مربع", "triangle": "مثلث", "pentagon": "پنج‌ضلعی", "bob": "دایره", "hexagon": "شش‌ضلعی"};
	console.log(winner);
	return ppl[winner];
}

Election.score = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	});
	for(var candidate in tally){
		tally[candidate] /= model.getTotalVoters();
	}
	var winner = _countWinner(tally);
	var color = _colorWinner(model, winner);

	// NO WINNER?! OR TIE?!?!
	if(!winner){

		var text = "<b>NOBODY WINS</b>";
		model.caption.innerHTML = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		text += "<b>بیشترین میانگین امتیاز می‌بره</b><br>";
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i].id;
			text += " با امتیاز"+" "+(tally[c].toFixed(2))+ " از 5.00" + " "+ _icon(c) + "<br>";
		}
		text += "<br>";
		text += ".."+" بیشترین امتیاز رو داره، بنابراین"+" "+_icon(winner)+"<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+us2br(winner).toUpperCase()+"</b> می‌بره";
		model.caption.innerHTML = text;

	}

};

Election.approval = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		var approved = ballot.approved;
		for(var i=0; i<approved.length; i++) tally[approved[i]]++;
	});
	var winner = _countWinner(tally);
	var color = _colorWinner(model, winner);

	// NO WINNER?! OR TIE?!?!
	if(!winner){

		var text = "<b>NOBODY WINS</b>";
		model.caption.innerHTML = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		text += "<b>بیشترین تأیید می‌بره</b><br>";
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i].id;
			text += " تأییدهاش"+" "+tally[c]+ " تاست" + " "+ _icon(c) + "<br>";
		}
		text += "<br>";
		text += "..."+" بیشترین تأیید رو داره، بنابراین"+" "+_icon(winner)+"<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+us2br(winner).toUpperCase()+"</b> می‌بره";
		model.caption.innerHTML = text;

	}

};

Election.condorcet = function(model, options){

	var text = "";
	text += "<span class='small'>";
	text += "<b>برنده رأی‌گیری‌های یک-به-یک کیه؟</b><br>";

	var ballots = model.getBallots();

	// Create the WIN tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;

	// For each combination... who's the better ranking?
	for(var i=0; i<model.candidates.length-1; i++){
		var a = model.candidates[i];
		for(var j=i+1; j<model.candidates.length; j++){
			var b = model.candidates[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			tally[winner.id]++;

			// Text.
			var by,to;
			if(winner==a){
				by = aWins;
				to = bWins;
			}else{
				by = bWins;
				to = aWins;
			}
			text += ":"+_icon(b.id)+" در مقابل "+_icon(a.id)+"<br>"
			text += " می‌بره "+"با نتیجهٔ:"+by+" در مقابل "+to+_icon(winner.id)+"<br>";

		}
	}

	// Was there one who won all????
	var topWinner = null;
	for(var id in tally){
		if(tally[id]==model.candidates.length-1){
			topWinner = id;
		}
	}

	// Winner... or NOT!!!!
	text += "<br>";
	if(topWinner){
		var color = _colorWinner(model, topWinner);
		text += "نماینده‌های دیگه رو در"+" "+_icon(topWinner)+"<br>";
		text += "رقابت‌های یک-به-یک شکست می‌ده" + "<br>"
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+us2br(topWinner).toUpperCase()+"</b> می‌بره";

	}else{
		model.canvas.style.borderColor = "#000"; // BLACK.
		text += "،هیچ نماینده‌ای، همهٔ نماینده‌های دیگه رو در یک-به-یک‌ها نبرده<br>";
		text += "</span>";
		text += "بنابراین برنده‌ای نداریم<br>";
		text += "<b id='ohno'>.نههه</b>";
	}

	// what's the loop?

	model.caption.innerHTML = text;

};

Election.borda = function(model, options){

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		for(var i=0; i<ballot.rank.length; i++){
			var candidate = ballot.rank[i];
			tally[candidate] += i; // the rank!
		}
	});
	var winner = _countLoser(tally); // LOWER score is best!
	var color = _colorWinner(model, winner);

	// NO WINNER?! OR TIE?!?!
	if(!winner){

		var text = "<b>هیچ‌کسی نمی‌بره</b>";
		model.caption.innerHTML = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		text += "<b>امتیاز کم‌تر بهتره</b><br>";
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i].id;
			text += "مجموع امتیازات "+_icon(c)+" برابره با: "+tally[c]+"<br>";
		}
		text += "<br>";
		text += "..."+"<i>کم‌ترین</i> امتیاز رو داره، بنابراین"+" "+_icon(winner)+"<br>";
		text += "</span>";
		text += "<br>";
	text += "<b style='color:"+color+"'>"+us2br(winner).toUpperCase()+"</b> می‌بره";
		model.caption.innerHTML = text;

	}

};

Election.irv = function(model, options){

	var text = "";
	text += "<span class='small'>";

	var finalWinner = null;
	var roundNum = 1;

	var candidates = [];
	for(var i=0; i<model.candidates.length; i++){
		candidates.push(model.candidates[i].id);
	}

	while(!finalWinner){

		text += ":"+"<b>دور "+roundNum+"ام</b><br>";
		text += "انتخاب اول رأی‌دهنه‌ها کیان؟<br>";

		// Tally the approvals & get winner!
		var pre_tally = _tally(model, function(tally, ballot){
			var first = ballot.rank[0]; // just count #1
			tally[first]++;
		});

		// ONLY tally the remaining candidates...
		var tally = {};
		for(var i=0; i<candidates.length; i++){
			var cID = candidates[i];
			tally[cID] = pre_tally[cID];
		}

		// Say 'em...
		for(var i=0; i<candidates.length; i++){
			var c = candidates[i];
			text += _icon(c)+":"+tally[c];
			if(i<candidates.length-1) text+=", ";
		}
		text += "<br>";

		// Do they have more than 50%?
		var winner = _countWinner(tally);
		var ratio = tally[winner]/model.getTotalVoters();
		if(ratio>=0.5){
			finalWinner = winner;
			text += "بیش از ۵۰٪ آٰرا رو داره "+_icon(winner)+"<br>";
			break;
		}

		// Otherwise... runoff...
		var loser = _countLoser(tally);
		text += ".هیچ‌کسی بیش از ۵۰٪ نیست <br>";
		text += "با حذف "+_icon(loser)+"، .به دور بعد می‌ریم<br><br>";

		// ACTUALLY ELIMINATE
		candidates.splice(candidates.indexOf(loser), 1); // remove from candidates...
		var ballots = model.getBallots();
		for(var i=0; i<ballots.length; i++){
			var rank = ballots[i].rank;
			rank.splice(rank.indexOf(loser), 1); // REMOVE THE LOSER
		}

		// And repeat!
		roundNum++;
	
	}

	// END!
	var color = _colorWinner(model, finalWinner);
	text += "</span>";
	text += "<br>";
	text += "<b style='color:"+color+"'>"+us2br(winner).toUpperCase()+"</b> می‌بره";
	model.caption.innerHTML = text;


};

Election.plurality = function(model, options){

	options = options || {};

	// Tally the approvals & get winner!
	var tally = _tally(model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	var winner = _countWinner(tally);
	var color = _colorWinner(model, winner);

	// Caption
	var text = "";
	text += "<span class='small'>";
	if(options.sidebar){
		text += "<b>بیشترین رأی می‌بره</b><br>";
	}
	for(var i=0; i<model.candidates.length; i++){
		var c = model.candidates[i].id;
		if(options.sidebar){
			text += " رأی‌هاش"+" "+tally[c]+ " تاست" + " "+ _icon(c) + "<br>";
		}else{
			text += us2br(c)+": "+tally[c];
			if(options.verbose) text+=" رأی";
			if(i<model.candidates.length-1) text+="، ";
		}
	}
	if(options.sidebar){
		text += "<br>";
		text += "..."+" بیشترین رأی رو داره، بنابراین"+" "+_icon(winner)+"<br>";
	}
	text += "</span>";
	text += "<br>";
	text += "<b style='color:"+color+"'>"+us2br(winner).toUpperCase()+"</b> می‌بره";
	model.caption.innerHTML = text;

};

var _tally = function(model, tallyFunc){

	// Create the tally
	var tally = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;

	// Count 'em up
	var ballots = model.getBallots();
	for(var i=0; i<ballots.length; i++){
		tallyFunc(tally, ballots[i]);
	}
	
	// Return it.
	return tally;

}

var _countWinner = function(tally){

	// TO DO: TIES as an array?!?!

	var highScore = -1;
	var winner = null;

	for(var candidate in tally){
		var score = tally[candidate];
		if(score>highScore){
			highScore = score;
			winner = candidate;
		}
	}

	return winner;

}

var _countLoser = function(tally){

	// TO DO: TIES as an array?!?!

	var lowScore = Infinity;
	var winner = null;

	for(var candidate in tally){
		var score = tally[candidate];
		if(score<lowScore){
			lowScore = score;
			winner = candidate;
		}
	}

	return winner;

}

var _colorWinner = function(model, winner){
	var color = (winner) ? Candidate.graphics[winner].fill : "";
	model.canvas.style.borderColor = color;
	return color;
}