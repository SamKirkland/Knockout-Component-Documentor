
// Automatically builds out the documentation navigation
ko.components.register('documentation-search', {
	allParams: {
		required: {
			links: {
				description: "A ko.observableArray of list items to show in the navigation",
				type: types.ko.observableArray
			}
		},
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
		
		if (params.domChange !== undefined) {
			self.domChange = params.domChange;
			self.domChange.subscribe(function(newValue) {
				// update the documentation component
				$('[data-spy="scroll"]').each(function () {
					$(this).scrollspy('refresh');
				});
			});
		}
		
		self.showSearch = params.showSearch;
		self.searchInput = ko.observable("");
		
		// Search text, defaults to "Search for..."
		if (params.placeholderText !== "") {
			self.placeholderText = params.placeholderText;
		}
		else {
			self.placeholderText = "Search for...";
		}
		
		self.links = params.links;
		self.filteredLinks = ko.computed(function(){
			var searchingText = self.searchInput().toLowerCase();
			
			if (self.links !== undefined) {
				self.links().forEach(function(link){
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
						link.tags().forEach(function(tag){
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
		
	},
	template: `
		<div class="form-group" data-bind="visible: showSearch">
			<input type="text" class="form-control"
				data-bind="attr: { placeholder: placeholderText }, textInput: searchInput">
			<span class="input-group-btn"></span>
		</div>
	
		<nav class="bs-docs-sidebar">
			<ul class="nav">
				<li>
					<a href="#knockoutComponents">Knockout Components</a> 
					<ul class="nav" data-bind="foreach: links">
						<li><a data-bind="attr: { href: '#' + componentID }, text: name, visible: visible"></a></li>
					</ul>
				</li>
			</ul>
		</nav>
	`
});
