
function knockoutType(baseType) {
	this.baseType = baseType;

	// knockout types
	this.observable = `${baseType} observable`;
	this.observableArray = `${baseType} observableArray`;
	this.computed = `${baseType} computed`;

	return this;
}


// ex: types.get(prop) === types.number
ko.types = ko.types || {
	get: function(prop) {
		return Object.prototype.toString.call(prop);
	},
	getType: function(prop) {
		if (typeof prop === "object") {
			return prop.baseType;
		}
		else {
			return prop;
		}
	},
	getFormatted: function(prop, errorCallback) {
		var typeAsString;
		if (typeof prop === "object") {
			typeAsString = prop.baseType;
		}
		else {
			typeAsString = prop;
		}

		if (typesValues.indexOf(typeAsString) === -1) {
			errorCallback();
			return "Unsupported Type";
		}
		
		return typeAsString.match(/(?:\[\w+ )?(\w+)\]?/i)[1];
	},
	object: new knockoutType('[object Object]'),
	date: new knockoutType('[object Date]'),
	dateTime: new knockoutType('DateTime'),
	array: new knockoutType('[object Array]'),
	string: new knockoutType('[object String]'),
	boolean: new knockoutType('[object Boolean]'),
	number: new knockoutType('[object Number]'),
	function: new knockoutType('function'),
	json: new knockoutType('JSON'),
	html: new knockoutType('HTML'),
	innerHtml: new knockoutType('InnerHTML'),
	css: new knockoutType('CSS')
};


Object.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

var typesValues = Object.values(Object.flatten(ko.types));


window.paramAsText = function(property) {
	if (property === undefined) {
		return "undefined";
	}
	
	if (ko.types.get(property) === ko.types.number) {
		return property;
	}
	
	return JSON.stringify(property);
}


function Generator() {};
Generator.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
Generator.prototype.getId = function() { return 'uniqueID_' + this.rand++; };
window.idGen = new Generator();




// Create uniqueID and run function
// pass a function that accepts the params (element, allBindings, viewModel, bindingContext)
ko.bindingHandlers.uniqueIdFunction = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		// bind a unique ID
		var uniqueID = idGen.getId();
		$(element).attr("id", uniqueID);
		
		ko.unwrap(valueAccessor)().fn(element, valueAccessor, allBindings, viewModel, bindingContext);
    } 
};

ko.bindingHandlers.addUniqueID = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var uniqueID = idGen.getId();
		$(element).attr("id", uniqueID);
		valueAccessor()(uniqueID);
	}
};

ko.bindingHandlers.clipboard = {
	init: function(el, valueAccessor, allBindings, data, context) {
		new Clipboard(el, {
			text: function(trigger) {
				if (typeof valueAccessor === "function") { // ko.unwrap wont work here
					return valueAccessor();
				}
				return valueAccessor;
			}
		}).on('success', function(e) {
			$(e.trigger).addClass("btn-success").find("span")
				.removeClass("glyphicon-copy")
				.addClass("glyphicon-ok");
			setTimeout(function(){
				$(e.trigger).removeClass("btn-success").find("span")
					.addClass("glyphicon-copy")
					.removeClass("glyphicon-ok");
			}, 750);
		});
	}
};

window.codeEditorFunction = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	var bindingParams = ko.utils.unwrapObservable(valueAccessor());
	
	if (bindingParams.mode === "json") {
		bindingParams.mode = { name: "javascript", json: true };
	}
	
	if (bindingParams.readOnly === undefined) {
		bindingParams.readOnly = false;
	}
	
	var myCodeMirror = CodeMirror.fromTextArea(element, {
		lineNumbers: true,
		mode: bindingParams.mode,
		readOnly: bindingParams.readOnly,
		lineWrapping: true,
		indentWithTabs: true,
		matchBrackets: true,
		theme: "mdn-like"
	});
	
	myCodeMirror.on("change", function(cm, change) {
		// update the value binding with the codemirror changes
		if (viewModel.textBinding !== undefined) {
			viewModel.textBinding(cm.getValue());
		}
	});
};


require("./knockout-documentation-search.js");
require("./knockout-component-preview.js");
require("./random-sample-component.js");


$(document).ready(function(){
	var pageVM = {
		selectedComponent: ko.observable()
	};

	ko.applyBindings(pageVM);
});
