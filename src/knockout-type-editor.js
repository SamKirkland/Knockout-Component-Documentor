// ex: types.get(prop) === types.number
var types = {
	get: function(prop) {
		return Object.prototype.toString.call(prop);
	},
	getFormatted: function(prop, errorCallback) {
		if (typesValues.indexOf(prop) === -1) {
			errorCallback();
			return "Unsupported Type";
		}
		
		return prop.match(/(?:\[\w+ )?(\w+)\]?/i)[1];
	},
	object: '[object Object]',
	date: '[object Date]',
	dateTime: 'DateTime',
	array: '[object Array]',
	string: '[object String]',
	boolean: '[object Boolean]',
	number: '[object Number]',
	function: 'function',
	json: 'JSON',
	html: 'HTML',
	css: 'CSS',
	ko: {
		observable: 'ko observable',
		observableArray: 'ko observableArray'
	}
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

var typesValues = Object.values(Object.flatten(types));


function typeAsText(type) { // returns the original string or returns the second word in brackets
	var found = type.match(/(?:\[\w+ )?(\w+)(?:\])?/i);
	return found[1];
}

function paramAsText(property) {
	if (property === undefined) {
		return "undefined";
	}
	
	if (types.get(property) === types.number) {
		return property;
	}
	
	return JSON.stringify(property);
}

ko.components.register('knockout-type-editor', {
	docs: {
		description: "Edit javascript or knockout types",
		required: {
			type: {
				description: "A javascript or knockout type. The editor will edit that type",
				type: types.string
			}
		},
		optional: {
			optionalParam: {
				description: "description!",
				type: types.string,
				default: "default"
			}
		}
	},
	viewModel: function(params) {
		var vm = this;
		
		vm.valueBinding = params.valueBinding;
		
		vm.required = params.required;
		vm.defaultValue = params.defaultValue;
		vm.possibleValues = params.possibleValues || ko.observableArray();
		
		vm.type = ko.observableArray(params.type);
		vm.typeEditing = params.typeEditing; // default to first item in list
		
		vm.uid = idGen.getId();
		
		vm.checkIfDefault = function (data) {
			return vm.defaultValue === data; // hacky conversion to string. ToDo: fix
		};
		
		vm.colorizeData = function(data) {
			var serialized = paramAsText(data);
			
			switch (types.get(data)) {
				case types.number:
					color = "#831a05";
					break;
					
				case types.string:
					color = "#235712";
					break;
					
				case types.boolean:
					color = "#0d7cca";
					break;
				
				default:
					color = "#bbb";
			}
			
			var isDefault = "";
			if (data === vm.defaultValue) {
				isDefault = `<span style='float:right;margin-right:10px;'>*default*</span>`;
			}
			
			return `<span style='color:${color};'>${serialized}</span>${isDefault}`;
		};
		
		return vm;
	},
	template: `
		<!-- ko if: type().length > 1 -->
			<select data-show-subtext="true" data-show-subtext="true"
				data-bind="foreach: type, value: typeEditing">
				<option data-bind="attr: { value: $data }, text: typeAsText($data)"></option>
			</select>
		<!-- /ko -->
		
		<!-- ko if: possibleValues.length > 0 -->
			<select data-width="100%" data-show-subtext="true"
				data-bind="foreach: possibleValues, value: valueBinding, attr: { multiple: type === types.array }">
				
				<option data-bind="attr: { 'data-content': $parent.colorizeData($data) }, text: $data, 'value': $data"></option>
			</select>
		<!-- /ko -->
		<!-- ko if: possibleValues.length === 0 -->
			<!-- ko if: typeEditing() === types.date -->
				<input type="date" class="form-control" data-bind="textInput: valueBinding">
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.dateTime -->
				<input type="datetime-local" name="bdaytime" data-bind="textInput: valueBinding">
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.array -->
				Array editor...
				<textarea class="html" data-bind="textInput: valueBinding, text: '[true,false,true,123]', uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }"></textarea>
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.string -->
				<input type="text" class="form-control" data-bind="textInput: valueBinding, value: defaultValue">
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.boolean -->
				<div class="radio"><label>
					<input data-bind="attr: { name: uid }, checked: valueBinding" type="radio" value="true" /> true
					<span data-bind="visible: defaultValue === 'true'">*default</span>
				</label></div>
				<div class="radio"><label>
					<input data-bind="attr: { name: uid }, checked: valueBinding" type="radio" value="false" /> false
					<span data-bind="visible: defaultValue === 'false'">*default</span>
				</label></div>
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.number -->
				<input type="number" class="form-control" data-bind="textInput: valueBinding">
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.object || typeEditing() === types.json -->
				<textarea class="html" data-bind="uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }"></textarea>
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.ko.observable -->
				<textarea class="html" data-bind="text: 'ko.observable()', uniqueIdFunction: { fn: codeEditorFunction, mode: 'javascript' }"></textarea>
			<!-- /ko -->
			<!-- ko if: typeEditing() === types.ko.observableArray -->
				<textarea class="html" data-bind="text: 'ko.observableArray()',uniqueIdFunction: { fn: codeEditorFunction, mode: 'javascript' }"></textarea>
			<!-- /ko -->
		<!-- /ko -->
	`
});
