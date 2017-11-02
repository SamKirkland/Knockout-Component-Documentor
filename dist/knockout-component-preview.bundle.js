/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(6);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {


function knockoutType(baseType) {
	this.baseType = baseType;

	// knockout types
	this.observable = `${baseType} observable`;
	this.observableArray = `${baseType} observableArray`;
	this.computed = `${baseType} computed`;

	return this;
}


// ex: types.get(prop) === types.number
ko.types = ko.types || {
	get: function(prop) {
		return Object.prototype.toString.call(prop);
	},
	getBaseType: function(prop) {
		return ko.types.getType(prop).match(new RegExp(/(\[.*\])/i))[1];
	},
	compareType: function(prop1, prop2) {
		return ko.types.getBaseType(prop1) === ko.types.getBaseType(prop2);
	},
	getType: function(prop) {
		if (typeof prop === "object") {
			return prop.baseType;
		}
		else {
			return prop;
		}
	},
	getFormatted: function(prop, errorCallback) {
		var typeAsString = ko.types.getType(prop);

		if (typesValues.indexOf(typeAsString) === -1) {
			errorCallback();
			return "Unsupported Type";
		}

		var baseType = typeAsString.match(/(?:\[\w+ )?(\w+)\]?/i)[1];

		// return type with observable/observableArray/computed
		/*
		var regexp = /\]\s+(\w+)/i;
		if (regexp.test(typeAsString)) {
			var matches = regexp.exec(typeAsString);
			return `${matches[1]} ${baseType}`;
		}
		*/

		return baseType;
	},
	isKnockout: function(type) {
		var typeAsString = ko.types.getType(prop);

		return typeAsString.indexOf('observable') >= 0 || typeAsString.indexOf('computed') >= 0;
	},
	object: new knockoutType('[object Object]'),
	date: new knockoutType('[object Date]'),
	dateTime: new knockoutType('[object DateTime]'),
	array: new knockoutType('[object Array]'),
	string: new knockoutType('[object String]'),
	boolean: new knockoutType('[object Boolean]'),
	number: new knockoutType('[object Number]'),
	function: new knockoutType('[object function]'),
	json: new knockoutType('[object JSON]'),
	html: new knockoutType('[object HTML]'),
	innerHtml: new knockoutType('[object InnerHTML]'),
	css: new knockoutType('[object CSS]'),
	other: new knockoutType('[object Other]')
};


Object.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

var typesValues = Object.values(Object.flatten(ko.types));


window.paramAsText = function(property) {
	if (property === undefined) {
		return "undefined";
	}
	
	if (ko.types.get(property) === ko.types.number) {
		return property;
	}
	
	return JSON.stringify(property);
}


function Generator() {};
Generator.prototype.rand =  Math.floor(Math.random() * 26) + Date.now();
Generator.prototype.getId = function() { return 'uniqueID_' + this.rand++; };
window.idGen = new Generator();




// Create uniqueID and run function
// pass a function that accepts the params (element, allBindings, viewModel, bindingContext)
ko.bindingHandlers.uniqueIdFunction = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		// bind a unique ID
		var uniqueID = idGen.getId();
		$(element).attr("id", uniqueID);
		
		ko.unwrap(valueAccessor)().fn(element, valueAccessor, allBindings, viewModel, bindingContext);
    } 
};

ko.bindingHandlers.addUniqueID = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var uniqueID = idGen.getId();
		$(element).attr("id", uniqueID);
		valueAccessor()(uniqueID);
	}
};

ko.bindingHandlers.clipboard = {
	init: function(el, valueAccessor, allBindings, data, context) {
		new Clipboard(el, {
			text: function(trigger) {
				if (typeof valueAccessor === "function") { // ko.unwrap wont work here
					return valueAccessor();
				}
				return valueAccessor;
			}
		}).on('success', function(e) {
			$(e.trigger).addClass("btn-success").find("span")
				.removeClass("glyphicon-copy")
				.addClass("glyphicon-ok");
			setTimeout(function(){
				$(e.trigger).removeClass("btn-success").find("span")
					.addClass("glyphicon-copy")
					.removeClass("glyphicon-ok");
			}, 750);
		});
	}
};

window.codeEditorFunction = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	var bindingParams = ko.utils.unwrapObservable(valueAccessor());
	
	if (bindingParams.mode === "json") {
		bindingParams.mode = { name: "javascript", json: true };
	}
	
	if (bindingParams.readOnly === undefined) {
		bindingParams.readOnly = false;
	}
	
	var myCodeMirror = CodeMirror.fromTextArea(element, {
		lineNumbers: true,
		mode: bindingParams.mode,
		readOnly: bindingParams.readOnly,
		lineWrapping: true,
		indentWithTabs: true,
		matchBrackets: true,
		theme: "mdn-like"
	});
	
	myCodeMirror.on("change", function(cm, change) {
		// update the value binding with the codemirror changes
		if (viewModel.textBinding !== undefined) {
			viewModel.textBinding(cm.getValue());
		}
	});
};


__webpack_require__(3);
__webpack_require__(8);
__webpack_require__(16);
__webpack_require__(20);


