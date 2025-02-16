type ElementProperties = {
	[k: string]: string | number | Function;
};

type ElementContent = string | number | ElementProperties | HTMLElement;

function newElement(elementDefinition: string, ...content: ElementContent[]) {
	let tagName = /^\w+/.exec(elementDefinition)![0];
	let result = document.createElement(tagName);
	let cssClassesRex = /\.(\w+)/g;
	let cssClassMatch = cssClassesRex.exec(elementDefinition);
	while (cssClassMatch) {
		result.classList.add(cssClassMatch[1]);
	}
	for (let item of content) {
		switch (item.constructor.name) {
			case "Number":
				result.appendChild(document.createTextNode(item.toString()));
				break;
			case "String":
				item = String(item);
				let rex = /&#x([0-9a-f]{4});/i;
				let rem = rex.exec(item);
				while (rem) {
					item = item.replace(rem[0], JSON.parse('"\\u' + rem[1] + '"'));
					rem = /&#x([0-9a-f]{4});/i.exec(item);
				}
				result.appendChild(document.createTextNode(item));
				break;
			case "Object":
				for (let key in Object.keys(item)) {
					let value = item[key];
					if (typeof value === "function") {
						result[key] = value;
					} else {
						result.setAttribute(key, value);
					}
				}
				break;
			default:
				if (item instanceof HTMLElement) {
					result.appendChild(item);
				} else {
					throw new TypeError("Expected string, number, Object or HTMLElement, got " + (!!item ? item.constructor.name : typeof item));
				}
		}
	}
	return result;
}
