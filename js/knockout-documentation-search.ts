import "./knockout-documentation-search.scss";
import knockoutDocumentationSearch from "./knockout-documentation-search.html";
import { getAllComponents } from "./utils";

class LinkVM {
	constructor(name: string, docs: any) {
		this.name = name;
	
		this.docs = docs || {};
		this.description = docs.description;
		this.tags = docs.tags;
		this.category = docs.category;
	
		this.visible = ko.observable(true);
		this.isActive = ko.observable(false);
	
		this.click = (parentVM: any) => {
			parentVM.components.forEach((item: any) => {
				item.isActive(false);
			});
	
			this.isActive(true);
			parentVM.selectedComponent(this.name);
		};
	}

	name: string;

	docs: any;
	description: string;
	tags: string;
	category: string;

	visible: KnockoutObservable<boolean>;
	isActive: KnockoutObservable<boolean>;

	click: (parentVM: any) => void;
}


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
		let self = this;
		
		self.selectedComponent = params.selectedComponent;

		self.showSearch = params.showSearch;
		self.searchInput = ko.observable("");

		self.documentSelf = params.documentSelf || false; // Document own components defaults to false

		// Search text, defaults to "Search for..."
		self.placeholderText = params.placeholderText || "Search for...";
		
		// An array of componentDocumentationVM's
		self.components = [];

		// add all registered components
		let allComponents = getAllComponents();
		Object.keys(allComponents).forEach((key) => {
			let component = allComponents[key];
			self.components.push(new LinkVM(key, component.docs));
		});

		// a list of components that have no category
		self.componentsWOCategory = self.components.filter((x: any) => {
			return x.category === undefined;
		});

		// a list of components with categories. Grouped into there categories
		let groupedCategories =self.components
			.filter((x: any) => {
				return x.category !== undefined;
			});

		let group_to_values = groupedCategories.reduce((obj: any, item: any) => {
			obj[item.category] = obj[item.category] || [];
			obj[item.category].push(item);
			return obj;
		}, {});

		self.componentsCategory = Object.keys(group_to_values).map((key) => {
			return {group: key, subMenus: group_to_values[key]};
		});


		if (self.selectedComponent() === undefined) {
			self.selectedComponent(Object.keys(getAllComponents())[0]);
			self.components
				.find((x: any) => {
					return x.name === self.selectedComponent();
				})
				.isActive(true);
		}

		self.filteredLinks = ko.computed(() => {
			let searchingText = self.searchInput().toLowerCase();
			if (self.components !== undefined) {
				self.components.forEach((link: any) => {
					let titleMatch;
					let descriptionMatch;

					// search title
					if (link.name) {
						titleMatch = link.name.toLowerCase().indexOf(searchingText) > -1;
					}
					
					// search description
					if (link.description) {
						descriptionMatch = link.description.toLowerCase().indexOf(searchingText) > -1;
					}
					
					// search tags
					let tagMatch = false;
					if (link.tags) {
						link.tags.forEach((tag: any) => {
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
	template: knockoutDocumentationSearch
});
