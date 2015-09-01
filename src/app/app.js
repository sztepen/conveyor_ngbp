angular.module('ngBoilerplate', [
    'templates-app',
    'templates-common',
    'ngBoilerplate.home',
    'ngBoilerplate.about',
    'ui.router'
])

    .config(function myAppConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
    })

    .run(function run() {
    })

    .controller('AppCtrl', function AppCtrl($scope, $location) {


        // Set up the scene, camera, and renderer as global variables.
        var container;
        var raycaster = new THREE.Raycaster();
        var scene, camera, renderer;
        var projector, mouse = {x: 0, y: 0}, INTERSECTED;
        var jumboelement;

        var PREVPLANEPOSITION = {};

        var plane = {};

        var offset = new THREE.Vector3(),
            SELECTED;

        var objects = [];

        function getDimensions()
        {
            var style = {};
            if (jumboelement) {
                style = window.getComputedStyle(jumboelement, null);
            }

            var WIDTH = style.getPropertyValue("width").replace("px", ""),
                HEIGHT = style.getPropertyValue("height").replace("px", "");

            return {Height: HEIGHT, Width: WIDTH};


        }

        // Sets up the scene.
        function init() {


            // Create the scene and set the scene size.
            scene = new THREE.Scene();
            jumboelement = document.getElementById("canvas-space");
            container = jumboelement;
            var style = {};
            if (jumboelement) {
                style = window.getComputedStyle(jumboelement, null);
            }

            var WIDTH = style.getPropertyValue("width").replace("px", ""),
                HEIGHT = style.getPropertyValue("height").replace("px", "");

            // Create a renderer and add it to the DOM.
            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(WIDTH, HEIGHT);
            if (jumboelement) {
                jumboelement.appendChild(renderer.domElement);
            }

            // Create a camera, zoom it out from the model a bit, and add it to the scene.
            camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
            camera.position.set(0, 6, 0);
            scene.add(camera);

            // Create an event listener that resizes the renderer with the browser window.
            window.addEventListener('resize', function () {
                var style = {};
                if (jumboelement) {
                    style = window.getComputedStyle(jumboelement, null);
                }

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

            light.position.set(-100, 200, 100);
            scene.add(light);


            var light2 = new THREE.PointLight(0xffffff);
            light2.position.set(100, -200, -100);
            scene.add(light2);

            var light3 = new THREE.AmbientLight(0x404040); // soft white light
            scene.add(light3);

            // Load in the mesh and add it to the scene.
            var loader = new THREE.JSONLoader();
            loader.load("assets/models/kabinaxx.json", function (geometry) {

                var material = new THREE.MeshLambertMaterial({color: 0x55B663});
                mesh = new THREE.Mesh(geometry, material);
                mesh.traverse(function (node) {
                    if (node.material) {
                        node.material.side = THREE.DoubleSide;
                    }
                });
                mesh.name = "old mesh";
                scene.add(mesh);
                objects.push(mesh);

            });

            loader.load("assets/models/kabinaxx.json", function (geometry) {

                var material = new THREE.MeshLambertMaterial({color: 0x55B663});
                var newmesh = new THREE.Mesh(geometry, material);
                newmesh.traverse(function (node) {
                    if (node.material) {
                        node.material.side = THREE.DoubleSide;
                    }
                });

                newmesh.name = "new mesh";
                scene.add(newmesh);
                newmesh.position.set(2, 2, 2);
                objects.push(newmesh);
            });


            // FLOOR
            var floorTexture = new THREE.ImageUtils.loadTexture('assets/images/grid.png');
            floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
            floorTexture.repeat.set(10, 10);
            var floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture, side: THREE.DoubleSide});
            var floorGeometry = new THREE.PlaneGeometry(100, 100, 10,10);
            var floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = -0.5;
            floor.rotation.x = Math.PI / 2;
            floor.name = "floor. this is floor";
            scene.add(floor);
            plane = floor;

            // Add OrbitControls so that we can pan around with the mouse.
            controls = new THREE.OrbitControls(camera, renderer.domElement);

            // initialize object to perform world/screen calculations
            projector = new THREE.Projector();



            renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
            renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
            renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

        }



        /*function getIntersected() {
            // find intersections
            // create a Ray with origin at the mouse position
            //   and direction into the scene (camera direction)
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, camera);
            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            // create an array containing all objects in the scene with which the ray intersects
            var intersects = ray.intersectObjects(scene.children);
            // INTERSECTED = the object in the scene currently closest to the camera
            //    and intersected by the Ray projected from the mouse position

            // if there is one (or more) intersections
            if (intersects.length > 0) {
                controls.enabled = false;
                // if the closest object intersected is not the currently stored intersection object
                if (intersects[0].object != INTERSECTED) {
                    // restore previous intersection object (if it exists) to its original color
                    if (INTERSECTED) {
                        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                    }
                    // store reference to closest object as current intersection object
                    INTERSECTED = intersects[0].object;
                    // store color of closest object (for later restoration)
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    // set a new color for closest object
                    INTERSECTED.material.color.setHex(0xffff00);
                }
            }

            else // there are no intersections
            {
                // restore previous intersection object (if it exists) to its original color
                if (INTERSECTED) {
                    INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                }
                // remove previous intersection object reference
                //     by setting current intersection object to "nothing"
                INTERSECTED = null;
            }

            return INTERSECTED;
        }*/

        function onDocumentMouseMove(event) {
            // the following line would stop any other event handler from firing
            // (such as the mouse's TrackballControls)
            // event.preventDefault();
            var intersects ={};
            // update the mouse variable
            var rect = jumboelement.getBoundingClientRect();
            var rc = {
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: rect.height
            };
            var dimensions = getDimensions();
            mouse.x = ( (event.clientX - rc.x) / dimensions.Width ) * 2 - 1;
            mouse.y = -( (event.clientY - rc.y) / dimensions.Height ) * 2 + 1;

            //

            raycaster.setFromCamera( mouse, camera );

            if ( SELECTED ) {

                planePosition =  intersects = raycaster.intersectObject( plane )[0].point;
                //planePosition.y = 0;


                var offset = PREVPLANEPOSITION.sub(planePosition);
                intersects = raycaster.intersectObject( plane );
                SELECTED.position.copy( SELECTED.position.sub( offset ) );

                PREVPLANEPOSITION =  planePosition;



                return;

            }

            intersects  = raycaster.intersectObjects( objects );

            if ( intersects.length > 0 ) {

                if ( INTERSECTED != intersects[ 0 ].object ) {

                    if ( INTERSECTED ) {INTERSECTED.material.color.setHex( INTERSECTED.currentHex );}

                    INTERSECTED = intersects[ 0 ].object;
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    INTERSECTED.material.color.setHex(0xffff00);

                    //plane.position.copy( INTERSECTED.position );
                   // plane.lookAt( camera.position );

                }

                container.style.cursor = 'pointer';

            } else {

                if ( INTERSECTED ) {INTERSECTED.material.color.setHex( INTERSECTED.currentHex );}

                INTERSECTED = null;

                container.style.cursor = 'auto';

            }
        }

        function onDocumentMouseDown( event ) {

            event.preventDefault();

            var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

            var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

            var intersects = raycaster.intersectObjects( objects );

            if ( intersects.length > 0 ) {

                controls.enabled = false;

                SELECTED = intersects[ 0 ].object;

                intersects = raycaster.intersectObject( plane );
             //   offset.copy( intersects[ 0 ].point ).sub( plane.position );

                PREVPLANEPOSITION =  raycaster.intersectObject( plane )[0].point;
                //PREVPLANEPOSITION = 0;

                container.style.cursor = 'move';

            }

        }

        function onDocumentMouseUp( event ) {

            event.preventDefault();

            controls.enabled = true;

            if ( INTERSECTED ) {

              //  plane.position.copy( INTERSECTED.position );

                SELECTED = null;

            }

            container.style.cursor = 'auto';

        }

        function update() {

            //if ( keyboard.pressed("z") )
            //{
            //  // do something
            //}
          //  getIntersected();
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


        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate';

            }
        });

        angular.element(document).ready(function () {
            init();
            animate();
        });

    });

