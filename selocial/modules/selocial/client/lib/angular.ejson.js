angular.fromJson = function(json) {
  return isString(json)
      ? EJSON.parse(json)
      : json;
};

angular.toJson = function toJson(obj, pretty) {
  if (isUndefined(obj)) return undefined;
  if (!isNumber(pretty)) {
    pretty = pretty ? 2 : null;
  }
  return JSON.stringify(obj, toJsonReplacer, pretty);
};

function toJsonReplacer(key, value) {
  var val = value;

  if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
    val = undefined;
  } else if (isWindow(value)) {
    val = '$WINDOW';
  } else if (value &&  window.document === value) {
    val = '$DOCUMENT';
  } else if (isScope(value)) {
    val = '$SCOPE';
  } else if (isDate(value)) {
      val = JSON.parse(EJSON.stringify(new Date(value))); 
  }

  return val;
}

function isUndefined(value) {return typeof value === 'undefined';}
function isNumber(value) {return typeof value === 'number';}
function isWindow(obj) { return obj && obj.window === obj; }
function isScope(obj) { return obj && obj.$evalAsync && obj.$watch; }
function isString(value) {return typeof value === 'string';}
function isDate(value) { return isString(value) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z$/.test(value);  }
