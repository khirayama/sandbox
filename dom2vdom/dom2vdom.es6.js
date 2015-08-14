import htmlparser from 'htmlparser2';
import {decode} from 'ent';

const masks = {
  MUST_USE_ATTRIBUTE: 0x1,
  MUST_USE_PROPERTY: 0x2,
  HAS_BOOLEAN_VALUE: 0x8,
  HAS_NUMERIC_VALUE: 0x10,
  HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
  HAS_OVERLOADED_BOOLEAN_VALUE: 0x40
};

const MUST_USE_ATTRIBUTE = masks.MUST_USE_ATTRIBUTE;
const MUST_USE_PROPERTY = masks.MUST_USE_PROPERTY;
const HAS_BOOLEAN_VALUE = masks.HAS_BOOLEAN_VALUE;
const HAS_OVERLOADED_BOOLEAN_VALUE = masks.HAS_OVERLOADED_BOOLEAN_VALUE;
const HAS_NUMERIC_VALUE = masks.HAS_NUMERIC_VALUE;
const HAS_POSITIVE_NUMERIC_VALUE = masks.HAS_POSITIVE_NUMERIC_VALUE;
const HTMLDOMPropertyConfig = {
  Properties: {
    accept: null,
    acceptCharset: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    challenge: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    classID: MUST_USE_ATTRIBUTE,

    className: MUST_USE_ATTRIBUTE,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    download: HAS_OVERLOADED_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    formAction: MUST_USE_ATTRIBUTE,
    formEncType: MUST_USE_ATTRIBUTE,
    formMethod: MUST_USE_ATTRIBUTE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    formTarget: MUST_USE_ATTRIBUTE,
    frameBorder: MUST_USE_ATTRIBUTE,
    headers: null,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    high: null,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    is: MUST_USE_ATTRIBUTE,
    keyParams: MUST_USE_ATTRIBUTE,
    keyType: MUST_USE_ATTRIBUTE,
    label: null,
    lang: null,
    list: MUST_USE_ATTRIBUTE,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    low: null,
    manifest: MUST_USE_ATTRIBUTE,
    marginHeight: null,
    marginWidth: null,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    media: MUST_USE_ATTRIBUTE,
    mediaGroup: null,
    method: null,
    min: null,
    minLength: MUST_USE_ATTRIBUTE,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    noValidate: HAS_BOOLEAN_VALUE,
    open: HAS_BOOLEAN_VALUE,
    optimum: null,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    sandbox: null,
    scope: null,
    scoped: HAS_BOOLEAN_VALUE,
    scrolling: null,
    seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    sizes: MUST_USE_ATTRIBUTE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: MUST_USE_PROPERTY,
    srcSet: MUST_USE_ATTRIBUTE,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,

    autoCapitalize: null,
    autoCorrect: null,

    itemProp: MUST_USE_ATTRIBUTE,
    itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    itemType: MUST_USE_ATTRIBUTE,

    itemID: MUST_USE_ATTRIBUTE,
    itemRef: MUST_USE_ATTRIBUTE,

    property: null,

    unselectable: MUST_USE_ATTRIBUTE
  },
  PropertyToAttributeMapping: {
    'className': 'class',
    'htmlFor': 'for',
    'httpEquiv': 'http-equiv',
    'acceptCharset': 'accept-charset'
  }
};

function checkMask(value, bitmask) {
  return (value & bitmask) === bitmask;
}

let getPropertyInfo = (() => {
  let propInfoByAttributeName = {};

  Object.keys(HTMLDOMPropertyConfig.Properties).forEach((propName) => {
    let propConfig = HTMLDOMPropertyConfig.Properties[propName];
    let attributeName = HTMLDOMPropertyConfig.PropertyToAttributeMapping[propName] || propName.toLowerCase();

    let propertyInfo = {
      attributeName: attributeName,
      propertyName: propName,

      mustUseAttribute: checkMask(propConfig, masks.MUST_USE_ATTRIBUTE),
      mustUseProperty: checkMask(propConfig, masks.MUST_USE_PROPERTY),
      hasBooleanValue: checkMask(propConfig, masks.HAS_BOOLEAN_VALUE),
      hasNumericValue: checkMask(propConfig, masks.HAS_NUMERIC_VALUE),
      hasPositiveNumericValue: checkMask(propConfig, masks.HAS_POSITIVE_NUMERIC_VALUE),
      hasOverloadedBooleanValue: checkMask(propConfig, masks.HAS_OVERLOADED_BOOLEAN_VALUE)
    };

    propInfoByAttributeName[attributeName] = propertyInfo;
  });

  return function getPropertyInfo(attributeName) {
    let lowerCased = attributeName.toLowerCase();
    let propInfo;

    if (propInfoByAttributeName.hasOwnProperty(lowerCased)) {
      propInfo = propInfoByAttributeName[lowerCased];
    } else {
      propInfo = {
        attributeName: attributeName,
        mustUseAttribute: true,
        isCustomAttribute: true
      };
    }
    return propInfo;
  };
})();

