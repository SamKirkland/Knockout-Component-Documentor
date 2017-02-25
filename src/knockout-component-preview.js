// ex: types.get(prop) == types.number
var types = {
	get: function(prop) {
		return Object.prototype.toString.call(prop);
	},
	object: '[object Object]',
	date: '[object Date]',
	array: '[object Array]',
	string: '[object String]',
	boolean: '[object Boolean]',
	number: '[object Number]',
	ko: {
		observable: 'ko observable',
		observableArray: 'ko observableArray'
	}
}

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
		
		ko.unwrap(valueAccessor)()(element, allBindings, viewModel, bindingContext);
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

function paramAsText(property) {
	if (property === undefined) {
		return "undefined";
	}
	
	if (types.get(property) === types.number) {
		return property;
	}
	
	return JSON.stringify(property);
}

function codeEditorFunction(element, allBindings, viewModel, bindingContext) {
	var myCodeMirror = CodeMirror.fromTextArea(element, {
		lineNumbers: true,
		mode:  "htmlmixed",
		lineWrapping: true,
		theme: "mdn-like"
	});
}

var myViewModelFactory = function(params, componentInfo) {
	var self = this;
	var functions = this; // this is just an alias for the protoype methods defined below
	
	// view params
	self.view = ko.observable(params.view || "dynamicEdit");
	
	self.paramList = ko.observableArray();
	self.componentsToPreview = ko.observableArray();
	//self.paramObject = ko.computed(functions.createParamObject(), this);
	
	if (params.autoDocument) {
		self.autoDocument = params.autoDocument;
	} else {
		self.autoDocument = false;
	}
	
	// you can preview all registered components if autodocument is true
	//if (self.autodocument) {
		functions.previewAllRegisteredComponents(self);
	//}
	
	// you can preview the component you pass into this component
	//if (!self.autodocument) {
	//	functions.documentPassedComponent(self, componentInfo);
	//}
	
	return self;
};