$(document).ready(function(){
	var pageVM = {
		selectedComponent: ko.observable(),
		status: ko.observable(false)
	};

	ko.applyBindings(pageVM);
});


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(4);

function getAllComponents() {
	return ko.components.Cc;
}

var link = function(name, docs){
	var vm = this;

	vm.name = name;

	docs = docs || {};
	vm.description = docs.description;
	vm.tags = docs.tags;
	vm.category = docs.category;

	vm.visible = ko.observable(true);
	vm.isActive = ko.observable(false);

	vm.click = function(parent){
		parent.components.forEach(function(item){
			item.isActive(false);
		});

		vm.isActive(true);
		parent.selectedComponent(vm.name);
	};


	return vm;
};


// Automatically builds out the documentation navigation
ko.components.register('documentation-search', {
	docs: {
		description: "Creates a list of links which will update selectedComponent when clicked",
		tags: ["internal for knockout-component-preview"],
		category: "Knockout Preview",
		required: {
			selectedComponent: {
				description: "This observable will be updated with the selected components name",
				type: ko.types.string
			}
		},
		optional: {
			documentSelf: {
				description: "should <knockout-component-preview> be included in the documentation output",
				defaultValue: false,
				type: ko.types.boolean
			},
			showSearch: {
				description: "To display the search above the navigation",
				defaultValue: true,
				type: ko.types.boolean
			},
			placeholderText: {
				description: "The default text to display in the search box",
				defaultValue: "Search for...",
				type: ko.types.string
			}
		}
	},
	viewModel: function(params) {
		var self = this;
		
		self.selectedComponent = params.selectedComponent;

		self.showSearch = params.showSearch;
		self.searchInput = ko.observable("");

		self.documentSelf = params.documentSelf || false; // Document own components defaults to false

		// Search text, defaults to "Search for..."
		self.placeholderText = params.placeholderText || "Search for...";
		
		// An array of componentDocumentationVM's
		self.components = [];

		// add all registered components
		$.each(getAllComponents(), function(key, componentRegistration){
			self.components.push(new link(key, componentRegistration.docs));
		});

		// a list of components that have no category
		self.componentsWOCategory = self.components.filter(function(x){
			return x.category === undefined;
		});

		// a list of components with categories. Grouped into there categories
		var groupedCategories =self.components
			.filter(function(x){
				return x.category !== undefined;
			});

		var group_to_values = groupedCategories.reduce(function(obj,item){
			obj[item.category] = obj[item.category] || [];
			obj[item.category].push(item);
			return obj;
		}, {});

		self.componentsCategory = Object.keys(group_to_values).map(function(key){
			return {group: key, subMenus: group_to_values[key]};
		});


		if (self.selectedComponent() === undefined) {
			self.selectedComponent(Object.keys(getAllComponents())[0]);
			self.components
				.find(function(x) {
					return x.name === self.selectedComponent();
				})
				.isActive(true);
		}

		self.filteredLinks = ko.computed(function(){
			var searchingText = self.searchInput().toLowerCase();
			if (self.components !== undefined) {
				self.components.forEach(function(link){
					// search title
					if (link.name) {
						var titleMatch = link.name.toLowerCase().indexOf(searchingText) > -1;
					}
					
					// search description
					if (link.description) {
						var descriptionMatch = link.description.toLowerCase().indexOf(searchingText) > -1;
					}
					
					// search tags
					var tagMatch = false;
					if (link.tags) {
						link.tags.forEach(function(tag){
							if (tagMatch) {
								return false; // stop loop
							}
							tagMatch = tag.toLowerCase().indexOf(searchingText) > -1;
						});
					}
					
					link.visible(titleMatch || descriptionMatch || tagMatch);
				});
			}
		});
		
		return self;	
	},
	template: __webpack_require__(7)
});


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./knockout-documentation-search.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./knockout-documentation-search.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "documentation-search {\n  display: flex;\n  flex-direction: column; }\n  documentation-search .component-list-overflow {\n    flex: 1;\n    overflow-y: auto; }\n    documentation-search .component-list-overflow::-webkit-scrollbar-track {\n      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.75); }\n    documentation-search .component-list-overflow::-webkit-scrollbar {\n      width: 6px; }\n    documentation-search .component-list-overflow::-webkit-scrollbar-thumb {\n      background-color: rgba(0, 0, 0, 0.8); }\n", ""]);

// exports


