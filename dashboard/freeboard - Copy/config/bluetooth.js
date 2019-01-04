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
						"title": "connect status",
						"value": "datasources[\"lan\"][\"connected\"]",
						"callback": "datasources[\"lan\"][\"connected\"]",
						"on_text": "CONNECTED",
						"off_text": "DISCONNECTED"
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