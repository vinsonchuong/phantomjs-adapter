export default function(xpath) {
  return `
    var element = document.evaluate(
      '${xpath.replace(/'/g, "\\'")}',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    if (!element) {
      return null;
    }

    var attributes = {};
    for (var i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      attributes[attribute.name] = attribute.value;
    }

    return {
      attributes: attributes,
      boundingClientRect: element.getBoundingClientRect(),
      textContent: element.textContent,
      value: element.value
    };
  `;
}