/***/ }),
/* 6 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = "<div class=\"form-group\" data-bind=\"visible: showSearch\" style=\"margin: 10px;\">\r\n\t<input type=\"text\" style=\"border-radius: 0;\" class=\"form-control\"\r\n\t\tdata-bind=\"attr: { placeholder: placeholderText }, textInput: searchInput\">\r\n\t<span class=\"input-group-btn\"></span>\r\n</div>\r\n\r\n<div class=\"component-list-overflow\">\r\n\t<ul class=\"list-unstyled\">\r\n\t\t<!-- ko foreach: componentsCategory -->\r\n\t\t\t<li>\r\n\t\t\t\t<a data-bind=\"text: group, attr: { href: ('#' + group.replace(/\\s+/g, '-')) }\" data-toggle=\"collapse\" aria-expanded=\"false\" class=\"subMenu\"></a>\r\n\t\t\t\t<ul class=\"collapse list-unstyled\" data-bind=\"foreach: subMenus, attr: { id: (group.replace(/\\s+/g, '-')) }\">\r\n\t\t\t\t\t<li>\r\n\t\t\t\t\t\t<a data-bind=\"\r\n\t\t\t\t\t\t\tattr: { href: '#goto-' + name },\r\n\t\t\t\t\t\t\ttext: name,\r\n\t\t\t\t\t\t\tclick: function(){ click($component); },\r\n\t\t\t\t\t\t\tvisible: visible\"></a>\r\n\t\t\t\t\t</li>\r\n\t\t\t\t</ul>\r\n\t\t\t</li>\r\n\t\t<!-- /ko -->\r\n\t\t<!-- ko foreach: componentsWOCategory -->\r\n\t\t<li data-bind=\"css: { 'active': isActive }\">\r\n\t\t\t<a data-bind=\"\r\n\t\t\t\tattr: { href: '#goto-' + name },\r\n\t\t\t\ttext: name,\r\n\t\t\t\tclick: function(){ click($component); },\r\n\t\t\t\tvisible: visible\"></a>\r\n\t\t</li>\r\n\t\t<!-- /ko -->\r\n\t</ul>\r\n</div>";

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(9);
__webpack_require__(11);

function getAllComponents() {
	return ko.components.Cc;
}

function componentExists(componentName) {
	return typeof getAllComponents()[ko.unwrap(componentName)] !== undefined;
}

function addOrError(item, errorArray, errorMessage) {
	if (typeof item === "undefined") {
		errorArray.push(errorMessage);
		return undefined;
	}
	
	return item;
};

function defaultValue(value, defaultValue) {
	if (typeof value === "undefined") {
		return defaultValue;
	}
	return value;
}

function jsDocTypeToComponentType(jsDocType) {
	var regexp = /ko\.(\w+)\((.*)\)/i;

	if (!regexp.test(jsDocType)) {
		// not a knockout type type
		return jsDocToBaseType(jsDocType);
	}


	// detect if the type is a knockout type (ko.observable, ko.observableArray, ko.computed)
	var matches = regexp.exec(jsDocType);
	var baseType = jsDocToBaseType(matches[2]);

	switch (matches[1].toLowerCase()) {
		case "observable":
			return baseType.observable;

		case "observablearray":
			return baseType.observableArray;

		case "computed":
			return baseType.computed;

		default:
			return baseType;
	}
}

function jsDocToBaseType(jsDocType) {
	switch (jsDocType.toLowerCase()) {
		case "object":
			return ko.types.object;

		case "date":
			return ko.types.date;

		case "datetime":
			return ko.types.dateTime;

		case "array":
			return ko.types.array;

		case "string":
			return ko.types.string;

		case "boolean":
			return ko.types.boolean;

		case "number":
			return ko.types.number;

		case "function":
			return ko.types.function;

		case "json":
			return ko.types.json;

		case "html":
			return ko.types.html;

		case "innerhtml":
			return ko.types.innerHtml;

		case "css":
			return ko.types.css;

		default:
			return ko.types.other;
	}
}

function jsDocsToComponentDocs(jsDocs) {
	var allComponents = [];

	// ToDo: Only run conversion on items that use @component
	$.each(jsDocs, function(index, jsDoc) {
		var componentDocs = {
			description: jsDoc.description,
			category: jsDoc.category,
			required: {},
			optional: {}
		};

		// move params to required and optional objects
		$.each(jsDoc.params, function(paramIndex, param) {
			var objToAddTo = componentDocs.required;
			if (param.optional) {
				objToAddTo = componentDocs.optional;
			}

			// remove "params" from the front of each param
			var paramName = param.name;
			var regexp = /\w+\.(.*)/i;
			if (regexp.test(paramName)) {
				paramName = regexp.exec(paramName)[1];
			}


			// ToDo: Add possibleValues
			// ToDo: Support types in defaultValue
			// ToDo: Add support for multiple types
			objToAddTo[paramName] = {
				description: param.description,
				defaultValue: param.defaultvalue,
				type: jsDocTypeToComponentType(param.type.names[0])
			};
		});

		// move all the custom tags onto the componentDocs object
		$.each(jsDoc.customTags, function(customTagsIndex, customTag) {
			if (customTag.tag === "tags") {
				// try to convert tags to array
				componentDocs[customTag.tag] = JSON.parse(customTag.value);
			}
			else {
				componentDocs[customTag.tag] = customTag.value;
			}
		});

		allComponents.push(componentDocs);
	});

	return allComponents;
}

var componentPreviewVM = function(params, componentInfo) {
	var vm = this;
	
	var defaultIncludeFn = function(componentName) { return `<script src="/js/${componentName}.js"></script>`; };
	var includeFn = params.includeFn || defaultIncludeFn;

	vm.loadingComplete = ko.observable(false);

	if (params.jsdocs !== undefined) {
		if (location.protocol === 'file:') {
			alert("jsdocs uses ajax to load in your doc file. This cannot be done on a local website. To fix this use localhost");
		}
		else {
			// load the jsdoc json file
			$.getJSON(params.jsdocs.location, function(jsDocs) {
				var jsDocs = jsDocsToComponentDocs(jsDocs);

				// add jsDocs to component registration
				$.each(jsDocs, function(index, jsDoc) {
					if (jsDoc.component !== undefined && componentExists(jsDoc.component)) {
						var componentRegistration = getAllComponents()[jsDoc.component];

						// merge jsDocs into docs
						componentRegistration.docs = $.extend(true, componentRegistration.docs, jsDoc);
					}
				});

				vm.loadingComplete(true);
				params.jsdocs.status(true);
			});
		}
	}

	if (!componentExists(params.componentName)) {
		// addOrError(paramsTempArray, vm.errors, `Component "${params.componentName}" can't be documented because its not registered on the page.`);
		return;
	}

	vm.componentName = params.componentName;

	// script tag generator
	vm.htmlInclude = includeFn(ko.unwrap(vm.componentName));

	// wait until jsDocs are loaded to get components
	vm.loadingComplete.subscribe(function(){
		vm.componentName.subscribe(function(newComponent){
			vm.viewModel(
				new componentDocumentationVM(vm, getAllComponents()[newComponent])
			);
		});

		vm.viewModel = ko.observable();

		if (vm.componentName() !== undefined) {
			vm.viewModel(new componentDocumentationVM(vm, getAllComponents()[vm.componentName()]));
		}
	});

	return vm;
};

var componentDocumentationVM = function(parent, construct) {
	var vm = this;
	var component = defaultValue(construct.docs, {});
	
	vm.errors = ko.observableArray();

	vm.componentName = parent.componentName();
	vm.htmlInclude = parent.htmlInclude;
	vm.componentID = `goto-${vm.componentName}`;

	vm.description = addOrError(
		component.description,
		vm.errors,
		`<b>No description provided</b><br>
		To fix this error add a new key 'description' to the component, <a target="_blank" href="https://github.com/SamKirkland/Knockout-Component-Preview#no-description-provided">example</a>.`
	); // A description of the component
	
	vm.pages = defaultValue(component.pages, []); // A list of pages these components are used on
	vm.tags = defaultValue(component.tags, []); // A list of tags
	vm.params = ko.observableArray(); // A list of all params (required and optional)
	vm.view = ko.observable(defaultValue(construct.view, "Table")); // View can be Table or Preview, defaults to Table
	vm.previewView = function() { vm.view("Preview"); };
	vm.tableView = function() { vm.view("Table"); };

	var blackListedComponents = ['knockout-component-preview', 'documentation-search', 'knockout-type-editor'];
	vm.blackListedComponent = blackListedComponents.indexOf(vm.componentName) >= 0;

	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	vm.componentParamObject = ko.computed(function(){
		var paramObject = {};
		vm.params().forEach(function(element, index){
			if (element.value() !== element.defaultValue && element.types[0] !== ko.types.innerHtml) {
				paramObject[element.name] = element.value();
			}
		});
		return paramObject;
	});
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	/* DELETE THE FOLLOWING ------------------------------ */
	
	vm.innerHtml = ko.observable();
	vm.html = ko.computed(function(){
		var paramsList = [];
		vm.params().map(function(param){ // Build up params
			if (param.value() !== param.defaultValue) { // Only add the param if it's not a default value
				paramsList.push(`${param.name}: ${JSON.stringify(param.value())}`);
			}
		});
		
		var paramsText = paramsList.join(",\n\t"); // format params
		var computedHTML = `<${vm.componentName} params='\n\t${paramsText}\n'></${vm.componentName}>`;
		vm.innerHtml(computedHTML);
		
		// find code instance, and update it
		// ToDo: fix this. make it less hacky
		var $textBoxInstance = $(`#${vm.componentID} .CodeMirror`).last();
		if ($textBoxInstance.length) {
			$textBoxInstance[0].CodeMirror.setValue(computedHTML);
		}
		
		return computedHTML;
	});
	
	
	// add the paramaters to the paramater list
	var paramsTempArray = [];
	
	// if component they didn't add the documentation param end here
	if (component === undefined) {
		addOrError(paramsTempArray, vm.errors, `No documentation defined`);
		return vm;
	}

	if (component && !jQuery.isEmptyObject(component.required)) {
		$.each(component.required, function(key, paramObj) {
			paramObj.required = true;
			paramObj.name = key;
			paramsTempArray.push(new paramVM(vm, paramObj));
		});
	}
	if (component && !jQuery.isEmptyObject(component.optional)) {
		$.each(component.optional, function(key, paramObj) {
			paramObj.required = false;
			paramObj.name = key;
			paramsTempArray.push(new paramVM(vm, paramObj));
		});
	}
	
	addOrError(paramsTempArray, vm.errors, "No parameters defined");
	vm.params(paramsTempArray); // Add required/optional params to the main list
	
	return vm;
};

