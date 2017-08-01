require("./knockout-type-editor.scss");

ko.components.register('knockout-type-editor', {
	docs: {
		description: "Edit javascript or knockout types",
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
		
		vm.textBinding = ko.observable();
		vm.textBinding.subscribe(function(newValue){
			if (ko.unwrap(vm.typeEditing) === "[object Number]") {
				vm.value(parseInt(newValue));
			}
			else {
				vm.value(newValue);
			}

		});
		
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