
                                     Mixins
================================================================================

This document sets standards for mixins.

Version: 0.1.0

> Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
>
> This work is free. You can redistribute it and/or modify it under the
> terms of the Do What The Fuck You Want To Public License, Version 2,
> as published by Sam Hocevar. See the COPYING file for more details.

- [Mixin methods](#mixin-methods)
    - [readable (stream)](#readable-stream)
    - [writable (stream)](#writable-stream)
    - [rest](#rest)
    - [rest (stream)](#rest-stream)
    - [rest/fs](#restfs)
    - [Parameters](#parameters)
- [Mixin objects](#mixin-objects)
- [Mixin manager](#mixin-manager)
- [Mixin samples](#mixin-samples)


Mixin methods
-------------

### readable (stream)

**DRAFT**

    yield read([size]) -> Blob

### writable (stream)

**DRAFT**

    yield write(data)
    yield close()

### rest

    yield head(url) -> Response< undefined > , throws error if status >= 400 or request error
    yield get(url) -> Response< Blob > , throws error if status >= 400 or request error
    yield put(url, data) -> Response< undefined > , throws error if status >= 400 or request error
    yield delete(url) -> Response< undefined > , throws error if status >= 400 or request error

### rest (stream)

    yield getStream(url) -> ReadableResponse< Blob > , throws error if status >= 400 or request error

### rest/fs

    yield mkcol(url) -> Response< undefined > , throws error if status >= 400 or request error
    yield propfind(url) -> Response< Array<Headers> > , throws error if status >= 400 or request error

### Parameters

- param url `{String}`
- param data `{Blob}`
- param size `{Number}`


Mixin objects
-------------

### Response `{Object<T>}`

- `response.status {Number}`
- `[response.statusText] {String}`
- `[response.data] {T}`
- `response.headers {Headers}`

### ReadableResponse `{Object<T>}`

- `response.status {Number}`
- `[response.statusText] {String}`
- `response.headers {Headers}`
- `yield response.read([size]) {StreamDataResult<T>}`

### Headers `{Object<Array<String>>}`

**DRAFT**

Example:

    {
      "resource-type": ["Collection"],
      "content-length": ["0"],
      "last-modified": ["2000-01-01T01:01:01Z"]
    }

(Headers key are in lower case.)

### metadata `{Object}`

- `[metadata.identifier] {String}`
- `[metadata.title] {String}`
- `[metadata.modified] {Date}`
- `[metadata.created] {Date}`
- `// dublin core...`

### stat `{Object}`

**DRAFT**

- `stat.type {String}` (can be: `"b"`, `"c"`, `"d"`, `"p"`, `"f"`, `"l"`, `"s"` or `"D"`)
- `[stat.dev] {Number}`
- `[stat.mode] {Number}`
- `[stat.nlink] {Number}`
- `[stat.uid] {Number}`
- `[stat.gid] {Number}`
- `[stat.rdev] {Number}`
- `[stat.blksize] {Number}`
- `[stat.ino] {Number}`
- `[stat.size] {Number}`
- `[stat.blocks] {Number}`
- `[stat.atime] {Date}` (accessed)
- `[stat.mtime] {Date}` (modified)
- `[stat.ctime] {Date}` (status changed/created)

### error `{Error}`

- `response.name {String}`
- `response.message {String}`
- `[response.status] {Number}`
- `[response.headers] {Object<Array<String>>}`

Mixin manager
-------------

XXX

Mixin samples
-------------

XXX

### Ajax

### WebDAV
