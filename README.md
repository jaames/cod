<p align="center">
  <img src="http://i.imgur.com/Owgsb3R.jpg"/>
</p>

An unassuming documentation format that works with any language.

----

Forked in 2022 to:
 - Get it working again in modern NodeJS
 - Rewrite in Typescript and remove peg.js parser for a much simpler codebase
 - Tweak output syntax for easier usage
 - Add line number output

A couple of things I didn't bother porting as they weren't relevant to me, feel free to make a PR though:
 - file streaming
 - `@colon:delimited:tag:format`
 - `@complexProperty["!value"]`
 - cod function `pretty` option
 - cli glob path input

----

```js
/**
@Example
  Text can go anywhere.
     Whitespace is preserved.
  @flag
  @number 42
  @string Hello, cod
  @nested
    @property yay
    Nested text.
  @list A
  @list B
  @list C
*/
```

```json
{
  "Example": {
    "lineBefore": 0,
    "lineAfter": 15,
    "text": "Text can go anywhere.\n   Whitespace is preserved.",
    "@flag": true,
    "@number": 42,
    "@string": "Hello, cod",
    "@nested": {
      "text": "Nested text.",
      "@property": "yay"
    },
    "@list": ["A", "B", "C"]
  }
}
```

## stupid by design

cod is **not** a documentation generator.

It is a documentation [***format***](#format) that outputs nearly "1-to-1" JSON.

cod does zero code analysis. 

cod doesn't know what `@class`, `@return`, `@param` or `@any` `@other` tag means.

cod does not generate HTML, PDFs, or any traditionally human-readable documentation; that part is left up to you.

As such, cod is not a standalone replacement for tools like *doxygen* or *Sphinx*, but it functions as
the first step in a more flexible doc-generation process for those who need finer control.

### cod may not be *smart*, but it's not *stubborn*, either.

You write your docs in cod's format, and it faithfully outputs JSON. That's it.

Use whatever tags you need.

Anything that isn't a `@tag` is text.

Text sections are left untouched. You can process it as Markdown later. Or HTML. Or just keep it as plain text.

Once you have the JSON, use it however you like:

  - Utilize existing templates and styles.
  - Build an app that can consume multiple versions of your API docs.
  - Easily compare specific versions of your API at the structural level.

cod is naturally language-agnostic; all it needs to know is the pattern you use to denote a doc-block (i.e. `/**` and `*/`).

## format

Tags without values are treated as boolean flags:

```
@flag
```

```json
{
  "@flag": true
}
```

There are also numbers and strings, and you can explicitly set a flag to `false`:

```
@number 42
@string Hello there.
@boolean false
```

```json
{
  "@number": 42,
  "@string": "Hello there.",
  "@boolean": false
}
```

Structure is designated by indentation.

```
@root
  @nested value
```

```json
{
  "@root": {
    "@nested": "value"
  }
}
```

Whitespace after indentation is preserved in text blocks.

```
@example
  This is some example text.

  It can handle multiple lines.
    Indentation is preserved.
```

```json
{
  "@example": {
    "text": "This is some example text.\n\nIt can handle multiple lines.\n  Indentation is preserved."
  }
}
```

Specifying a `@tag` more than once will turn it into a list of values.

```
@list A
@list B
@list C
```

```json
{
  "@list": [
    "A",
    "B",
    "C"
  ]
}
```

## CLI

```
cod *.js # or *.go or *.c or ...
cod -b '###*' -e '###' *.coffee
cod -b "'''*" -e "'''" *.py
cod -b '{-*' -e '-}' *.hs
cod -b '--[[*' -e ']]' *.lua
```

```
cat *.js | cod  > api.json
```

```
cod --help

           _-""-,-"'._         
     .-*'``           ``-.__.-`:
  .'o   ))` ` ` ` ` ` `_`.---._:
   `-'.._,,____...--*"` `"     
         ``
cod: An unassuming documentation generator.
  
Usage: cod [-b <doc-begin> -e <doc-end>] [-o <output-file>] [-u] [<input-file>...]

Options:
  -b <doc-begin>    String that marks the start of a doc-block  (default: "/**")
  -e <doc-end>      String that marks the end of a doc-block (default: "*/")
  -o <output-file>  Output file (default: "STDOUT")
  -u --ugly         Output non-pretty JSON.
  -v --version      output the current version
  -h, --help        display help for command
```

## API

<a name='api_cod'></a>
#### [`cod(text, options)`](#api_cod)
> If [`text`](#api_cod_text) is supplied, cod will parse it and return
> a plain JS object that contains your doc structure.
>  
> <a name='api_cod_text'></a>
> [`text`](#api_cod_text) (String)
> > Text containing cod-style documentation. Probably source code.
>
> <a name='api_cod_options'></a>
> [`options`](#api_cod_options) (Object)
> > <a name='api_cod_options_docBegin'></a>
> > [`docBegin`](#api_cod_options_docBegin) (String) default: `"/**"`
> > > String that marks the start of a doc-block
>
> > <a name='api_cod_options_docEnd'></a>
> > [`docEnd`](#api_cod_options_docEnd) (String) default: `"*/"`
> > > String that marks the end of a doc-block

```js
import { cod } from 'cod';

const doc = cod(`
  /**
    Hello, cod.
    @answer 42
  */`, {});

console.log(doc); 

// Output:
// { 'text': 'Hello, cod.', '@answer': 42 }
```

## install

```bash
npm install -g @jaames/cod
```

## license

MIT