/**
 * @author mrdoob / http://mrdoob.com/
 */

function DaydreamController() {

	var state = null;
	var myCharacteristic;

	function connect() {

		return navigator.bluetooth.requestDevice( {
			filters: [ {
				name: 'embARC'
			} ],
			optionalServices: [ 0x180f ]
		} )
		.then( function ( device ) {
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
		/*.then( function ( characteristic ) {
		  // Set up event listener for when characteristic value changes.
		  console.log("Set up event listene")
		  characteristic.addEventListener('characteristicvaluechanged',
		                                  handleBatteryLevelChanged);
		  // Reading Battery Level...
		  //return characteristic.readValue();
		} )*/
		.catch(function (error) { console.log(error); });

	}


	function handleBatteryLevelChanged(event) {
	    console.log("message comes")
	    let batteryLevel = event.target.value.getUint8(0);
	    console.log('Battery percentage is ' + batteryLevel);
	    state = batteryLevel
	    onStateChangeCallback( state );
	}


	function onDisconnected(event) {
	  let device = event.target;
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
