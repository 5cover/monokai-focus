# Monokai Focus

## Scopes|TS

### (role) parameter

roles can be combined with another scope.

input to a definition.

receive information from outside

in a function(a,b):

    a
    b

in a generic type type `T<U>`

    U

in catch clauses

### comments

intent

`// warnings: blah blah`

### documentation

document

`/** @throws Error blah blah **/`

### identifiers

name things.

bindings (foo, bar), labels (label:), private fields (#a), object keys

### functions

abstract logic under a callable name

if f is a function

    f
    function f()
    f = () => {}

all have f styled as a function.

also

    constructor()
    method()

### leaves

inert (behaviorless, contextless) leaf values which logic flows from

    null
    5
    true
    false
    undefined
    NaN
    Infinity
    123n

### text

regex literals

    /regex/

string literals

    "a"

template literals

    `hello ${x}`

outside is same style as a string literal
`${}` : white
inside is treated as a normal expression

escape sequences

### types

categorize and constrain values

    Number
    number
    MyType
    any
    unknown
    never
    void
    (other primitive keyword types)

### punctuation

separate things

    .
    ,
    :
    ;

### brackets

group things

    ()
    []
    {}

### language provided bindings

contextual expressions

    this
    super
    arguments

### declarations

introduce, emit or qualify bindings

    var
    let
    const
    class [extends]
    function[*]
    async
    import [from] [as]
    export [as] [from]
    export default
    get
    set
    static
    using
    constructor

TypeScript-specific

    interface [extends]
    type
    declare
    abstract
    implements
    enum
    public
    private
    protected
    readonly
    override
    namespace
    module
    require

### operations

may not be strictly pure. "stable" the operation accepts arguments and its semantics are only derived from passed arguments, without relying on non-local context. for control flow, this also means no jumps outside of it.

can be reasoned about in isolation (locally intelligible) : You can understand them by looking only at what’s inside them.

expressions:

    ==
    !=
    ===
    !==
    >
    >=
    <
    <=
    %
    -
    +
    **
    &
    |
    ^
    ~
    <<
    >>
    >>>
    &&
    ||
    ??
    !
    ? :
    typeof
    in
    instanceof
    new
    void
    ?.
    , (when used as an operator)
    ...
    await

statements, for which the "arguments" are the blocks of code you pass into them:

    switch case default
    if else
    try catch finally
    for [of]
    [do] while
    for await
    =>

TypeScript-specifc

    keyof
    as [const]
    extends (conditional type)
    infer
    satisfies
    is
    asserts

### instructions

statements or expressions that either accept no argument or have non-local effects.

requires external control/context

expressions

    =
    +=
    -=
    *=
    /=
    %=
    **=
    <<=
    >>=
    >>>=
    &=
    ^=
    |=
    &&=
    ||=
    ??=
    ++
    --
    delete
    yield

syntax

    break
    continue
    debugger
    return
    throw
    with

## additionnal features

### brackets inherit the style of what they are used on

    f(args) // () use f's color
    import { x } from 'module' // {} use import's color

Like brackets are used to extend something
Tthose are different brackets then standalone brackets (like expression groupings ,array and objects) because they cannot be nested. so they should be colored differently while we can keep our lightness scaling for nested standalone brackets
This can be partially done on VSCode assuming bracket pair colorization is disabled, but it is brittle.

## cannot do

what doesn't seem to be doable with native VSCode syntax highlighting.

- structural bracket coloring
- only increase bracket pair depth for contiguous brackets
- catch variable in italics
- color only expression-level commas as separators
- coloring break and continue, goto, and for await as instructions (keyword.control.loop everywhere for JS/TS)
