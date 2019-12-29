// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

import { EffectComposer } from './three.js-master/EffectComposer.js';
import { RenderPass } from './three.js-master/RenderPass.js';
import { ShaderPass } from './three.js-master/ShaderPass.js';
import { OutlinePass } from './three.js-master/OutlinePass.js';
import { FXAAShader } from './three.js-master/FXAAShader.js';
import { VignetteShader } from './three.js-master/VignetteShader.js';

function initViews() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x424a57);
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.shadowMap.type = THREE.PCFShadowMap;
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.01,
		10000
	);
	camera.lookAt(new THREE.Vector3(0, 0, -0.05));
	camera.position.set(0.15, 0.02, -0.3);

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
};


// importing cubemaps

var t_albedo = new THREE.TextureLoader().load("./assets/models/teeth/Albedo.jpg");
var t_normal = new THREE.TextureLoader().load("./assets/models/teeth/Normal.jpg");
var t_roughness = new THREE.TextureLoader().load("./assets/models/teeth/Roughness.jpg");

var t_bone_albedo = new THREE.TextureLoader().load("./assets/models/teeth/bone_Albedo.jpg");
var t_bone_normal = new THREE.TextureLoader().load("./assets/models/teeth/bone_Normal.jpg");
var t_bone_roughness = new THREE.TextureLoader().load("./assets/models/teeth/bone_Roughness.jpg");

var r = "./assets/maps/";
var urls = [r + "px.png", r + "nx.png",
	r + "py.png", r + "ny.png",
	r + "pz.png", r + "nz.png"
];

var textureCube = new THREE.CubeTextureLoader().load(urls);
textureCube.format = THREE.RGBFormat;

// Matreials
mat_master = new THREE.MeshStandardMaterial({
	// color: new THREE.Color(0x96de8e),
	map: t_albedo,
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
	envMap: textureCube,
	needsUpdate: true,
	envMapIntensity: 1,
	side: THREE.DoubleSide,
	vertexColors: THREE.VertexColors, //for polypainting
});
mat_master_withoutVertexColor = new THREE.MeshStandardMaterial({
	// color: new THREE.Color(0x96de8e),
	map: t_albedo,
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
	envMap: textureCube,
	needsUpdate: true,
	envMapIntensity: 1,
	side: THREE.DoubleSide,
});
mat_upperGum = new THREE.MeshStandardMaterial({
	// color: new THREE.Color(0x96de8e),
	map: t_albedo,
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
	envMap: textureCube,
	needsUpdate: true,
	envMapIntensity: 1,
	transparent: true,
	side: THREE.DoubleSide
});
mat_lowerGum = new THREE.MeshStandardMaterial({
	// color: new THREE.Color(0x96de8e),
	map: t_albedo,
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
	envMap: textureCube,
	needsUpdate: true,
	envMapIntensity: 1,
	transparent: true,
	side: THREE.DoubleSide
});
mat_caries = new THREE.MeshStandardMaterial({
	color: new THREE.Color(0xa3a379),
	map: t_albedo,
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(8, 8),
	roughnessMap: t_roughness,
});
mat_damaged = new THREE.MeshStandardMaterial({
	color: new THREE.Color(0xd4c200),
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
});
mat_missing = new THREE.MeshStandardMaterial({
	// color: new THREE.Color(0xb5000f),
	map: t_albedo,
	metalness: 0,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
	transparent: true,
	opacity: 0.0,
	depthWrite: false
});
mat_golden = new THREE.MeshStandardMaterial({
	color: new THREE.Color(0xffe380),
	metalness: 1,
	normalMap: t_normal,
	normalScale: new THREE.Vector2(1, 1),
	roughnessMap: t_roughness,
	envMap: textureCube,
	envMapIntensity: 1.25,
});

