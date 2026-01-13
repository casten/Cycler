import {get_key} from "./claude-key.js";

function claude_type_to_generic_type(type) {
	var type_map = {
		message_start: "general",
		content_block_delta: "update"
	}
	if (type in type_map) {
		return type_map[type];
	}
	return `unknown-${type}`;
}

export const claude = {
	create_request: function create_request(prompt, ctx) {
		//Claude just appends previous messages
		ctx.push({role:"user", content: prompt});
		return {
			url: "https://api.anthropic.com/v1/messages",
			obj: {
		        method: "POST",
		        headers: {'Content-Type': 'application/json',
		    			  'x-api-key': get_key(),
		    			  'anthropic-version': "2023-06-01",
		    			  'anthropic-dangerous-direct-browser-access': true
		    			},
		        body: JSON.stringify({
		            "model":"claude-sonnet-4-5",
				    "max_tokens": 32000,
				    "messages": ctx,
				    "stream": true,
				    "thinking": {
				        "type": "enabled",
				        "budget_tokens": 16000
				    },
				})
		    }
	    };
	},
	process_response: (lines, status_cb, ctx) => {
		var index = 0;
		var response_text = "";
		var result = {
			errors: []
		};
		var datas = [];
		for (index=0;index<lines.length;index+1) {
			if (lines[index] ==""){
				index += 1;
				continue;
			}
			var event_type_line = lines[index]; 
			if (event_type_line.includes("event:")){
				index+=1;
				var data_line = lines[index]; 
				if (!data_line.includes("data:")){
					return result;
				}
				var message_text = data_line.split("data:")[1];
				try {
					var data = JSON.parse(message_text);
					datas.push(data);
				}
				catch (error) {
					result['errors'].push({"location":"data_parsing", error: error});
					return result;				
				}
				if (lines[index+1] != "") { //if we don't see the trailing empty string, wait until we get it to process this response group
					return result;
				}
				index +=1;
				if ("type" in data) {
					if (data['type'] == 'message_stop') {
						result['done'] = true;
					}
				}
				if ("delta" in data) {
					if ("text" in data['delta']){
						status_cb(data['delta']['text']);
						response_text += data['delta']['text'];
					}
					if ("thinking" in data['delta']) {
						status_cb(data['delta']['thinking']);
					}
				}
			}
		}
		if (typeof(response_text) == 'undefined') debugger;
		ctx.push({ role: "assistant", content: response_text});

		result['response_text'] = response_text;
		result['remainder'] = lines.slice(index);
		return result;
	}
}