require("./knockout-component-documentor.scss");
require("./knockout-type-editor.js");

function getAllComponents() {
	return ko.components.Ec;
}

function componentExists(componentName) {
	return typeof getAllComponents()[ko.unwrap(componentName)] !== undefined;
}

function addOrError(item, errorArray, errorMessage) {
	if (typeof item === "undefined") {
		errorArray.push(errorMessage);
		return undefined;
	}
	
	return item;
};

function defaultValue(value, defaultValue) {
	if (typeof value === "undefined") {
		return defaultValue;
	}
	return value;
}

function jsDocTypeToComponentType(jsDocType) {
	var regexp = /ko\.(\w+)\((.*)\)/i;

	if (!regexp.test(jsDocType)) {
		// not a knockout type type
		return jsDocToBaseType(jsDocType);
	}


	// detect if the type is a knockout type (ko.observable, ko.observableArray, ko.computed)
	var matches = regexp.exec(jsDocType);
	var baseType = jsDocToBaseType(matches[2]);

	switch (matches[1].toLowerCase()) {
		case "observable":
			return baseType.observable;

		case "observablearray":
			return baseType.observableArray;

		case "computed":
			return baseType.computed;

		default:
			return baseType;
	}
}

function jsDocToBaseType(jsDocType) {
	switch (jsDocType.toLowerCase()) {
		case "object":
			return ko.types.object;

		case "date":
			return ko.types.date;

		case "datetime":
			return ko.types.dateTime;

		case "array":
			return ko.types.array;

		case "string":
			return ko.types.string;

		case "boolean":
			return ko.types.boolean;

		case "number":
			return ko.types.number;

		case "function":
			return ko.types.function;

		case "json":
			return ko.types.json;

		case "html":
			return ko.types.html;

		case "innerhtml":
			return ko.types.innerHtml;

		case "css":
			return ko.types.css;

		default:
			return ko.types.other;
	}
}

function jsDocsToComponentDocs(jsDocs) {
	var allComponents = [];

	// ToDo: Only run conversion on items that use @component
	$.each(jsDocs, function(index, jsDoc) {
		var componentDocs = {
			description: jsDoc.description,
			category: jsDoc.category,
			required: {},
			optional: {}
		};

		// move params to required and optional objects
		$.each(jsDoc.params, function(paramIndex, param) {
			var objToAddTo = componentDocs.required;
			if (param.optional) {
				objToAddTo = componentDocs.optional;
			}

			// remove "params" from the front of each param
			var paramName = param.name;
			var regexp = /\w+\.(.*)/i;
			if (regexp.test(paramName)) {
				paramName = regexp.exec(paramName)[1];
			}

			// ToDo: Support types in defaultValue
			// ToDo: Add support for multiple types
			objToAddTo[paramName] = {
				description: param.description,
				defaultValue: param.defaultvalue,
				type: jsDocTypeToComponentType(param.type.names[0])
			};
		});

		// move all the custom tags onto the componentDocs object
		$.each(jsDoc.customTags, function(customTagsIndex, customTag) {
			if (customTag.tag === "tags") {
				// try to convert tags to array
				componentDocs[customTag.tag] = JSON.parse(customTag.value);
			}
			else {
				componentDocs[customTag.tag] = customTag.value;
			}
		});

		allComponents.push(componentDocs);
	});

	return allComponents;
}

