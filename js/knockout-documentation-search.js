require("./knockout-documentation-search.scss");

function getAllComponents() {
	return ko.components.Ec;
}

var link = function(name, docs){
	var vm = this;

	vm.name = name;

	docs = docs || {};
	vm.description = docs.description;
	vm.tags = docs.tags;
	vm.category = docs.category;

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


ko.components.register('documentation-search', {
	/**
	 * @component documentation-search
	 * @tags ["internal for knockout-component-documentor"]
	 * @description Creates a list of links which will update selectedComponent when clicked
	 * @category Knockout Component Documentor
	 * @param {string} params.selectedComponent This observable will be updated with the selected components name
	 * @param {boolean} [params.documentSelf=false] Determines if <knockout-component-documentor> will be included in the documentation output
	 * @param {boolean} [params.showSearch=true] To display the search above the navigation
	 * @param {string} [params.placeholderText=Search for...] The default text to display in the search box
	 */
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

		// a list of components that have no category
		self.componentsWOCategory = self.components.filter(function(x){
			return x.category === undefined;
		});

		// a list of components with categories. Grouped into there categories
		var groupedCategories =self.components
			.filter(function(x){
				return x.category !== undefined;
			});

		var group_to_values = groupedCategories.reduce(function(obj,item){
			obj[item.category] = obj[item.category] || [];
			obj[item.category].push(item);
			return obj;
		}, {});

		self.componentsCategory = Object.keys(group_to_values).map(function(key){
			return {group: key, subMenus: group_to_values[key]};
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