myViewModelFactory.prototype = {
	componentPreview: function(self, componentName) { // the viewmodel to hold all info needed to preview a component
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
		vm.view = ko.observable(self.view || "dynamicEdit");
		
		vm.previewView = function() {
			self.view("dynamicEdit");
		};
		vm.tableView = function() {
			self.view("table");
		};
		
		vm.params = ko.observableArray();
		vm.paramsBindingsOnly = {};
		vm.html = ko.computed(function(){
			var paramsText = "";
			vm.params().forEach(function(element, index){
				var seperator = "";
				if (paramsText.length > 0) {
					seperator = ", ";
				}
				paramsText += seperator + `\n\t${element.name}: ${paramAsText(element.value())}`;
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
		vm.view = self.view;
		
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
	previewAllRegisteredComponents: function(self) {
		$.each(ko.components.Cc, function(componentName, componentObj) {
			if (!window.hasDocumentedSelf) { // Create a object to store components that have already been documented
				window.hasDocumentedSelf = {};
			}
			
			try {
				if (!window.hasDocumentedSelf[componentName]) { // only document components that haven't already been documented
					self.componentsToPreview.push(new self.componentPreview(self, componentName));
					window.hasDocumentedSelf[componentName] = true;
				}
			}
			catch (error) {
				console.log(error);
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
		
		vm.formType = types.get(paramObj.possibleValues || paramObj.defaultValue);
		vm.formTypeText = ko.computed(function(){ // ToDo: use prototype
			var regexResult = vm.formType.match(/\[\w+ (\w+)\]/);
			return regexResult[1];
		});
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
		else {
			vm.possibleValues.push("nothing defined...");
			console.log("No possible values set");
		}
		
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



$(document).ready(function(){
	ko.components.register('knockout-component-preview', {
		allParams: {
			required: {},
			optional: {
				documentSelf: {
					description: "should <knockout-component-preview> be included in the documentation output",
					defaultValue: false,
					type: types.boolean,
					possibleValues: [true, false]
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
					type: types.boolean,
					possibleValues: [true, false]
				}
			}
		},
		viewModel: {
			createViewModel: function(params, componentInfo) {
				setTimeout(function(){
					$('[data-spy="scroll"]').each(function () {
						$(this).scrollspy('refresh');
					}); 
				}, 1000);
				
				return new myViewModelFactory(params, componentInfo);
			}
		},
		template: `
			<div class="container-fluid" data-bind="foreach: componentsToPreview">
				<div class="row subgroup">
					<div class="col-xs-12 no-gutter">
						<hr style="border-color: #ccc;">
						<h4 class="componentTitle" data-bind="text: name"></h4>
						
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-default" data-bind="css: { 'active': view() === 'dynamicEdit' }, click: previewView">
								<span class="glyphicon glyphicon-eye-open"></span> Preview
							</button>
							<button type="button" class="btn btn-default" data-bind="css: { 'active': view() === 'table' }, click: tableView">
								<span class="glyphicon glyphicon-list-alt"></span> Table
							</button>
						</div>
						
						
					</div>
				</div>
				<div class="row row-eq-height" data-bind="attr: { 'id': componentID }">
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
											<div class="knockout-component-preview--dataType" data-bind="text: formTypeText"></div>
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
								<div class="list-group" data-bind="foreach: params">
								
									<div href="#" class="list-group-item">
									
										<div class="form-group">
											<b>Default</b>
											<span class="list-group-item-content" data-bind="text: defaultValue"></span>
											<hr>
											
											<label class="list-group-item-heading" for="ex1" data-bind="text: name"></label>
											<!-- ko if: formType === types.array -->
												<select class="selectpicker" data-width="100%" data-bind="foreach: possibleValues, value: valueBinding">
													<option data-bind="attr: { 'data-subtext': '*default*' }, text: $data"></option>
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
										<div class="list-group-item-text list-group-item">
											<b class="list-group-item-title">Description</b>
											<span class="list-group-item-content" data-bind="text: description"></span>
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
										Code
										
										<div data-bind="clipboard: {}" class="btn btn-default btn-sm pull-right" style="margin-top:-5px;margin-right:-9px;">
											<span class="glyphicon glyphicon-copy"></span> Copy
										</div>
									</div>
									<div class="panel-body" style="padding:0;">
										<textarea class="html" data-bind="text: html, uniqueIdFunction: codeEditorFunction"></textarea>
									</div>
								</div>
								
							</div>
							<div class="clearfix"></div>
						<!-- /ko -->
					</div>
				</div>
			</div>`
	});
	
	ko.components.register('random-sample-component', {
		allParams: {
			required: {},
			optional: {
				paramText: {
					description: "The text to appear within a component",
					defaultValue: "oops",
					type: types.string,
					possibleValues: [123, true, false, null, undefined, "oops", "poops", "woops", "unicorn poo", "Ex3"]
				},
				showBorder: {
					description: "Show a border around the demo component",
					defaultValue: true,
					type: types.boolean
				},
				dropdown: {
					description: "The border size in pixels of the border",
					defaultValue: "none",
					type: types.string,
					possibleValues: [0, "none", "somethingElse"]
				},
				borderWidth: {
					description: "The border size in pixels of the border",
					defaultValue: 0,
					type: types.number
				}
			}
		},
		viewModel: function(params) {
			this.paramText = params.paramText;
			this.borderWidth = params.borderWidth;
			this.allParams = ko.computed(function(){
				return JSON.stringify(params);
			});
		},
		template: `
			Just some silly demo component.<br>
			The value of paramText: <span style="border-color:green;border-style:solid;" data-bind="text: paramText"></span><br>
			<b>borderWidth:</b> <span data-bind="text: borderWidth"></span><br>
			<b>allParams:</b> <span data-bind="text: allParams"></span>
		`
	});
	
	// Automatically builds out the documentation navigation
	ko.components.register('documentation-search', {
		allParams: {
			required: {},
			optional: {
				showSearch: {
					description: "To display the search above the navigation",
					defaultValue: true,
					type: types.boolean
				},
				placeholderText: {
					description: "The default text to display in the search box",
					defaultValue: "Search for...",
					type: types.string
				}
			}
		},
		viewModel: function(params) {
			var self = this;
			self.links = ko.observableArray();
			
			if (params.placeholderText !== "") {
				self.placeholderText = params.placeholderText;
			}
			else {
				self.placeholderText = "Search for...";
			}
			
			self.showSearch = params.showSearch; // ko.unwrap(params.showSearch)
			self.searchInput = ko.observable("");
			
			self.filteredResults = ko.computed(function(){
				var searchingText = self.searchInput().toLowerCase();
				
				self.links().forEach(function(link){
					link.subLinks().forEach(function(subLink){
						var foundMatch = subLink.title().toLowerCase().indexOf(searchingText) > -1;
						subLink.visible(foundMatch);
					});
				});
			});
			
			var link = function(parameter) {
				var vm = this;
				
				// param change event
				vm.title = ko.observable(parameter.title);
				vm.id = ko.observable(parameter.id);
				vm.subLinks = ko.observableArray();
				vm.visible = ko.observable(true);
				
				// build up sub group
				if (parameter.dom != undefined) {
					parameter.dom.find(".subgroup").each(function(index, element){
						var id = $(element).find("h4").first().text().replace(/\s+/g, '');
						element.id = id;
						vm.subLinks().push(new link({
							title: $(element).find("h4").first().text(),
							id: id
						}));
					});
				}
				
				return vm;
			}
			
			$(".group").each(function(index, element){
				var title = $(element).find("h3").first().text();
				var id = title.replace(/\s+/g, '');
				element.id = id;
				self.links().push(new link({
					dom: $(element),
					title: title,
					id: id
				}));
			});
			
			setInterval(function(){
				$('[data-spy="scroll"]').each(function () {
					$(this).scrollspy('refresh');
				});
			}, 1000);
		},
		template: `
			<div class="form-group" data-bind="visible: showSearch">
				<input type="text" class="form-control" data-bind="attr: { placeholder: placeholderText }"
					data-bind="textInput: searchInput">
				<span class="input-group-btn"></span>
			</div>
		
			<nav class="bs-docs-sidebar">
				<ul class="nav" data-bind="foreach: links">
					<li>
						<a data-bind="attr: { href: '#' + id() }, text: title"></a> 
						<ul class="nav" data-bind="foreach: subLinks">
							<li><a data-bind="attr: { href: '#' + id() }, text: title, visible: visible"></a></li>
						</ul>
					</li>
				</ul>
			</nav>
			
			<div class="btn-toolbar" role="toolbar">
				<div class="btn-group" role="group">Table</div>
				<div class="btn-group" role="group">Preview</div>
			</div>
		`
	});
	
	ko.applyBindings();
});