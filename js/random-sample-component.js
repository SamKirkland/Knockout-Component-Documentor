require("./random-sample-component.scss");

ko.components.register('random-sample-component', {
	docs: {
		description: "This is a sample component to show the usage of <knockout-component-documentor> - you can test one of each editor.",
		tags: ["demo", "example", "tag", "test"],
		pages: ["/page1.html", "/page2.html", "/page3.html", "/page4.html", "/page5.html"],
		required: {},
		optional: {
			title: {
				description: "The title of the component",
				defaultValue: "Default title",
				type: [ko.types.string, ko.types.json, ko.types.boolean],
				possibleValues: ["Default title", "First title option", "Another option!", "YEAH"]
			},
			description: {
				description: "A description under the title",
				defaultValue: "default description",
				type: ko.types.string
			},
			observable: {
				description: "A knockout observable string, changing this param will auto unbind and rebind the component",
				defaultValue: "observable string",
				type: ko.types.string.observable
			},
			icon: {
				description: "The icon to show below the title",
				defaultValue: "glyphicon-user",
				type: ko.types.string,
				possibleValues: ["glyphicon-user", "glyphicon-heart", "glyphicon-cog", "glyphicon-print", "glyphicon-bookmark"]
			},
			uselessParam: {
				description: "Doesn't do anything...",
				defaultValue: true,
				type: ko.types.boolean
			},
			borderWidth: {
				description: "The border size in pixels of the border",
				defaultValue: 1,
				type: ko.types.number
			},
			jsonParam: {
				description: "JSON editor",
				defaultValue: JSON.stringify({ ttest: 'json value', test_2: 123 }),
				type: ko.types.json
			},
			koObservableArray: {
				description: "knockout observableArray",
				defaultValue: "something",
				type: ko.types.string.observableArray
			},
			jsArray: {
				description: "js array",
				defaultValue: "something",
				type: ko.types.array
			},
			innerHtml: {
				description: "Passes through the HTML",
				defaultValue: "",
				type: ko.types.innerHtml
			}
		}
	},
	viewModel: function(params) {
		var vm = this;

		vm.title = ko.unwrap(params.title) || "Default Title";
		vm.description = ko.unwrap(params.description) || "default description";
		vm.icon = ko.unwrap(params.icon) || "glyphicon-refresh";
		vm.showBorder = ko.unwrap(params.showBorder);
		vm.borderWidth = ko.unwrap(params.borderWidth);

		return vm;
	},
	template: require("./random-sample-component.html")
});
