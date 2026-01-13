export const ollama = {
	create_request: (prompt, ctx) => {
		return {
			url: "http://127.0.0.1:11434/api/generate",
			obj: {
		        method: "POST",
		        headers: {'Content-Type': 'application/json'},
		        body: JSON.stringify({
		            "model":"gpt-oss:20b",
		            "prompt": prompt,
		            "stream":true,
		            "context":ctx[0]
		        })
		    }
	    };
	},
	process_response: (lines, status_cb, ctx)=> {
		var processed = [];
		var response_text = "";
		var result = {};
		for (const line of lines) {
			try {
			    var processed_line = JSON.parse(line);
			}
			catch (error) {
				//drop JSON parse errors for now
				continue;
			}
		    if ("thinking" in processed_line) {
		    	status_cb(processed_line["thinking"]);
		    }
		    if (!processed["done"] && processed_line["response"]){
		        response_text += processed_line["response"];
		    }
		    //Ollama refreshes the context each time, so clear the old and re-set it
		    if ("context" in processed) {
		        ctx.length = 0
		        ctx.push(processed_line["context"]);
		    }
		}
		result["response_text"] = response_text;
		return result;
	}

}