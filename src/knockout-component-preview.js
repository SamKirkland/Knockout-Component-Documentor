
function Generator() {};
Generator.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
Generator.prototype.getId = function() { return 'uniqueID_' + this.rand++; };
var idGen = new Generator();

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
	
	vm.components = []; // An array of componentDocumentationVM's
	
	// add all registered components
	$.each(ko.components.Cc, function(key, componentRegistration){
		componentRegistration.name = key;
		vm.components.push(new componentDocumentationVM(vm, componentRegistration));
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
	vm.pages = []; // A list of pages these components are used on
	vm.tags = []; // A list of tags
	vm.params = ko.observableArray(); // A list of all params (required and optional)
	vm.view = ko.observable(construct.view || "Table"); // View can be Table or Preview, defaults to Table
	vm.previewView = function() { vm.view("Preview"); };
	vm.tableView = function() { vm.view("Table"); };
	
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	vm.componentParamObject = ko.computed(function(){
		var paramObject = {};
		vm.params().forEach(function(element, index){
			if (element.valueBinding() !== element.defaultValue) {
				paramObject[element.name] = element.valueBinding();
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
	
	function convertToArray(data) {
		if (types.get(data) === types.array) {
			return data;
		}
		
		return [data];
	};
	
	vm.type = convertToArray(construct.type);
	vm.typeEditing = ko.observable(vm.type[0]);
	vm.typeFormatted = ko.computed(function(){
		return vm.type.map(function(t) {
			return types.getFormatted(t, function(){
				parent.errors.push(
					`<b>The type '${t}' is not supported.</b><br>
					To fix this error change the value to the right of 'type' for the '${vm.name}' param to a <a href="https://github.com/SamKirkland/Knockout-Component-Preview#SupportedTypes">supported type</a>.`
				);
			});
		});
	});
	
	// param change event
	vm.valueBinding = ko.observable();
	vm.value = ko.computed(function(){
		console.log("recalcing");
		switch (vm.typeEditing()) {
			case types.boolean:
				return vm.valueBinding() === "true";
			
			case types.string:
				return JSON.stringify(vm.valueBinding());
			
			/* js types, don't wrap them in quotes */
			default:
				return vm.valueBinding();
		}
		
		return paramAsText(vm.valueBinding());
	});
	
	
	return vm;
};

// Create uniqueID and run function
// pass a function that accepts the params (element, allBindings, viewModel, bindingContext)
ko.bindingHandlers.uniqueIdFunction = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		// bind a unique ID
		var uniqueID = idGen.getId();
		$(element).attr("id", uniqueID);
		
		ko.unwrap(valueAccessor)().fn(element, valueAccessor, allBindings, viewModel, bindingContext);
    } 
};

ko.bindingHandlers.addUniqueID = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var uniqueID = idGen.getId();
		$(element).attr("id", uniqueID);
		valueAccessor()(uniqueID);
	}
};

ko.bindingHandlers.clipboard = {
	init: function(el, valueAccessor, allBindings, data, context) {
		new Clipboard(el, {
			text: function(trigger) {
				return $(trigger).parent().next().find("textarea").val();
			}
		}).on('success', function(e) {
			$(e.trigger).addClass("btn-success").find("span")
				.removeClass("glyphicon-copy")
				.addClass("glyphicon-ok");
			setTimeout(function(){
				$(e.trigger).removeClass("btn-success").find("span")
					.addClass("glyphicon-copy")
					.removeClass("glyphicon-ok");
			}, 750);
		});
	}
};

function codeEditorFunction(element, valueAccessor, allBindings, viewModel, bindingContext) {
	var bindingParams = ko.utils.unwrapObservable(valueAccessor());
	
	if (bindingParams.mode === "json") {
		bindingParams.mode = { name: "javascript", json: true };
	}
	
	if (bindingParams.readOnly === undefined) {
		bindingParams.readOnly = false;
	}
	
	var myCodeMirror = CodeMirror.fromTextArea(element, {
		lineNumbers: true,
		mode: bindingParams.mode,
		readOnly: bindingParams.readOnly,
		lineWrapping: true,
		indentWithTabs: true,
		matchBrackets: true,
		theme: "mdn-like"
	});
	
	myCodeMirror.on("change", function(cm, change) {
		// update the value binding with the codemirror changes
		if (viewModel.valueBinding !== undefined) {
			viewModel.valueBinding(cm.getValue());
		}
	});
}

ko.components.register('knockout-component-preview', {
	docs: {
		description: "Documents Knockout.js components",
		required: {},
		optional: {
			componentsToPreview: {
				description: "The ko.observableArray that will be updated with components being previewed",
				defaultValue: undefined,
				type: types.ko.observableArray
			},
			documentSelf: {
				description: "should <knockout-component-preview> be included in the documentation output",
				defaultValue: false,
				type: types.boolean
			},
			paramObjectName: {
				description: "The name of the object the paramaters are set to within the knockout component",
				defaultValue: "allParams",
				type: types.string
			},
			view: {
				description: "Determines which view to show onload",
				defaultValue: "dynamicEdit",
				type: types.string,
				possibleValues: ["dynamicEdit", "table"]
			},
			autoDocument: {
				description: "Attempts to infer paramaters, types, and defaultValues of viewmodel",
				defaultValue: false,
				type: types.boolean
			},
			includeFn: {
				description: "A function used transform the component name into your include tags.",
				defaultValue: function(componentName){ return `<script src="/js/${includeFn}.js"></script>`; },
				type: types.function
			}
		}
	},
	viewModel: {
		createViewModel: function(params, componentInfo) {
			return new componentPreviewVM(params, componentInfo);
		}
	},
	template: `
		<div class="subgroup container-fluid" data-bind="foreach: components">
			<div data-bind="attr: { 'id': componentID }">
				<div class="row">
					<div class="col-xs-12 no-gutter">
						<hr style="border-color: #ccc;">
						<div class="btn-group pull-right" role="group">
							<button type="button" class="btn btn-default" data-bind="css: { 'active': view() === 'Preview' }, click: previewView">
								<span class="glyphicon glyphicon-eye-open"></span> Preview
							</button>
							<button type="button" class="btn btn-default" data-bind="css: { 'active': view() === 'Table' }, click: tableView">
								<span class="glyphicon glyphicon-list-alt"></span> Table
							</button>
						</div>
						
						<h4 style="margin-bottom:0;" class="componentTitle" data-bind="text: componentName"></h4>
						
						<div style="display:inline-block;margin:5px 0 10px 0;" data-bind="foreach: tags">
							<span class="label label-default" data-bind="text: $data"></span>
						</div>
						
						<blockquote data-bind="visible: description, text: description"></blockquote>
						
						<ul style="padding: 10px 30px;" class="alert alert-danger" data-bind="foreach: errors, visible: errors().length">
							<li data-bind="html: $data"></li>
						</ul>
						
						<!-- ko if: view() === 'Table' && pages.length -->
							<div class="panel panel-default">
								<div class="panel-heading">
									Included on <span class="label" data-bind="css: pageCountClass, text: pageCount"></span> pages
								</div>
								<ul data-bind="foreach: pages" style="padding:0;">
									<li class="list-group-item" style="float:left;border-top-width:0;border-left-width:0;border-bottom-width:0;">
										<a data-bind="attr: { href: $data }, text: $data"></a>
									</li>
								</ul>
								<div class="clearfix"></div>
							</div>
						<!-- /ko -->
						
					</div>
				</div>
				<div class="row row-eq-height">
					<div class="col-xs-12 no-gutter row-eq-height">
						<!-- ko if: view() === 'Table' -->
							<h3 style="display:block;width:100%;">Parameters</h3>
							
							<h4 style="display:block;width:100%;">Required</h4>
							<table class="table table-striped table-bordered table-hover table-condensed">
								<thead>
									<tr>
										<th>Name</th>
										<th>Description</th>
										<th>Type(s)</th>
										<th>Required</th>
										<th>Default</th>
										<th>Possible Values</th>
									</tr>
								</thead>
								<tbody data-bind="foreach: params">
									<tr>
										<td data-bind="text: name"></td>
										<td data-bind="text: description"></td>
										<td data-bind="foreach: typeFormatted">
											<div class="knockout-component-preview--dataType">
												<span data-bind="text: $data"></span>
											</div>
										</td>
										<td data-bind="text: required"></td>
										<td data-bind="text: defaultValue"></td>
										<td data-bind="foreach: possibleValues">
											<div class="knockout-component-preview--dataType">
												<span data-bind="text: paramAsText($data)"></span>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						<!-- /ko -->
						<!-- ko if: view() === 'Preview' -->
							<div class="col-xs-6 col-lg-4 no-gutter">
								<div class="list-group params-list" data-bind="foreach: params">
									<div class="list-group-item">
										<div class="form-group">
											<h3>
												<span data-bind="text: name"></span>
												<span class="badge" data-bind="text: typeFormatted"></span>
											</h3>
											
											<p class="list-group-item-content" data-bind="text: description"></p>
											
											<knockout-type-editor params="
												valueBinding: valueBinding,
												type: type,
												required: required,
												defaultValue: defaultValue,
												possibleValues: possibleValues,
												typeEditing: typeEditing"></knockout-type-editor>
											
										</div>
									</div>
								</div>
							</div>
							<div class="col-xs-6 col-lg-8 no-gutter-right" style="display:flex;flex-direction:column;">
								<div class="panel panel-default" style="flex: 1 0">
									<div class="panel-heading">Preview</div>
									<div class="panel-body" style="position: relative;">
										<!-- ko if: componentName !== 'knockout-type-editor' -->
											<div data-bind='component: { name: componentName, params: componentParamObject }'></div>
										<!-- /ko -->
										<!-- ko if: componentName === 'knockout-type-editor' -->
											<div class="alert alert-danger" style="margin:0;">knockout-type-editor can't preview its self</div>
										<!-- /ko -->
									</div>
								</div>
								<div class="panel panel-default" style="flex: 0 1">
									<div class="panel-heading">
										Include Tags
										
										<div data-bind="clipboard: {}" class="btn btn-default btn-sm pull-right" style="margin-top:-5px;margin-right:-9px;">
											<span class="glyphicon glyphicon-copy"></span> Copy
										</div>
									</div>
									<div class="panel-body" style="padding:0;">
										<textarea class="html" data-bind="text: htmlInclude, uniqueIdFunction: { fn: codeEditorFunction, mode: 'htmlmixed', readOnly: true }"></textarea>
									</div>
								</div>
								<div class="panel panel-default" style="flex: 0 1">
									<div class="panel-heading">
										Component Code
										
										<div data-bind="clipboard: {}" class="btn btn-default btn-sm pull-right" style="margin-top:-5px;margin-right:-9px;">
											<span class="glyphicon glyphicon-copy"></span> Copy
										</div>
									</div>
									<div class="panel-body" style="padding:0;">
										<textarea class="html" data-bind="text: html, uniqueIdFunction: { fn: codeEditorFunction, mode: 'htmlmixed' }"></textarea>
									</div>
								</div>
							</div>
							<div class="clearfix"></div>
						<!-- /ko -->
					</div>
				</div>
			</div>
		</div>
	`
});

$(document).ready(function(){
	var pageVM = function() {
		var vm = this;
		
		vm.domChangeEvent = ko.observable();
		vm.componentsToPreviewList = ko.observableArray();
	};
	
	ko.applyBindings(new pageVM());
});