var paramVM = function(parent, construct){
	var vm = this;
	
	vm.name = construct.name || ""; // Name something something error
	vm.required = construct.required;
	vm.description = construct.description || ""; // No description error
	vm.selectedValue = ko.observable();
	vm.defaultValue = construct.defaultValue || ""; // No defaultValue error
	
	vm.possibleValues = construct.possibleValues || []; // all possible values (if set)
	vm.example = construct.example || ""; // No example error
	
	vm.value = ko.observable();
	vm.types = convertToArray(construct.type);
	
	//console.log(vm.types);

	vm.typeFormatted = ko.computed(function(){
		return vm.types.map(function(t) {
			return ko.types.getFormatted(t, function(){
				parent.errors.push(
					`<b>The type '${t}' is not supported.</b><br>
					To fix this error change the value to the right of 'type' for the '${vm.name}' param to a <a href="https://github.com/SamKirkland/Knockout-Component-Preview#SupportedTypes">supported type</a>.`
				);
			});
		});
	});

	vm.dataTypeClass = function(data) {
		var typeAsString = `[object ${data}]`;
		switch (typeAsString) {
			case ko.types.number.baseType:
				return "colorized-number";
				
			case ko.types.string.baseType:
				return "colorized-string";
				
			case ko.types.boolean.baseType:
				return "colorized-boolean";
				
			case ko.types.array.baseType:
				return "colorized-array";
			
			default:
				return "colorized-default";
		}
	};
	
	function convertToArray(data) {
		if (ko.types.get(data) === ko.types.array.baseType) {
			return data;
		}
		
		return [data];
	};
	
	return vm;
};


