(function() {
    var THREE_ID = 0;
    var dataString = '{"heading": "3", "roll": "2", "pitch": "2", "temp": "126","quatX": "0", "quatY": "0", "quatZ": "1", "quatW": "1","calSys": "3","calGyro": "3","calAccel": "3", "calMag": "3" }';
    var dataJson = JSON.parse(dataString);

    var threeWidgetSettings = [{
        "name": "title",
        "display_name": "Title",
        "type": "text"
      },{
        "name": "height",
        "display_name": "Height Blocks",
        "type": "number",
        "default_value": 6,
        "description": "A height block is around 60 pixels"
      },{
        "name": "obj",
        "display_name": "The path of obj model",
        "default_value": "img/bunny.obj",
        "type": "text"
      },{
        "name": "mtl",
        "display_name": "The path of mtl model",
        "default_value": "img/bunny.mtl",
        "type": "text"    
      },{
        "name": "stl",
        "display_name": "The path of stl model",
        "default_value": "img/cat-top.stl",
        "type": "text"    
    }];
    for (settingkey in dataJson) {
      var dataSource = {
          "name": settingkey,
          "display_name": settingkey,
          "default_value": dataJson[settingkey],
          "type": "calculated"
      };
      threeWidgetSettings.push(dataSource);
    }
    var threeWidget = function (settings) {
        var self = this;
        var threeElement =$('<div class="container"><div id="renderer"></div>'+
            '<div id="controls"><div class="col-sm-4"><h6>Orientation (degrees):</h6>' +
            '<p>Heading = <span id="heading">0</span></p><p>Roll = <span id="roll">0</span></p><p>' + 
            'Pitch = <span id="pitch">0</span></p></div><div class="col-sm-4"><h6>Calibration:</h6><p>' + 
            '(0=uncalibrated, 3=fully calibrated)</p><p>System = <span id="calSys">0</span></p><p>' + 
            'Gyro = <span id="calGyro">0</span></p><p>Accelerometer = <span id="calAccel">0</span></p>' + 
            '<p>Magnetometer = <span id="calMag">0</span></p></div></div>'
            + '</div>');
        var currentSettings = settings;
        function createWidget() {
            var models = [
              {
                name: 'Bunny',
                load: function(model) {

                  objMTLLoader.load(
                    currentSettings.obj,
                    currentSettings.mtl,
                    function(object) {
                      var geom = object.children[1].geometry;
                      // Rebuild geometry normals because they aren't loaded properly.
                      geom.computeFaceNormals();
                      geom.computeVertexNormals();
                      // Build bunny mesh from geometry and material.
                      model.model = new THREE.Mesh(geom, material);
                      // Move the bunny so it's roughly in the center of the screen.
                      model.model.position.y = -4;
                    }
                  );
                }
              },
              {
                name: 'Cat Statue',
                load: function(model) {
                  stlLoader.load(
                    currentSettings.stl,
                    function(geometry) {
                      // Regenerate normals because they aren't loaded properly.
                      geometry.computeFaceNormals();
                      geometry.computeVertexNormals();
                      // Load the model and build mesh.
                      model.model = new THREE.Mesh(geometry, material);
                      // Rotate, scale, and move so the cat is facing out the screen.
                      model.model.rotation.x = -90 * (Math.PI / 180.0);
                      model.model.scale.set(0.15, 0.15, 0.15);
                      model.model.position.y = -4;
                    }
                  );
                }
              },
              {
                name: 'XYZ Axes',
                load: function(model) {
                  // Build some cylinders and rotate them to form a cross of the XYZ axes.
                  model.model = new THREE.Group();
                  var xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 32, 32),
                                                 material);
                  xAxis.rotation.z = 90.0*(Math.PI/180.0);
                  model.model.add(xAxis);
                  var yAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 32, 32),
                                                 material);
                  model.model.add(yAxis);
                  var zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 32, 32),
                                                 material);
                  zAxis.rotation.x = 90.0*(Math.PI/180.0);
                  model.model.add(zAxis);
                }
              }
            ];
            threeElement.css('height', '100%');
            threeElement.css('width', '100%');
            $('.col-sm-4').css({"float": "left"});
            var sceneWidth = threeElement.width()*0.6;
            var sceneHeight = threeElement.height()*2.7;
            console.log(currentSettings.obj)


            var offset = null;
            var orientation = null;
            var objMTLLoader = new THREE.OBJMTLLoader();
            var stlLoader = new THREE.STLLoader();
            var currentModel = null;

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.1, 1000);
            // Start with the camera moved back a bit to look directly at the origin.
            camera.position.z = 10;

            // Setup Three.js WebGL renderer and add it to the page.
            var renderer = new THREE.WebGLRenderer();
            renderer.setSize(sceneWidth, sceneHeight);
            renderer.setClearColor(0xff0000, 0);
            $('#renderer').append(renderer.domElement);
            $('#renderer canvas').addClass('center-block');  // Center the renderer.

            // Create white material for the models.
            var material = new THREE.MeshPhongMaterial({ color: 0xffffff });

            // Setup 3 point lighting with a red and blue point light in upper left
            // and right corners, plus a bit of backlight from the rear forward.
            var pointLight1 = new THREE.PointLight(0xffbbbb, 0.6);
            pointLight1.position.set(40, 15, 40);
            scene.add(pointLight1);
            var pointLight2 = new THREE.PointLight(0xbbbbff, 0.6);
            pointLight2.position.set(-40, 15, 40);
            scene.add(pointLight2);
            var backLight = new THREE.DirectionalLight(0xffff, 0.3);
            backLight.position.set(0, -0.25, -1);
            scene.add(backLight);

            // Create a couple groups to apply rotations to the 3D model at different
            offset = new THREE.Group();
            orientation = new THREE.Group();
            offset.add(orientation);
            scene.add(offset);


            // Main rendering function.
            function render() {
              requestAnimationFrame(render);
              // Switch to the first model once it's loaded.
              if (currentModel === null) {
                if (models[0].hasOwnProperty('model')) {
                  console.log("show model 0")
                  currentModel = 0;
                  orientation.add(models[0].model);
                }
              }
              // Update the orientation with the last BNO sensor reading quaternion.
              if (currentSettings !== null) {
               orientation.quaternion.set(Number(currentSettings.quatX), Number(currentSettings.quatY), Number(currentSettings.quatZ), Number(currentSettings.quatW));
              }
              renderer.render(scene, camera);
            }

            render();

            $.each(models, function(index, model) {
              // Populate drop-down.
              $('#model').append($("<option />").val(index).text(model.name));
              // Kick off loading the model.
              model.load(model);
            });

        }
        this.render = function (element) {
            $(element).append(threeElement);
            createWidget();
            $('#heading').text(currentSettings.heading);
            $('#roll').text(currentSettings.roll);
            $('#pitch').text(currentSettings.pitch);
            $('#calSys').text(currentSettings.calSys);
            $('#calGyro').text(currentSettings.calGyro);
            $('#calAccel').text(currentSettings.calAccel);
            $('#calMag').text(currentSettings.calMag);
        }

        this.onSettingsChanged = function (newSettings) {
          console.log(".onSettingsChanged")
            currentSettings = newSettings;
            createWidget();
            console.log(currentSettings)
            $('#heading').text(currentSettings.heading);
            $('#roll').text(currentSettings.roll);
            $('#pitch').text(currentSettings.pitch);
            $('#calSys').text(currentSettings.calSys);
            $('#calGyro').text(currentSettings.calGyro);
            $('#calAccel').text(currentSettings.calAccel);
            $('#calMag').text(currentSettings.calMag);
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
          console.log("onCalculatedValueChanged")
          console.log(settingName + ": " + newValue)
          createWidget()
            if (dataJson[settingName]) {
                $('#' + settingName).text(newValue);
            }
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return Number(currentSettings.height);
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        "type_name": "three.js",
        "display_name": "Three.js to show 3D model",
        "description": "Three.js to show 3D model",
        "fill_size": true,
        "external_scripts": [
            "thirdlib/three.min.js",
            "thirdlib/DDSLoader.js",
            "thirdlib/MTLLoader.js",
            "thirdlib/OBJMTLLoader.js",
            "thirdlib/OBJLoader.js",
            "thirdlib/STLLoader.js",
            "thirdlib/bootstrap.min.js",
        ],
        "settings": threeWidgetSettings,
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new threeWidget(settings));
        }
    });
}());