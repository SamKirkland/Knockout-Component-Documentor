
function Generator() {};
Generator.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
Generator.prototype.getId = function() { return 'uniqueID_' + this.rand++; };
var idGen = new Generator();

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
}

var myViewModelFactory = function(params, componentInfo) {
	var self = this;
	var functions = this; // this is just an alias for the protoype methods defined below
	
	// view params
	//self.view = ko.observable(params.view || "dynamicEdit");
	
	// This grabs the wrapping viewmodel. ToDo: Pass int $parent instead of doing this
	//self.parentVM = ko.dataFor($(componentInfo.element).parent()[0]);
	
	self.paramList = ko.observableArray();
	self.componentsToPreview = params.componentsToPreview || ko.observableArray();
	//self.paramObject = ko.computed(functions.createParamObject(), this);
	
	self.documentSelf = params.documentSelf;
	
	self.allComponentsAdded = function(parent) {
		if (parent.domChangeEvent !== undefined) {
			parent.domChangeEvent(true);
		}
	};
	
	if (params.autoDocument) {
		self.autoDocument = params.autoDocument;
	} else {
		self.autoDocument = false;
	}
	
	// you can preview all registered components if autodocument is true
	//if (self.autodocument) {
		functions.previewAllRegisteredComponents(params, self);
	//}
	
	// you can preview the component you pass into this component
	//if (!self.autodocument) {
	//	functions.documentPassedComponent(self, componentInfo);
	//}
	
	return self;
};

