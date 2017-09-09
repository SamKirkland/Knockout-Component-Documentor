# Knockout Component Documentor

## Description
A Knockout.js component that generates documentation for your Knockout components.

## Usage
1. Include the component js file 'knockout-component-preview.js' (under the src folder) in your project
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
			}
		}
	},
	viewModel: function(params) {},
	template: "..."
});
```


#### Properties
Knockout Component Documentor supports many properties, if the following properties aren't sufficient see the custom properties section below.

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
| defaultValue      | `object`                      | Place documentation for required parameters here      |
| type              | `single item` or `array`      | A single type or an array of types are supported, see the [Supported Types](http://...#supported-types) section |
| possibleValues    | `array[string|number|object]` | Place all possible values in this array, the editor will shhow them in a dropdown |


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
2. Then specify how you want them to be displayed by passing in innerHTML into the component. You can also you any other params or inner HTML vars the component uses in this innerHTML!
```html
<knockout-component-preview>
    <div data-bind="text: myCustomParam"></div>
</knockout-component-preview>
```

## [Supported Types](#supported-types)
The variable `ko.types` is available for describing parameter types:
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

If you attempt to use another type you will get a red "Unsupported Type" message within the offending component


## License
Copyright 2015 Sam Kirkland
Released under The MIT License.