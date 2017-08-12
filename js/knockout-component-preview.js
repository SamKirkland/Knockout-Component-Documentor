require("./knockout-component-preview.scss");
require("./knockout-type-editor.js");


function addOrError(item, errorArray, errorMessage) {
	if (item === undefined) {
		errorArray.push(errorMessage);
		return undefined;
	}
	
	return item;
};

var componentPreviewVM = function(params, componentInfo) {
	var vm = this;
	
	vm.docKeyName = params.docKeyName || "docs"; // The key to look for, defaults to "docs"
	vm.includeFn = params.includeFn;
	vm.selfDocument = params.selfDocument || false; // Document own componentsm defaults to false
	vm.componentsToPreviewList = params.componentsToPreviewList;
	
	vm.components = []; // An array of componentDocumentationVM's
	
	// add all registered components
	$.each(ko.components.Cc, function(key, componentRegistration){
		var docs = componentRegistration.docs;
		componentRegistration.name = key;
		vm.components.push(new componentDocumentationVM(vm, componentRegistration));
		if (vm.componentsToPreviewList !== undefined) {
			vm.componentsToPreviewList.push({
				name: key,
				description: docs.description,
				tags: docs.tags,
				visible: ko.observable(true)
			});
		}
	});
	
	return vm;
};

var componentDocumentationVM = function(parent, construct) {
	var vm = this;
	var component = construct[parent.docKeyName];
	
	vm.errors = ko.observableArray();
	vm.componentName = construct.name;
	vm.componentID = `goto-${vm.componentName}`;
	
	vm.description = addOrError(
		construct.docs.description,
		vm.errors,
		`<b>No description provided</b><br>
		To fix this error add a new key 'description' to the component, <a href="#">example</a>.`
	); // A description of the component
	
	vm.pages = construct.docs.pages || []; // A list of pages these components are used on
	vm.tags = construct.docs.tags || []; // A list of tags
	vm.params = ko.observableArray(); // A list of all params (required and optional)
	vm.view = ko.observable(construct.view || "Table"); // View can be Table or Preview, defaults to Table
	vm.previewView = function() { vm.view("Preview"); };
	vm.tableView = function() { vm.view("Table"); };
	
	var blackListedComponents = ['knockout-component-preview', 'knockout-type-editor'];
	vm.blackListedComponent = blackListedComponents.indexOf(vm.componentName) >= 0;


	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	vm.componentParamObject = ko.computed(function(){
		var paramObject = {};
		vm.params().forEach(function(element, index){
			if (element.value() !== element.defaultValue) {
				paramObject[element.name] = element.value();
			}
		});
		return paramObject;
	});
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	
	vm.html = ko.computed(function(){
		var paramsList = [];
		vm.params().map(function(param){ // Build up params
			if (param.value() !== param.defaultValue) { // Only add the param if it's not a default value
				paramsList.push(`${param.name}: ${param.value()}`);
			}
		});
		
		var paramsText = paramsList.join(",\n\t"); // format params
		var computedHTML = `<${vm.componentName} params='\n\t${paramsText}\n'></${vm.componentName}>`;
		
		// find code instance, and update it
		// ToDo: fix this. make it less hacky
		var $textBoxInstance = $(`#${vm.componentID} .CodeMirror`).last();
		if ($textBoxInstance.length) {
			$textBoxInstance[0].CodeMirror.setValue(computedHTML);
		}
		
		return computedHTML;
	});
	
	// script tag generator
	if (parent.includeFn) {
		vm.htmlInclude = parent.includeFn(vm.componentName);
	}
	else {
		vm.htmlInclude = `<script src="/js/${vm.componentName}.js"></script>`;
	}
	
	// add the paramaters to the paramater list
	var paramsTempArray = [];
	
	// if component they didn't add the documentation param end here
	if (component === undefined) {
		addOrError(paramsTempArray, vm.errors, `No key {parent.docKeyName} defined`);
		return vm;
	}
	
	if (component && !jQuery.isEmptyObject(component.required)) {
		$.each(construct[parent.docKeyName].required, function(key, paramObj) {
			paramObj.required = true;
			paramObj.name = key;
			paramsTempArray.push(new paramVM(vm, paramObj));
		});
	}
	if (component && !jQuery.isEmptyObject(component.optional)) {
		$.each(construct[parent.docKeyName].optional, function(key, paramObj) {
			paramObj.required = false;
			paramObj.name = key;
			paramsTempArray.push(new paramVM(vm, paramObj));
		});
	}
	
	addOrError(paramsTempArray, vm.errors, "No parameters defined");
	vm.params(paramsTempArray); // Add required/optional params to the main list
	
	return vm;
};

var paramVM = function(parent, construct){
	var vm = this;
	
	vm.name = construct.name || ""; // Name something something error
	vm.required = construct.required;
	vm.description = construct.description || ""; // No description error
	vm.selectedValue = ko.observable();
	vm.defaultValue = construct.defaultValue || ""; // No defaultValue error
	
	vm.possibleValues = construct.possibleValues || []; // all possible values (if set)
	vm.example = construct.example || ""; // No example error
	
	vm.value = ko.observable();
	vm.types = convertToArray(construct.type);
	vm.typeFormatted = ko.computed(function(){
		return vm.types.map(function(t) {
			return ko.types.getFormatted(t, function(){
				parent.errors.push(
					`<b>The type '${t}' is not supported.</b><br>
					To fix this error change the value to the right of 'type' for the '${vm.name}' param to a <a href="https://github.com/SamKirkland/Knockout-Component-Preview#SupportedTypes">supported type</a>.`
				);
			});
		});
	});
	
	function convertToArray(data) {
		if (ko.types.get(data) === ko.types.array) {
			return data;
		}
		
		return [data];
	};
	
	return vm;
};


ko.components.register('knockout-component-preview', {
	docs: {
		description: "Documents Knockout.js components",
		required: {},
		optional: {
			componentsToPreview: {
				description: "The ko.observableArray that will be updated with components being previewed",
				defaultValue: undefined,
				type: ko.types.ko.observableArray
			},
			documentSelf: {
				description: "should <knockout-component-preview> be included in the documentation output",
				defaultValue: false,
				type: ko.types.boolean
			},
			paramObjectName: {
				description: "The name of the object the paramaters are set to within the knockout component",
				defaultValue: "allParams",
				type: ko.types.string
			},
			view: {
				description: "Determines which view to show onload",
				defaultValue: "dynamicEdit",
				type: ko.types.string,
				possibleValues: ["dynamicEdit", "table"]
			},
			autoDocument: {
				description: "Attempts to infer paramaters, types, and defaultValues of viewmodel",
				defaultValue: false,
				type: ko.types.boolean
			},
			includeFn: {
				description: "A function used transform the component name into your include tags.",
				defaultValue: function(componentName){ return `<script src="/js/${includeFn}.js"></script>`; },
				type: ko.types.function
			}
		}
	},
	viewModel: {
		createViewModel: function(params, componentInfo) {
			return new componentPreviewVM(params, componentInfo);
		}
	},
	template: require('./knockout-component-preview.html')
});
