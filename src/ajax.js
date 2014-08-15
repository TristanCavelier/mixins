/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  // Version: 0.1.0

  // Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
  // This program is free software. It comes without any warranty, to
  // the extent permitted by applicable law. You can redistribute it
  // and/or modify it under the terms of the Do What The Fuck You Want
  // To Public License, Version 2, as published by Sam Hocevar. See
  // the COPYING file for more details.

  /*jslint indent: 2, nomen: true */
  /*global XMLHttpRequest, Blob */

  function newPromise(executor, canceller) {
    var Cons = (root.promy && root.promy.Promise) || root.Promise;
    return new Cons(executor, canceller);
  }

  // function checkHeadersJSONSchema(headers_json) {
  //   /*jslint forin: true */
  //   if (typeof headers_json !== "object" || headers_json === null) {
  //     checkHeadersJSONSchema._throw();
  //   }
  //   var k, i, l;
  //   for (k in headers_json) {
  //     if (!Array.isArray(headers_json[k])) {
  //       checkHeadersJSONSchema._throw();
  //     }
  //     for (i = 0, l = headers_json[k]; i < l; i += 1) {
  //       if (typeof headers_json[k][i] === "string") {
  //         checkHeadersJSONSchema._throw();
  //       }
  //     }
  //   }
  // }

  // checkHeadersJSONSchema._throw = function () {
  //   throw new TypeError("Ajax: `headers` is not of type object<array<string>>");
  // };

  var emptyString = "";

  function _copyObjectKeys(o1, o2) {
    /*jslint forin: true */
    var k;
    for (k in o2) {
      o1[k] = o2[k];
    }
    return o1;
  }

  // { "server": ["SimpleHTTP/0.6 Python/3.4.1"],
  //   "date": ["Wed, 04 Jun 2014 14:06:57 GMT"],
  //   "value": ["hello guys"],
  //   "content-type": ["application/x-silverlight"],
  //   "content-length": ["11240"],
  //   "last-modified": ["Mon, 03 Dec 2012 23:51:07 GMT"],
  //   "x-cache": ["HIT via me", "HIT via other"] }
  function headersAsKeyValues(sHeaders) {
    /*jslint regexp: true */
    var result = {}, key, value = "";
    sHeaders.split("\r\n").forEach(function (line) {
      if (line[0] === " " || line[0] === "\t") {
        value += " " + line.replace(/^\s*/, "").replace(/\s*$/, "");
      } else {
        if (key) {
          if (result[key]) {
            result[key].push(value);
          } else {
            result[key] = [value];
          }
        }
        key = /^([^:]+)\s*:\s*(.*)$/.exec(line);
        if (key) {
          value = key[2].replace(/\s*$/, "");
          key = key[1].toLowerCase();
        }
      }
    });
    return result;
  }

  function _mixParams(param1, param2) {
    var headers = param1.headers, xhrFields = param1.xhrFields;
    _copyObjectKeys(param1, param2);
    if (param2.mixHeaders && param2.headers) {
      param1.headers = _copyObjectKeys(headers || {}, param2.headers);
    }
    if (param2.mixXhrFields && param2.xhrFields) {
      param1.xhrFields = _copyObjectKeys(xhrFields || {}, param2.xhrFields);
    }
    return param1;
  }

  /**
   * @param param {Object}
   * @param param.url {String}
   * @param [param.method="GET"] {String}
   * @param [param.headers] {Object<Array<String>>}
   * @param [param.responseType="blob"] {String}
   * @param [param.data] {Any}
   * @param [param.xhrFields] {Object}
   * @param [param.beforeSend] {Function}
   * @param [param.handleHTTPStatusError=true] {Boolean}
   */
  function request(param) {
    /*jslint forin: true */
    var xhr = new XMLHttpRequest();
    return newPromise(function (resolve, reject, notify) {
      var k, i, tmp, method;
      tmp = param.headers;
      if (tmp) {
        for (k in tmp) {
          for (i = 0; i < tmp[k].length; i += 1) {
            if (typeof tmp[k][i] === "string") {
              xhr.setRequestHeader(k, tmp[k][i]);
            }
          }
        }
      }
      tmp = param.xhrFields;
      if (tmp) {
        for (k in tmp) {
          xhr[k] = tmp[k];
        }
      }
      xhr.onload = function () {
        if ((param.handleHTTPStatusError === undefined ||
             param.handleHTTPStatusError) && xhr.status >= 400) {
          return reject(_copyObjectKeys(
            new Error("Ajax: " + method + ": " + xhr.statusText),
            {
              "status": xhr.status,
              "headers": headersAsKeyValues(xhr.getAllResponseHeaders())
            }
          ));
        }
        var result = {
          "status": xhr.status,
          "headers": headersAsKeyValues(xhr.getAllResponseHeaders()),
        };
        if (xhr.response !== undefined) {
          result.data = xhr.response;
        }
        return resolve(result);
      };
      xhr.onabort = xhr.onerror = function () {
        return reject(new Error("Ajax: " + method + ": Unknown Error"));
      };
      if (typeof notify === "function" && !param.disableNotifications) {
        xhr.onprogress = function (event) {
          return notify({
            "type": "Ajax",
            "url": param.url,
            "method": method,
            "loaded": event.loaded,
            "total": event.total
          });
        };
      }
      method = param.method || "GET";
      xhr.open(method, param.url);
      xhr.responseType = param.responseType || "blob";
      if (typeof param.beforeSend === "function") {
        param.beforeSend.call(null, xhr);
      }
      return xhr.send(param.data);
    }, function () {
      xhr.abort();
    });
  }

  /**
   * @param [param] {Object}
   * @param [param.headers] {Object<Array<String>>}
   * @param [param.xhrFields] {Object}
   * @param [param[":" + method]] {Object} param[":" + method] ~= param
   */
  function Ajax(param) {
    this._param = JSON.parse(JSON.stringify(param || {}));
  }

  Ajax.prototype.request = function (method, url, data) {
    method = (emptyString + (method || "GET")).toLowerCase(); // cast to string
    var param = JSON.parse(JSON.stringify(this._param));
    if (this._param[":" + method]) {
      _mixParams(param, this._param[":" + method]);
    }
    param.url = url;
    param.method = method.toUpperCase();
    if (data !== undefined) {
      param.data = data;
    }
    return request(param);
  };

  // rest (no stream) mixin method: head(url) -> response< empty >
  Ajax.prototype.head = function (url) {
    return this.request("HEAD", url);
  };

  // rest (no stream) mixin method: get(url) -> response< Blob >
  Ajax.prototype.get = function (url) {
    return this.request("GET", url);
  };

  Ajax.prototype.post = function (url, data) {
    return this.request("POST", url, data);
  };

  // rest (no stream) mixin method: put(url, data) -> response< empty >
  Ajax.prototype.put = function (url, data) {
    return this.request("PUT", url, data);
  };

  // rest (no stream) mixin method: delete(url) -> response< empty >
  Ajax.prototype["delete"] = function (url) {
    return this.request("DELETE", url);
  };

  // mkcol'n'propfind mixin method: mkcol(url)
  Ajax.prototype.mkcol = function (url) {
    return this.request("MKCOL", url);
  };

  // mkcol'n'propfind mixin method: propfind(url)
  Ajax.prototype.propfind = function (url) {
    return this.request("PROPFIND", url);
  };

  Ajax.request = request;

  root.Ajax = Ajax;

  if (root.mixinManager) {
    try {
      root.mixinManager.register("ajax", function (param) {
        return new Ajax(param);
      }, Ajax);
    } catch (e) {
      console.warn("Ajax: Cannot add `ajax` to mixin manager");
    }
  }

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(Ajax, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));
