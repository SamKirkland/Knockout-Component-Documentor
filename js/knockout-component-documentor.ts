import "./knockout-component-documentor.scss";
import "./knockout-type-editor.ts";
import knockoutComponentDocumentor from "./knockout-component-documentor.html";
import { getAllComponents } from "./utils";

function componentExists(componentName: string) {
	return typeof getAllComponents()[ko.unwrap(componentName)] !== undefined;
}

function addOrError(item: undefined | string, errorArray: KnockoutObservableArray<string>, errorMessage: string): undefined | string {
	if (item === undefined) {
		errorArray.push(errorMessage);
		return undefined;
	}
	
	return item;
};

function defaultValue<GType>(value: GType, defaultValue: GType): GType {
	if (typeof value === "undefined") {
		return defaultValue;
	}
	return value;
}

function jsDocTypeToComponentType(jsDocType: string) {
	let regexp = /ko\.(\w+)\((.*)\)/i;

	if (!regexp.test(jsDocType)) {
		// not a knockout type type
		return jsDocType;
	}

	// detect if the type is a knockout type (ko.observable, ko.observableArray, ko.computed)
	let matches = regexp.exec(jsDocType);
	return matches[2];
}

function jsDocsToComponentDocs(jsDocs: any) {
	let allComponents = [];
	
	allComponents = jsDocs
		.filter((jsDoc: any) => {
			return jsDoc.customTags !== undefined;
		})
		.filter((jsDoc: any) => {
			// filter to only jsDocs that have "@component"
			return jsDoc.customTags.find((x: any) => x.tag === "component") !== undefined;
		})
		.map((jsDoc: any) => {
			let paramMapped = jsDoc.params.map((param: any) => {
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

			let componentDocs: any = {
				description: jsDoc.description,
				category: jsDoc.category,
				params: paramMapped,
				filename: fileName,
				filepath: filePath
			};

			jsDoc.customTags.forEach((customTag: any) => {
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

class ComponentDocumentorVM {
	constructor(params: any, componentInfo: any) {
		let includeFn = params.includeFn || this.defaultIncludeFn;
	
		this.loadingComplete = ko.observable(false);
	
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
				jsDocsMapped.forEach((jsDoc: any) => {
					if (jsDoc.component !== undefined && componentExists(jsDoc.component)) {
						let componentRegistration = getAllComponents()[jsDoc.component];
						
						componentRegistration.docs = jsDoc;
					}
				});
	
				this.loadingComplete(true);
				params.jsdocs.status(true);
			});
		}
	
		if (!componentExists(params.componentName)) {
			// addOrError(paramsTempArray, vm.errors, `Component "${params.componentName}" can't be documented because its not registered on the page.`);
			return;
		}
	
		this.componentName = params.componentName;
	
		// script tag generator
		this.htmlInclude = ko.observable();
	
		// wait until jsDocs are loaded to get components
		this.loadingComplete.subscribe(() => {
			this.componentName.subscribe((newComponent) => {
				let component = getAllComponents()[newComponent];
				this.viewModel(
					new ComponentDocumentationVM(this, component)
				);
	
				this.htmlInclude(includeFn(this.componentName(), component.docs.filename, component.docs.filepath));
			});
	
			this.viewModel = ko.observable();
	
			if (this.componentName() !== undefined) {
				this.viewModel(new ComponentDocumentationVM(this, getAllComponents()[this.componentName()]));
			}
		});
	}

	defaultIncludeFn = (componentName: string, filename: string, filepath: string) => {
		return `<script src="/js/${componentName}.js"></script>`;
	};

	componentName: KnockoutObservable<string>;

	loadingComplete: KnockoutObservable<boolean>;

	htmlInclude: KnockoutObservable<string>;

	viewModel: KnockoutObservable<any>;
}

class ComponentDocumentationVM {
	constructor(parent: any, construct: any) {
		let component = defaultValue(construct.docs, {});
		
		this.errors = ko.observableArray();
	
		this.componentName = parent.componentName();
		this.htmlInclude = parent.htmlInclude;
		this.componentID = `goto-${this.componentName}`;
	
		this.description = addOrError(
			component.description,
			this.errors,
			`<b>No description provided</b><br>
			To fix this error add a new key '@description' to the component, <a target="_blank" href="https://github.com/SamKirkland/Knockout-Component-Documentor#no-description-provided">example</a>.`
		);
		
		this.pages = defaultValue(component.pages, []); // A list of pages these components are used on
		this.tags = defaultValue(component.tags, []); // A list of tags
		this.params = ko.observableArray(); // A list of all params (required and optional)
		this.view = ko.observable(defaultValue(construct.view, "Preview")); // View can be Table or Preview, defaults to Table
		this.previewView = () => {
			this.view("Preview");
		};
		this.tableView = () => {
			this.view("Table");
		};
	
		let blackListedComponents = ['knockout-component-documentor', 'documentation-search', 'knockout-type-editor'];
		this.blackListedComponent = blackListedComponents.indexOf(this.componentName) >= 0;
	
		/* DELETE THE FOLLOWING ------------------------------ */
		/* DELETE THE FOLLOWING ------------------------------ */
		/* DELETE THE FOLLOWING ------------------------------ */
		/* DELETE THE FOLLOWING ------------------------------ */
		this.componentParamObject = ko.computed(() => {
			let paramObject: any = {};
			this.params().forEach((element: any, index) => {
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
	
		this.innerHtml = ko.observable();
		this.html = ko.computed(() => {
			let paramsList = this.params()
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
			if (this.htmlParam !== undefined && this.htmlParam !== null && this.htmlParam.value() !== this.htmlParam.defaultValue && this.htmlParam.value() !== "undefined") {
				htmlParam = `\n${this.htmlParam.value()}\n`;
			}
			let computedHTML = `<${this.componentName}${paramsText}>${htmlParam}</${this.componentName}>`;
			this.innerHtml(computedHTML);
			
			// find code instance, and update it
			// ToDo: fix this. make it less hacky
			let $textBoxInstance = document.querySelectorAll(`#${this.componentID} .CodeMirror`);
			if ($textBoxInstance.length > 0) {
				($textBoxInstance[$textBoxInstance.length - 1] as any).CodeMirror.setValue(computedHTML);
			}
			
			return computedHTML;
		});
		
	
		// add the paramaters to the paramater list
		let paramsTempArray = component.params.map((paramObj: any) => new ParamVM(this, paramObj));

		// if component they didn't add the documentation param end here
		if (component === undefined) {
			addOrError(paramsTempArray, this.errors, `No documentation defined`);
			return this;
		}
		
		addOrError(paramsTempArray, this.errors, "No parameters defined");
		this.params(paramsTempArray); // Add required/optional params to the main list
		
	
		let innerHtmlParams = this.params().filter((param) => param.typeFormatted()[0] === "innerHtml");
		if (innerHtmlParams.length === 1) {
			this.htmlParam = innerHtmlParams[0];
		}
		else {
			this.htmlParam = null;
		}
	
		if (innerHtmlParams.length > 1) {
			this.errors.push(
				`This component has multiple parameters of type 'innerHtml'<br>
				To fix this error change the types of all but one parameter to something else.<br>
				Offending parameters: <b>${innerHtmlParams.map((x) => x.name).join(", ")}</b>`
			);
		}
	
		this.innerHtmlLoading = ko.observable(false);
	}


	errors: KnockoutObservableArray<any>;

	componentName: string;
	htmlInclude: string;
	componentID: string;

	innerHtml: KnockoutObservable<any>;
	html: KnockoutObservable<any>;

	componentParamObject: KnockoutObservable<any>;

	htmlParam: null | any;

	innerHtmlLoading: KnockoutObservable<boolean>;

	/** is this component blacklisted from rendering a preview of it's self? */
	blackListedComponent: boolean;

	/** A description of the component */
	description: string;
	
	/** A list of pages these components are used on */
	pages: string[];
	
	/** A list of tags */
	tags: string[];

	/** A list of all params (required and optional) */
	params: KnockoutObservableArray<any> = ko.observableArray();

	/** View can be Table or Preview, defaults to Table  */
	view: KnockoutObservable<any>;

	previewView: () => void;

	tableView: () => void;
}

class ParamVM {
	constructor(parent: any, construct: any) {
		this.name = construct.name || "";
		this.required = construct.required;
		this.description = construct.description || "";
		this.selectedValue = ko.observable();
		this.defaultValue = construct.defaultValue;
		
		this.example = construct.example || "";
		
		this.value = ko.observable(construct.defaultValue);
		this.types = convertToArray(construct.type);

		function supportedTypes(type: string, errorCallback: () => void) {
			let supportedTypes = ["string", "boolean", "number", "object", "array", "function", "json", "date", "dateTime", "html", "innerHtml", "css"];

			if (!supportedTypes.includes(type)) {
				errorCallback();
				return "Unsupported Type";
			}

			return type;
		}
		
		this.typeFormatted = ko.computed(() => {
			return this.types.map((t) => {
				return supportedTypes(t, () => {
					parent.errors.push(
						`<b>The type '${t}' is not supported.</b><br>
						To fix this error change the value to the right of 'type' for the '${this.name}' param to a <a href="https://github.com/SamKirkland/Knockout-Component-Documentor#SupportedTypes">supported type</a>.`
					);
				});
			});
		});

		this.dataTypeClass = function(type) {
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
		
		function convertToArray(data: any) {
			if (Array.isArray(data)) {
				return data;
			}
			
			return [data];
		};
	}

	/** Name something something error */
	name: string;

	required: boolean;

	/** No description error */
	description: string;

	selectedValue: KnockoutObservable<any>;

	/** No defaultValue error */
	defaultValue: any;
	
	/** No example error */
	example: string;
	
	value: KnockoutObservable<any>;

	types: any[];

	typeFormatted: KnockoutComputed<any>;

	dataTypeClass: (type: string) => string;
}

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
			return new ComponentDocumentorVM(params, componentInfo);
		}
	},
	template: knockoutComponentDocumentor
});
