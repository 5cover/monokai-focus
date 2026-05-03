# Theme token-color selector syntax: `src/theme.ts`

Theme token-color rules use a separate parser in `parseTheme`. This syntax is much smaller than the `createMatchers` language.

A raw theme setting has a `scope` field:

```ts
readonly scope?: ScopePattern | ScopePattern[];
```

If `scope` is a string, `parseTheme`:

1. removes leading commas
2. removes trailing commas
3. splits the string on commas
4. trims each resulting selector
5. splits each selector on literal spaces
6. treats the final segment as the target scope
7. treats all earlier segments as parent scopes
8. reverses the parent scopes so matching starts from the deepest parent

If `scope` is an array, each array element is treated as one selector string. Array elements are not comma-split by this branch.

## Theme selector shape

The effective grammar is approximately:

```ebnf
themeScopeField ::= scopeString | scopeString[]
scopeString     ::= selector (',' selector)*
selector        ::= scopePath
scopePath       ::= scopeName (' '+ scopeName)*
scopeName       ::= arbitrary non-space string, usually dot-separated
```

The last `scopeName` in a selector is the target token scope.

```text
meta.object-literal.key string.quoted
```

is parsed as:

```ts
scope = 'string.quoted'
parentScopes = ['meta.object-literal.key']
```

Internally, parent scopes are reversed. With only one parent scope, this is not visible. With multiple parent scopes:

```text
source.ts meta.object-literal.key string.quoted
```

is parsed as:

```ts
scope = 'string.quoted'
parentScopes = ['meta.object-literal.key', 'source.ts']
```

That reversal matters because parent matching starts from the deepest parent and walks outward.

## Comma alternatives

A comma in a string `scope` field creates multiple independent theme rules.

```text
string.quoted, comment.line
```

is parsed as two rules:

```text
string.quoted
comment.line
```

Leading and trailing commas are removed before splitting.

```text
,string.quoted,
```

is parsed as just:

```text
string.quoted
```

Interior empty alternatives are not removed.

```text
string.quoted,,comment.line
```

contains an empty selector between the two commas. That empty selector becomes a default-scope rule because splitting and trimming produce `''`.

## Space: ancestor relationship

A space separates ancestor scopes from the final target scope.

```text
source.ts string.quoted
```

means:

```text
match a token whose current scope is string.quoted, with source.ts somewhere in its parent scope path
```

The parent does not need to be immediate unless `>` is used.

For a token scope stack:

```text
source.ts meta.object-literal.ts string.quoted.double.ts
```

this selector matches:

```text
source.ts string.quoted
```

because:

- the current scope `string.quoted.double.ts` matches target `string.quoted`
- one of the parent scopes matches `source.ts`

## Dotted-prefix scope matching

Scope matching uses dotted-prefix logic:

```ts
scopePattern === scopeName ||
(scopeName.startsWith(scopePattern) && scopeName[scopePattern.length] === '.')
```

So this selector:

```text
string.quoted
```

matches:

```text
string.quoted
string.quoted.double
string.quoted.double.ts
```

but not:

```text
string.quotedness
string
```

The dot boundary is required.

Parent scopes use the same matching logic.

```text
meta.object-literal.key string.quoted
```

matches a parent scope such as:

```text
meta.object-literal.key.ts
```

## Parent-scope matching order

Parent scopes are matched from deepest to shallowest.

Given:

```text
source.ts meta.object-literal.ts meta.object-literal.key.ts string.quoted.double.ts
```

The current token scope is:

```text
string.quoted.double.ts
```

The parent path is:

```text
source.ts meta.object-literal.ts meta.object-literal.key.ts
```

Selector:

```text
source.ts meta.object-literal.key string.quoted
```

is parsed into target:

```text
string.quoted
```

and reversed parent scopes:

```text
meta.object-literal.key
source.ts
```

Matching starts at the deepest parent:

1. find `meta.object-literal.key` while walking upward
2. then continue upward and find `source.ts`