ko.components.register('knockout-component-preview', {
	docs: {
		description: "Documents Knockout.js components",
		tags: ["internal for knockout-component-preview"],
		category: "Knockout Preview",
		required: {},
		optional: {
			documentSelf: {
				description: "should <knockout-component-preview> be included in the documentation output",
				defaultValue: false,
				type: ko.types.boolean
			},
			jsdocs: {
				description: "The path to the json file generated from jsdocs. If passed components will document themselves based on jsdocs data.",
				defaultValue: undefined,
				type: ko.types.string
			},
			autoDocument: {
				description: "Attempts to infer paramaters, types, and defaultValues of viewmodel",
				defaultValue: false,
				type: ko.types.boolean
			},
			includeFn: {
				description: "A function used transform the component name into your include tags.",
				defaultValue: function(componentName){ return `<script src="/js/${includeFn}.js"></script>`; },
				type: ko.types.function
			}
		}
	},
	viewModel: {
		createViewModel: function(params, componentInfo) {
			return new componentPreviewVM(params, componentInfo);
		}
	},
	template: __webpack_require__(15)
});


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(10);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./knockout-component-preview.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./knockout-component-preview.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".params-list {\n  margin: 0; }\n\n.no-bottom-margin {\n  margin-bottom: 0; }\n\n.preview-max-height {\n  max-height: 90vh; }\n\n.knockout-component-preview--dataType.colorized-number {\n  background: #831a05;\n  color: #fff; }\n\n.knockout-component-preview--dataType.colorized-string {\n  background: #235712;\n  color: #fff; }\n\n.knockout-component-preview--dataType.colorized-boolean {\n  background: #0d7cca;\n  color: #fff; }\n\n.knockout-component-preview--dataType.colorized-array {\n  background: #661ec0;\n  color: #fff; }\n\n.knockout-component-preview--dataType.colorized-default {\n  background: #bbb;\n  color: #fff; }\n\n.param-name {\n  background: #ddd;\n  border-radius: 3px;\n  padding: 3px 6px; }\n\ntr:hover .param-name {\n  background: #ccc; }\n\n.styled-scrollbar {\n  background-color: rgba(0, 0, 0, 0.2);\n  -webkit-background-clip: text;\n  transition: background-color .5s;\n  overflow-x: hidden;\n  overflow-y: scroll; }\n\n.styled-scrollbar:hover {\n  background-color: rgba(0, 0, 0, 0.5); }\n\n.styled-scrollbar::-webkit-scrollbar {\n  width: 8px;\n  height: 8px; }\n\n.styled-scrollbar::-webkit-scrollbar-track {\n  display: none; }\n\n.styled-scrollbar::-webkit-scrollbar-thumb {\n  border-radius: 10px;\n  background-color: inherit; }\n", ""]);

// exports


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(12);

