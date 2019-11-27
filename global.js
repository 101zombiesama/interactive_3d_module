var scene, camera, renderer, controls, domEvents;
var mat_master, mat_caries, mat_damaged, mat_missing, mat_golden, mat_highlight, mat_selected, mat_screw;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var touch = new THREE.Vector2();

var upper_teeth_model;
var lower_teeth_model;
var upper_gum_model;
var lower_gum_model;
var upper_implant_teeth_model;
var lower_implant_teeth_model;
var screw_up_model;
var screw_down_model;

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