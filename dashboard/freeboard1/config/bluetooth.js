var BlueToothConfig = {
	"version": 1,
	"allow_edit": true,
	"plugins": [],
	"panes": [
		{
			"title": "connection status",
			"width": 1,
			"row": {
				"1": 5,
				"2": 5,
				"3": 5
			},
			"col": {
				"1": 1,
				"2": 1,
				"3": 1
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "interactive_indicator",
					"settings": {
						"title": "connect",
						"value": "datasources[\"lan\"][\"connected\"]",
						"callback": "datasources[\"lan\"][\"connected\"]",
						"on_text": "",
						"off_text": ""
					}
				}
			]
		},
		{
			"width": 1,
			"row": {
				"3": 1
			},
			"col": {
				"3": 2
			},
			"col_width": 2,
			"widgets": [
				{
					"type": "three.js",
					"settings": {
						"height": 6,
						"obj": "img/bunny.obj",
						"mtl": "img/bunny.mtl",
						"stl": "img/cat-top.stl",
						"heading": "3",
						"roll": "2",
						"pitch": "2",
						"temp": "126",
						"quatX": "0",
						"quatY": "0",
						"quatZ": "0",
						"quatW": "1",
						"calSys": "3",
						"calGyro": "3",
						"calAccel": "3",
						"calMag": "3"
					}
				}
			]
		}
	],
	"datasources": [
		{
			"name": "lan",
			"type": "bluetooth_client",
			"settings": {
				"device": "embARC",
				"refresh_time": 500,
				"name": "lan"
			}
		}
	],
	"columns": 3	
}