ko.components.register('knockout-type-editor', {
	docs: {
		description: "Edit javascript or knockout types",
		tags: ["internal for knockout-component-preview"],
		category: "Knockout Preview",
		required: {
			type: {
				description: "A javascript or knockout type. The editor will edit that type",
				type: ko.types.string
			}
		},
		optional: {
			optionalParam: {
				description: "description!",
				type: ko.types.string,
				default: "default"
			}
		}
	},
	viewModel: function(params) {
		var vm = this;

		vm.value = params.value;
		vm.types = params.types;
		vm.typeEditing = ko.observable(ko.types.getType(vm.types[0])); // default to first item in list
		
		vm.textBinding = ko.observable();
		vm.textBinding.subscribe(function(newValue){
			if (newValue === undefined || newValue.length === 0) {
				vm.value("undefined");
				return;
			}
			if (ko.unwrap(vm.typeEditing) === ko.types.number.baseType) {
				vm.value(parseInt(newValue));
			}
			else if (ko.unwrap(vm.typeEditing) === ko.types.boolean.baseType) {
				vm.value(JSON.parse(newValue));
			}
			else {
				vm.value(ko.types.getType(newValue));
			}
		});
		
		vm.required = params.required;
		vm.defaultValue = params.defaultValue;
		vm.possibleValues = params.possibleValues || ko.observableArray();
		
		
		vm.uid = idGen.getId();
		
		vm.checkIfDefault = function (data) {
			return vm.defaultValue === data; // hacky conversion to string. ToDo: fix
		};
		
		vm.typeAsText = function(type) { // returns the original string or returns the second word in brackets
			var found = ko.types.getType(type).match(/(?:\[\w+ )?(\w+)(?:\])?/i);
			return found[1];
			return type;
		};

		vm.colorizeData = function(data) {
			var serialized = paramAsText(data);
			
			switch (ko.types.get(data)) {
				case ko.types.number:
					color = "#831a05";
					break;
					
				case ko.types.string:
					color = "#235712";
					break;
					
				case ko.types.boolean:
					color = "#0d7cca";
					break;
				
				default:
					color = "#bbb";
			}
			
			var isDefault = "";
			if (data === vm.defaultValue) {
				isDefault = `<span style='float:right;margin-right:10px;'>*default*</span>`;
			}
			
			return `<span style='color:${color};'>${serialized}</span>${isDefault}`;
		};
		
		return vm;
	},
	template: __webpack_require__(14)
});


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(13);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./knockout-type-editor.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./knockout-type-editor.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "knockout-type-editor {\n  display: block; }\n", ""]);