mat_screw = new THREE.MeshStandardMaterial({
	color: new THREE.Color(0xffffff),
	metalness: 1,
	roughness: 0.3,
	envMap: textureCube,
	envMapIntensity: 1.25,
	side: THREE.DoubleSide
});
mat_upperBone = new THREE.MeshStandardMaterial({
	map: t_bone_albedo,
	metalness: 0,
	roughness: 0.6,
	normalMap: t_bone_normal,
	roughnessMap: t_bone_roughness,
	roughness: 1.2,
	envMap: textureCube,
	envMapIntensity: 1,
	transparent: true,
});
mat_lowerBone = new THREE.MeshStandardMaterial({
	map: t_bone_albedo,
	metalness: 0,
	roughness: 0.6,
	normalMap: t_bone_normal,
	roughnessMap: t_bone_roughness,
	roughness: 1.2,
	envMap: textureCube,
	envMapIntensity: 1,
	transparent: true,
});

// Loading External Mesh

function initModel() {
	var loader = new THREE.OBJLoader();
	loader.load(
		"./assets/models/teeth/bottom_teeth_offset.obj",
		function (object) {
			lower_teeth_model = new THREE.Group();
			for (var i = 0; i < object.children.length; i++) {
				var buffGeo = object.children[i].geometry;
				var geo = new THREE.Geometry().fromBufferGeometry(buffGeo);
				geo.mergeVertices();

				// initializing the vertex colors with empty colors
				for (var j = 0; j < geo.faces.length; j++) {
					var face = geo.faces[j];
					face.vertexColors[0] = new THREE.Color();
					face.vertexColors[1] = new THREE.Color();
					face.vertexColors[2] = new THREE.Color();
				}

				var mesh = new THREE.Mesh(geo, mat_master);

				mesh.requiredMaterial = mat_master;
				mesh.name = object.children[i].name;
				mesh.material = mesh.requiredMaterial;
				mesh.toothDossier = {
					name: object.children[i].name,
					status: "healthy",
					statusDetailsAvailable: false,
					statusDetails: {},
					parodontitis: {
						1: '0',
						2: '0',
						3: '0',
						4: '0',
						5: '0',
						6: '0'
					}
				}
				lower_teeth_model.add(mesh);
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

	loader.load(
		"./assets/models/teeth/upper_teeth_offset.obj",
		function (object) {
			upper_teeth_model = new THREE.Group();
			for (var i = 0; i < object.children.length; i++) {
				var buffGeo = object.children[i].geometry;
				var geo = new THREE.Geometry().fromBufferGeometry(buffGeo);
				geo.mergeVertices();

				// initializing the vertex colors with empty colors
				for (var j = 0; j < geo.faces.length; j++) {
					var face = geo.faces[j];
					face.vertexColors[0] = new THREE.Color();
					face.vertexColors[1] = new THREE.Color();
					face.vertexColors[2] = new THREE.Color();
				}

				var mesh = new THREE.Mesh(geo, mat_master);

				mesh.requiredMaterial = mat_master;
				mesh.name = object.children[i].name;
				mesh.material = mesh.requiredMaterial;
				mesh.toothDossier = {
					name: object.children[i].name,
					status: "healthy",
					statusDetailsAvailable: false,
					statusDetails: {},
					parodontitis: {
						1: '0',
						2: '0',
						3: '0',
						4: '0',
						5: '0',
						6: '0'
					}
				}
				upper_teeth_model.add(mesh);
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

	loader.load(
		"./assets/models/teeth/lower_gum_offset3.obj",
		function (object) {
			var buffGeo = object.children[0].geometry;
			var geo = new THREE.Geometry().fromBufferGeometry(buffGeo);
			geo.mergeVertices();
			lower_gum_model = new THREE.Mesh(geo, mat_lowerGum);

			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

	loader.load(
		"./assets/models/teeth/upper_gum_offset.obj",
		function (object) {
			var buffGeo = object.children[0].geometry;
			var geo = new THREE.Geometry().fromBufferGeometry(buffGeo);
			geo.mergeVertices();
			upper_gum_model = new THREE.Mesh(geo, mat_upperGum);
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

	// importing inplant teeth
	loader.load(
		"./assets/models/teeth/lower_implant_teeth.obj",
		function (object) {
			lower_implant_teeth_model = object;
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].material = mat_master_withoutVertexColor;
				object.children[i].visible = false;
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);
	loader.load(
		"./assets/models/teeth/upper_implant_teeth.obj",
		function (object) {
			upper_implant_teeth_model = object;
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].material = mat_master_withoutVertexColor;
				object.children[i].visible = false;
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

	loader.load(
		"./assets/models/teeth/screw_up_big_fat.obj",
		function (object) {
			screw_up_model = object;
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].material = mat_screw;
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);
	loader.load(
		"./assets/models/teeth/screw_down_big_fat.obj",
		function (object) {
			screw_down_model = object;
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].material = mat_screw;
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

	// importing bones
	loader.load(
		"./assets/models/teeth/upper_bone.obj",
		function (object) {
			upper_bone_model = object;
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].material = mat_upperBone;
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);
	loader.load(
		"./assets/models/teeth/lower_bone3.obj",
		function (object) {
			lower_bone_model = object;
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].material = mat_lowerBone;
			}
			modelState.numMeshesLoaded++;

		},
		function (xhr) {},
		function (error) {
			console.log(error.target);
			console.log('An error happened');

		}
	);

}


function initLights() {
	// Lights
	var topLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.7);
	topLight.position.set(0, 10, 0);

	var leftLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.3);
	leftLight.position.set(-100, 0, 20);

	var rightLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 50%, 75%)'), 0.3);
	rightLight.position.set(100, 0, 100);

	var frontLight_r = new THREE.DirectionalLight(0xffffff, 0.5);
	frontLight_r.position.set(100, 0, -75).normalize();

	var frontLight_l = new THREE.DirectionalLight(0xffffff, 0.5);
	frontLight_l.position.set(-100, 0, -75).normalize();

	var ambLight = new THREE.AmbientLight(0x404040, 1);

	scene.add(topLight);
	scene.add(leftLight);
	scene.add(rightLight);
	scene.add(frontLight_r);
	scene.add(frontLight_l);
	scene.add(ambLight);

	var axesHelper = new THREE.AxesHelper(5);
	// scene.add( axesHelper );
}


// initiating
initViews();
initModel();
initLights();

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target = new THREE.Vector3(0, 0, -0.05);
domEvents = new THREEx.DomEvents(camera, renderer.domElement);

// postprocessing
composer = new EffectComposer(renderer);
var renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

outlinePassHighlight = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePassSelected = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

outlinePassHighlight.edgeStrength = 2;
outlinePassHighlight.edgeGlow = 0.5;
outlinePassHighlight.edgeThickness = 1;
outlinePassHighlight.pulsePeriod = 0;
outlinePassHighlight.visibleEdgeColor = new THREE.Color(0xffffff);
outlinePassHighlight.hiddenEdgeColor = new THREE.Color(0x190a05);
composer.addPass(outlinePassHighlight);

outlinePassSelected.edgeStrength = 4;
outlinePassSelected.edgeGlow = 0.5;
outlinePassSelected.edgeThickness = 1.5;
outlinePassSelected.pulsePeriod = 2;
outlinePassSelected.visibleEdgeColor = new THREE.Color(0x85ff54);
outlinePassSelected.hiddenEdgeColor = new THREE.Color(0x0c1708);
composer.addPass(outlinePassSelected);

effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(effectFXAA);

effectVignette = new ShaderPass(VignetteShader);
// effectFXAA.uniforms[ 'offset' ].value.set(1);
// effectFXAA.uniforms[ 'darkness' ].value.set(1);
composer.addPass(effectVignette);




function animate() {
	requestAnimationFrame(animate);

	controls.update();
	TWEEN.update();
	// renderer.render( scene, camera );
	composer.render();

}
animate();