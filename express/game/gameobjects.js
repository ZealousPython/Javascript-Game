kinematic_bodies = [];
enemy_count = 0;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
function collide(body, body2){
    if ( body.rect.x < body2.rect.x + body2.rect.width &&
    body.rect.x + body.rect.width > body2.rect.x &&
    body.rect.y < body2.rect.y + body2.rect.height &&
    body.rect.height + body.rect.y > body2.rect.y)
        return true;
    else return false;
}

var map = {}; // Reads inputs
addEventListener("keydown", function(event){
  map[event.code] = true;
  //console.log(event.code)
});
addEventListener("keyup", function(event){
  delete map[event.code];
});

class Rect{
    constructor(x, y, width, height, color="#000000"){
        this.rect = {x:x,y:y,width:width,height:height};
        this.color = color;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
    }
}
class Kinematic extends Rect{
    constructor(name, x, y, width, height, color = "#000000"){
        super(x,y,width,height,color);
        this.velocity = {x:0,y:0};
        this.name = name;
        kinematic_bodies.push(this);
    }
    move(){
        this.rect.x += this.velocity.x;
        this.rect.y += this.velocity.y; 
    }
}
class Anim {
    constructor(frames, loop = true, speed = 6){
        this.frames = frames;
        this.loop = loop;
        this.speed = speed;
    }
}
class Player extends Kinematic{
    constructor(x,y){
        super("Player", x, y, 4, 6, "#FFFF00");
        let idle = new Anim([player_images[0]],false,0)
        let left = new Anim([player_images[1]],false,0)
        let right = new Anim([player_images[2]],false,0)
        this.animations = {"idle":idle, "right":right,"left":left};
        this.sprite_offset = {x:-6,y:-9}
        this.anim = "idle";
        this.frame = 0;
        this.cooldown = 0;
        this.cooldown_time = 5;
        this.sprite = this.animations[this.anim].frames[this.frame].img;
        
        this.speed = 2.5;
    }
    draw(){
        if (this.animations[this.anim].frames[this.frame] != null){
            ctx.drawImage(this.sprite,this.rect.x+this.sprite_offset.x,this.rect.y+this.sprite_offset.y,16,24);
        }
        else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        }
    }
    update(){
        if (this.cooldown > 0){
            this.cooldown -= 1
        }
        this.sprite = this.animations[this.anim].frames[this.frame].img;
        this.controls()
        this.move()
        if(this.rect.x < 6){
            this.rect.x = 6
        }
        else if (this.rect.x + (6+(this.rect.width))> canvas.width){
            this.rect.x = canvas.width - (6+(this.rect.width))
        }
        if(this.rect.y < 9){
            this.rect.y = 9
        }
        else if (this.rect.y + 14 > canvas.height){
            this.rect.y = canvas.height - 14
        }
    }
    hit(){
        console.log("hit")
    }
    controls() {//interperets inputs
        if (map["KeyW"]){
            this.velocity.y = -this.speed//if the W key is pressed move up
        }
        else if (map["KeyS"]){
            this.velocity.y = this.speed//if the S key is pressed move down
        }
        else{
            this.velocity.y = 0
        }
        if (map["KeyA"]){
            this.anim = "left"
            this.velocity.x = -this.speed//if the A key is pressed move left
        }
        else if (map["KeyD"]){
            this.anim = "right"
            this.velocity.x = this.speed//if the D key is pressed move right
        }
        else{
            this.anim = "idle"
            this.velocity.x = 0
        }
        if (map["Space"] && this.cooldown <= 0){
            this.cooldown = this.cooldown_time;
            new PBullet(this.rect.x+this.sprite_offset.x,this.rect.y-12,"up");
            new PBullet(this.rect.x-this.sprite_offset.x,this.rect.y-12,"up");//if the Space bar is pressed shoot
        }
        if (map["Enter"]){
            this.speed = 1//left shift
        }
        else{
            this.speed =2
        }
    }
}
class PBullet extends Kinematic{
    constructor(x,y, direction){
        super("PProjectile",x, y, 4, 8,"#FFFF00")
        this.direction = direction
        this.speed = 8
    }
    update(){
        if (this.direction == "up"){
            this.velocity.y = -this.speed
        }
        this.check_collisions()
        this.move()
        this.out_of_bounds()
    }
    check_collisions(){
        for (let i = 0; i < kinematic_bodies.length;i++){
            if(kinematic_bodies[i].name ==="Enemy" && collide(this,kinematic_bodies[i])){
                kinematic_bodies[i].hit()
                const index = kinematic_bodies.indexOf(this);
                if (index > -1) {
                    kinematic_bodies.splice(index, 1); // 2nd parameter means remove one item only
                }
            }
        }
    }
    out_of_bounds(){
        if (this.rect.x < -32 || this.rect.x > canvas.width+32 || this.rect.y > canvas.height+32 || this.rect.y < -32){
            const index = kinematic_bodies.indexOf(this);
            kinematic_bodies.splice(index, 1);
        }
    }
}