// exports


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = "<!-- ko if: types.length > 1 -->\r\n\t<select data-show-subtext=\"true\" data-show-subtext=\"true\"\r\n\t\tdata-bind=\"foreach: types, value: typeEditing\">\r\n\t\t<option data-bind=\"attr: { value: $data }, text: $parent.typeAsText($data)\"></option>\r\n\t</select>\r\n<!-- /ko -->\r\n\r\n<!-- ko if: possibleValues.length > 0 -->\r\n\t<select data-width=\"100%\" data-show-subtext=\"true\"\r\n\t\tdata-bind=\"foreach: possibleValues, value: textBinding, attr: { multiple: typeEditing === ko.types.array }\">\r\n\t\t<option data-bind=\"attr: { 'data-content': $parent.colorizeData($data) }, text: $data, 'value': $data\"></option>\r\n\t</select>\r\n<!-- /ko -->\r\n<!-- ko if: possibleValues.length === 0 -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.date) -->\r\n\t\t<input type=\"date\" class=\"form-control\" data-bind=\"textInput: textBinding\" />\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.dateTime) -->\r\n\t\t<input type=\"datetime-local\" class=\"form-control\" data-bind=\"textInput: textBinding\" />\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.array) -->\r\n\t\tArray editor...\r\n\t\t<textarea class=\"html\" data-bind=\"textInput: textBinding, text: '[true,false,true,123]', uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }\"></textarea>\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.string) -->\r\n\t\t<input type=\"text\" class=\"form-control\" data-bind=\"textInput: textBinding, value: defaultValue\" />\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.boolean) -->\r\n\t\t<div class=\"radio\">\r\n\t\t\t<label>\r\n\t\t\t\t<input data-bind=\"attr: { name: uid }, checked: value, checkedValue: true\" type=\"radio\" value=\"true\" /> true\r\n\t\t\t\t<span data-bind=\"visible: defaultValue\">*default</span>\r\n\t\t\t</label>\r\n\t\t</div>\r\n\t\t<div class=\"radio\">\r\n\t\t\t<label>\r\n\t\t\t\t<input data-bind=\"attr: { name: uid }, checked: value, checkedValue: false\" type=\"radio\" value=\"false\" /> false\r\n\t\t\t\t<span data-bind=\"visible: !defaultValue\">*default</span>\r\n\t\t\t</label>\r\n\t\t</div>\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.number) -->\r\n\t\t<input type=\"number\" class=\"form-control\" data-bind=\"textInput: textBinding\" />\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.object) || ko.types.compareType(typeEditing(), ko.types.json) -->\r\n\t\t<textarea class=\"html\" data-bind=\"uniqueIdFunction: { fn: codeEditorFunction, mode: 'json' }\"></textarea>\r\n\t<!-- /ko -->\r\n\t<!-- ko if: ko.types.compareType(typeEditing(), ko.types.html) || ko.types.compareType(typeEditing(), ko.types.innerHtml) -->\r\n\t\t<textarea class=\"html\" data-bind=\"uniqueIdFunction: { fn: codeEditorFunction, mode: 'htmlmixed' }\"></textarea>\r\n\t<!-- /ko -->\r\n<!-- /ko -->";

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = "\r\n<!-- ko if: !loadingComplete() -->\r\n\t<h1>Loading...</h1>\r\n<!-- /ko -->\r\n<!-- ko if: loadingComplete -->\r\n\t<div class=\"subgroup container-fluid\" data-bind=\"with: viewModel\">\r\n\t\t<div data-bind=\"attr: { 'id': componentID }\">\r\n\t\t\t<div class=\"row\">\r\n\t\t\t\t<div class=\"col-xs-12 no-gutter\">\r\n\t\t\t\t\t<div class=\"btn-group pull-right\" role=\"group\">\r\n\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-default\" data-bind=\"css: { 'active': view() === 'Preview' }, click: previewView\">\r\n\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-eye-open\"></span> Preview\r\n\t\t\t\t\t\t</button>\r\n\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-default\" data-bind=\"css: { 'active': view() === 'Table' }, click: tableView\">\r\n\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-list-alt\"></span> Table\r\n\t\t\t\t\t\t</button>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<h4 style=\"margin-bottom:0;\" class=\"componentTitle\" data-bind=\"text: componentName\"></h4>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<div style=\"display:inline-block;margin:5px 0 10px 0;\" data-bind=\"foreach: tags\">\r\n\t\t\t\t\t\t<span class=\"label label-default\" data-bind=\"text: $data\"></span>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<blockquote data-bind=\"visible: description, text: description\"></blockquote>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<!-- ko template: { nodes: $componentTemplateNodes, data: $data } --><!-- /ko -->\r\n\r\n\t\t\t\t\t<ul style=\"padding: 10px 30px;\" class=\"alert alert-danger\" data-bind=\"foreach: errors, visible: errors().length\">\r\n\t\t\t\t\t\t<li data-bind=\"html: $data\"></li>\r\n\t\t\t\t\t</ul>\r\n\t\t\t\t\t\r\n\t\t\t\t\t<!-- ko if: view() === 'Table' && pages.length -->\r\n\t\t\t\t\t\t<div class=\"panel panel-default\">\r\n\t\t\t\t\t\t\t<div class=\"panel-heading\">\r\n\t\t\t\t\t\t\t\tIncluded on <b data-bind=\"text: pages.length\"></b> pages\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div data-bind=\"foreach: pages\" class=\"list-group\" style=\"padding:0;\">\r\n\t\t\t\t\t\t\t\t<a style=\"float:left;border-top-width:0;border-left-width:0;border-bottom-width:0;\"\r\n\t\t\t\t\t\t\t\t\tclass=\"list-group-item\" data-bind=\"attr: { href: $data }, text: $data\"></a>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"clearfix\"></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t<!-- /ko -->\r\n\t\t\t\t\t\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"row row-eq-height\" data-bind=\"css: { 'preview-max-height': view() === 'Preview' }\">\r\n\t\t\t\t<!-- ko if: view() === 'Table' -->\r\n\t\t\t\t\t<div class=\"col-xs-12 no-gutter\">\r\n\t\t\t\t\t\t<h3 style=\"display:block;width:100%;\">Parameters</h3>\r\n\t\t\t\t\t\t<table class=\"table table-striped table-bordered table-hover\">\r\n\t\t\t\t\t\t\t<thead>\r\n\t\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t\t<th>Name</th>\r\n\t\t\t\t\t\t\t\t\t<th>Description</th>\r\n\t\t\t\t\t\t\t\t\t<th>Type(s)</th>\r\n\t\t\t\t\t\t\t\t\t<th>Required</th>\r\n\t\t\t\t\t\t\t\t\t<th>Default</th>\r\n\t\t\t\t\t\t\t\t\t<th>Possible Values</th>\r\n\t\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t</thead>\r\n\t\t\t\t\t\t\t<tbody data-bind=\"foreach: params\">\r\n\t\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t\t\t<span data-bind=\"text: name\" class=\"param-name\"></span>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t<td data-bind=\"text: description\"></td>\r\n\t\t\t\t\t\t\t\t\t<td data-bind=\"foreach: typeFormatted\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"knockout-component-preview--dataType\" data-bind=\"css: $parent.dataTypeClass($data)\">\r\n\t\t\t\t\t\t\t\t\t\t\t<span data-bind=\"html: $data\"></span>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t<td data-bind=\"text: required\"></td>\r\n\t\t\t\t\t\t\t\t\t<td data-bind=\"text: defaultValue\"></td>\r\n\t\t\t\t\t\t\t\t\t<td data-bind=\"foreach: possibleValues\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"knockout-component-preview--dataType\">\r\n\t\t\t\t\t\t\t\t\t\t\t<span data-bind=\"text: paramAsText($data)\"></span>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t</tbody>\r\n\t\t\t\t\t\t</table>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t<!-- /ko -->\r\n\t\t\t\t<!-- ko if: view() === 'Preview' -->\r\n\t\t\t\t\t<div class=\"col-xs-6 col-lg-4 no-gutter styled-scrollbar\">\r\n\t\t\t\t\t\t<div class=\"list-group params-list\" data-bind=\"foreach: params\">\r\n\t\t\t\t\t\t\t<div class=\"list-group-item\">\r\n\t\t\t\t\t\t\t\t<div class=\"form-group\">\r\n\t\t\t\t\t\t\t\t\t<h3>\r\n\t\t\t\t\t\t\t\t\t\t<span data-bind=\"text: name\"></span>\r\n\t\t\t\t\t\t\t\t\t\t<span class=\"badge\" data-bind=\"text: typeFormatted\"></span>\r\n\t\t\t\t\t\t\t\t\t</h3>\r\n\t\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t\t<p class=\"list-group-item-content\" data-bind=\"text: description\"></p>\r\n\t\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t\t<knockout-type-editor params=\"\r\n\t\t\t\t\t\t\t\t\t\tvalue: value,\r\n\t\t\t\t\t\t\t\t\t\ttypes: types,\r\n\t\t\t\t\t\t\t\t\t\trequired: required,\r\n\t\t\t\t\t\t\t\t\t\tdefaultValue: defaultValue,\r\n\t\t\t\t\t\t\t\t\t\tpossibleValues: possibleValues\"></knockout-type-editor>\r\n\t\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"col-xs-6 col-lg-8 no-gutter-right styled-scrollbar\" style=\"display:flex;flex-direction:column;\">\r\n\t\t\t\t\t\t<div class=\"panel panel-default\" style=\"flex: 1 0\">\r\n\t\t\t\t\t\t\t<div class=\"panel-heading\">Preview</div>\r\n\t\t\t\t\t\t\t<div class=\"panel-body\" style=\"position: relative;\">\r\n\t\t\t\t\t\t\t\t<!-- ko if: !blackListedComponent -->\r\n\t\t\t\t\t\t\t\t\t<div data-bind='component: { name: componentName, params: componentParamObject }'></div>\r\n\t\t\t\t\t\t\t\t<!-- /ko -->\r\n\t\t\t\t\t\t\t\t<!-- ko if: blackListedComponent -->\r\n\t\t\t\t\t\t\t\t\t<div class=\"alert alert-danger\" style=\"margin:0;\">\r\n\t\t\t\t\t\t\t\t\t\tCan't preview <b data-bind=\"text: componentName\"></b> because it's a internal component\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t<!-- /ko -->\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"panel panel-default\" style=\"flex: 0 1\">\r\n\t\t\t\t\t\t\t<div class=\"panel-heading\">\r\n\t\t\t\t\t\t\t\tInclude Tags\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t<div data-bind=\"clipboard: htmlInclude\" class=\"btn btn-default btn-sm pull-right\" style=\"margin-top:-5px;margin-right:-9px;\">\r\n\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-copy\"></span> Copy\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"panel-body\" style=\"padding:0;\">\r\n\t\t\t\t\t\t\t\t<textarea class=\"html\" data-bind=\"text: htmlInclude, uniqueIdFunction: { fn: codeEditorFunction, mode: 'htmlmixed', readOnly: true }\"></textarea>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"panel panel-default no-bottom-margin\" style=\"flex: 0 1\">\r\n\t\t\t\t\t\t\t<div class=\"panel-heading\">\r\n\t\t\t\t\t\t\t\tComponent Code\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t<div data-bind=\"clipboard: html\" class=\"btn btn-default btn-sm pull-right\" style=\"margin-top:-5px;margin-right:-9px;\">\r\n\t\t\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-copy\"></span> Copy\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"panel-body\" style=\"padding:0;\">\r\n\t\t\t\t\t\t\t\t<textarea class=\"html\" data-bind=\"text: html, uniqueIdFunction: { fn: codeEditorFunction, mode: 'htmlmixed', readOnly: true }\"></textarea>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"clearfix\"></div>\r\n\t\t\t\t<!-- /ko -->\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n<!-- /ko -->";

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(17);

