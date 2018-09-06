require("./random-sample-component.scss");

ko.components.register('random-sample-component', {
	/**
	 * @component random-sample-component
	 * @tags ["demo", "example", "tag", "test"]
	 * @description This is a sample component to show the usage of <knockout-component-documentor> - you can test one of each editor.
	 * @category Knockout Component Documentor
	 * @param {string|boolean|json} [params.title=Default title] The title of the component
	 * @param {string} [params.description=default description] A description under the title
	 * @param {ko.observable(string)} [params.observable=observable string] A knockout observable string, changing this param will auto unbind and rebind the component
	 * @param {string} [params.icon=glyphicon-user] The icon to show below the title
	 * @param {boolean} [params.uselessParam=true] Doesn't do anything...
	 * @param {number} [params.borderWidth=1] The border size in pixels of the border
	 * @param {json} [params.jsonParam] JSON editor
	 * @param {ko.observableArray(string)} [params.koObservableArray=something] knockout observableArray
	 * @param {array} params.jsArray js array
	 * @param {innerHtml} params.innerHtml Passes through the HTML
	 */
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
