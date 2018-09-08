# Knockout Component Documentor

#### [Check out the DEMO!](https://samkirkland.com/labs/Knockout-Component-Documentor/example/example.html)


### Description
A Knockout.js component that generates documentation for your Knockout components.

Drop this component on a page and it will create a live preview and editor for every component you have registered on the page. The recommended use case for this is a internal only page where developers, QA, and shareholders can see all available UI components.


### Getting Started

##### Step 1: Document each component
Document each component with the standard [jsDoc](http://usejsdoc.org/) spec. The only special property `knockout-component-documentor` needs is the `@component` property. This should be specify the name of the component you're documenting.

```javascript
/**
 * @component jsdoc-sample-component
 * @tags ["demo", "example", "tag", "test"]
 * @description A quite wonderful component.
 * @category JSDoc Folder
 * @param {ko.observable(string)} obsString - A observable that is a string type
 * @param {string} [defaultString=default value] - This param has a default value of "default value"
 * @param {number} numParam - A param number type
 * @param {ko.observable(number)} obsNumber - A observable that is a number type
 */
```

##### Step 2: Run the NPM command
Run the command `"npm run document-components"`. This command will look through your solutions jsdocs and generate a `jsdocs.json` file with your documented components.

##### Step 3: Setup the NPM command to run on every build (optional)
It's a good idea to run the command in step 2 on every build so your component documentation is always up to date.

You can have webpack run this command by installing the NPM library `webpack-shell-plugin` and configuring it to run on each build

```javascript
// webpack.config.js
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
	// your config...
	plugins: [
		new WebpackShellPlugin({
			onBuildEnd: ['npm run document-components']
		})
	],
	// your config...
};

```


##### Step 4: Add the component to your page
Add the component js file in your page:
```html
<script src="knockout-component-documentor.bundle.js"></script>
```

Pass the path of the generated file in step 2 into the `<knockout-component-documentor>` component. The default location of `jsdocs.json` is the same folder as `package.json`
```html
<knockout-component-documentor params="jsdocs: { location: '../jsdocs.json' }"></knockout-component-documentor>
```


### Properties
Knockout Component Documentor supports many properties, if the following properties aren't sufficient see the custom properties section.

| Property      		| Type          | Description                                           |
|:---------------------:|:-------------:|:-----------------------------------------------------:|
| description   		| `string`      | A description of the component                        |
| category (optional)	| `string`      | Components with a category defined will appear within a submenu. Components with the same category (case sensitive) are grouped into the same submenu |
| tags (optional)		| `string[]`    | Displayed under the title and searchable in the navigation |
| pages (optional)		| `string[]`    | Displayed under the description, the strings should be valid links to the pages this component is used on. Useful for regression testing |


### Custom Properties
Custom properties are used when the built in jsDoc properties  above just aren't enough for your use case.

```javascript
/**
 * @component jsdoc-sample-component
 * @description A component with a custom param!!!
 * @myCustomParam You can have unlimited custom params
 * @anotherCustomParam Awesome!
 */
```

2. Then specify how you want them to be displayed by passing in innerHTML into the component.
```html
<knockout-component-preview>
	<!-- ko if: myCustomParam -->
		This will only be displayed when a component sets the myCustomParam.<br>
		myCustomParam value: <div data-bind="text: myCustomParam"></div>
	<!-- /ko -->
</knockout-component-preview>
```


### Supported Types
The following types are available for editing in jsdocs.
The editor will automatically pick the best editor for your parameter based on the type(s) you pass in.
```javascript
/**
 * @param {string} paramName - param description here
 * @param {boolean} paramName - param description here
 * @param {number} paramName - param description here
 * @param {object} paramName - param description here
 * @param {array} paramName - param description here
 * @param {function} paramName - param description here
 * @param {json} paramName - param description here
 * @param {date} paramName - param description here
 * @param {dateTime} paramName - param description here
 * @param {html} paramName - param description here
 * @param {innerHtml} paramName - param description here
 * @param {css} paramName - param description here
 */
```

If you wan't to denote that these params are observable simply wrap them in `ko.observable(TYPE)`
```javascript
/**
 * @param {ko.observable(string)} paramName - param description here
 * @param {ko.observable(boolean)} paramName - param description here
 * and so on...
 */
```

All unkown types will be edited as "other"

##### Knockout Types
Knockout types are also supported by appending `.observable`, `.observableArray`, or `.computed` to the end of the type.
Example: `ko.types.string.observable`

If you attempt to a type not listed above you will get a red "Unsupported Type" message within the offending component



### Settings
All settings are optional. Pass the params into the component.

| Property              | Type              | Default           | Description                                           |
|:---------------------:|:-----------------:|:-----------------:|:-----------------------------------------------------:|
| componentsToPreview   | `observableArray` | `[]`              | The ko.observableArray that will be updated with components being previewed |
| documentSelf          | `boolean`         | `false`           | Should `<knockout-component-preview>` be included in the documentation output |
| view                  | `string`          | `undefined`       | Determines which view to show onload, pass "dynamicEdit" or "table" |
| includeFn             | `function`        | `function(componentName, filename, filepath)`    | A function used transform the component name into your include tags |
| jsdocs                | `Object`          | `undefined`       | `jsdocs: { location: '../jsdocs.json', status: status }` |


##### Example:
```html
<knockout-component-preview params="
	includeFn: function(componentName, filename, filepath){
		return `<script src='/yourCustomFolder/${componentName}.js'></script>`;
	}
">
</knockout-component-preview>
```


### Issues & Solutions

##### Components are being documented
1. Verify you completed all the `getting started` steps.
2. Verify you added the `.js` files for all the component you want to document to your page
3. Verify the generated `jsdoc.json` file has your components documentation in it - if the `jsdoc.json` file is empty, or jsdoc comments aren't appearing in the file verify the location of your comments is valid. They should appear directly before the `viewModel: function(params) {` line when registering components
4. If you're still having issues create a github issue

##### No description provided
The description is a required parameter when documenting a component. To fix this add the `@description` jsdoc key to your component.
```javascript
/**
 * @component jsdoc-sample-component
 * @description A component with a description
 */
```


### Roadmap
1. autoDocument option
3. Support for defining examples
4. NPM package
5. React version


### License
Copyright Sam Kirkland

Released under The MIT License.