myViewModelFactory.prototype = {
	componentPreview: function(parentParams, self, componentName) { // the viewmodel to hold all info needed to preview a component
		var vm = this;
		
		if (!ko.components.isRegistered(componentName)) {
			throw `The component <${componentName}> isn't registered.`;
		}
		
		if (!ko.components.Cc[componentName].allParams) {
			throw `The component <${componentName}> doesn't have paramaters defined in its knockout registeration.'`;
			// ToDo: add a link to github for instructions
		}
		
		vm.name = componentName;
		vm.componentID = 'preview-' + vm.name;
		vm.visible = ko.observable(true);
		vm.view = ko.observable(self.view || "dynamicEdit");
		
		vm.previewView = function() {
			vm.view("dynamicEdit");
		};
		vm.tableView = function() {
			vm.view("table");
		};
		
		vm.description = ko.components.Cc[componentName].allParams.description;
		
		vm.tags = ko.observableArray(ko.components.Cc[componentName].allParams.tags);
		
		vm.pages = ko.observable(ko.components.Cc[componentName].allParams.pages);
		vm.pageCount = ko.computed(function(){
			if (vm.pages() === undefined) {
				return 0;
			}
			else {
				return vm.pages().length;
			}
		});
		vm.pageCountClass = ko.computed(function(){
			if (vm.pageCount() < 3) {
				return "label-success";
			}
			if (vm.pageCount() < 6) {
				return "label-warning";
			}
			
			return "label-danger";
		});
		
		vm.params = ko.observableArray();
		vm.paramsBindingsOnly = {};
		vm.html = ko.computed(function(){
			var paramsText = "";
			vm.params().forEach(function(element, index){
				var seperator = "";
				if (paramsText.length > 0) {
					seperator = ", ";
				}
				if (element.value() !== element.defaultValue) {
					paramsText += `${seperator}\n\t${element.name}: ${paramAsText(element.value())}`;
				}
			});
			paramsText += "\n";
			
			// find code instance, and update it
			// ToDo: fix this. make it less hacky
			var $textBoxInstance = $('#' + vm.componentID + " .html").parent().find(".CodeMirror").last();
			if ($textBoxInstance.length) {
				$textBoxInstance[0].CodeMirror.setValue(`<${vm.name} params='${paramsText}'></${vm.name}>`);
			}
			
			return `<${vm.name} params='${paramsText}'></${vm.name}>`;
		});
		
		// script tag generator
		if (parentParams.includeFn) {
			vm.htmlInclude = parentParams.includeFn(componentName);
		}
		else {
			vm.htmlInclude = `<script src="/js/${componentName}.js"></script>`;
		}
		
		// add the paramaters to the paramater list
		
		// ToDo: combine into one loop
		$.each(ko.components.Cc[componentName].allParams.required, function(key, paramObj){
			paramObj.required = true;
			paramObj.name = key;
			vm.params.push(new self.componentParamVM(self, paramObj));
			//vm.paramsBindingsOnly[vm.params()[key].name] = vm.params()[key].value;
		});
		$.each(ko.components.Cc[componentName].allParams.optional, function(key, paramObj){
			paramObj.required = false;
			paramObj.name = key;
			vm.params.push(new self.componentParamVM(self, paramObj));
			//vm.paramsBindingsOnly[vm.params()[key].name] = vm.params()[key].value;
		});
		
		return vm;
	},
	previewAllRegisteredComponents: function(parentParams, self) {
		$.each(ko.components.Cc, function(componentName, componentObj) {
			if (!window.hasDocumentedSelf) { // Create a object to store components that have already been documented
				window.hasDocumentedSelf = {};
			}
			
			var dependentComponents = ["knockout-component-preview", "knockout-type-editor", "documentation-search"];
			
			var shouldDocumentThisComponent = dependentComponents.indexOf(componentName) === -1 || self.documentSelf === true;
			
			if (shouldDocumentThisComponent) {
				try {
						if (!window.hasDocumentedSelf[componentName]) { // only document components that haven't already been documented
							self.componentsToPreview.push(new self.componentPreview(parentParams, self, componentName));
							window.hasDocumentedSelf[componentName] = true;
						}
				}
				catch (error) {
					console.log(error);
				}
			}
		})
	},
	documentPassedComponent: function(componentInfo) {
		var domNodesLength = componentInfo.templateNodes.length;
		for (var i = 0; i < domNodesLength; i++) {
			var component = componentInfo.templateNodes[i];
			var componentName = component.tagName;
			
			// only dom elements will have a tagName
			if (componentName) {
				componentName = componentName.toLowerCase();
			
				self.component = ko.observable(`<${componentName} params=></${componentName}>`);
				self.componentName = componentName;
				
				// its a component!
				if (ko.components.isRegistered(componentName)) {
					
					var componentParams = ko.components.Cc[componentName].allParams;
					
					//
					if (componentParams === undefined) {
						console.log(`The component <${componentName}> doesn't have paramaters defined in its knockout registeration. Please fix that.`);
					}
					
					console.log(componentParams);
					var componentParamsLength = componentParams.length;
					for (var p = 0; p < componentParamsLength; p++) {
						var currentParam = componentParams[p];
						
						console.log(currentParam);
						
						// add param to documentation
						this.paramList.push(new functions.componentParamVM(currentParam));
						
						//self.currentParams
						
						// param attribute for the component
						component.setAttribute("params", `${currentParam.name}: ${currentParam.name}`);
					}
					
					
				}
			}
		}
	},
	createParamObject: function(){
		var paramListLength = this.paramList().length;
		
		var obj = {};
		for (var i = 0; i < paramListLength; i++) {
			var paramVM = this.paramList()[i];
			obj[paramVM.name] = paramVM.value();
		}
		
		return obj;
	},
	componentParamVM: function(self, paramObj) {
		var vm = this;
		
		vm.formType = paramObj.type; //types.get(paramObj.possibleValues || paramObj.defaultValue);
		vm.formTypePretty = paramAsText(paramObj.type);
		
		vm.required = paramObj.required;
		vm.description = paramObj.description || "";
		vm.defaultValue = paramObj.defaultValue || "";
		vm.name = paramObj.name || "";
		
		// param change event
		vm.valueBinding = ko.observable();
		vm.value = ko.computed(function(){
			if (vm.formType === types.boolean) {
				return vm.valueBinding() === "true";
			}
			return vm.valueBinding();
		});
		
		vm.possibleValues = ko.observableArray();
		if (paramObj.possibleValues) { // ToDo: fix this
			if (types.get(paramObj.possibleValues) == types.array) { // populate possibleValues
				$.each(paramObj.possibleValues, function(index, element){
					vm.possibleValues.push(paramObj.possibleValues[index]);
				});
			}
			else {
				vm.possibleValues.push(paramObj.possibleValues);
			}
		}
		//else {
			//vm.possibleValues.push("nothing defined...");
			//console.log("No possible values set");
		//}
		
		// setup input placeholder text
		vm.placeHolder = "";
		if (typeof paramObj.possibleValues != 'undefined') {
			vm.placeHolder = paramObj.possibleValues.toString();
		}
		else if (typeof paramObj.defaultValue != 'undefined') {
			vm.placeHolder = paramObj.defaultValue.toString();
		}

		return vm;
	}
};

