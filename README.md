
Mixins
======

This document sets standards for mixins. There are 4 levels of API: draft,
unstable, stable and frozen. (as NodeJS does.)

- [Mixin methods](#mixin-methods)
    - [readableStream](#readablestream)
    - [writableStream](#writablestream)
    - [rest](#rest)
    - [restStream](#reststream)
    - [mkcol 'n' propfind](#mkcol-n-propfind)
    - [Parameters](#parameters)
- [Mixin objects](#mixin-objects)
- [Mixin manager](#mixin-manager)
- [Mixin samples](#mixin-samples)

[License of this document + version](#license-of-this-document--version)


Mixin methods
-------------

### readableStream

**DRAFT**

    yield read([size]) -> Blob

### writableStream

**DRAFT**

    yield write(data)
    yield close()

### rest

**UNSTABLE**

    yield head(url) -> Response< undefined > , throws error if status >= 400 or request error
    yield get(url) -> Response< Blob > , throws error if status >= 400 or request error
    yield put(url, data) -> Response< undefined > , throws error if status >= 400 or request error
    yield delete(url) -> Response< undefined > , throws error if status >= 400 or request error

### restStream

**UNSTABLE**

    yield getStream(url) -> ReadableResponse< Blob > , throws error if status >= 400 or request error
    yield putStream(url) -> WritableRequest XXX

### mkcol 'n' propfind

**UNSTABLE**

    yield mkcol(url) -> Response< undefined > , throws error if status >= 400 or request error
    yield propfind(url) -> Response< Array<Headers> > , throws error if status >= 400 or request error

### Parameters

- url `{String}`
- data `{Blob}`
- size `{Number}`


Mixin objects
-------------

### Response `{Object<T>}`

**UNSTABLE**

- `response.status {Number}`
- `[response.statusText] {String}`
- `[response.data] {T}`
- `response.headers {Headers}`

### ReadableResponse `{Object<T>}`

**DRAFT**

- `response.status {Number}`
- `[response.statusText] {String}`
- `response.headers {Headers}`
- `yield response.read([size]) {StreamDataResult<T>}`

### Headers `{Object<Array<String>>}`

**UNSTABLE**

Example:

    {
      "resource-type": ["Collection"],
      "content-length": ["0"],
      "last-modified": ["2000-01-01T01:01:01Z"]
    }

(Headers key are in lower case.)

### metadata `{Object}`

**STABLE**

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

**STABLE**

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

XXX

### WebDAV

XXX


License of this document + version
----------------------------------

Version: 0.2.0

> Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
>
> This work is free. You can redistribute it and/or modify it under the
> terms of the Do What The Fuck You Want To Public License, Version 2,
> as published by Sam Hocevar. See below for more details.


                DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                        Version 2, December 2004

     Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

     Everyone is permitted to copy and distribute verbatim or modified
     copies of this license document, and changing it is allowed as long
     as the name is changed.

                DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
       TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

      0. You just DO WHAT THE FUCK YOU WANT TO.
