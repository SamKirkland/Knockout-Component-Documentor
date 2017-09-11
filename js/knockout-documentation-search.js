require("./knockout-documentation-search.scss");

function getAllComponents() {
	return ko.components.Cc;
}

var link = function(name, docs){
	var vm = this;

	vm.name = name;
	vm.description = docs.description;
	vm.tags = docs.tags;
	vm.visible = ko.observable(true);
	vm.isActive = ko.observable(false);

	vm.click = function(parent){
		parent.components.forEach(function(item){
			item.isActive(false);
		});

		vm.isActive(true);
		parent.selectedComponent(vm.name);
	};

	return vm;
};

// Automatically builds out the documentation navigation
ko.components.register('documentation-search', {
	docs: {
		description: "Creates a list of links which will update selectedComponent when clicked",
		tags: ["internal for knockout-component-preview"],
		required: {
			selectedComponent: {
				description: "This observable will be updated with the selected components name",
				type: ko.types.string
			}
		},
		optional: {
			documentSelf: {
				description: "should <knockout-component-preview> be included in the documentation output",
				defaultValue: false,
				type: ko.types.boolean
			},
			showSearch: {
				description: "To display the search above the navigation",
				defaultValue: true,
				type: ko.types.boolean
			},
			placeholderText: {
				description: "The default text to display in the search box",
				defaultValue: "Search for...",
				type: ko.types.string
			}
		}
	},
	viewModel: function(params) {
		var self = this;
		
		self.selectedComponent = params.selectedComponent;

		self.showSearch = params.showSearch;
		self.searchInput = ko.observable("");

		self.documentSelf = params.documentSelf || false; // Document own components defaults to false

		// Search text, defaults to "Search for..."
		self.placeholderText = params.placeholderText || "Search for...";
		
		// An array of componentDocumentationVM's
		self.components = [];

		// add all registered components
		$.each(getAllComponents(), function(key, componentRegistration){
			self.components.push(new link(key, componentRegistration.docs));
		});

		if (self.selectedComponent() === undefined) {
			self.selectedComponent(Object.keys(getAllComponents())[0]);
			self.components
				.find(function(x) {
					return x.name === self.selectedComponent();
				})
				.isActive(true);
		}

		self.filteredLinks = ko.computed(function(){
			var searchingText = self.searchInput().toLowerCase();
			if (self.components !== undefined) {
				self.components.forEach(function(link){
					// search title
					if (link.name) {
						var titleMatch = link.name.toLowerCase().indexOf(searchingText) > -1;
					}
					
					// search description
					if (link.description) {
						var descriptionMatch = link.description.toLowerCase().indexOf(searchingText) > -1;
					}
					
					// search tags
					var tagMatch = false;
					if (link.tags) {
						link.tags.forEach(function(tag){
							if (tagMatch) {
								return false; // stop loop
							}
							tagMatch = tag.toLowerCase().indexOf(searchingText) > -1;
						});
					}
					
					link.visible(titleMatch || descriptionMatch || tagMatch);
				});
			}
		});
		
		return self;	
	},
	template: require("./knockout-documentation-search.html")
});