This is ordered ancestor matching. The parent scopes do not need to be adjacent.

## Child combinator: `>`

`>` is supported only in parent scopes, not as the final target scope.

It means the next parent scope must match immediately at the current parent position.

```text
source.ts > meta.object-literal.key string.quoted
```

After parsing and reversing, the internal parent scope list is:

```ts
['meta.object-literal.key', '>', 'source.ts']
```

During matching, `>` applies to the following parent-scope pattern in the reversed list. Because the list is reversed, this is easier to understand operationally than textually: when the matcher sees `>`, the next required parent must match the current parent scope without skipping ancestors.

This makes `>` an immediate-parent constraint between adjacent parent requirements in the reversed matching order.

Invalid use of `>` as the last parent-scope item fails that rule.

```text
> string.quoted
```

is parsed with parent scopes containing only `>`, and `_scopePathMatchesParentScopes` returns `false` for that rule.

A selector whose final target scope is literally `>` can be parsed, but it is just a target scope string and is not useful for ordinary TextMate scopes.

## Rule ranking and specificity

After parsing, rules are sorted and inserted into a trie. At match time:

1. match candidates are collected for the token's current scope
2. candidates are sorted by specificity
3. the first candidate whose parent scopes match is used

Specificity comparison is:

1. deeper target scope wins
2. if target depth ties, compare parent scopes from deepest outward
3. longer parent-scope strings are considered more specific
4. if still tied, more parent scopes win

Target scope depth is the number of dot-separated segments in the final target scope.

```text
string.quoted.double
```

is more specific than:

```text
string.quoted
```

For parent scopes, a longer matching parent scope is considered more specific.

```text
meta.object-literal.key
```

is more specific than:

```text
meta.object-literal
```

Child combinators do not add specificity.

## Rule merging and inheritance

Rules with the same target scope and the same parent-scope list are merged during trie insertion.

When a later rule inserts into the same trie node and same parent-scope list, set attributes overwrite prior set attributes.

Unset attributes inherit from the main rule at that trie node:

- `fontStyle: NotSet` inherits
- `foreground: 0` inherits
- `background: 0` inherits
- empty `fontFamily` inherits
- `fontSize: 0` inherits
- `lineHeight: 0` inherits

This is why a more specific rule that only sets `fontStyle` may keep the foreground from a broader rule.

## Defaults

A theme rule with no `scope` becomes a default rule because `parseTheme` uses `['']` when `entry.scope` is absent.

A parsed rule whose scope is `''` contributes to default style resolution before trie construction.

An accidental empty selector from comma splitting can also become a default rule.

## Font style syntax

`fontStyle` is parsed separately from scope selectors.

Recognized space-separated segments are:

```text
italic
bold
underline
strikethrough
```

Any other segment is ignored.

If `fontStyle` is a string, the parser starts from `FontStyle.None`, then ORs recognized styles into it. An empty string therefore means explicit `none`, not inherit.

## Unsupported in theme selectors

Theme token-color selectors do not support:

- negation with `-`
- grouping with parentheses
- OR with `|`
- injection priorities `R:` or `L:`
- quoted scope names
- escaping
- wildcard syntax
- boolean AND beyond ordered ancestor scopes
- top-level selector expressions from `matcher.ts`

Therefore this is not a valid theme-token exclusion selector:

```text
string.quoted - meta.object-literal.key
```

In `theme.ts`, it is parsed as a scope path whose final target scope is `meta.object-literal.key`, with parent scopes `['-', 'string.quoted']` after reversal. It does not mean “string except object-literal key”.

To color strings except object keys, theme rules must use override semantics:

```json
{
  "scope": "string.quoted",
  "settings": {
    "foreground": "#..."
  }
},
{
  "scope": "meta.object-literal.key string.quoted",
  "settings": {
    "foreground": "#..."
  }
}
```

The second rule handles string tokens under object-literal keys.
