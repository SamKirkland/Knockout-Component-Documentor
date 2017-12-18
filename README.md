# Knockout Component Documentor

## Description
A Knockout.js component that generates documentation for your Knockout components.

Drop this component on a page and it will create a live preview and editor for every component you have registered on the page. The recommended use case for this is a internal only page where developers, QA, and shareholders can see all available UI components.

## Installing
Note: NPM package is in the roadmap

1. Include the component js file `knockout-component-documentor.js` and `clipboard.min.js` in your project
2. Add the CSS and JS on your page:
```html
<link rel="stylesheet" type="text/css" href="knockout-component-documentor.css" />
<script src="clipboard.min.js"></script>
<script src="knockout-component-documentor.js"></script>
```
3. Include scripts to the components you want to document
4. Add the component to your page:
```html
<knockout-component-documentor></knockout-component-documentor>
```

## Documenting Components
You have two options for documenting components.
1. jsDocs using the special `@component` property
2. Using the `docs` property when registering a component

### Method 1: jsDocs
Note: Currently only some of the options available work using the jsDocs method

Step 1:
Document each component with normal jsDocs syntax. The only unique property knockout-component-documentor needs is the `@component` property. This should be specify the name of the component you're documenting.

```javascript
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
```

Step 2:
Run the command `"npm run document-components"`. This command will look through your solutions jsdocs and generate a `jsdocs.json` file with your documented components.

Note: It would be a good idea to add this to your build configuration so it runs on every build.

Step 3:
Pass the generated file in step 2 into the `<knockout-component-documentor>` component.

```html
<knockout-component-documentor params="jsdocs: { location: '../jsdocs.json', status: status }"></knockout-component-documentor>
```

Note: status is a ko.observable() boolean that is used to communicate with outside components when the documentor is done loading the jsdocs file. In the example page this is done for the side navigation.

### Method 2: Using the `docs` property when registering a component 
Add documentation when you register a component. Place your documentation within the docs property.

```javascript
ko.components.register('my-documented-component', {
	docs: {
		description: "A simple example with one required param and one optional param",
		category: "Example Components"
		required: {
			importantParam: {
				description: "This is a required param, notice it has no defaultValue specified",
				type: ko.types.string
			}
		},
		optional: {
			optionalParamName: {
				description: "This is an example optional param",
				defaultValue: 35,
				type: ko.types.number
			},
			anotherOptionalParam: {
			    description: "An optional param with multiple allowed types and no defaultValue",
			    defaultValue: undefined,
			    type: [ko.types.string, ko.types.string.observable]
			}
		}
	},
	viewModel: function(params) {},
	template: "..."
});
```


#### Properties
Knockout Component Documentor supports many properties, if the following properties aren't sufficient see the custom properties section.

| Property      		| Type          | Description                                           |
|:---------------------:|:-------------:|:-----------------------------------------------------:|
| description   		| `string`      | A description of the component                        |
| required      		| `object`      | Place documentation for required parameters here      |
| optional      		| `object`      | Place documentation for optional parameters here      |
| category (optional)	| `string`      | Components with a category defined will appear within a submenu. Components with the same category (case sensitive) are grouped into the same submenu |
| tags (optional)		| `string[]`    | Displayed under the title and searchable in the navigation |
| pages (optional)		| `string[]`    | Displayed under the description, the strings should be valid links to the pages this component is used on. Useful for regression testing |


#### Documenting Parameters
Both the `required` and `optional` properties (see above) accept objects. Each object documents a parameter. See which keys you can use to describe your parameters below.

| Property          | Type                          | Description                                           |
|:-----------------:|:-----------------------------:|:-----------------------------------------------------:|
| description       | `string`                      | A description of the component                        |
| defaultValue      | `object`                      | Only used for optional parameters, this is the default value if one isn't passed    |
| type              | `single item` or `array`      | A single type or an array of types is supported, see the [Supported Types](#supported-types) section |
| possibleValues    | `array[string,number,object]` | Place all possible values in this array, the editor will show them in a dropdown |


## Custom Properties
Custom properties are used when the properties above just aren't enough for your use case.

1. Is using method 1: 
```javascript
/**
 * @component jsdoc-sample-component
 * @description A component with a custom param!!!
 * @myCustomParam You can have unlimited custom params
 */
```

2. If using method 2: simply add a property directly onto the `docs` section
```javascript
docs: {
	description: "...",
	required: {},
	optional: {},
	myCustomParam: "You can have unlimited custom params, you can also use any type (Object, string, array, etc...)"
}
```

3. Then specify how you want them to be displayed by passing in innerHTML into the component.
```html
<knockout-component-preview>
	<!-- ko if: myCustomParam -->
		This will only be displayed when a component sets the myCustomParam.<br>
		myCustomParam value: <div data-bind="text: myCustomParam"></div>
	<!-- /ko -->
</knockout-component-preview>
```

## Supported Types
The following types are available within `ko.types` for describing parameter types.
The editor will automatically pick the best editor for your parameter based on the type(s) you pass in.
* `ko.types.object`
* `ko.types.date`
* `ko.types.dateTime`
* `ko.types.array`
* `ko.types.string`
* `ko.types.boolean`
* `ko.types.number`
* `ko.types.function`
* `ko.types.json`
* `ko.types.html`
* `ko.types.innerHtml`
* `ko.types.css`

##### Knockout Types
Knockout types are also supported by appending `.observable`, `.observableArray`, or `.computed` to the end of the type.
Example: `ko.types.string.observable`

If you attempt to a type not listed above you will get a red "Unsupported Type" message within the offending component

## Settings
All settings are optional. Pass the params into the component.

| Property              | Type              | Default           | Description                                           |
|:---------------------:|:-----------------:|:-----------------:|:-----------------------------------------------------:|
| componentsToPreview   | `observableArray` | `[]`              | The ko.observableArray that will be updated with components being previewed |
| documentSelf          | `boolean`         | `false`           | Should `<knockout-component-preview>` be included in the documentation output |
| view                  | `string`          | `undefined`       | Determines which view to show onload, pass "dynamicEdit" or "table" |
| includeFn             | `function`        | `function(componentName)`    | A function used transform the component name into your include tags |
| jsdocs                | `Object`          | `undefined`       | `jsdocs: { location: '../jsdocs.json', status: status }` |
| whitelist          	| `string[]`        | `undefined`		| (Currently Does Nothing!) Pass in a list of knockout components. The documentor will only document the passed components instead of all registered |
| blacklist          	| `string[]`        | `undefined`		| (Currently Does Nothing!) The same as whitelist but inverted. If you pass both whitelist and blacklist you will get an error. |

##### Example:
```html
<knockout-component-preview params="
	includeFn: function(componentName){
		return `<script src='/yourCustomFolder/${componentName}.js'></script>`;
	}
">
</knockout-component-preview>
```

## Issues & Solutions

##### No description provided
The description is a required parameter when documenting a component. To fix this add the description key to your component.
If you don't want the component to be displayed in your documentation use the blacklist setting.



## Roadmap
1. autoDocument option
2. whiteList and blackList options
3. Support for live innerHTML in the preview
4. Support for defining examples
5. NPM package
6. React version
7. Angular version


## License
Copyright Sam Kirkland

Released under The MIT License.