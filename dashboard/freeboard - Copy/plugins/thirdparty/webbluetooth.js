(function() {
	freeboard.loadDatasourcePlugin({
		"type_name": "bluetooth_client",
		"display_name": "Bluetooth Client",
		"description": "A Bluetooth client",
		"external_scripts": [
			"js/bower_components.min.js",
		],
		"settings": [{
			"name": "device",
			"display_name": "Device name",
			"type": "text",
			"description": "Bluetooth Device Name",
			"required": true
		},{
			"name": "refresh_time",
			"display_name": "Refresh time",
			"type": "number",
			"default_value": 500,
		}, ],
		// **newInstance(settings, newInstanceCallback, updateCallback)** (required) : A function that will be called when a new instance of this plugin is requested.
		// * **settings** : A javascript object with the initial settings set by the user. The names of the properties in the object will correspond to the setting names defined above.
		// * **newInstanceCallback** : A callback function that you'll call when the new instance of the plugin is ready. This function expects a single argument, which is the new instance of your plugin object.
		// * **updateCallback** : A callback function that you'll call if and when your datasource has an update for freeboard to recalculate. This function expects a single parameter which is a javascript object with the new, updated data. You should hold on to this reference and call it when needed.
		newInstance: function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new webBluetoothClientPlugin(settings, updateCallback));
		}
	});
	var optionalServices = ["alert_notification", "automation_io", "battery_service", "blood_pressure",
	    "body_composition","bond_management","continuous_glucose_monitoring","current_time","cycling_power",
	"cycling_speed_and_cadence", "device_information", "environmental_sensing", "generic_access", "generic_attribute",
	"glucose", "health_thermometer", "heart_rate", "human_interface_device", "immediate_alert", "indoor_positioning",
	"internet_protocol_support", "link_loss", "location_and_navigation", "next_dst_change", "phone_alert_status",
	"pulse_oximeter", "reference_time_update", "running_speed_and_cadence", "scan_parameters", "tx_power",
	"user_data", "weight_scale"];

	var characteristics = ["aerobic_heart_rate_lower_limit", "aerobic_heart_rate_upper_limit", "aerobic_threshold", 
	"age", "aggregate", "alert_category_id", "alert_category_id_bit_mask", "alert_level", 
	"alert_notification_control_point", "alert_status", "altitude", "anaerobic_heart_rate_lower_limit", 
	"anaerobic_heart_rate_upper_limit", "anaerobic_threshold", "analog", "apparent_wind_direction", 
	"apparent_wind_speed", "gap.appearance", "barometric_pressure_trend", "battery_level", "blood_pressure_feature", 
	"blood_pressure_measurement", "body_composition_feature", "body_composition_measurement", "body_sensor_location", 
	"bond_management_control_point", "bond_management_feature", "boot_keyboard_input_report", 
	"boot_keyboard_output_report", "boot_mouse_input_report", "gap.central_address_resolution_support", 
	"cgm_feature", "cgm_measurement", "cgm_session_run_time", "cgm_session_start_time", 
	"cgm_specific_ops_control_point", "cgm_status", "csc_feature", "csc_measurement", "current_time", 
	"cycling_power_control_point", "cycling_power_feature", "cycling_power_measurement", "cycling_power_vector", 
	"database_change_increment", "date_of_birth", "date_of_threshold_assessment", "date_time", "day_date_time", 
	"day_of_week", "descriptor_value_changed", "gap.device_name", "dew_point", "digital", "dst_offset", "elevation", 
	"email_address", "exact_time_256", "fat_burn_heart_rate_lower_limit", "fat_burn_heart_rate_upper_limit", 
	"firmware_revision_string", "first_name", "five_zone_heart_rate_limits", "floor_number", "gender", 
	"glucose_feature", "glucose_measurement", "glucose_measurement_context", "gust_factor", "hardware_revision_string", 
	"heart_rate_control_point", "heart_rate_max", "heart_rate_measurement", "heat_index", "height", "hid_control_point", 
	"hid_information", "hip_circumference", "humidity", "ieee_11073-20601_regulatory_certification_data_list", 
	"indoor_positioning_configuration",  "intermediate_temperature", "irradiance", 
	"language", "last_name", "latitude", "ln_control_point", "ln_feature", "local_east_coordinate.xml", 
	"local_north_coordinate", "local_time_information", "location_and_speed", "location_name", "longitude", 
	"magnetic_declination", "magnetic_flux_density_2D", "magnetic_flux_density_3D", "manufacturer_name_string", 
	"maximum_recommended_heart_rate", "measurement_interval", "model_number_string", "navigation", "new_alert", 
	"gap.peripheral_preferred_connection_parameters", "gap.peripheral_privacy_flag", "plx_continuous_measurement", 
	"plx_features", "plx_spot_check_measurement", "pnp_id", "pollen_concentration", "position_quality", "pressure", 
	"protocol_mode", "rainfall", "gap.reconnection_address", "record_access_control_point", 
	"reference_time_information", "report", "report_map", "resting_heart_rate", "ringer_control_point", 
	"ringer_setting", "rsc_feature", "rsc_measurement", "sc_control_point", "scan_interval_window", 
	"scan_refresh", "sensor_location", "serial_number_string", "gatt.service_changed", "software_revision_string", 
	"sport_type_for_aerobic_and_anaerobic_thresholds", "supported_new_alert_category", "supported_unread_alert_category",
	 "system_id", "temperature", "temperature_measurement", "temperature_type", "three_zone_heart_rate_limits", 
	 "time_accuracy", "time_source", "time_update_control_point", "time_update_state", "time_with_dst", "time_zone", 
	 "true_wind_direction", "true_wind_speed", "two_zone_heart_rate_limit", "tx_power_level", "uncertainty", 
	 "unread_alert_status", "user_control_point", "user_index", "uv_index", 
	"vo2_max", "waist_circumference", "weight", "weight_measurement", "weight_scale_feature", "wind_chill"]
	//"intermediate_blood_pressure",
	var characteristicsSet = {};
	var characteristicuuids  = characteristics.map(s => BluetoothUUID.getCharacteristic(s));
	
	for(var i = 0, len = characteristicuuids.length; i < len; i++){
		characteristicsSet[characteristicuuids[i]] = characteristics[i];
	}


	var webBluetoothClientPlugin = function(settings, updateCallback) {
		// Always a good idea...
		var self = this;
		var bluetoothDevice = null;
		var currentSettings = settings;
		var oldSettings = settings;
		var homeState = {
			state: {
				reported: {},
				desired: {}
			},
			connected: false
		};
		var panesLoaded = {};
		var col = [1, 1],
			row = [
				[9, 5],
				[9, 5, 5]
			];
		var homeStateNew = homeState.state;


		function clientDisconnect() {
			if (!bluetoothDevice) {
			    return;
			}
			console.log('Disconnecting from Bluetooth Device...');
			if (bluetoothDevice.gatt.connected) {
			    bluetoothDevice.gatt.disconnect();
			} else {
			    console.log('> Bluetooth Device is already disconnected');
			}
		}

		function clientConnect() {
			clientDisconnect();
			console.log("Try to connect a new client.");
			creatBLEClient(currentSettings);
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			oldSettings = newSettings;
		};

		self.updateNow = function() {
			if (bluetoothDevice) {
				console.log("Always in connected state!");
			} else {
				document.querySelector('#connect').addEventListener('click', function() {
				    if (isWebBluetoothEnabled()) {
				      //ChromeSamples.clearLog();
				      //onButtonClick();
				      clientConnect();
				    }
				});	
			}
		};

		self.onDispose = function() {};

		self.send = function(datasource, value) {
			var re = /\[\"([\w\_\-\$]+)\"\]/g;
			var msg2send = {};
			var match;
			var msg = "";
			var match_cnt = 0;
			var last_match;
			console.log(datasource);
			var thing = re.exec(datasource)[1];
			if (thing === "connected") { // Connect or disconnect
				if (value) {
					clientConnect();
				} else {
					clientDisconnect();
				}
			} else if (thing === "state") {
				while ((match = re.exec(datasource))) {
					last_match = match[1];
					msg += '{' + '"' + last_match + '":';
					match_cnt += 1;
					console.log("cnt" + match_cnt);
				}
				msg += value.toString();
				do {
					msg += '}';
					match_cnt--;
				} while (match_cnt);
				msg2send = JSON.parse(msg);
				msg = JSON.stringify(msg2send);
				client.sendMessage(msg);

			}
			updateCallback(homeState);
		};

		function isWebBluetoothEnabled() {
		    if (navigator.bluetooth) {
		      return true;
		    } else {
		      alert('Web Bluetooth API is not available.\n' +
		          'Please make sure the "Experimental Web Platform features" flag is enabled.');
		      return false;
		    }
		}

		function creatBLEClient(settings) {


			
			optionalServices = optionalServices.map(s => s.startsWith('0x') ? parseInt(s) : s).filter(s => s && BluetoothUUID.getService);
			return navigator.bluetooth.requestDevice( {
				filters: [ {
					name: settings.device
				} ],
				optionalServices: optionalServices
			} )
			.then( device =>  {
				console.log("start connect")
				bluetoothDevice = device; 
				bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
				return bluetoothDevice.gatt.connect();
			} )
			.then( server =>  {
				console.log('Getting Services...');
				return server.getPrimaryServices();
			} )
			.then( services => {
				
				homeStateNew.reported[settings.device] = {};
				homeState.connected = true;
				updateCallback(homeState);
				getHomeState();

			    console.log('Getting Characteristics...');
		    	let queue = Promise.resolve();
			    services.forEach(service => {
			      queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
			        console.log('> Service: ' + service + service.uuid);
			        let queue2 = Promise.resolve();
			        characteristics.forEach(characteristic => {
			        	if (characteristic.properties.notify === true){
			        		queue2 = queue2.then(_ =>characteristic.startNotifications().then(
			        			_ => {
			        					characteristic.addEventListener('characteristicvaluechanged', handleNotifyChanged);
			        				}
			        			)
			        		);
			        	}else{
				        	if (service.uuid === "0000180a-0000-1000-8000-00805f9b34fb"){
				        		homeStateNew.reported[settings.device]["deviceInfo"] = {};
				        		let decoder = new TextDecoder('utf-8');
				        		switch (characteristic.uuid) {
				    				case BluetoothUUID.getCharacteristic('manufacturer_name_string'):
				        				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				        					homeStateNew.reported[settings.device]["deviceInfo"]["manufacturer_name_string"] = decoder.decode(value);
				        				});
				    				break;

				    				case BluetoothUUID.getCharacteristic('model_number_string'):
				        				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				        					homeStateNew.reported[settings.device]["deviceInfo"]["model_number_string"] = decoder.decode(value);
				        				});
				    				break;

				    				case BluetoothUUID.getCharacteristic('hardware_revision_string'):
				        				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				        					homeStateNew.reported[settings.device]["deviceInfo"]["hardware_revision_string"] = decoder.decode(value);
				        				});
				        				break;

				    				case BluetoothUUID.getCharacteristic('firmware_revision_string'):
				        				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				        					homeStateNew.reported[settings.device]["deviceInfo"]["firmware_revision_string"] = decoder.decode(value);
				        				});
				    				break;

				    				case BluetoothUUID.getCharacteristic('software_revision_string'):
				        				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				        					homeStateNew.reported[settings.device]["deviceInfo"]["software_revision_string"] = decoder.decode(value);
				        				});
				    				break;

				    				case BluetoothUUID.getCharacteristic('system_id'):
				        				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				            				console.log('> System ID: ');
				            				homeStateNew.reported[settings.device]["deviceInfo"]["system_manufacturer_id"] = padHex(value.getUint8(4)) + 
				            					padHex(value.getUint8(3)) + padHex(value.getUint8(2)) + padHex(value.getUint8(1)) + padHex(value.getUint8(0));
				                			homeStateNew.reported[settings.device]["deviceInfo"]["system_organizationally_id"] = padHex(value.getUint8(7)) + 
				            					padHex(value.getUint8(6)) + padHex(value.getUint8(5));
				          				});
				    				break;

				    				case BluetoothUUID.getCharacteristic('ieee_11073-20601_regulatory_certification_data_list'):
				          				queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
				            				console.log('> IEEE 11073-20601 Regulatory Certification Data List: ' +
				                				decoder.decode(value));
				          				});
				    				break;

					    			case BluetoothUUID.getCharacteristic('pnp_id'):
					        			queue2 = queue2.then(_ => characteristic.readValue()).then(value => {
					            			homeStateNew.reported[settings.device]["deviceInfo"]["vendor_id_source"] = (value.getUint8(0) === 1 ? 'Bluetooth' : 'USB');
					            			if (value.getUint8(0) === 1) {
					            				homeStateNew.reported[settings.device]["deviceInfo"]["vendor_id"] = (value.getUint8(1) | value.getUint8(2) << 8);

					            			} else {
					            				homeStateNew.reported[settings.device]["deviceInfo"]["vendor_id"] = getUsbVendorName(value.getUint8(1) | value.getUint8(2) << 8);
					            			}
					            			homeStateNew.reported[settings.device]["deviceInfo"]["product_id"] = (value.getUint8(3) | value.getUint8(4) << 8);
					            			homeStateNew.reported[settings.device]["deviceInfo"]["product_version"] = (value.getUint8(5) | value.getUint8(6) << 8);
					        			});
					    			break;
					    			default: console.log('> Unknown Characteristic: ' + characteristic.uuid);
				        			}

				        	}else {
				        		homeStateNew.reported[settings.device][service.uuid] = {};
				        		//let decoder = new TextDecoder('utf-8');
				        		

				        		homeStateNew.reported[settings.device][service.uuid][characteristic.uuid] = getSupportedProperties(characteristic);
				        		showdata();
				        	}
			        	}

			        });
			        return queue2
			      }));
			    });
			    return queue;
			})
			.catch(error => { 
				console.log(error); 
				setTimeout(function() {
					freeboard.loadDashboard(BlueToothConfig);
					freeboard.setEditing(false);
				}, 1000);
			});
		}

		function getSupportedProperties(characteristic) {
		  let supportedProperties = [];
		  for (const p in characteristic.properties) {
		    if (characteristic.properties[p] === true) {
		      supportedProperties.push(p.toUpperCase());
		    }
		  }
		  console.log(supportedProperties);
		  return supportedProperties.join(",")
		}
		function showdata(){
			var receiveDevice, receiveService, receiveCharacteristic;
			for (receiveDevice in homeStateNew.reported) {
				if (homeStateNew.reported[receiveDevice] === null) {
					//delete UI
				} else {
					console.log(panesLoaded[receiveDevice])
					if (homeState.state.reported[receiveDevice] === undefined || panesLoaded[receiveDevice] === undefined) { //&&
							//add UI
							
						for (receiveService in homeStateNew.reported[receiveDevice]) {
							if (receiveService === "deviceInfo") {
								var pane = {};
								var widgets = [];
								var widget = {};
								pane.title = receiveService;
								pane.width = 1;
								pane.col_width = 1;
								pane.row = {
									"1": row[0][0] + row[0][1] - 5,
									"2": row[0][col[0]],
									"3": row[1][col[1]]
								};
								pane.col = {
									"1": 1,
									"2": col[0] + 1,
									"3": col[1] + 1
								};

								for (receiveCharacteristic in homeStateNew.reported[receiveDevice][receiveService]) {
									widget.type = "text_widget";
									widget.settings = {
										"title": receiveCharacteristic,
										"size": "regular",
										"value": 'datasources["' + ["lan", "state", "reported", receiveDevice, receiveService, receiveCharacteristic].join('"]["') + '"]',
										"animate": true
									};
									row[0][col[0]] += 2;
									row[1][col[1]] += 2;
									widgets.push(widget);
									widget = {};
								}
								pane.widgets = widgets;
								freeboard.addPane(pane);
								col[0] += 1;
								col[0] %= 2;
								col[1] += 1;
								col[1] %= 3;
								panesLoaded[receiveDevice] = true;
							}else{
								var pane = {};
								var widgets = [];
								var widget = {};
								pane.title = characteristicsSet[receiveService];
								pane.width = 1;
								pane.col_width = 1;
								pane.row = {
									"1": row[0][0] + row[0][1] - 5,
									"2": row[0][col[0]],
									"3": row[1][col[1]]
								};
								pane.col = {
									"1": 1,
									"2": col[0] + 1,
									"3": col[1] + 1
								};

								for (receiveCharacteristic in homeStateNew.reported[receiveDevice][receiveService]) {
									console.log(receiveService + ":" +receiveCharacteristic )
									widget.type = "text_widget";
									if (characteristicsSet[receiveService] === "battery_level"){
										widget.type = "gauge";
									}
									widget.settings = {
										"title": receiveService,
										"size": "regular",
										"value": 'datasources["' + ["lan", "state", "reported", receiveDevice, receiveService, receiveCharacteristic].join('"]["') + '"]',
										"animate": true
									};
									row[0][col[0]] += 2;
									row[1][col[1]] += 2;
									widgets.push(widget);
									widget = {};
								}
								pane.widgets = widgets;
								freeboard.addPane(pane);
								col[0] += 1;
								col[0] %= 2;
								col[1] += 1;
								col[1] %= 3;
								panesLoaded[receiveDevice] = true;
							}

						}
						
					}
					
				}
			}
			for (key in homeStateNew) {
				if (homeState.state[key] === undefined) {
					homeState.state[key] = {};
				}
				for (receiveDevice in homeStateNew[key]) {
					if (homeStateNew[key][receiveDevice] === null) {
						homeState.state[key][receiveDevice] = undefined;
					} else {
						if (homeState.state[key][receiveDevice] === undefined) {
							homeState.state[key][receiveDevice] = {};
						}
						for (receiveService in homeStateNew[key][receiveDevice]) {
							if (homeState.state[key][receiveDevice][receiveService] === undefined) {
								homeState.state[key][receiveDevice][receiveService] = {};
							}
							for (receiveCharacteristic in homeStateNew[key][receiveDevice][receiveService]) {
								homeState.state[key][receiveDevice][receiveService][receiveCharacteristic] = homeStateNew[key][receiveDevice][receiveService][receiveCharacteristic];
							}
						}
					}
				}
			}
			updateCallback(homeState);
		}

		function onDisconnected(event) {
			homeState.connected = false;
			updateCallback(homeState);
			console.log("Web socket closed");
		}

		function handleNotifyChanged(e) {
			var receiceUuid = event.target.uuid
			var characteristicValue = event.target.value.getUint8(0);
			homeStateNew.reported[settings.device][receiceUuid] = {"value": characteristicValue};//["value"] = characteristicValue;
			var receiveDevice, receiveService, receiveCharacteristic;
			for (receiveDevice in homeStateNew.reported) {
				if (homeStateNew.reported[receiveDevice] === null) {
					//delete UI
				} else {
					console.log(panesLoaded[receiveDevice])
					if (homeState.state.reported[receiveDevice] === undefined || panesLoaded[receiveDevice] === undefined) { //&&
							//add UI
							
						for (receiveService in homeStateNew.reported[receiveDevice]) {
							if (receiveService === "deviceInfo") {
								var pane = {};
								var widgets = [];
								var widget = {};
								pane.title = receiveService;
								pane.width = 1;
								pane.col_width = 1;
								pane.row = {
									"1": row[0][0] + row[0][1] - 5,
									"2": row[0][col[0]],
									"3": row[1][col[1]]
								};
								pane.col = {
									"1": 1,
									"2": col[0] + 1,
									"3": col[1] + 1
								};

								for (receiveCharacteristic in homeStateNew.reported[receiveDevice][receiveService]) {
									widget.type = "text_widget";
									widget.settings = {
										"title": receiveCharacteristic,
										"size": "regular",
										"value": 'datasources["' + ["lan", "state", "reported", receiveDevice, receiveService, receiveCharacteristic].join('"]["') + '"]',
										"animate": true
									};
									row[0][col[0]] += 2;
									row[1][col[1]] += 2;
									widgets.push(widget);
									widget = {};
								}
								pane.widgets = widgets;
								freeboard.addPane(pane);
								col[0] += 1;
								col[0] %= 2;
								col[1] += 1;
								col[1] %= 3;
								panesLoaded[receiveDevice] = true;
							}else{
								var pane = {};
								var widgets = [];
								var widget = {};
								pane.title = characteristicsSet[receiveService];
								pane.width = 1;
								pane.col_width = 1;
								pane.row = {
									"1": row[0][0] + row[0][1] - 5,
									"2": row[0][col[0]],
									"3": row[1][col[1]]
								};
								pane.col = {
									"1": 1,
									"2": col[0] + 1,
									"3": col[1] + 1
								};

								for (receiveCharacteristic in homeStateNew.reported[receiveDevice][receiveService]) {
									widget.type = "text_widget";
									if (characteristicsSet[receiveService] === "battery_level"){
										widget.type = "gauge";
									}
									widget.settings = {
										"title": "",
										"size": "regular",
										"value": 'datasources["' + ["lan", "state", "reported", receiveDevice, receiveService, receiveCharacteristic].join('"]["') + '"]',
										"animate": true
									};
									row[0][col[0]] += 2;
									row[1][col[1]] += 2;
									widgets.push(widget);
									widget = {};
								}
								pane.widgets = widgets;
								freeboard.addPane(pane);
								col[0] += 1;
								col[0] %= 2;
								col[1] += 1;
								col[1] %= 3;
								panesLoaded[receiveDevice] = true;
							}

						}
						
					}
					
				}
			}
			for (key in homeStateNew) {
				if (homeState.state[key] === undefined) {
					homeState.state[key] = {};
				}
				for (receiveDevice in homeStateNew[key]) {
					if (homeStateNew[key][receiveDevice] === null) {
						homeState.state[key][receiveDevice] = undefined;
					} else {
						if (homeState.state[key][receiveDevice] === undefined) {
							homeState.state[key][receiveDevice] = {};
						}
						for (receiveService in homeStateNew[key][receiveDevice]) {
							if (homeState.state[key][receiveDevice][receiveService] === undefined) {
								homeState.state[key][receiveDevice][receiveService] = {};
							}
							for (receiveCharacteristic in homeStateNew[key][receiveDevice][receiveService]) {
								homeState.state[key][receiveDevice][receiveService][receiveCharacteristic] = homeStateNew[key][receiveDevice][receiveService][receiveCharacteristic];
							}
						}
					}
				}
			}
			updateCallback(homeState);
		}

		function getHomeState() {
			if (bluetoothDevice.gatt.connected) {

				//////////////////////client.sendMessage("{}");
			}
		}
	};
}());