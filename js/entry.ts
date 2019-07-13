import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';

import * as ClipboardJS from 'clipboard';

class knockoutType {
	constructor(baseType: string) {
		this.baseType = baseType;

		this.observable = `${baseType} observable`;
		this.observableArray = `${baseType} observableArray`;
		this.computed = `${baseType} computed`;
	}

	baseType: string;
	observable: string;
	observableArray: string;
	computed: string;
}

class Generator {
	rand = () => {
		return Math.floor(Math.random() * 26) + Date.now();
	}

	getId = () => {
		return 'uniqueID_' + (this.rand() + 1);
	}
}

declare global {
    interface Window {
		idGen: Generator;
		paramAsText: (property: any) => string;
		codeEditorFunction: (element: any, valueAccessor: any, allBindings: any, viewModel: any, bindingContext: any) => void;
	}
}

window.idGen = new Generator();

window.paramAsText = function(property: any) {
	if (property === undefined) {
		return "undefined";
	}
	
	if (property === "number") {
		return property;
	}
	
	return JSON.stringify(property);
}

// Create uniqueID and run function
// pass a function that accepts the params (element, allBindings, viewModel, bindingContext)
ko.bindingHandlers.uniqueIdFunction = {
    init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
		// bind a unique ID
		let uniqueID = window.idGen.getId();
		element.setAttribute("id", uniqueID);
		
		ko.unwrap(valueAccessor)().fn(element, valueAccessor, allBindings, viewModel, bindingContext);
    } 
};

ko.bindingHandlers.addUniqueID = {
	init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
		let uniqueID = window.idGen.getId();
		element.setAttribute("id", uniqueID);
		valueAccessor()(uniqueID);
	}
};

ko.bindingHandlers.clipboard = {
	init: (el, valueAccessor, allBindings, data, context) => {
		new ClipboardJS(el, {
			text: (trigger) => ko.unwrap(valueAccessor())
		}).on('success', (e) => {
			const trigger = e.trigger;
			trigger.classList.add("btn-success");

			// show copied icon
			const copyIcon = trigger.querySelector("span");
			copyIcon.classList.remove("glyphicon-copy");
			copyIcon.classList.add("glyphicon-ok");

			// revert copy button
			setTimeout(() => {
				trigger.classList.remove("btn-success");

				copyIcon.classList.add("glyphicon-copy");
				copyIcon.classList.remove("glyphicon-ok");
			}, 750);
		});
	}
};

ko.bindingHandlers.innerHtml = {
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		let value = valueAccessor();
		let valueUnwrapped = ko.unwrap(value);

		if (valueUnwrapped === null) {
			return;
		}

		// save height so it's less garring
		element.parentElement.style.height = element.parentElement.style.height;

		viewModel.innerHtmlLoading(true);

		// unbind
		ko.cleanNode(element.firstChild);
		
		// re-add
		element.innerHTML = `<div data-bind='component: { name: componentName, params: componentParamObject }'>${valueUnwrapped.value()}</div>`;
		// apply the binding again
		setTimeout(() => {
			try {
				ko.applyBindings(viewModel, element.firstChild);
			}
			catch (e) {
				viewModel.innerHtmlLoading(false);
			}

			// reset height to auto
			element.parentElement.style.height = "auto";

			viewModel.innerHtmlLoading(false);
		}, 100);
	}
};

window.codeEditorFunction = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	let bindingParams = ko.utils.unwrapObservable(valueAccessor());
	
	if (bindingParams.mode === "json") {
		bindingParams.mode = { name: "javascript", json: true };
	}
	
	if (bindingParams.readOnly === undefined) {
		bindingParams.readOnly = false;
	}
	
	let myCodeMirror = CodeMirror.fromTextArea(element, {
		lineNumbers: true,
		mode: bindingParams.mode,
		readOnly: bindingParams.readOnly,
		lineWrapping: true,
		indentWithTabs: true,
		theme: "mdn-like"
	});
	
	myCodeMirror.on("change", function(cm, change) {
		// update the value binding with the codemirror changes
		if (viewModel.textBinding !== undefined) {
			viewModel.textBinding(cm.getValue());
		}
	});
};


import "./knockout-documentation-search.ts";
import "./knockout-component-documentor.ts";
import "./random-sample-component.ts";
import "./jsdoc-sample-component.ts";