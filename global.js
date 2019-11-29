var scene, camera, renderer, controls, domEvents;
var mat_master, mat_caries, mat_damaged, mat_missing, mat_golden, mat_highlight, mat_selected, mat_screw;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var touch = new THREE.Vector2();

var sphere_model;
var screws =[];

var composer, outlinePassHighlight, outlinePassSelected, effectFXAA, effectVignette;

// initiating modelState with listenable implementation
modelState = {
    numMeshesLoadedInternal: 0,
    numMeshesLoadedListener: function(val) {},
    set numMeshesLoaded(val) {
      this.numMeshesLoadedInternal = val;
      this.numMeshesLoadedListener(val);
    },
    get numMeshesLoaded() {
      return this.numMeshesLoadedInternal;
    },
    registerListener: function(listener) {
      this.numMeshesLoadedListener = listener;
    }
  }