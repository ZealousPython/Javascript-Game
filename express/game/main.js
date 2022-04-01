//const spawn = require("nodemon/lib/spawn");

let canvas = $("#canvas")[0];
let ctx = canvas.getContext('2d');
canvas.width = 256
canvas.height = 512
ctx.font = "14px Monospace"
total_score = 0
function update_game(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle="white"
    ctx.fillText(`SCORE: ${total_score}`,2,512-7);
    for (let i = 0; i < kinematic_bodies.length;i++){
        kinematic_bodies[i].update();
    }
    for (let i = 0; i < kinematic_bodies.length;i++){
        kinematic_bodies[i].draw();
    }
}
new_player = new Player(canvas.width/2,canvas.height-32);


function CSwarm(){
    for (let i = 0; i<8;i++){
        new CSwarmer(40, -16-i*16,1);
        new CSwarmer(88, -16-i*16,-1);
        new CSwarmer(152, -16-i*16,1);
        new CSwarmer(200, -16-i*16,-1);
    }
}
function Turrets(){
    new SideTurret(0, -16, "left")
    new SideTurret(0, -16, "center")
    new SideTurret(0, -16, "right")
}

function verify_name(){
    let name_box = document.getElementById("name_input")
    if (name_box.value.length >=  15){
        name_box.value = ""
    }
}

function skimmers(){
    let start_y = -16
    for (let i = 0; i < 4; i++){
        new Skimmer(0, start_y, "right")
        new Skimmer(canvas.width-16, start_y-16, "left")
        start_y -= 32
    }
}
function combo_wave1(){
    new SideTurret(0, -16, "left")
    new SideTurret(0, -16, "right")
    for (let i = 0; i<8;i++){
        new CSwarmer(88, -16-i*16,-1);
        new CSwarmer(152, -16-i*16,1);
    }
}
function combo_wave2(){
    new SideTurret(0, -16, "center")
    for (let i = 0; i<8;i++){
        new CSwarmer(40, -16-i*16,1);
        new CSwarmer(200, -16-i*16,-1);
    }
}
function combo_wave3(){
    new Skimmer(0, -16, "right")
    new Skimmer(canvas.width-16, -32, "left")
    
    new Skimmer(0, -48, "right")
    new Skimmer(canvas.width-16, -64, "left")
    for (let i = 0; i<8;i++){
        new CSwarmer(40, -16-i*16,1);
        new CSwarmer(200, -16-i*16,-1);
    }
}
function spawner(){
    
    if(enemy_count === 0){
        let spawn_functions = [combo_wave1,skimmers,Turrets,CSwarm,combo_wave2,combo_wave3]
        let enemy_wave = Math.floor(Math.random()*spawn_functions.length)
        spawn_functions[enemy_wave]();
    }
}
let spawing = true
function gameloop(){
    if (spawing)
        spawner();
    if(map["KeyR"]){
        delete map["KeyR"]
        spawing = false
        console.log(kinematic_bodies)
        
    }
    kinematic_bodies;
    update_game();
    requestAnimationFrame(gameloop)
}