ko.components.register('knockout-component-preview', {
	allParams: {
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
			return new myViewModelFactory(params, componentInfo);
		}
	},
	template: `
		<div class="subgroup container-fluid" data-bind="foreach: { data: componentsToPreview, afterRender: allComponentsAdded($parent) }">
			<div data-bind="attr: { 'id': componentID }">
				<div class="row">
					<div class="col-xs-12 no-gutter">
						<hr style="border-color: #ccc;">
						<div class="btn-group pull-right" role="group">
							<button type="button" class="btn btn-default" data-bind="css: { 'active': view() === 'dynamicEdit' }, click: previewView">
								<span class="glyphicon glyphicon-eye-open"></span> Preview
							</button>
							<button type="button" class="btn btn-default" data-bind="css: { 'active': view() === 'table' }, click: tableView">
								<span class="glyphicon glyphicon-list-alt"></span> Table
							</button>
						</div>
						
						<h4 style="margin-bottom:0;" class="componentTitle" data-bind="text: name"></h4>
						
						<!-- ko if: tags().length -->
							<div style="display:inline-block;margin:5px 0 10px 0;" data-bind="foreach: tags">
								<span class="label label-default" data-bind="text: $data"></span>
							</div>
						<!-- /ko -->
						
						<blockquote data-bind="visible: description, text: description"></blockquote>
						
						<!-- ko if: pageCount -->
							<div class="panel panel-default">
								<div class="panel-heading">
									Page List <span class="label" data-bind="css: pageCountClass, text: pageCount"></span>
								</div>
								<ul data-bind="foreach: pages" class="list-group">
									<li class="list-group-item">
										<a data-bind="attr: { href: $data }, text: $data"></a>
									</li>
								</ul>
							</div>
						<!-- /ko -->
						
					</div>
				</div>
				<div class="row row-eq-height">
					<div class="col-xs-12 no-gutter row-eq-height">
						<!-- ko if: view() === 'table' -->
							<table class="table table-striped table-bordered table-hover table-condensed">
								<thead>
									<tr>
										<th>Parameter Name</th>
										<th>Description</th>
										<th>Type</th>
										<th>Required</th>
										<th>Default</th>
										<th>Possible Values</th>
									</tr>
								</thead>
								<tbody data-bind="foreach: params">
									<tr>
										<td data-bind="text: name"></td>
										<td data-bind="text: description"></td>
										<td>
											<div class="knockout-component-preview--dataType" data-bind="text: formType"></div>
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
						<!-- ko if: view() === 'dynamicEdit' -->
							<div class="col-xs-6 col-lg-4 no-gutter">
								<div class="list-group params-list" data-bind="foreach: params">
									<div class="list-group-item">
										<div class="form-group">
											<h3>
												<span data-bind="text: name"></span>
												<span class="badge" data-bind="text: formTypePretty"></span>
											</h3>
											
											<p class="list-group-item-content" data-bind="text: description"></p>
											
											<knockout-type-editor params="type: formType, required: required, defaultValue: defaultValue, possibleValues: possibleValues"></knockout-type-editor>
											
											<!-- ko if: formType === types.array -->
												<select class="selectpicker" data-width="100%" data-bind="foreach: possibleValues, value: valueBinding">
													<option data-bind="attr: { 'data-subtext': $data === $parent.defaultValue ? '*default*' : '' }, text: $data"></option>
												</select>
											<!-- /ko -->
											<!-- ko if: formType === types.string -->
												<input data-bind="textInput: valueBinding, attr: { 'required': required, 'placeholder': placeHolder }"
													type="text" class="form-control" id="ex1">
											<!-- /ko -->
											<!-- ko if: formType === types.boolean -->
												<div class="radio">
													<label>
														<input type="radio" data-bind="checked: valueBinding" name="ex1" id="ex01" value="true"> true
													</label>
												</div>
												<div class="radio">
													<label>
														<input type="radio" data-bind="checked: valueBinding" name="ex1" id="ex02" value="false"> false
													</label>
												</div>
											<!-- /ko -->
											<!-- ko if: formType === types.number -->
												<input type="number" class="form-control" data-bind="textInput: valueBinding" id="ex1">
											<!-- /ko -->
										</div>
									</div>
								</div>
							</div>
							<div class="col-xs-6 col-lg-8 no-gutter-right" style="display:flex;flex-direction:column;">
								<div class="panel panel-default" style="flex: 1 0">
									<div class="panel-heading">Preview</div>
									<div class="panel-body" style="position: relative;">
										<div data-bind='component: { name: name, params: paramsBindingsOnly }'></div>
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