class CSwarmer extends Kinematic{
    constructor(x,y,i_direction){
        super("Enemy", x, y, 16, 16,"#FF0000")
        this.health = 5;
        this.direction = i_direction
        this.speed = 3
        this.animation = new Anim([cswarm_images[0],cswarm_images[1],cswarm_images[2],cswarm_images[1]],true,6)
        this.movement_cooldown = 0
        this.movement_interval = 30
        this.active = false
        this.frame = 0
        this.frame_counter = 0
        this.sprite = this.animation.frames[this.frame]
        enemy_count++;
    }
    draw(){
        if (this.animation.frames[this.frame].img != null){
            ctx.drawImage(this.sprite.img,this.rect.x,this.rect.y,16,16);
            
        }
        else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        }
    }
    update(){
        if (this.active){
            
            this.frame_counter++;
            if (this.frame_counter >= this.animation.speed){
                this.frame++
                if (this.frame >= this.animation.frames.length){
                    this.frame = 0
                }
                
                this.frame_counter = 0;
            }
            this.sprite = this.animation.frames[this.frame]
            this.velocity.y = this.speed
            this.velocity.x = this.speed*this.direction*.5
            this.movement_cooldown -= 1
            if (this.movement_cooldown <= 0){
                this.movement_cooldown = this.movement_interval
                this.direction *= -1
            }
            this.move()
            if(this.rect.y > canvas.height){
                const index = kinematic_bodies.indexOf(this);
                kinematic_bodies.splice(index, 1);
                enemy_count--;
            }
            this.check_collisions()
        }
        else{
            if (this.rect.y > 0-this.rect.height){
                this.active = true
            }
            else{
                this.rect.y += 1
            }
        }
    }
    check_collisions(){
        for (let i = 0; i < kinematic_bodies.length;i++){
            if(kinematic_bodies[i].name ==="Player" && collide(this,kinematic_bodies[i])){
                kinematic_bodies[i].hit()
            }
        }
    }
    hit(){
        if(this.active){
            this.health -= 1
            if (this.health <= 0){
                const index = kinematic_bodies.indexOf(this);
                kinematic_bodies.splice(index, 1);
                total_score += 100
                enemy_count--;
            }
        }
    }
}


class EBullet extends Kinematic{
    constructor(x, y, direction, damage){
        super("EProjectile",x, y, 6, 6,"#FFFF00")
        this.direction = direction+90
        this.damage = damage
        this.speed = 2
        this.sprite = ebullet_sprite
    }
    update(){
        let pi = Math.PI;
        this.velocity.x = this.speed*Math.cos(this.direction*(pi/180))
        this.velocity.y = this.speed*Math.sin(this.direction*(pi/180))
        this.check_collisions()
        this.move()
        this.out_of_bounds()
    }
    out_of_bounds(){
        if (this.rect.x < -32 || this.rect.x > canvas.width+32 || this.rect.y > canvas.height+32 || this.rect.y < -32){
            const index = kinematic_bodies.indexOf(this);
            kinematic_bodies.splice(index, 1);
        }
    }
    draw(){
        if (this.sprite != null){
            ctx.fillStyle = this.color;
            //ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
            ctx.setTransform(1, 0, 0, 1,this.rect.x+this.rect.width/2, this.rect.y+this.rect.height/2)
            ctx.rotate((this.direction-90)*Math.PI/180);
            ctx.drawImage(this.sprite.img,-this.rect.width/2-5,-this.rect.height/2-9);
            ctx.setTransform(1,0,0,1,0,0)
            
        }
        else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        }
    }
    check_collisions(){
        for (let i = 0; i < kinematic_bodies.length;i++){
            if(kinematic_bodies[i].name ==="Player" && collide(this,kinematic_bodies[i])){
                kinematic_bodies[i].hit()
                const index = kinematic_bodies.indexOf(this);
                if (index > -1) {
                    kinematic_bodies.splice(index, 1); // 2nd parameter means remove one item only
                }
            }
        }
    }
}