var componentDocumentorVM = function(params, componentInfo) {
	var vm = this;
	
	var defaultIncludeFn = function(componentName) { return `<script src="/js/${componentName}.js"></script>`; };
	var includeFn = params.includeFn || defaultIncludeFn;

	vm.loadingComplete = ko.observable(false);

	if (params.jsdocs === undefined) {
		alert("jsdocs location must be passed into the <knockout-component-documentor>");
	}
	
	if (location.protocol === 'file:') {
		alert("jsdocs uses ajax to load in your doc file. This cannot be done on a local website. To fix this use localhost");
	}
	else {
		// load the jsdoc json file
		$.getJSON(params.jsdocs.location, function(jsDocs) {
			var jsDocs = jsDocsToComponentDocs(jsDocs);

			// add jsDocs to component registration
			$.each(jsDocs, function(index, jsDoc) {
				if (jsDoc.component !== undefined && componentExists(jsDoc.component)) {
					var componentRegistration = getAllComponents()[jsDoc.component];

					// merge jsDocs into docs
					componentRegistration.docs = $.extend(true, componentRegistration.docs, jsDoc);
				}
			});

			vm.loadingComplete(true);
			params.jsdocs.status(true);
		});
	}

	if (!componentExists(params.componentName)) {
		// addOrError(paramsTempArray, vm.errors, `Component "${params.componentName}" can't be documented because its not registered on the page.`);
		return;
	}

	vm.componentName = params.componentName;

	// script tag generator
	vm.htmlInclude = includeFn(ko.unwrap(vm.componentName));

	// wait until jsDocs are loaded to get components
	vm.loadingComplete.subscribe(function(){
		vm.componentName.subscribe(function(newComponent){
			vm.viewModel(
				new componentDocumentationVM(vm, getAllComponents()[newComponent])
			);
		});

		vm.viewModel = ko.observable();

		if (vm.componentName() !== undefined) {
			vm.viewModel(new componentDocumentationVM(vm, getAllComponents()[vm.componentName()]));
		}
	});

	return vm;
};

var componentDocumentationVM = function(parent, construct) {
	var vm = this;
	var component = defaultValue(construct.docs, {});
	
	vm.errors = ko.observableArray();

	vm.componentName = parent.componentName();
	vm.htmlInclude = parent.htmlInclude;
	vm.componentID = `goto-${vm.componentName}`;

	vm.description = addOrError(
		component.description,
		vm.errors,
		`<b>No description provided</b><br>
		To fix this error add a new key '@description' to the component, <a target="_blank" href="https://github.com/SamKirkland/Knockout-Component-Documentor#no-description-provided">example</a>.`
	); // A description of the component
	
	vm.pages = defaultValue(component.pages, []); // A list of pages these components are used on
	vm.tags = defaultValue(component.tags, []); // A list of tags
	vm.params = ko.observableArray(); // A list of all params (required and optional)
	vm.view = ko.observable(defaultValue(construct.view, "Preview")); // View can be Table or Preview, defaults to Table
	vm.previewView = function() { vm.view("Preview"); };
	vm.tableView = function() { vm.view("Table"); };

	var blackListedComponents = ['knockout-component-documentor', 'documentation-search', 'knockout-type-editor'];
	vm.blackListedComponent = blackListedComponents.indexOf(vm.componentName) >= 0;

	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	vm.componentParamObject = ko.computed(function(){
		var paramObject = {};
		vm.params().forEach(function(element, index){
			if (element.value() !== element.defaultValue && element.types[0] !== ko.types.innerHtml) {
				paramObject[element.name] = element.value();
			}
		});
		return paramObject;
	});
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */

	vm.innerHtml = ko.observable();
	vm.html = ko.computed(function(){
		var paramsList =
			vm.params()
			.filter((param) => {
				let isDefaultParam = param.value() === param.defaultValue;
				let isInnerHTML = param.types[0].baseType === "[object InnerHTML]";
				
				return !isDefaultParam && !isInnerHTML;
			})
			.map((param) => {
				return `${param.name}: ${JSON.stringify(param.value())}`;
			});

		let paramsText = "";
		if (paramsList.length > 0) {
			// format params
			paramsText = ` params='\n\t${paramsList.join(",\n\t")}\n'`;
		}
		
		let htmlParam = "";
		if (vm.htmlParam !== undefined && vm.htmlParam !== null &&
			vm.htmlParam.value() !== undefined &&
			vm.htmlParam.value() !== "undefined") {
			
			htmlParam = `\n${vm.htmlParam.value()}\n`;
		}
		let computedHTML = `<${vm.componentName}${paramsText}>${htmlParam}</${vm.componentName}>`;
		vm.innerHtml(computedHTML);
		
		// find code instance, and update it
		// ToDo: fix this. make it less hacky
		let $textBoxInstance = $(`#${vm.componentID} .CodeMirror`).last();
		if ($textBoxInstance.length) {
			$textBoxInstance[0].CodeMirror.setValue(computedHTML);
		}
		
		return computedHTML;
	});
	
	
	// add the paramaters to the paramater list
	var paramsTempArray = [];
	
	// if component they didn't add the documentation param end here
	if (component === undefined) {
		addOrError(paramsTempArray, vm.errors, `No documentation defined`);
		return vm;
	}

	if (component && !jQuery.isEmptyObject(component.required)) {
		$.each(component.required, function(key, paramObj) {
			paramObj.required = true;
			paramObj.name = key;
			paramsTempArray.push(new paramVM(vm, paramObj));
		});
	}
	if (component && !jQuery.isEmptyObject(component.optional)) {
		$.each(component.optional, function(key, paramObj) {
			paramObj.required = false;
			paramObj.name = key;
			paramsTempArray.push(new paramVM(vm, paramObj));
		});
	}
	
	addOrError(paramsTempArray, vm.errors, "No parameters defined");
	vm.params(paramsTempArray); // Add required/optional params to the main list
	

	// All innerHtml params
	var allInnerHtmlParams = vm.params().filter(function(element) {
		return element.typeFormatted()[0] === "InnerHTML";
	});

	if (allInnerHtmlParams.length > 0) {
		vm.htmlParam = allInnerHtmlParams[0];
	}
	else {
		vm.htmlParam = null;
	}

	if (allInnerHtmlParams.length > 1) {
		vm.errors.push(
			`This component has multiple parameters of type 'InnerHTML'<br>
			To fix this error change the types of all but one parameter to something else.<br>
			Offending parameters: <b>${allInnerHtmlParams.map(function(x) { return x.name; }).join(", ")}</b>`
		);
	}

	vm.innerHtmlLoading = ko.observable(false);

	return vm;
};

