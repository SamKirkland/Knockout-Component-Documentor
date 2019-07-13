import './jsdoc-sample-component.scss';
import jsdocSampleComponent from './jsdoc-sample-component.html';

class JsDocSampleComponentVM {
	constructor(params: {
		observableString: KnockoutObservable<string>,
		defaultString: KnockoutObservable<string>,
		numParam: number,
		observableNumber: KnockoutObservableArray<number>,
	}) {
		this.observableString = params.observableString;
		this.defaultString = params.defaultString || ko.observable("default value");
		this.numParam = params.numParam;
		this.observableNumber = params.observableNumber;
	}
	
	observableString: KnockoutObservable<string>;
	defaultString: KnockoutObservable<string>;
	numParam: number;
	observableNumber: KnockoutObservableArray<number>;
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
	viewModel: function(params: any) {
		return new JsDocSampleComponentVM(params);
	},
	template: jsdocSampleComponent
});
