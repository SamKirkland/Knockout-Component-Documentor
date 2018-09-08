require("./knockout-type-editor.scss");

ko.components.register('knockout-type-editor', {
	/**
	 * @component knockout-type-editor
	 * @tags ["internal for knockout-component-documentor"]
	 * @description Edit javascript or knockout types
	 * @category Knockout Component Documentor
	 * @param {string} params.type A javascript or knockout type. The editor will edit that typ
	 * @param {string} [params.optionalParam=default] description!
	 */
	viewModel: function(params) {
		let vm = this;

		vm.value = params.value;
		vm.types = params.types;
		vm.typeEditing = ko.observable(vm.types[0]); // default to first item in list
		
		vm.textBinding = ko.observable();
		vm.textBinding.subscribe((newValue) => {
			if (newValue === undefined || newValue.length === 0) {
				vm.value("undefined");
				return;
			}

			if (ko.unwrap(vm.typeEditing) === "number") {
				vm.value(parseInt(newValue));
			}
			else if (ko.unwrap(vm.typeEditing) === "boolean") {
				vm.value(JSON.parse(newValue));
			}
			else {
				vm.value(newValue);
			}
		});
		
		vm.required = params.required;
		vm.defaultValue = params.defaultValue;
		
		
		vm.uid = idGen.getId();
		
		vm.checkIfDefault = function (data) {
			return vm.defaultValue === data; // hacky conversion to string. ToDo: fix
		};

		vm.colorizeData = function(type) {
			switch (type) {
				case "number":
					color = "#831a05";
					break;
					
				case "string":
					color = "#235712";
					break;
					
				case "boolean":
					color = "#0d7cca";
					break;
				
				default:
					color = "#bbb";
			}
			
			let isDefault = "";
			if (type === vm.defaultValue) {
				isDefault = `<span style='float:right;margin-right:10px;'>*default*</span>`;
			}
			
			return `<span style='color:${color};'>${serialized}</span>${isDefault}`;
		};
		
		return vm;
	},
	template: require("./knockout-type-editor.html")
});
