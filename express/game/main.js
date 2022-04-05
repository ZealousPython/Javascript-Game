//const spawn = require("nodemon/lib/spawn");

//const { restart } = require("nodemon");


canvas.width = 256
canvas.height = 512
ctx.font = "14px Monospace"
total_score = 0


function update_game(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.drawImage(background.img,0,0)
    ctx.fillStyle="white"
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${total_score}`,2,512-7);
    ctx.fillText(`LIVES: ${new_player.lives}`,canvas.width-80,512-7);
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
function combo_wave4(){
    new Skimmer(0, -16, "right")
    new Skimmer(canvas.width-16, -32, "left")
    new Skimmer(0, -48, "right")
    new Skimmer(canvas.width-16, -64, "left")
    for (let i = 0; i<8;i++){
        new CSwarmer(88, -16-i*16,-1);
        new CSwarmer(152, -16-i*16,1);
    }
}

let spawner_timer = setTimeout(()=>{enemy_count = 0; spawner()},12000);

function spawner(){
    
    if(enemy_count === 0){
        let spawn_functions = [combo_wave1,skimmers,Turrets,CSwarm,combo_wave2,combo_wave3, combo_wave4]
        let enemy_wave = Math.floor(Math.random()*spawn_functions.length)
        spawn_functions[enemy_wave]();
        clearTimeout(spawner_timer)
        spawner_timer = setTimeout(()=>{enemy_count = 0; spawner()},12000);
        
    }
}
let spawing = true
let bounus_lives = 0

function game_over(){
    game_overed = true
    ctx.font = "28px Monospace"
    ctx.textAlign = 'center'
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle="white"
    ctx.fillText(`GAME OVER`,canvas.width/2,canvas.height/2);
    ctx.font = "20px Monospace"
    ctx.fillText(`FINAL SCORE: ${total_score}`,canvas.width/2,canvas.height/2+32);
    ctx.font = "14px Monospace"
    ctx.fillText(`Press R to Restart`,canvas.width/2,canvas.height-7);
}

function start_screen(){
    
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.font = "28px Monospace"
    ctx.fillStyle="#FFFFFF"
    ctx.textAlign = 'center'
    ctx.fillText(`Shoot The Space`,canvas.width/2,canvas.height/2,canvas.width);
    ctx.font = "14px Monospace"
    ctx.fillText(`Press R to Start The Game`,canvas.width/2,canvas.height/2+32, canvas.width);
}

function restart_game(){
    if(gaming == false){
        game_overed = false
        gaming = true
        kinematic_bodies = [];
        spawning = true
        total_score = 0
        new_player = new Player(canvas.width/2,canvas.height-32);
    }
}

canvas.addEventListener("click", (e)=>{
    if(!canvas_active)requestAnimationFrame(gameloop);
    canvas_active = true;
  spawner_timer = setTimeout(()=>{enemy_count = 0; spawner()},12000)
})
function lose_focus(){
    canvas_active = false;
  clearTimeout(spawner_timer)
}


window.addEventListener('keydown', function(e) {
    if(e.code == "Space" && e.target == document.body) {
      e.preventDefault();
    }
  });
let game_overed = false
function gameloop(){
    if(canvas_active){
        canvas.style.borderColor = "blue"
    }
    else{
      clearTimeout(spawner_timer)
        canvas.style.borderColor = "#CCCCCC"
    }
    if(map["KeyR"]){
        delete map["KeyR"]
        console.log(canvas_active)
        if(canvas_active){
            restart_game()
            died = true
        }
    }
    if(gaming){
        if (Math.floor(total_score / 15000) === bounus_lives+1){
            new_player.lives++;
            bounus_lives++
        }
        if (spawing)
            spawner();
       
        update_game();
        if(new_player.lives <= 0){
            gaming = false;
        }
    }
    else{
        if(!died){
            start_screen()
        }
        else{
            if(!game_overed)game_over();
        }
    }
    //ctx.clearRect(0,0,canvas.width,canvas.height)
    //ctx.font = "48px Monospace"
    if(canvas_active){
        requestAnimationFrame(gameloop)
    }
    else{
        clearTimeout(spawner_timer)
        canvas.style.borderColor = "#CCCCCC"
    }
    
}