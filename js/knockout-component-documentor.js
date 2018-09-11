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
	let regexp = /ko\.(\w+)\((.*)\)/i;

	if (!regexp.test(jsDocType)) {
		// not a knockout type type
		return jsDocType;
	}

	// detect if the type is a knockout type (ko.observable, ko.observableArray, ko.computed)
	let matches = regexp.exec(jsDocType);
	return matches[2];
}

function jsDocsToComponentDocs(jsDocs) {
	let allComponents = [];
	
	allComponents = jsDocs
		.filter((jsDoc) => {
			// filter to only jsDocs that have "@component"
			return jsDoc.customTags.find((x) => x.tag === "component") !== undefined;
		})
		.map((jsDoc) => {
			let paramMapped = jsDoc.params.map((param) => {
				// remove "params" from the front of each param
				let paramName = param.name;
				let regexp = /\w+\.(.*)/i;
				if (regexp.test(paramName)) {
					paramName = regexp.exec(paramName)[1];
				}

				return {
					name: paramName,
					required: !param.optional,
					description: param.description,
					defaultValue: param.defaultvalue,
					type: jsDocTypeToComponentType(param.type.names[0])
				};
			});

			let fileName;
			let filePath;

			if (jsDoc.meta && jsDoc.meta.filename && jsDoc.meta.path) {
				fileName = jsDoc.meta.filename;
				filePath = jsDoc.meta.path;
			}

			let componentDocs = {
				description: jsDoc.description,
				category: jsDoc.category,
				params: paramMapped,
				filename: fileName,
				filepath: filePath
			};

			jsDoc.customTags.forEach((customTag) => {
				let tagValue = customTag.value;

				if (customTag.tag === "tags") {
					// try to convert tags to array
					tagValue = JSON.parse(tagValue);
				}
				
				componentDocs[customTag.tag] = tagValue;
			});

			return componentDocs;
		});

	return allComponents;
}

