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
	bool: '[object Boolean]',
	number: '[object Number]',
	json: 'json',
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
		
		vm.valueBinding = ko.observable();
		
		vm.type = types.get(params.type);
		vm.required = params.required;
		vm.defaultValue = params.defaultValue;
		vm.possibleValues = params.possibleValues;
		
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
			
			return `<span style="color:${color};">${serialized}</span>`;
		};
		
		return vm;
	},
	template: `
		<!-- ko if: type !== types.boolean -->
			POSSIBLE VALUES
			<select class="selectpicker" data-width="100%"
				data-bind="foreach: possibleValues, value: valueBinding, attr: { multiple: type === types.array }">
				
				<option data-bind="attr: { 'data-content': $parent.colorizeData($data), 'data-subtext': $data === $parent.defaultValue ? '*default*' : '' }"></option>
			</select>
		<!-- /ko -->
		ko if: possibleValues === undefined
		
			<!-- ko if: type === types.date -->
				<input type="date" class="form-control">
			<!-- /ko -->
			<!-- ko if: type === types.dateTime -->
				<input type="datetime-local" name="bdaytime">
			<!-- /ko -->
			<!-- ko if: type === types.array -->
				Array editor...
				<textarea class="html" data-bind="text: '[true,false,true,123]', uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }"></textarea>
			<!-- /ko -->
			<!-- ko if: type === types.string -->
				<input type="text" class="form-control" data-bind="value: defaultValue">
			<!-- /ko -->
			<!-- ko if: type === types.boolean -->
				<div class="radio"><label>
					<input type="radio" value="true"> true <span data-bind="text: defaultValue"></span>
				</label></div>
				<div class="radio"><label>
					<input type="radio" value="false"> false <span data-bind="text: defaultValue"></span>
				</label></div>
			<!-- /ko -->
			<!-- ko if: type === types.number -->
				<input type="number" class="form-control">
			<!-- /ko -->
			<!-- ko if: type === types.object || type === types.json -->
				<textarea class="html" data-bind="text: '{test:123}', uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }"></textarea>
			<!-- /ko -->
			<!-- ko if: type === types.ko.observable -->
				<textarea class="html" data-bind="text: 'ko.observable(true)', uniqueIdFunction: { fn: codeEditorFunction, mode: 'javascript' }"></textarea>
			<!-- /ko -->
			<!-- ko if: type === types.ko.observableArray -->
				<textarea class="html" data-bind="text: 'ko.observableArray([])', uniqueIdFunction: { fn: codeEditorFunction, mode: 'javascript' }"></textarea>
			<!-- /ko -->
		/ko
	`
});
