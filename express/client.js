
const leaderboard = document.getElementById("leaderboard")
const socket = io("ws://localhost:8000");
function callback(){
    console.log("Got Message")
}
function data_callback(all_scores){
  console.log("Score Recieved")
  scores = all_scores
  update_leaderboard()
}

function collect_score(){
  socket.emit("get_scores", data_callback);
}

//send message
scores = []

// receive a message from the server
socket.on("send_data", data_callback)
function sort_scores(all_scores){
  let sorted_scores = []
  let score_start_length = all_scores.length
  while(sorted_scores.length != score_start_length){
    let highest_score = 0
    let highest_index = 0
    let lowest_id = 0
    for (let i = 0; i < all_scores.length;i++){
     // if(all_scores[i])//add ID BIAS
      if(highest_score < all_scores[i].score){
        highest_score = all_scores[i].score
        highest_index = i
        
      }
      //else if(highest_score == all_scores[i].score)
    }
    sorted_scores.push(all_scores[highest_index])
    all_scores.splice(highest_index,1)
  }
  return sorted_scores
}

function submit_score(){
  canvas_active = false
  let name_box = document.getElementById("name_input")
  if(name_box.value.length > 0 && died && !gaming){
    socket.emit("send_score",name_box.value, total_score, data_callback);
    total_score = 0
    name_box.value = "";
  }
}


function update_leaderboard(){
  if (scores.length > 0){
    scores = sort_scores(scores)
    let new_leaderbaord = `
    <thead>
      <tr>
        <th class="name">Name</th>
        <th class="score">Score</th>
        <th>Rank</th>
      </tr>
    </thead>`
    let max_loop = scores.length > 10 ? 10: scores.length;
   new_leaderbaord +=`<tbody>`
    for (let i = 0;i < max_loop;i++){
      new_leaderbaord += `<tr><th scope="row">${scores[i].name}</td><td>${scores[i].score}</td><td>${i+1}</td></tr>`
    }
    new_leaderbaord +=`</tbody>`
    leaderboard.innerHTML = new_leaderbaord;
  }
}
setInterval(collect_score,5000)