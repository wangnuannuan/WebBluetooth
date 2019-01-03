async function DaydreamController() {

	var state = null;
	var myCharacteristic;

	async function connect() {
		const optionalServices = "alert_notification, automation_io, battery_service, blood_pressure," + 
		    "body_composition, bond_management, continuous_glucose_monitoring, current_time, cycling_power," +  
		    "cycling_speed_and_cadence, device_information, environmental_sensing, generic_access, generic_attribute," + 
		    "glucose, health_thermometer, heart_rate, human_interface_device, immediate_alert, indoor_positioning," +
		    "internet_protocol_support, link_loss, location_and_navigation, next_dst_change, phone_alert_status," +
		    "pulse_oximeter, reference_time_update, running_speed_and_cadence, scan_parameters, tx_power," + 
		    "user_data, weight_scale";

		optionalServices = optionalServices.split(/, ?/).map(s => s.startsWith('0x') ? parseInt(s) : s).filter(s => s && BluetoothUUID.getService);
		try {
			const device = await navigator.bluetooth.requestDevice( {filters: [ {name: 'embARC'} ], optionalServices: optionalServices});
			const server = await device.gatt.connect();
			const services = await server.getPrimaryServices();	
			for (const service of services) {
				const characteristics = await service.getCharacteristics();
				characteristics.forEach(characteristic => {
				    console.log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
					if (characteristic.properties.notify === true){
						var myCharacteristic = await service.getCharacteristic(characteristic.uuid);
						await myCharacteristic.startNotifications();
						myCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
					} else if (service.uuid === "0000180a-0000-1000-8000-00805f9b34fb") {
						const decoder = new TextDecoder('utf-8');
      					switch (characteristic.uuid) {

					        case BluetoothUUID.getCharacteristic('manufacturer_name_string'):
					        	await characteristic.readValue().then(value => {
					           		console.log('> Manufacturer Name String: ' + decoder.decode(value));
					        	});
					        	break;

					        case BluetoothUUID.getCharacteristic('model_number_string'):
					          	await characteristic.readValue().then(value => {
					            	console.log('> Model Number String: ' + decoder.decode(value));
					          	});
					          	break;

					        case BluetoothUUID.getCharacteristic('hardware_revision_string'):
					          	await characteristic.readValue().then(value => {
					            	console.log('> Hardware Revision String: ' + decoder.decode(value));
					          	});
					          	break;

					        case BluetoothUUID.getCharacteristic('firmware_revision_string'):
					          await characteristic.readValue().then(value => {
					            console.log('> Firmware Revision String: ' + decoder.decode(value));
					          });
					          break;

					        case BluetoothUUID.getCharacteristic('software_revision_string'):
					          	await characteristic.readValue().then(value => {
					            	console.log('> Software Revision String: ' + decoder.decode(value));
					          	});
					          	break;

					        case BluetoothUUID.getCharacteristic('system_id'):
					          	await characteristic.readValue().then(value => {
					            	console.log('> System ID: ');
					            	console.log('  > Manufacturer Identifier: ' +
					                	padHex(value.getUint8(4)) + padHex(value.getUint8(3)) +
					                	padHex(value.getUint8(2)) + padHex(value.getUint8(1)) +
					                	padHex(value.getUint8(0)));
					            	console.log('  > Organizationally Unique Identifier: ' +
					                	padHex(value.getUint8(7)) + padHex(value.getUint8(6)) +
					                	padHex(value.getUint8(5)));
					          	});
					          	break;

					        case BluetoothUUID.getCharacteristic('ieee_11073-20601_regulatory_certification_data_list'):
					          	await characteristic.readValue().then(value => {
					            	console.log('> IEEE 11073-20601 Regulatory Certification Data List: ' +
					                	decoder.decode(value));
					          	});
					          	break;

					        case BluetoothUUID.getCharacteristic('pnp_id'):
					          	await characteristic.readValue().then(value => {
					            	console.log('> PnP ID:');
					            	console.log('  > Vendor ID Source: ' +
					                	(value.getUint8(0) === 1 ? 'Bluetooth' : 'USB'));
					            	if (value.getUint8(0) === 1) {
					              	console.log('  > Vendor ID: ' +
					                  	(value.getUint8(1) | value.getUint8(2) << 8));
					            	} else {
					              	console.log('  > Vendor ID: ' +
					                  	getUsbVendorName(value.getUint8(1) | value.getUint8(2) << 8));
					            	}
					            	console.log('  > Product ID: ' +
					                	(value.getUint8(3) | value.getUint8(4) << 8));
					            	console.log('  > Product Version: ' +
					                	(value.getUint8(5) | value.getUint8(6) << 8));
					          	});
					          	break;

					        default: console.log('> Unknown Characteristic: ' + characteristic.uuid);
					      }
					}
				});
			}
		} catch(error) {
    		console.log('Argh! ' + error);
  		}
		/*.then( function ( device ) {
			console.log("start connect")
			device.addEventListener('gattserverdisconnected', onDisconnected);
			return device.gatt.connect();
		} )
		.then( function ( server ) {
			console.log(server)
			return server.getPrimaryService( 0x180f );
		} )
		.then( function ( service ) {
			console.log("hello")
			console.log(service)
			return service.getCharacteristic( 'battery_level' );
		} )
		.then(function (characteristic){
			console.log("start notify")
			myCharacteristic = characteristic;
		    return myCharacteristic.startNotifications().then(_ => {
		      console.log('> Notifications started');
		      myCharacteristic.addEventListener('characteristicvaluechanged',
		          handleBatteryLevelChanged);
		    });
			//return characteristic.startNotifications();
		})
		.then( function ( characteristic ) {
		  // Set up event listener for when characteristic value changes.
		  console.log("Set up event listene")
		  characteristic.addEventListener('characteristicvaluechanged',
		                                  handleBatteryLevelChanged);
		  // Reading Battery Level...
		  //return characteristic.readValue();
		} )*/
		//.catch(function (error) { console.log(error); });

	}
	function getSupportedProperties(characteristic) {
		//if (characteristic.properties.notify === true){;}
	  	const supportedProperties = [];
	    /*console.log('> Characteristic UUID:  ' + characteristic.uuid);
	    console.log('> Broadcast:            ' + characteristic.properties.broadcast);
	    console.log('> Read:                 ' + characteristic.properties.read);
	    console.log('> Write w/o response:   ' +
	      characteristic.properties.writeWithoutResponse);
	    console.log('> Write:                ' + characteristic.properties.write);
	    console.log('> Notify:               ' + characteristic.properties.notify);
	    console.log('> Indicate:             ' + characteristic.properties.indicate);
	    console.log('> Signed Write:         ' +
	      characteristic.properties.authenticatedSignedWrites);
	    console.log('> Queued Write:         ' + characteristic.properties.reliableWrite);
	    console.log('> Writable Auxiliaries: ' +
	      characteristic.properties.writableAuxiliaries);*/
	  	for (const p in characteristic.properties) {
		    if (characteristic.properties[p] === true) {
		      supportedProperties.push(p.toUpperCase());
		    }
	  	}
	  	return '[' + supportedProperties.join(', ') + ']';
	}

	function padHex(value) {
	  return ('00' + value.toString(16).toUpperCase()).slice(-2);
	}

	function getUsbVendorName(value) {
	  // Check out page source to see what valueToUsbVendorName object is.
	  return value +
	      (value in valueToUsbVendorName ? ' (' + valueToUsbVendorName[value] + ')' : '');
	}

	function handleNotifications(event) {
	    console.log("message comes")
	    const batteryLevel = event.target.value.getUint8(0);
	    console.log('Battery percentage is ' + batteryLevel);
	    state = batteryLevel
	    onStateChangeCallback( state );
	}


	function onDisconnected(event) {
	  const device = event.target;
	  console.log('Device ' + device.name + ' is disconnected.');
	}

	function onStateChangeCallback() {}



	return {
		connect: connect,
		onStateChange: function ( callback ) {
			onStateChangeCallback = callback;
		}
	}

}