let getAttributeValue = (propInfo, value) => {
  let result;
  if (propInfo.hasBooleanValue) {
    result = '';
  } else {
    result = value;
  }
  return result;
};

let setVNodeAttribute = (properties, propInfo, value) => {
  properties.attributes[propInfo.attributeName] = getAttributeValue(propInfo, value);
};

let parseStyles = (input) => {
  let attributes = input.split(';');
  let styles = attributes.reduce((object, attribute) => {
    let entry = attribute.split(/:(.+)/);
    if (entry[0] && entry[1]) object[entry[0].trim()] = entry[1].trim();
    return object;
  }, {});
  return styles;
};

let propertyValueConversions = {
  'style': parseStyles,
  'placeholder': decode,
  'title': decode,
  'alt': decode
};

let propertyIsTrue = (propInfo, value) => {
  if (propInfo.hasBooleanValue) {
    return (value === '' || value.toLowerCase() === propInfo.attributeName);
  } else if (propInfo.hasOverloadedBooleanValue) {
    return (value === '');
  }
  return false;
};

let getPropertyValue = (propInfo, value) => {
  let isTrue = propertyIsTrue(propInfo, value);
  let result;

  if (propInfo.hasBooleanValue) {
    result = isTrue ? true : false;
  } else if (propInfo.hasOverloadedBooleanValue) {
    result = isTrue ? true : value;
  } else if (propInfo.hasNumericValue || propInfo.hasPositiveNumericValue) {
    result = Number(value);
  } else {
    result = value;
  }
  return result;
};

let setVNodeProperty = (properties, propInfo, value) => {
  let propName = propInfo.propertyName;
  let valueConverter;
  let _value;

  if (propName && propertyValueConversions.hasOwnProperty(propName)) {
    valueConverter = propertyValueConversions[propInfo.propertyName];
    _value = valueConverter(value);
  }
  properties[propInfo.propertyName] = getPropertyValue(propInfo, _value || value);
};

let propertySetters = {
  attribute: {
    set: setVNodeAttribute
  },
  property: {
    set: setVNodeProperty
  }
};

let getPropertySetter = (propInfo) => {
  let result;
  if (propInfo.mustUseAttribute) {
    result = propertySetters.attribute;
  } else {
    // Anything we don't set as an attribute is treated as a property
    result = propertySetters.property;
  }
  return result;
};

let convertTagAttributes = (tag) => {
  let attributes = tag.attribs;
  let vNodeProperties = {
    attributes: {}
  };
  Object.keys(attributes).forEach((attributeName) => {
    let value = attributes[attributeName];
    let propInfo = getPropertyInfo(attributeName);

    let propertySetter = getPropertySetter(propInfo);
    propertySetter.set(vNodeProperties, propInfo, value);
  });
  return vNodeProperties;
};

let createConverter = function createConverter(VNode, VText) {
  let converter = {
    convert: (node, getVNodeKey) => {
      let result;
      if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
        result = converter.convertTag(node, getVNodeKey);
      } else if (node.type === 'text') {
        result = new VText(decode(node.data));
      } else {
        // converting an unsupported node, return an empty text node instead.
        result = new VText('');
      }
      return result;
    },
    convertTag: (tag, getVNodeKey) => {
      let attributes = convertTagAttributes(tag);
      let key;

      if (getVNodeKey) {
        key = getVNodeKey(attributes);
      }

      let children = Array.prototype.map.call(tag.children || [], (node) => {
        return converter.convert(node, getVNodeKey);
      });

      return new VNode(tag.name, attributes, children, key);
    }
  };
  return converter;
};

let parseHTML = function parseHTML(html) {
  let handler = new htmlparser.DomHandler();

  let parser = new htmlparser.Parser(handler, {
    lowerCaseAttributeNames: false
  });
  parser.parseComplete(html);
  return handler.dom;
};

let convertHTML = function initializeHtmlToVdom(VTree, VText) {
  let htmlparserToVdom = createConverter(VTree, VText);
  return function convertHTML(options, html) {
    let noOptions = typeof html === 'undefined' && typeof options === 'string';
    let hasOptions = !noOptions;

    // was html supplied as the only argument?
    let htmlToConvert = noOptions ? options : html;
    let getVNodeKey = hasOptions ? options.getVNodeKey : undefined;

    let tags = parseHTML(htmlToConvert);

    let convertedHTML;
    if (tags.length > 1) {
      convertedHTML = tags.map((tag) => {
        return htmlparserToVdom.convert(tag, getVNodeKey);
      });
    } else {
      convertedHTML = htmlparserToVdom.convert(tags[0], getVNodeKey);
    }

    return convertedHTML;
  };
};

export function initializeConverter(dependencies) {
  if (!dependencies.VNode || !dependencies.VText) throw new Error('html-to-vdom needs to be initialized with VNode and VText');
  return convertHTML(dependencies.VNode, dependencies.VText);
}
