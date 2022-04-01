const http = require('http');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
let all_scores = []

const app = express();


async function add_score(new_name, new_score){
    new_player_score = {
        id:all_scores.length,
        name:new_name,
        score:new_score
    };
    all_scores.push(new_player_score);
}

async function update_database(db){
    for (let i = 0; i < all_scores.length;i++){
        player = all_scores[i]
        await db.exec(`INSERT OR REPLACE INTO scores (id, name, score) VALUES (${player.id},'${player.name}',${player.score});`);
    }
}

async function remove_all_scores(db){
    await db.exec("DELETE FROM scores")
}
async function create_scores_table(db){
    await db.exec("CREATE TABLE IF NOT EXISTS scores (id INT PRIMARY KEY, name TEXT, score TEXT)");
}

async function get_all_scores(db){
    let scores = []
    let select_command = `SELECT id id,
    name name,
    score score
    FROM scores`
    rows = await db.all(select_command)
    rows.forEach((row)=>{
        player_score = {
            id:row.id,
            name:row.name,
            score:row.score,
        };
        scores.push(player_score); 
    })
    return scores
}

//db.serialize(()=>{update_database();});
//db.serialize(get_all_scores());\
async function get_database(){
    return await open({
        filename: 'extra_files\\leaderboard.db',
        driver: sqlite3.cached.Database
    })
}

async function init(){
    const db = await get_database()
    await create_scores_table(db);
    //await remove_all_scores(db);
    all_scores = await get_all_scores(db);
    console.log(all_scores);
}


async function new_score(name, score, callback){
    const db = await get_database()
    await add_score(name, score)    
    await update_database(db)
    all_scores = await get_all_scores(db)
    callback(all_scores);
}

async function send_scores(callback){
    const db = await get_database()
    all_scores = await get_all_scores(db)
    callback(all_scores);
}

app.use(express.json());
app.use(express.static("express"));
// default URL for website
app.use('/', function(req,res){
    res.sendFile(path.join(__dirname+'/express/index.html'));
    //__dirname : It will resolve to your project folder.
  });
const server = http.createServer(app);
const port = 8000;
const io = require('socket.io')(server);


io.on('connection', client => {
    client.on("ping",(callback)=>{
        console.log("Pinged")
        callback();
    })
    client.emit("send_data", all_scores);
    client.on("get_scores", send_scores);
    client.on("send_score",new_score)
  });


server.listen(port);
console.debug('Server listening on port ' + port);
init();

