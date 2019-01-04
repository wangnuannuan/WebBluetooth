(function() {
    var THREE_ID = 0;
    var dataString = '{"heading": 3, "roll": 2, "pitch": 2, "temp": 126,"quatX": 0, "quatY": 0, "quatZ": 1, "quatW": 1,"calSys": 3,"calGyro": 3,"calAccel": 3, "calMag": 3 }';
    var dataJson = JSON.parse(dataString);
    var key;
    var threeWidgetSettings = [{
        "name": "title",
        "display_name": "Title",
        "type": "text"
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

    for (key in dataJson) {
        var dataSource = {
            "name": key,
            "display_name": key,
            "type": "calculated"
        }
        threeWidgetSettings.push(dataSource);
    }

    freeboard.loadWidgetPlugin({
        "type_name": "three",
        "display_name": "Three.js to show 3D model",
        "description": "Three.js to show 3D model",
        "external_scripts":[
            "thirdlib/js/jquery-2.1.4.min.js",
            "thirdlib/js/three.min.js",
            "thirdlib/js/DDSLoader.js",
            "thirdlib/js/MTLLoader.js",
            "thirdlib/js/OBJMTLLoader.js",
            "thirdlib/js/OBJLoader.js",
            "thirdlib/js/STLLoader.js",
            "thirdlib/js/bootstrap.min.js",
        ],
        "settings": threeWidgetSettings,
        newInstance: function(settings, newInstanceCallback) {
            newInstanceCallback(new threejsWidgetPlugin(settings));
        }
    });

    var threejsWidgetPlugin = function(settings) {
        var self = this;
        var thisWidgetId = "three-" + THREE_ID++;
        var titleElement = $('<div class="container"></div>');
        var stateElement = $('<div class="indicator-text"></div>');
        var currentSettings = settings;
        var isOn = false;
        var onText=currentSettings.on_text;
        var offText=currentSettings.off_text;

        function updateState() {
            indicatorElement.toggleClass("on", isOn);

            if (isOn=='true') {
                stateElement.text((_.isUndefined(onText) ? (_.isUndefined(currentSettings.on_text) ? "" : currentSettings.on_text) : onText));
            } else {
                stateElement.text((_.isUndefined(offText) ? (_.isUndefined(currentSettings.off_text) ? "" : currentSettings.off_text) : offText));
            }
        }


        this.onClick = function(e) {
            e.preventDefault()

            if (currentSettings.callback && (currentSettings.callback.trim() !== "")) {
                var new_val = !isOn;
                this.onCalculatedValueChanged('value', new_val);
                this.sendValue(currentSettings.callback, new_val);
            }
        }


        this.render = function(element) {
            $(element).append(titleElement).append(indicatorElement).append(stateElement);
            $(indicatorElement).click(this.onClick.bind(this));
            indicatorElement.attr("id", "test");

        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
            updateState();
        }

        this.onCalculatedValueChanged = function(settingName, newValue) {
            if (settingName == "value") {
                isOn = newValue;
            }
          

            updateState();
        }

        this.onDispose = function() {}

        this.getHeight = function() {
            return 1;
        }

        this.onSettingsChanged(settings);
    };

}());