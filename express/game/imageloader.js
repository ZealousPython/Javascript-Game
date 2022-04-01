
let canvas = $("#canvas")[0];
let ctx = canvas.getContext('2d');
let gaming = false
let died = false
var loader = new PxLoader()
player_image_paths = ["game/media/idle.png","game/media/left.png","game/media/right.png"]
cswarm_paths = ["game/media/CSwarmer/CSwarmer1.png","game/media/CSwarmer/CSwarmer2.png","game/media/CSwarmer/CSwarmer3.png"]
turret_paths = ["game/media/Turret/Turret1.png","game/media/Turret/Turret2.png"]
skimmer_paths = ["game/media/Skimmer/Skimmer1.png","game/media/Skimmer/Skimmer2.png","game/media/Skimmer/Skimmer3.png"]
player_images = []
cswarm_images = []
turret_images = []
skimmer_images = []

ebullet_sprite = new PxLoaderImage("game/media/EBullet.png")
function load_images_from_path(images){
    let return_list = []
    for (let i = 0; i < images.length;i++){
        var pxImage = new PxLoaderImage(images[i])
        return_list.push(pxImage)
        loader.add(pxImage);
    }
    return return_list
}

player_images = load_images_from_path(player_image_paths)
cswarm_images = load_images_from_path(cswarm_paths)
turret_images = load_images_from_path(turret_paths)
skimmer_images = load_images_from_path(skimmer_paths)
loader.add(ebullet_sprite)
loader.start();



loader.addCompletionListener(()=>{
    requestAnimationFrame(gameloop)
})