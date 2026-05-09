# name

Generate the final theme from a typed inventory of known scopes, rather than hand-authoring selectors directly.

Enabled local reasoning. When you associate a scope to a style scope, you can count that this association is always effective.

## Definitions

scope: sequence of atoms. `a.b.c`. `keyword.control.if.js`.

style: styling props.

unset: a scope's style is unset meaning it must not be s

stylemap: scope -> style map. Sub-objects for child scopes (space combinator).

```js
{
  'source.js': {
    'keyword.control.if': operation,
    'keyword.control.import': langvar,
    'meta.import': {
      '': undefined, // undefined for unstyled (implicit or explicitly necessary depending on config). empty keys signifies the parent scope by itself.
      'keyword.control.import': declaration
    }
  }
}
```

A JSON schema validates that every scope is given a style or a subobject with only the scopes that can appear within it.

Here, this means `source.js meta.import keyword.control.import` is always styled as a declaration.

A style binding (selector -> style) must always hold. It should not be allowed to be accidentally overriden.

Adding a way to group by atom, (a special submap under keyword) is very tempting for brevity authoring convenience. This is indeed verbose. But also local, easy to reason about, simple, and contained.

## Input

### scopes

set of known scopes stacks (with languages) that represent the core and must be styled correctly.

example for JSON

```js
{
  "source.json": {
    suffix: 'json' // shared suffix of all children, that need not be specified in stylemaps. eg real scope is "meta.structure.array.json"
    children: {
      "meta.structure.array": {
        title: "array",
        children: {
          "punctuation.definition.array.begin": {
            title: 'begin',
            match: "\\["
          },
          "punctuation.definition.array.end": {
            title: 'end',
            match: "\\]"
          },
          "punctuation.separator.array": {
            on: ","
          },
          "invalid.illegal.expected-array-separator": {
            match: "[^\\s\\]]"
          }
        }
      },
    }
  }
}
```

match/on/title are used to remember what the scope is and where it appears. For JSON schema conversion:

- title = space-sep concatenatation of json title of each parent from root to deepest. for each element title = title ?? description ?? on
- description = (title ? {on}\n{description} : description ? on : null)

to stringify on:

- if it's a string wrap in backticks: `` `${on}` ``
- if it's begin/end: `` `${begin}`...`${end}` ``
- if it's an array: wrap in parens is parent is a begin/end, join each alternative by `|`
- if it's a { pattern, group }: `` `${pattern.toString()}`\$${group} ``. omit the group part if group === 0. normalize regex to string if it contains no qualifiers or groups and group is 0.

### stylemap

Either partial or total depending on strictness

### options

- strict: bool: whether to treat missing scopes from the style map as implicitly unset

## Processing

exported functions (provisional)

findScopes(filename: string, mode?: 'tmLanguage.xml' | 'tmLanguage.json' | 'plist' ...) // parses the language file (chooses a parsing method depending on filename if mode undefined)

genSchema(scopes)

compile({
  scopes: known scopes,
  stylemap: stylemap,
  strict: boolean,
}): TokenColors // accepts the scopes from unioned findScopes calls, the styles and options to produce final TokenColors ruleset

general algorithm:

1. Parse scope grammars into scope set with findScopes
2. Generate JSON schema and optionally TypeScript type from scope universe.

## Output:

- a value to color-theme.json's tokenColors key.
