var scene, camera, renderer;

var waterSurface, waterMesh;
var poolBottom, poolBottomMesh;
var poolWall1, poolWall1Mesh;
var poolWall2, poolWall2Mesh;
var sn;
var clock;
var waterCamera;

init();
animate();

function init() {
    sn = new SimplexNoise();
    scene = new THREE.Scene();
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, .1, 20000);
    camera.position.set(0,1.8,10);
    camera.rotation.x = -0.4;
    scene.add(camera);

    window.addEventListener('resize', function() {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });

    buildSkyBox("skybox1.jpg");

    buildLight();

    buildPlanes();


}

function buildSkyBox(file){
    var skyGeo = new THREE.CubeGeometry(500, 500, 500);
    var matFacesArray = [];
    var skyboxTexture = new THREE.TextureLoader().load( file );;
    //skyboxTexture.mapping = THREE.CubeReflectionMapping;

    for (var i = 0; i < 6; i++){
        matFacesArray.push(new THREE.MeshBasicMaterial({
            map: skyboxTexture,
            side: THREE.BackSide
        }));
    }

    var sky = new THREE.MeshFaceMaterial (matFacesArray);
    var skyBox = new THREE.Mesh(skyGeo, sky );
    scene.add ( skyBox );

}
function buildLight(){
    renderer.setClearColor(new THREE.Color(0, 0, .3));

    var light = new THREE.PointLight(0xffffff, 1);
    light.position.set(0,5,0);
    light.rotation.x = Math.PI/2;
    light.castShadow = true;
    light.target = camera;
    scene.add(light);
}

function buildPlanes(){

    waterCamera = new THREE.CubeCamera(1, 5000, 1024);
    waterCamera.position.set(0,10,0);
    scene.add(waterCamera);

    waterSurface = new THREE.PlaneGeometry(6,6,100,100);
    var waterMaterial = new THREE.MeshPhongMaterial({
        vertexColors: THREE.VertexColors,
        color: 0xffffff,
        shading: THREE.SmoothShading,
        transparent: true,
        opacity: .7,
        emissive: 0x111111,
        envMap: waterCamera.renderTarget.texture
    });

    waterMesh = new THREE.Mesh(waterSurface, waterMaterial);
    waterMesh.rotation.x = Math.PI * -.5;
    waterMesh.rotation.z = Math.PI * -.25;
    waterMesh.position.y = -1.25;
    scene.add(waterMesh);

    waterCamera.position = waterMesh.position;

    // load a texture, set wrap mode to repeat
    var pool_texture = new THREE.TextureLoader().load( "pool_texture.jpg" );
    pool_texture.mapping = THREE.UVMapping;
    pool_texture.wrapS = THREE.RepeatWrapping;
    pool_texture.wrapT = THREE.RepeatWrapping;
    pool_texture.repeat.set( 4, 4 );

    /*FIXME*/
        // load a texture, set wrap mode to repeat
        var pool_wall_texture = new THREE.TextureLoader().load( "pool_wall_texture2.jpg" );
        pool_wall_texture.mapping = THREE.UVMapping;
        pool_wall_texture.anisotropic =
        pool_wall_texture.wrapS = THREE.RepeatWrapping;
        pool_wall_texture.wrapT = THREE.RepeatWrapping;
        pool_wall_texture.repeat.set( 2, 2 );

    poolBottom = new THREE.PlaneGeometry(6,6,25,25);

    var bottomMaterial = new THREE.MeshPhongMaterial({
        map: pool_texture,
        // vertexColors: THREE.FaceColors,
        // color: 0xAAAAAA,
        shading: THREE.SmoothShading
    });

    poolBottomMesh = new THREE.Mesh(poolBottom, bottomMaterial);
    poolBottomMesh.rotation.x = Math.PI * -.5;
    poolBottomMesh.rotation.z = Math.PI * -.25;
    poolBottomMesh.position.y = -2.5;
    scene.add(poolBottomMesh);

    poolWall1 = new THREE.PlaneGeometry(1.5,6,5,25);
    poolWall2 = new THREE.PlaneGeometry(1.5,6,25,5);
    var wallMaterial = new THREE.MeshPhongMaterial({
        map: pool_wall_texture,
        // vertexColors: THREE.FaceColors,
        // color: 0x888888,
        shading: THREE.SmoothShading
    });

    poolWall1Mesh = new THREE.Mesh(poolWall1, wallMaterial);
    poolWall2Mesh = new THREE.Mesh(poolWall2, wallMaterial);
    poolWall1Mesh.rotation.z = Math.PI * -.5;
    poolWall1Mesh.rotation.y = Math.PI * -.25;
    poolWall2Mesh.rotation.z = Math.PI * -.5;
    poolWall2Mesh.rotation.y = Math.PI * .25;

    poolWall1Mesh.position.set(2.1,-1.75,-2.1);
    poolWall2Mesh.position.set(-2.1,-1.75,-2.1);
    scene.add(poolWall1Mesh);
    scene.add(poolWall2Mesh)

    waterMesh.geometry.dynamic = true;
}

function updateWaves(){
    var delta = clock.getDelta();
    var vertices = waterMesh.geometry.vertices;
    var faces = waterMesh.geometry.faces;

    for(var i = 0; i < vertices.length; i++){
        var scale = .7;
        var smallScale = 5;
        var inverseScale = .1;
        var waveSpeed = .6;

        var z = sn.noise3d(vertices[i].x*scale, vertices[i].y*scale, waveSpeed * clock.getElapsedTime());

        var zz = sn.noise3d(vertices[i].y*smallScale, vertices[i].x*smallScale, waveSpeed * clock.getElapsedTime());

        var value = z/10 + zz/60;

        waterMesh.geometry.vertices[i].z = value;

        var colorValue = value*5 + .5;
    }
    waterMesh.geometry.verticesNeedUpdate = true;
    waterMesh.geometry.computeFaceNormals();
    waterMesh.geometry.computeVertexNormals();

    waterCamera.updateCubeMap(renderer, scene);
}

function animate() {
    setTimeout( function(){
        requestAnimationFrame(animate);
    }, 1000/30);

    updateWaves();

    renderer.render(scene, camera);
}
