import color from 'color'
import { semantic as s, type Style } from './decleme.ts'
import type { TokenStyling } from './types.ts'

export const colors = {
    invalid: color('hsl(0, 90%, 60%)'),
    red: color('hsl(5, 80%, 75%)'),
    orange: color('hsl(30, 96%, 70%)'),
    yellow: color('hsl(45, 75%, 70%)'),
    green: color('hsl(90, 59%, 66%)'),
    blue: color('hsl(186, 51%, 69%)'),
    purple: color('hsl(250, 77%, 78%)'),
    pink: color('hsl(313, 35%, 80%)'),
    fg: color('hsl(60, 30%, 96%)'),
    bg: color('#272822'),
    fg1: color('hsl(60, 4%, 75%)'),
    fg2: color('hsl(60, 1%, 59%)'),
    fg2_5: color('hsl(60, 1%, 53%)'),
}

export const style = {
    /**
     * A named composable unit of logic.
     *
     * Examples
     *
     * * functions
     * * decorators
     * * classes
     */
    abstraction: { name: 'abstraction', fg: colors.pink },
    /**
     * Signal miscaellanous author intent.
     */
    comment: { name: 'comment', fg: colors.orange },
    /**
     * Introduce or qualify a construct or emit a binding.
     *
     * Examples
     *
     * * var
     * * let
     * * const
     * * class [extends]
     * * function[*]
     * * async
     * * import [from] [as]
     * * export [as] [from]
     * * export default
     * * get
     * * set
     * * static* * using
     * * constructor
     *
     * TypeScript
     *
     * * interface [extends]
     * * type
     * * declare
     * * abstract
     * * implements
     * * enum
     * * public
     * * private
     * * protected
     * * readonly
     * * override
     * * namespace
     * * module
     * * require
     */
    declaration: { name: 'declaration', fg: colors.blue },
    deprecated: { name: 'deprecated', in: 'strikethrough' },
    /**
     * Structurally low-signal tokens.
     *
     * Examples
     *
     * * Accessor dots `a.b`
     * * C++ namespace resolve `::`.
     */
    dim: { name: 'dim', fg: colors.fg.alpha(1 / 4) },
    /**
     * Documentation content.
     */
    documentation: { name: 'documentation', fg: colors.fg2_5 },
    /**
     * Parsable documentation syntax.
     *
     * Examples
     *
     * * Doxygen
     * * JSDoc
     * * PHPDoc
     */
    documentationSyntax: { name: 'documentation-syntax', fg: colors.fg2 },
    /**
     * Formatted emphasis.
     */
    emphasis: { name: 'emphasis', in: 'italic' },
    /**
     * Implicitly, everything not colored.
     *
     * Examples
     *
     * * bindings (foo, bar)
     * * labels (label:)
     * * private fields (#a)
     * * object/mapping keys
     */
    fg: { name: 'fg', fg: colors.fg },
    illegal: { name: 'illegal', fg: colors.invalid, in: 'bold' },
    /**
     * Statement or expression that either accepts no arguments or has non-local effects.
     *
     * Examples
     *
     * Expressions
     *
     * * delete
     * * await
     * * yield
     *
     * syntax
     *
     * * break
     * * continue
     * * return
     * * throw
     * * with
     */
    instruction: { name: 'instruction', fg: colors.red },
    /**
     * Contextual expressions supplied by the language.
     *
     * Examples
     *
     * * this
     * * super
     * * arguments
     */
    langvar: { name: 'language-variable', fg: colors.purple },
    /** Inert (behaviorless, contextless) values. They seed logic.
     *
     * Examples
     *
     * * null
     * * 5
     * * true
     * * false
     * * undefined
     * * NaN
     * * Infinity
     * * 123n
     */
    leaf: { name: 'leaf', fg: colors.green },
    /** Categorize and constrain values into domains.
     *
     * Examples
     *
     * * Number
     * * number
     * * MyType
     * * any
     * * unknown
     * * never
     * * void
     * * (other primitive keyword types)
     */
    type: { name: 'type', fg: colors.green },
    /**
     * Meta-level construct with nonlocal semantics or evaluated before regular content.
     *
     * Examples
     *
     * * Preprocessor directives
     * * CSS at-rules
     */
    meta: { name: 'meta', fg: colors.purple },
    /**
     * While they may not be strictly pure, operations are "stable" constructs intended for computation. They accepts arguments and their semantics are only derived from passed arguments, without relying on context. For control flow, this also means no jumps outside of it.
     * Basically, if it performs a computation and can be reasoned about in isolation (locally intelligible), it's an operation. As for declarations, you can understand them fully by looking only at what’s inside them.
     *
     * Examples
     *
     * * expressions
     * * typeof
     * * in
     * * instanceof
     * * new
     * * void
     *
     * statements, for which the "arguments" are the blocks of code you pass into them
     *
     * * switch case default
     * * if else
     * * try catch finally
     * * for [of]
     * * [do] while
     * * for await
     *
     * TypeScript
     *
     * * keyof
     * * as [const]
     * * extends (conditional type)
     * * infer
     * * satisfies
     * * is
     * * asserts
     */
    operation: { name: 'operation', fg: colors.blue },
    /**
     * Labels for recieved information.
     *
     * Examples
     *
     * * Function parameters.
     * * Generic type parameters.
     * * Catch variables.
     *
     * Parameter is not a color category but a role overlay.
     */
    parameter: { name: 'parameter', in: 'italic' },
    /**
     * Formatted quote.
     */
    quote: { name: 'quote', fg: colors.fg1 },
    /**
     * Formatted strong.
     */
    strong: { name: 'strong', in: 'bold' },
    /**
     * Literal text or regular expression. Used for spans of content that do not obey the syntax or semantics of the containing language, and obey no particular rules (plain strings), or a different grammar (regular expressions)
     */
    text: { name: 'text', fg: colors.yellow },
} as const satisfies Record<string, Style>

export const semanticTokenColors = {
    '*.deprecated': s(style.deprecated),
    comment: s(style.comment),
    decorator: s(style.abstraction),
    class: s(style.abstraction),
    enum: s(style.type),
    interface: s(style.type),
    keyword: s(style.instruction),
    macro: style.meta.fg,
    namespace: s(style.type),
    number: s(style.leaf),
    operator: s(style.operation),
    parameter: s(style.parameter),
    regexp: s(style.text),
    string: s(style.text),
    struct: s(style.type),
    type: s(style.type),
    typeParameter: {
        fontStyle: 'italic',
        foreground: style.type.fg,
    },
    function: s(style.abstraction),
    '*.typeHint': s(style.type),
} satisfies TokenStyling