class SideTurret extends Kinematic{
    constructor(x,y,direction){
        super("Enemy", x, y, 48, 48,"#FF00FF")
        this.health = 16;
        this.direction = direction
        this.speed = 1
        this.shoot_direction = 0;
        this.shoot_speed = 2;
        this.animation = new Anim([turret_images[0]],true,6)
        this.movement_cooldown = 0
        this.active = false
        this.frame = 0
        this.frame_counter = 0
        this.sprite = this.animation.frames[this.frame]
        this.shooting = false
        this.cooldown = 0;
        this.cooldown_time = 7;
        this.angles = 0
        this.max_angles = 5
        this.stop_distance = (canvas.height/5)+getRandomInt(-64,64)
        if(this.direction == "left"){
            this.shoot_speed = -this.shoot_speed
        }
        else if (this.direction == "center"){
            this.shoot_direction = -20
        }
        enemy_count++;
    }
    draw(){
        ctx.fillStyle = this.color;
        //ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        if (this.animation.frames[this.frame].img != null){
            
            ctx.drawImage(this.sprite.img,this.rect.x,this.rect.y,48,48);
            ctx.setTransform(1, 0, 0, 1,this.rect.x+24, this.rect.y+24)
            ctx.rotate(this.shoot_direction*Math.PI/180);
            ctx.drawImage(turret_images[1].img,-24,-24,48,48);
            ctx.setTransform(1,0,0,1,0,0)
        }
        else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        }
    }
    shoot(){
        this.shoot_direction += this.shoot_speed
        if(this.cooldown <= 0){
            new EBullet(this.rect.x+24,this.rect.y+32,this.shoot_direction,1);
            this.cooldown = this.cooldown_time
            this.angles += 1
        }
        if (this.angles >= this.max_angles){
            this.shoot_speed = -this.shoot_speed
            this.angles = 0
        }
        this.cooldown -= 1
            
    }
    update(){
        if (this.active){
            if(this.shooting) this.shoot();
            this.sprite = this.animation.frames[this.frame]
            
            if (this.rect.y < this.stop_distance){
                this.velocity.y = 3
            }
            else{
                this.shooting = true;
                this.velocity.y = 0
            }
            if(this.direction == "left"){
                this.rect.x = 0
            }
            else if (this.direction == "right"){
                this.rect.x = canvas.width - this.rect.width
            }
            else if (this.direction == "center"){
                this.rect.x = canvas.width/2 - this.rect.width/2
            }
            
            this.move()
            if(this.rect.y > canvas.height){
                const index = kinematic_bodies.indexOf(this);
                kinematic_bodies.splice(index, 1);
            }
            
        }
        else{
            if (this.rect.y > 0-this.rect.height){
                this.active = true
            }
            else{
                this.rect.y += 1
            }
        }
    }
    hit(){
        if(this.active){
            this.health -= 1
            if (this.health <= 0){
                const index = kinematic_bodies.indexOf(this);
                kinematic_bodies.splice(index, 1);
                total_score += 500
                enemy_count--;
            }
        }
    }
}
class Skimmer extends Kinematic{
    constructor(x,y,direction){
        super("Enemy", x, y, 16, 16,"#FF00FF")
        this.health = 5;
        this.direction = direction
        this.speed = 4
        this.shoot_direction = 0;
        this.animation = new Anim([skimmer_images[0],skimmer_images[1],skimmer_images[2]],true,6)
        this.movement_cooldown = 0
        this.active = false
        this.frame = 0
        this.frame_counter = 0
        this.sprite = this.animation.frames[this.frame]
        
        this.cooldown = 0;
        this.cooldown_time = 16;
        if(this.direction == "left"){
            this.shoot_speed = -this.shoot_speed
        }
        else if (this.direction == "center"){
            this.shoot_direction = -20
        }
        enemy_count++;
    }
    draw(){
        ctx.fillStyle = this.color;
        //ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        if (this.animation.frames[this.frame].img != null){
            if(this.direction == "left")
                ctx.drawImage(this.sprite.img,this.rect.x,this.rect.y,16,16);
            else {
                ctx.setTransform(-1,0,0,1,0,0)
                ctx.drawImage(this.sprite.img,-this.rect.x,this.rect.y,16,16);
                ctx.setTransform(1,0,0,1,0,0)
            }
        }
        else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
        }
    }
    check_collisions(){
        for (let i = 0; i < kinematic_bodies.length;i++){
            if(kinematic_bodies[i].name ==="Player" && collide(this,kinematic_bodies[i])){
                kinematic_bodies[i].hit()
            }
        }
    }
    shoot(){
        if(this.cooldown <= 0){
            new EBullet(this.rect.x+24,this.rect.y+32,this.shoot_direction,1);
            this.cooldown = this.cooldown_time
        }
        this.cooldown -= 1
    }
    update(){
        if (this.active){
            this.shoot()
            this.sprite = this.animation.frames[this.frame]
            this.frame_counter++;
            if (this.frame_counter >= this.animation.speed){
                this.frame++
                if (this.frame >= this.animation.frames.length){
                    this.frame = 0
                }
                
                this.frame_counter = 0;
            }
            this.sprite = this.animation.frames[this.frame]

            this.velocity.y = 1
            if(this.direction == "left"){
                this.velocity.x = -this.speed
                this.shoot_direction = 15
            }
            else if (this.direction == "right"){
                this.velocity.x = this.speed
                this.shoot_direction = -15
            }
           
            
            this.move()
            this.check_collisions()
            if (this.rect.x+16 > canvas.width+64){
                this.direction = "left"
            }
            else if (this.rect.x  < -64){
                this.direction = "right"
            }
            if(this.rect.y > canvas.height){
                const index = kinematic_bodies.indexOf(this);
                kinematic_bodies.splice(index, 1);
                enemy_count--;
            }
            
        }
        else{
            if (this.rect.y > 0-this.rect.height){
                this.active = true
            }
            else{
                this.rect.y += 1
            }
        }
    }
    hit(){
        if(this.active){
            this.health -= 1
            if (this.health <= 0){
                const index = kinematic_bodies.indexOf(this);
                kinematic_bodies.splice(index, 1);
                total_score += 300
                enemy_count--;
            }
        }
    }
}