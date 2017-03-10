
ko.components.register('random-sample-component', {
	allParams: {
		description: "This is a sample component to show the usage of <knockout-component-preview> - you can test one of each editor.",
		tags: ["demo", "example", "tag", "test"],
		pages: ["/page1.html", "/page2.html", "/page3.html", "/page4.html", "/page5.html"],
		required: {},
		optional: {
			title: {
				description: "The title of the component",
				defaultValue: "Default title",
				type: types.string,
				possibleValues: ["Default title", "First title option", "Another option!", "YEAH"]
			},
			description: {
				description: "A description under the title",
				defaultValue: "default description",
				type: types.string
			},
			icon: {
				description: "The icon to show below the title",
				defaultValue: "glyphicon-user",
				type: types.string,
				possibleValues: ["glyphicon-user", "glyphicon-heart", "glyphicon-cog", "glyphicon-print", "glyphicon-bookmark"]
			},
			uselessParam: {
				description: "Doesn't do anything...",
				defaultValue: true,
				type: types.boolean
			},
			borderWidth: {
				description: "The border size in pixels of the border",
				defaultValue: 1,
				type: types.number
			},
			jsonParam: {
				description: "JSON editor",
				defaultValue: JSON.stringify({ ttest: 'json value', test_2: 123 }),
				type: types.json
			},
			koObservableArray: {
				description: "knockout observableArray",
				defaultValue: "something",
				type: types.ko.observableArray
			},
			jsArray: {
				description: "js array",
				defaultValue: "something",
				type: types.array
			}
		}
	},
	viewModel: function(params) {
		var vm = this;
		
		vm.title = params.title || "Default Title";
		vm.description = params.description || "default description";
		vm.icon = params.icon || "glyphicon-refresh";
		vm.showBorder = params.showBorder;
		vm.borderWidth = parseInt(params.borderWidth) + "px" || "1px";
		
		return vm;
	},
	template: `
		<div style="border:1px solid #000;" data-bind="style: { borderWidth: borderWidth }">
			<h3 data-bind="text: title"></h3>
			<p data-bind="text: description"></p>
			<button type="button" class="btn btn-default btn-lg">
				<span class="glyphicon" data-bind="css: icon"></span> Button
			</button>
		</div>
	`
});
