// ex: types.get(prop) == types.number
var types = {
	'get': function(prop) {
		return Object.prototype.toString.call(prop);
	},
	'object': '[object Object]',
	'date': '[object Date]',
	'array': '[object Array]',
	'string': '[object String]',
	'boolean': '[object Boolean]',
	'number': '[object Number]'
}

$(document).ready(function(){
	ko.components.register('knockout-component-tester', {
		viewModel: {
			createViewModel: function(params, componentInfo) {
				function myViewModelFactory(params, componentInfo) {
					var self = this;
					
					self.paramList = ko.observableArray();
					
					var componentParamVM = function (parameter) {
						var vm = this;
						
						vm = parameter;
						
						vm.formType = types.get(parameter.possibleValues || parameter.defaultValue);
						
						// param change event
						vm.valueBinding = ko.observable();
						vm.value = ko.computed(function(){
							if (vm.formType === types.boolean) {
								return vm.valueBinding() === "true";
							}
							return vm.valueBinding();
						});
						
						vm.name = parameter.name;
						
						// create param
						vm[parameter.name] = ko.computed(function(){
							if (vm.formType === types.boolean) {
								return vm.valueBinding() === "true";
							}
							return vm.valueBinding();
						});
						
						// setup input placeholder text
						vm.placeHolder = "";
						if (typeof parameter.possibleValues != 'undefined') {
							vm.placeHolder = parameter.possibleValues.toString();
						}
						else if (typeof parameter.defaultValue != 'undefined') {
							vm.placeHolder = parameter.defaultValue.toString();
						}
						
						return vm;
					}
					
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
								
								var componentParams = ko.components.Cc[componentName].params;
								
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
									self.paramList.push(new componentParamVM(currentParam));
									
									//self.currentParams
									
									// param attribute for the component
									component.setAttribute("params", `${currentParam.name}: ${currentParam.name}`);
								}
								
								
							}
						}
					}
					
					self.paramObject = ko.computed(function(){
						var paramListLength = self.paramList().length;
						
						var obj = {};
						for (var i = 0; i < paramListLength; i++) {
							var paramVM = self.paramList()[i];
							obj[paramVM.name] = paramVM.value();
						}
						
						return obj;
					});
					
					return self;
				}
				
				setTimeout(function(){
					$('[data-spy="scroll"]').each(function () {
						$(this).scrollspy('refresh');
					}); 
				}, 1000);
				
				return new myViewModelFactory(params, componentInfo);
				
			}
		},
		template: `
			<div class="row subgroup">
				<div class="col-xs-12">
					<h4 data-bind="text: componentName"></h4>
				</div>
				<div class="col-xs-4">
					
					<div class="list-group" data-bind="foreach: paramList">
						<div href="#" class="list-group-item">
							<h4 class="list-group-item-heading" data-bind="text: name">List group item heading</h4>
							<p class="list-group-item-text" data-bind="text: 'No Description' || 'description: ' + description"></p>
							<p class="list-group-item-text" data-bind="text: 'required: ' + required"></p>
							<p class="list-group-item-text" data-bind="text: 'defaultValue: ' + defaultValue"></p>
							<p class="list-group-item-text" data-bind="text: 'placeHolder: ' + placeHolder"></p>
							<p class="list-group-item-text">
								<div class="form-group">
									<label for="ex1" data-bind="text: name"></label>
									<!-- ko if: formType === types.array -->
										<select data-bind="options: possibleValues, value: valueBinding"></select>
									<!-- /ko -->
									<!-- ko if: formType === types.string -->
										<input data-bind="textInput: valueBinding, attr: { 'required': required, 'placeholder': placeHolder }" type="text" class="form-control" id="ex1">
									<!-- /ko -->
									<!-- ko if: formType === types.boolean -->
										<label class="checkbox-inline">
											<input type="radio" name="1" value="true" data-bind="checked: valueBinding"> true
										</label>
										<label class="checkbox-inline">
											<input type="radio" name="1" value="false" data-bind="checked: valueBinding"> false
										</label>
									<!-- /ko -->
									<!-- ko if: formType === types.number -->
										<input type="number" class="form-control" data-bind="textInput: valueBinding" id="ex1">
									<!-- /ko -->
								</div>
							</p>
						</div>
					</div>
					
				</div>
				<div class="col-xs-8" style="border: 1px solid #666;">
					<div data-bind='component: { name: componentName, params: paramObject }'></div>
					<div data-bind="text: component"></div>
				</div>
				<div class="clearfix"></div>
			</div>
		`
	});
	
	ko.components.register('random-sample-component', {
		params: [
			{
				name: "showBorder",
				description: "Show a border around the demo component",
				required: false,
				defaultValue: true
			},
			{
				name: "dropdown",
				description: "The border size in pixels of the border",
				required: false,
				defaultValue: "none",
				possibleValues: [0, "none", "somethingElse"]
			},
			{
				name: "borderWidth",
				description: "The border size in pixels of the border",
				required: false,
				defaultValue: 0
			},
			{
				name: "paramText",
				description: "The text to appear within a component",
				required: true,
				defaultValue: "oops",
				possibleValues: ["oops", "poops", "woops", "unicorn poo", "Ex3"]
			}
		],
		viewModel: function(params) {
			this.paramText = ko.observable(params.paramText);
			this.borderWidth = ko.observable(params.borderWidth);
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
		params: [
			{
				name: "showSearch",
				description: "To display the search above the navigation",
				required: false,
				defaultValue: true
			},
			{
				name: "placeholderText",
				description: "The default text to display in the search box",
				required: false,
				defaultValue: "Search for..."
			}
		],
		viewModel: function(params) {
			var self = this;
			self.links = ko.observableArray();
			
			if (params.placeholderText !== "") {
				self.placeholderText = params.placeholderText;
			}
			else {
				self.placeholderText = "Search for...";
			}
			
			self.showSearch = ko.observable(params.showSearch);
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
			
			setTimeout(function(){
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
		`
	});
	
	ko.applyBindings();
	
	
	//ko.applyBindings();
});