require("./knockout-type-editor.scss");

ko.components.register('knockout-type-editor', {
	docs: {
		description: "Edit javascript or knockout types",
		tags: ["internal for knockout-component-documentor"],
		category: "Knockout Component Documentor",
		required: {
			type: {
				description: "A javascript or knockout type. The editor will edit that type",
				type: ko.types.string
			}
		},
		optional: {
			optionalParam: {
				description: "description!",
				type: ko.types.string,
				default: "default"
			}
		}
	},
	viewModel: function(params) {
		var vm = this;

		vm.value = params.value;
		vm.types = params.types;
		vm.typeEditing = ko.observable(ko.types.getType(vm.types[0])); // default to first item in list
		
		vm.textBinding = ko.observable();
		vm.textBinding.subscribe(function(newValue){
			if (newValue === undefined || newValue.length === 0) {
				vm.value("undefined");
				return;
			}
			if (ko.unwrap(vm.typeEditing) === ko.types.number.baseType) {
				vm.value(parseInt(newValue));
			}
			else if (ko.unwrap(vm.typeEditing) === ko.types.boolean.baseType) {
				vm.value(JSON.parse(newValue));
			}
			else {
				vm.value(ko.types.getType(newValue));
			}
		});
		
		vm.required = params.required;
		vm.defaultValue = params.defaultValue;
		vm.possibleValues = params.possibleValues || ko.observableArray();
		
		
		vm.uid = idGen.getId();
		
		vm.checkIfDefault = function (data) {
			return vm.defaultValue === data; // hacky conversion to string. ToDo: fix
		};
		
		vm.typeAsText = function(type) { // returns the original string or returns the second word in brackets
			var found = ko.types.getType(type).match(/(?:\[\w+ )?(\w+)(?:\])?/i);
			return found[1];
			return type;
		};

		vm.colorizeData = function(data) {
			var serialized = paramAsText(data);
			
			switch (ko.types.get(data)) {
				case ko.types.number:
					color = "#831a05";
					break;
					
				case ko.types.string:
					color = "#235712";
					break;
					
				case ko.types.boolean:
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
	template: require("./knockout-type-editor.html")
});
