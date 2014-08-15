/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  // Version: 0.1.1

  // Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
  // This program is free software. It comes without any warranty, to
  // the extent permitted by applicable law. You can redistribute it
  // and/or modify it under the terms of the Do What The Fuck You Want
  // To Public License, Version 2, as published by Sam Hocevar. See
  // the COPYING file for more details.

  /*jslint indent: 2 */

  function sequence(thenArray) {
    return ((root.CancellablePromise && root.CancellablePromise.sequence) || root.sequence)(thenArray);
  }

  function capitalize(string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1).toLowerCase();
  }

  /**
   * @param [param] {Object}
   * @param [param.authType] {String} none|auto|basic|digest
   * @param [param.username] {String}
   * @param [param.password] {String}
   * @param [param.realm] {String}
   */
  function WebDAV(param) {
    param = param || {};
    var propfind_param = {
      "headers": {"Depth": 1},
      "responseType": "text",
      "mixHeaders": true
    };
    switch (param.authType) {
    case "basic":
      this._ajax = new root.Ajax({
        "headers": {
          "Authorization": "Basic " +
            root.btoa(param.username + ":" + param.password)
        },
        ":propfind": propfind_param
      });
      break;
    case "digest":
      throw new Error("WebDAV: Digest is not implemented");
    case "auto":
      this._ajax = new root.Ajax({
        "xhrFields": {"withCredentials": true},
        ":propfind": propfind_param
      });
      break;
    // case "none":
    default:
      this._ajax = new root.Ajax({":propfind": propfind_param});
      break;
    }
  }

  // mixin method: head(url) -> response< empty >
  WebDAV.prototype.head = function (url) {
    return this._ajax.head(url);
  };

  // mixin method: get(url) -> response< Blob >
  WebDAV.prototype.get = function (url) {
    return this._ajax.get(url);
  };

  // mixin method: put(url, data) -> response< empty >
  WebDAV.prototype.put = function (url, data) {
    return this._ajax.put(url, data);
  };

  // mixin method: delete(url) -> response< empty >
  WebDAV.prototype["delete"] = function (url) {
    return this._ajax["delete"](url);
  };

  // mixin method: mkcol(url) -> response< empty >
  WebDAV.prototype.mkcol = function (url) {
    return this._ajax.request("mkcol", url);
  };

  // mixin method: propfind(url) -> response< json >
  WebDAV.prototype.propfind = function (url) {
    var it = this;
    return sequence([function () {
      return it._ajax.request("propfind", url);
    }, function (response) {
      /*jslint ass: true */
      var i, l, tmp, rows = [], row, responses;
      responses = new root.DOMParser().
        parseFromString(response.data, "text/xml").
        querySelectorAll("D\\:response, response");

      function defaultRowFiller(key, tag) {
        if ((tmp = responses[i].querySelector("D\\:" + tag + ", " + tag)) !== null &&
            tmp.textContent) {
          row[key] = tmp.textContent;
        }
      }

      for (i = 0, l = responses.length; i < l; i += 1) {
        row = {};
        defaultRowFiller("location", "href");
        defaultRowFiller("status", "status");
        // resource-type
        if ((tmp = responses[i].querySelector("D\\:resourcetype, resourcetype")) !== null &&
            (tmp = tmp.firstElementChild) !== null &&
            tmp.tagName) {
          row["resource-type"] = tmp.tagName.
            replace(/^D:/, "").
            replace(/[a-zA-Z]+/g, capitalize);
        }
        defaultRowFiller("content-type", "getcontenttype");
        defaultRowFiller("content-length", "getcontentlength");
        defaultRowFiller("creation-date", "creationdate");
        defaultRowFiller("last-modified", "getlastmodified");
        rows.push(row);
      }
      response.data = rows;
      return response;
    }]);
  };

  root.WebDAV = WebDAV;

  if (root.mixinManager) {
    try {
      root.mixinManager.register("webdav", function (param) {
        return new WebDAV(param);
      }, WebDAV);
    } catch (e) {
      if (root.console && typeof root.console.warn === "function") {
        try { root.console.warn(e); } catch (ignore) {}
      }
    }
  }

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(WebDAV, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));