var paramVM = function(parent, construct){
	var vm = this;
	
	vm.name = construct.name || ""; // Name something something error
	vm.required = construct.required;
	vm.description = construct.description || ""; // No description error
	vm.selectedValue = ko.observable();
	vm.defaultValue = construct.defaultValue; // No defaultValue error
	
	vm.example = construct.example || ""; // No example error
	
	vm.value = ko.observable(construct.defaultValue);
	vm.types = convertToArray(construct.type);
	
	vm.typeFormatted = ko.computed(function(){
		return vm.types.map(function(t) {
			return ko.types.getFormatted(t, function(){
				parent.errors.push(
					`<b>The type '${t}' is not supported.</b><br>
					To fix this error change the value to the right of 'type' for the '${vm.name}' param to a <a href="https://github.com/SamKirkland/Knockout-Component-Documentor#SupportedTypes">supported type</a>.`
				);
			});
		});
	});

	vm.dataTypeClass = function(data) {
		var typeAsString = `[object ${data}]`;
		switch (typeAsString) {
			case ko.types.number.baseType:
				return "colorized-number";
				
			case ko.types.string.baseType:
				return "colorized-string";
				
			case ko.types.boolean.baseType:
				return "colorized-boolean";
				
			case ko.types.array.baseType:
				return "colorized-array";
			
			default:
				return "colorized-default";
		}
	};
	
	function convertToArray(data) {
		if (ko.types.get(data) === ko.types.array.baseType) {
			return data;
		}
		
		return [data];
	};
	
	return vm;
};


ko.components.register('knockout-component-documentor', {
	viewModel: {
		/**
		 * @component knockout-component-documentor
		 * @tags ["internal for knockout-component-documentor"]
		 * @description Documents Knockout.js components
		 * @category Knockout Component Documentor
		 * @param {string} params.jsdocs The path to the json file generated from jsdocs. If passed components will document themselves based on jsdocs data.
		 * @param {boolean} [params.documentSelf=false] should <knockout-component-documentor> be included in the documentation output
		 * @param {boolean} [params.autoDocument=false] Attempts to infer paramaters, types, and defaultValues of viewmodel
		 * @param {function} [params.includeFn=function(componentName){ return `<script src="/js/${includeFn}.js"></script>`; }] A function used transform the component name into your include tags.
		 */
		createViewModel: function(params, componentInfo) {
			return new componentDocumentorVM(params, componentInfo);
		}
	},
	template: require('./knockout-component-documentor.html')
});
