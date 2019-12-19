var scene, camera, renderer, controls, domEvents;

var mat_master, mat_caries, mat_damaged, mat_missing, mat_golden, mat_highlight, mat_selected, mat_screw, mat_upperGum,
    mat_lowerGum, mat_lowerBone, mat_upperBone;

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
var upper_bone_model;
var lower_bone_model;

var isImplantMode = false;
var sculptMode = false;
var paintMode = false;
var sculptPush = true;
var paintPaint = true;

var sculptStrength = -0.000125;

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