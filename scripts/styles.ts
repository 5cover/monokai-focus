import color from 'color'
import type { Style } from './decleme.ts'

const core = {
    green: color('hsl(90, 59%, 66%)'),
    blue: color('hsl(186, 51%, 69%)'),
    purple: color('hsl(250, 77%, 78%)'),
    red: color('hsl(5, 80%, 75%)'),
    orange: color('hsl(30, 96%, 70%)'),
    yellow: color('hsl(45, 80%, 70%)'),
    pink: color('hsl(313, 42%, 80%)'),
    white: color('hsl(60, 30%, 96%)'),
}

export const colors = {
    invalid: color('hsl(0, 90%, 60%)'),
    bg: color('#272822'),
    fg: core.white,
    fg1: color('hsl(60, 4%, 75%)'),
    fg2: color('hsl(60, 1%, 59%)'),
    fg2_5: color('hsl(60, 1%, 53%)'),
    comment: core.orange,
    text: core.yellow,
    operation: core.blue,
    type: core.green,
    leaf: core.green,
    declaration: core.blue,
    function: core.white,
    langvar: core.red,
    instruction: core.red,
    meta: core.pink,
}

export const s = {
    fg: { name: 'fg', fg: colors.fg },
    langvar: { name: 'languageVariable', fg: colors.langvar, in: 'italic' },
    type: { name: 'type', fg: colors.type },
    function: { name: 'function', fg: colors.function },
    declaration: { name: 'declaration', fg: colors.declaration },
    operation: { name: 'operation', fg: colors.operation },
    instruction: { name: 'instruction', fg: colors.instruction },
    dimPunctuation: { name: 'dimPunctuation', fg: colors.fg.alpha(1 / 4) },
    meta: { name: 'meta', fg: colors.meta },
    illegal: { name: 'illegal', fg: colors.invalid, in: 'bold' },
    deprecated: { name: 'deprecated', in: 'strikethrough' },
    comment: { name: 'comment', fg: colors.comment },
    documentation: { name: 'documentation', fg: colors.fg2_5 },
    documentationSyntax: { name: 'documentation syntax', fg: colors.fg2 },
    leaf: { name: 'constant', fg: colors.leaf },
    text: { name: 'text', fg: colors.text },
    parameter: { name: 'parameter', in: 'italic' },
    emphasis: { name: 'emphasis', in: 'italic' },
    strong: { name: 'strong', in: 'bold' },
    quote: { name: 'quote', in: 'italic' },
} satisfies Record<string, Style>