ko.components.register('random-sample-component', {
	docs: {
		description: "This is a sample component to show the usage of <knockout-component-preview> - you can test one of each editor.",
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
	template: __webpack_require__(19)
});


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(18);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./random-sample-component.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./random-sample-component.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = "<div style=\"border:1px solid #000;\" data-bind=\"style: { borderWidth: borderWidth + 'px' }\">\r\n\t<h3 data-bind=\"text: title\"></h3>\r\n\t<p data-bind=\"text: description\"></p>\r\n\t<button type=\"button\" class=\"btn btn-default btn-lg\">\r\n\t\t<span class=\"glyphicon\" data-bind=\"css: icon\"></span> Button\r\n\t</button>\r\n</div>";

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(21);


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
function jsDocSampleComponentVM(params) {
	var vm = this;

	vm.observableString = params.observableString;
	vm.defaultString = params.defaultString || "default value";
	vm.numParam = params.numParam;
	vm.observableNumber = params.observableNumber;

	return vm;
}

ko.components.register('jsdoc-sample-component', {
	viewModel: function(params) {
		return new jsDocSampleComponentVM(params);
	},
	template: __webpack_require__(23)
});


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(22);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./jsdoc-sample-component.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./jsdoc-sample-component.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = "<div>\r\n\t<div data-bind=\"text: observableString\"></div>\r\n\t<div data-bind=\"text: defaultString\"></div>\r\n\t<div data-bind=\"text: numParam\"></div>\r\n\t<div data-bind=\"text: observableNumber\"></div>\r\n</div>";

/***/ })
/******/ ]);