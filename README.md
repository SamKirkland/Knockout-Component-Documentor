# Knockout Component Documentor

## Description
A Knockout.js component that generates documentation for your Knockout components.

Drop this component on a page and it will create a live preview and editor for every component you have registered on a page. The recommended use case for this is a internal only page/subdomain that where developers, QA, and shareholders can see all available UI component options and quickly protoype with the existing parameters.

## Installing
Note: NPM package is in the roadmap

1. Include the component js file `knockout-component-preview.js` and `clipboard.min.js` in your project
2. Add the CSS and JS on your page:
```html
<link rel="stylesheet" type="text/css" href="knockout-component-preview.css" />
<script src="clipboard.min.js"></script>
<script src="knockout-component-preview.js"></script>
```
3. Include scripts to the components you want to document
4. Add the component to your page:
```html
<knockout-component-preview></knockout-component-preview>
```

## Documenting Components
Add documentation when you register a component.
```javascript
ko.components.register('my-documented-component', {
	docs: {
		description: "A simple example with one required param and one optional param",
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
Knockout Component Preivew supports many properties, if the following properties aren't sufficient see the custom properties section.

| Property      | Type          | Description                                           |
|:-------------:|:-------------:|:-----------------------------------------------------:|
| description   | `string`      | A description of the component                        |
| required      | `object`      | Place documentation for required parameters here      |
| optional      | `object`      | Place documentation for optional parameters here      |
| tags          | `string[]`    | Displayed under the title and searchable in the navigation |
| pages         | `string[]`    | Displayed under the description, the strings should be valid links to the pages this component is used on. Useful for regression testing |

#### Documenting Parameters
Both the `required` and `optional` properties (see above) accept objects. Each object documents a parameter. See which keys you can use to describe your parameters below.

| Property          | Type                          | Description                                           |
|:-----------------:|:-----------------------------:|:-----------------------------------------------------:|
| description       | `string`                      | A description of the component                        |
| defaultValue      | `object`                      | Only used for optional parameters, this is the default value if one isn't passed    |
| type              | `single item` or `array`      | A single type or an array of types is supported, see the [Supported Types](#supported-types) section |
| possibleValues    | `array[string,number,object]` | Place all possible values in this array, the editor will show them in a dropdown |


## Custom Properties
Custom properties are passed through into the component.
1. Simply add them to the `docs`
```javascript
docs: {
    description: "...",
    required: {},
    optional: {},
    myCustomParam: "You can have unlimited custom params, you can also use any type (Object, string, array, etc...)"
}
```
2. Then specify how you want them to be displayed by passing in innerHTML into the component. You can also use any other params, you can even use internal variables knockout component preview sets.
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
| autoDocument          | `boolean`         | `false`           | (Currently Does Nothing!) Attempts to infer paramaters, types, and defaultValues of viewmodel |
| whitelist          | `string[]`         | `undefined`           | (Currently Does Nothing!) Pass in a list of knockout components. The documentor will only document the passed components instead of all registered |
| blacklist          | `string[]`         | `undefined`           | (Currently Does Nothing!) The same as whitelist but inverted. If you pass both whitelist and blacklist you will get an error. |

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
Copyright 2015 Sam Kirkland
Released under The MIT License.