
ko.components.register('random-sample-component', {
	allParams: {
		description: "This is a sample component to show the usage of <knockout-component-preview> - you can test one of each editor.",
		tags: ["demo", "example", "tag", "test"],
		pages: ["/page1.html", "/page2.html", "/page3.html", "/page4.html", "/page5.html"],
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
			},
			jsonParam: {
				description: "JSON editor",
				defaultValue: JSON.stringify({ ttest: 'json value', test_2: 123 }),
				type: types.json
			},
			koObservable: {
				description: "knockout observable",
				defaultValue: "something",
				type: types.ko.observable
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

ko.components.register('random-sample-component2', {
	viewModel: function(params) {
		this.paramText = params.paramText;
	},
	template: `
		TEST
	`
});