let componentDocumentorVM = function(params, componentInfo) {
	let vm = this;
	
	let defaultIncludeFn = function(componentName, filename, filepath) { return `<script src="/js/${componentName}.js"></script>`; };
	let includeFn = params.includeFn || defaultIncludeFn;

	vm.loadingComplete = ko.observable(false);

	if (params.jsdocs === undefined) {
		alert("jsdocs location must be passed into the <knockout-component-documentor>");
	}
	
	if (location.protocol === 'file:') {
		alert("jsdocs uses ajax to load in your doc file. This cannot be done on a local website. To fix this use localhost");
	}
	else {
		// load the jsdoc json file
		fetch(params.jsdocs.location)
		.then((response) => {
			if (!response.ok) {
				// failed
				alert(`Couldn't load - Status:${response.status}`);
				return;
			}
			
			return response.json();
		})
		.then((jsDocs) => {
			let jsDocsMapped = jsDocsToComponentDocs(jsDocs);

			// add jsDocs to component registration
			jsDocsMapped.forEach((jsDoc) => {
				if (jsDoc.component !== undefined && componentExists(jsDoc.component)) {
					let componentRegistration = getAllComponents()[jsDoc.component];
					
					componentRegistration.docs = jsDoc;
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
	vm.htmlInclude = ko.observable();

	// wait until jsDocs are loaded to get components
	vm.loadingComplete.subscribe(() => {
		vm.componentName.subscribe((newComponent) => {
			let component = getAllComponents()[newComponent];
			vm.viewModel(
				new componentDocumentationVM(vm, component)
			);

			vm.htmlInclude(includeFn(vm.componentName(), component.docs.filename, component.docs.filepath));
		});

		vm.viewModel = ko.observable();

		if (vm.componentName() !== undefined) {
			vm.viewModel(new componentDocumentationVM(vm, getAllComponents()[vm.componentName()]));
		}
	});

	return vm;
};

let componentDocumentationVM = function(parent, construct) {
	let vm = this;
	let component = defaultValue(construct.docs, {});
	
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

	let blackListedComponents = ['knockout-component-documentor', 'documentation-search', 'knockout-type-editor'];
	vm.blackListedComponent = blackListedComponents.indexOf(vm.componentName) >= 0;

	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	vm.componentParamObject = ko.computed(() => {
		let paramObject = {};
		vm.params().forEach((element, index) => {
			if (element.value() !== element.defaultValue && element.types[0] !== "innerHtml") {
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
	vm.html = ko.computed(() => {
		let paramsList =
			vm.params()
			.filter((param) => {
				let isDefaultParam = param.value() === param.defaultValue;
				let isInnerHTML = param.types[0] === "innerHtml";
				
				return !isDefaultParam && !isInnerHTML;
			})
			.map((param) => {
				let value = param.value();

				if (value === "undefined") {
					return undefined;
				}
				
				if (Array.isArray(value)) {
					return `[${value}]`;
				}

				return `${param.name}: ${JSON.stringify(value)}`;
			});

		let paramsText = "";
		if (paramsList.length > 0) {
			// format params
			paramsText = ` params='\n\t${paramsList.join(",\n\t")}\n'`;
		}
		
		let htmlParam = "";
		if (vm.htmlParam !== undefined && vm.htmlParam !== null && vm.htmlParam.value() !== vm.htmlParam.defaultValue && vm.htmlParam.value() !== "undefined") {
			htmlParam = `\n${vm.htmlParam.value()}\n`;
		}
		let computedHTML = `<${vm.componentName}${paramsText}>${htmlParam}</${vm.componentName}>`;
		vm.innerHtml(computedHTML);
		
		// find code instance, and update it
		// ToDo: fix this. make it less hacky
		let $textBoxInstance = document.querySelectorAll(`#${vm.componentID} .CodeMirror`);
		if ($textBoxInstance.length > 0) {
			$textBoxInstance[$textBoxInstance.length - 1].CodeMirror.setValue(computedHTML);
		}
		
		return computedHTML;
	});
	
	// if component they didn't add the documentation param end here
	if (component === undefined) {
		addOrError(paramsTempArray, vm.errors, `No documentation defined`);
		return vm;
	}

	// add the paramaters to the paramater list
	let paramsTempArray = component.params.map((paramObj) => new paramVM(vm, paramObj));
	
	addOrError(paramsTempArray, vm.errors, "No parameters defined");
	vm.params(paramsTempArray); // Add required/optional params to the main list
	

	let innerHtmlParams = vm.params().filter((param) => param.typeFormatted()[0] === "innerHtml");
	if (innerHtmlParams.length === 1) {
		vm.htmlParam = innerHtmlParams[0];
	}
	else {
		vm.htmlParam = null;
	}

	if (innerHtmlParams.length > 1) {
		vm.errors.push(
			`This component has multiple parameters of type 'innerHtml'<br>
			To fix this error change the types of all but one parameter to something else.<br>
			Offending parameters: <b>${innerHtmlParams.map((x) => x.name).join(", ")}</b>`
		);
	}

	vm.innerHtmlLoading = ko.observable(false);

	return vm;
};

let paramVM = function(parent, construct){
	let vm = this;
	
	vm.name = construct.name || ""; // Name something something error
	vm.required = construct.required;
	vm.description = construct.description || ""; // No description error
	vm.selectedValue = ko.observable();
	vm.defaultValue = construct.defaultValue; // No defaultValue error
	
	vm.example = construct.example || ""; // No example error
	
	vm.value = ko.observable(construct.defaultValue);
	vm.types = convertToArray(construct.type);

	function supportedTypes(type, errorCallback) {
		let supportedTypes = ["string", "boolean", "number", "object", "array", "function", "json", "date", "dateTime", "html", "innerHtml", "css"];

		if (!supportedTypes.includes(type)) {
			errorCallback();
			return "Unsupported Type";
		}

		return type;
	}
	
	vm.typeFormatted = ko.computed(() => {
		return vm.types.map((t) => {
			return supportedTypes(t, () => {
				parent.errors.push(
					`<b>The type '${t}' is not supported.</b><br>
					To fix this error change the value to the right of 'type' for the '${vm.name}' param to a <a href="https://github.com/SamKirkland/Knockout-Component-Documentor#SupportedTypes">supported type</a>.`
				);
			});
		});
	});

	vm.dataTypeClass = function(type) {
		switch (type) {
			case "number":
				return "colorized-number";
				
			case "string":
				return "colorized-string";
				
			case "boolean":
				return "colorized-boolean";
				
			case "array":
				return "colorized-array";
			
			default:
				return "colorized-default";
		}
	};
	
	function convertToArray(data) {
		if (Array.isArray(data)) {
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
