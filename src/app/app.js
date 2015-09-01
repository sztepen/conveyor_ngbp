angular.module( 'ngBoilerplate', [
  'templates-app',
  'templates-common',
  'ngBoilerplate.home',
  'ngBoilerplate.about',
  'ui.router'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {


      // Set up the scene, camera, and renderer as global variables.
    var scene, camera, renderer;
  var projector, mouse = { x: 0, y: 0 }, INTERSECTED;



    // Sets up the scene.
    function init() {


      // Create the scene and set the scene size.
      scene = new THREE.Scene();
        var jumboelement = document.getElementById("canvas-space");
        var style ={};
        if (jumboelement){style = window.getComputedStyle(jumboelement, null);}

        var WIDTH = style.getPropertyValue("width").replace("px", ""),
            HEIGHT = style.getPropertyValue("height").replace("px", "");

      // Create a renderer and add it to the DOM.
      renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(WIDTH, HEIGHT);
        if (jumboelement){jumboelement.appendChild(renderer.domElement);}

      // Create a camera, zoom it out from the model a bit, and add it to the scene.
      camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
      camera.position.set(0,6,0);
      scene.add(camera);

      // Create an event listener that resizes the renderer with the browser window.
      window.addEventListener('resize', function() {
          var jumboelement = document.getElementById("canvas-space");
          var style ={};
          if (jumboelement){style = window.getComputedStyle(jumboelement, null);}

          var WIDTH = style.getPropertyValue("width").replace("px", ""),
              HEIGHT = style.getPropertyValue("height").replace("px", "");
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
      });

      // Set the background color of the scene.
      renderer.setClearColor(0x333F47, 1);

      // Create a light, set its position, and add it to the scene.
      var light = new THREE.PointLight(0xffffff);

      light.position.set(-100,200,100);
      scene.add(light);


     var light2 = new THREE.PointLight(0xffffff);
        light2.position.set(100,-200,-100);
      scene.add(light2);

    var light3 = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light3 );

      // Load in the mesh and add it to the scene.
      var loader = new THREE.JSONLoader();
      loader.load( "assets/models/kabinaxx.json", function(geometry){

        var material = new THREE.MeshLambertMaterial({color: 0x55B663});
        mesh = new THREE.Mesh(geometry, material);
    mesh.traverse( function( node ) {
        if( node.material ) {
          node.material.side = THREE.DoubleSide;
        }
      });
      mesh.name = "old mesh";
        scene.add(mesh);

      });

    loader.load( "assets/models/kabinaxx.json", function(geometry){

    var material = new THREE.MeshLambertMaterial({color: 0x55B663});
    var newmesh = new THREE.Mesh(geometry, material);
    newmesh.traverse( function( node ) {
        if( node.material ) {
          node.material.side = THREE.DoubleSide;
        }
      });

    newmesh.name = "new mesh";
    scene.add(newmesh);
    newmesh.position.set(2,2,2);
      });


    // FLOOR
  var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set( 10, 10 );
  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.5;
  floor.rotation.x = Math.PI / 2;
  floor.name = "floor. this is floor";
  scene.add(floor);

      // Add OrbitControls so that we can pan around with the mouse.
      controls = new THREE.OrbitControls(camera, renderer.domElement);

    // initialize object to perform world/screen calculations
  projector = new THREE.Projector();

  // when the mouse moves, call the given function
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // when the mouse clicks call the given function
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    }

  function getIntersected()
  {
    // find intersections
  // create a Ray with origin at the mouse position
  //   and direction into the scene (camera direction)
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );
  var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
  // create an array containing all objects in the scene with which the ray intersects
  var intersects = ray.intersectObjects( scene.children );
  // INTERSECTED = the object in the scene currently closest to the camera
  //    and intersected by the Ray projected from the mouse position

  // if there is one (or more) intersections
  if ( intersects.length > 0 )
  {
    // if the closest object intersected is not the currently stored intersection object
    if ( intersects[ 0 ].object != INTERSECTED )
    {
        // restore previous intersection object (if it exists) to its original color
      if ( INTERSECTED ) {INTERSECTED.material.color.setHex( INTERSECTED.currentHex );}
      // store reference to closest object as current intersection object
      INTERSECTED = intersects[ 0 ].object;
      // store color of closest object (for later restoration)
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      // set a new color for closest object
      INTERSECTED.material.color.setHex( 0xffff00 );
    }
  }

  else // there are no intersections
  {
    // restore previous intersection object (if it exists) to its original color
    if ( INTERSECTED ) {INTERSECTED.material.color.setHex( INTERSECTED.currentHex );}
    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
  }

  return INTERSECTED;
  }

  function onDocumentMouseMove( event )
{
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


function onDocumentMouseDown( event )
{
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  console.log("Click.");

  var intersected = getIntersected();
  //alert(intersected.name);
}



function update()
{

  //if ( keyboard.pressed("z") )
  //{
  //  // do something
  //}
  getIntersected();
  controls.update();
  //stats.update();
}

    // Renders the scene and updates the render as needed.
    function animate() {

      // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
      requestAnimationFrame(animate);

      // Render the scene.
      renderer.render(scene, camera);
      controls.update();
      update();
    }




  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;

    }
  });

        angular.element(document).ready(function () {
            init();
            animate();
        });
})

;

