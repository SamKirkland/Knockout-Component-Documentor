// ex: types.get(prop) == types.number
var types = {
	get: function(prop) {
		return Object.prototype.toString.call(prop);
	},
	object: '[object Object]',
	date: '[object Date]',
	dateTime: 'dateTime',
	array: '[object Array]',
	string: '[object String]',
	boolean: '[object Boolean]',
	number: '[object Number]',
	json: 'json',
	css: 'css',
	ko: {
		observable: 'ko observable',
		observableArray: 'ko observableArray'
	}
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
	allParams: {
		description: "Edit javascript or knockout types",
		required: {
			type: {
				description: "A javascript or knockout type. The editor will edit that type",
				type: types.string
			}
		},
		optional: {}
	},
	viewModel: function(params) {
		var vm = this;
		
		vm.valueBinding = params.valueBinding;
		
		vm.type = ko.observableArray([params.type]);
		vm.required = params.required;
		vm.defaultValue = params.defaultValue;
		vm.possibleValues = params.possibleValues || ko.observableArray();
		
		vm.typeChange = function(){
			console.log("!!!!");
		};
		
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
		<div style="background:#babaff;">
			<!-- ko if: type().length > 1 -->
				<select class="selectpicker" data-width="100%" data-show-subtext="true" data-show-subtext="true" data-bind="foreach: type, value: typeChange }">
					<option data-bind="text: $data"></option>
				</select>
			<!-- /ko -->
		</div>
		
		<!-- ko if: possibleValues().length > 0 -->
			<select class="selectpicker" data-width="100%" data-show-subtext="true"
				data-bind="foreach: possibleValues, value: valueBinding, attr: { multiple: type === types.array }">
				
				<option data-bind="attr: { 'data-content': $parent.colorizeData($data), 'value': $data }"></option>
			</select>
		<!-- /ko -->
		<!-- ko if: possibleValues().length === 0 -->
			<!-- ko if: type()[0] === types.date -->
				<input type="date" class="form-control" data-bind="textInput: valueBinding">
			<!-- /ko -->
			<!-- ko if: type()[0] === types.dateTime -->
				<input type="datetime-local" name="bdaytime" data-bind="textInput: valueBinding">
			<!-- /ko -->
			<!-- ko if: type()[0] === types.array -->
				Array editor...
				<textarea class="html" data-bind="textInput: valueBinding, text: '[true,false,true,123]', uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }"></textarea>
			<!-- /ko -->
			<!-- ko if: type()[0] === types.string -->
				<input type="text" class="form-control" data-bind="textInput: valueBinding, value: defaultValue">
			<!-- /ko -->
			<!-- ko if: type()[0] === types.boolean -->
				<div class="radio"><label>
					<input data-bind="checked: valueBinding" type="radio" value="true"> true
				</label></div>
				<div class="radio"><label>
					<input data-bind="checked: valueBinding" type="radio" value="false"> false
				</label></div>
			<!-- /ko -->
			<!-- ko if: type()[0] === types.number -->
				<input type="number" class="form-control" data-bind="textInput: valueBinding">
			<!-- /ko -->
			<!-- ko if: type()[0] === types.object || type()[0] === types.json -->
				<textarea class="html" data-bind="uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }"></textarea>
			<!-- /ko -->
			<!-- ko if: type()[0] === types.ko.observable -->
				<textarea class="html" data-bind="text: 'ko.observable()', uniqueIdFunction: { fn: codeEditorFunction, mode: 'javascript' }"></textarea>
			<!-- /ko -->
			<!-- ko if: type()[0] === types.ko.observableArray -->
				<textarea class="html" data-bind="text: 'ko.observableArray()',uniqueIdFunction: { fn: codeEditorFunction, mode: 'javascript' }"></textarea>
			<!-- /ko -->
		<!-- /ko -->
	`
});
