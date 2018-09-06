require("./jsdoc-sample-component.scss");


function jsDocSampleComponentVM(params) {
	var vm = this;

	vm.observableString = params.observableString;
	vm.defaultString = params.defaultString || "default value";
	vm.numParam = params.numParam;
	vm.observableNumber = params.observableNumber;

	return vm;
}

ko.components.register('jsdoc-sample-component', {
	/**
	 * @component jsdoc-sample-component
	 * @tags ["demo", "example", "tag", "test"]
	 * @description A quite wonderful component.
	 * @category JSDoc Folder
	 * @param {ko.observable(string)} params.obsString - A observable that is a string type
	 * @param {string} [params.defaultString=default value] - This param has a default value of "default value"
	 * @param {number} params.numParam - A param number type
	 * @param {ko.observable(number)} params.obsNumber - A observable that is a number type
	 */
	viewModel: function(params) {
		return new jsDocSampleComponentVM(params);
	},
	template: require("./jsdoc-sample-component.html")
});
