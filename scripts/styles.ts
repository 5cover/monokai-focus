import color from 'color'
import { semantic as s, type Style } from './decleme.ts'
import type { TokenStyling } from './types.ts'

export const colors = {
    green: color('hsl(90, 59%, 66%)'),
    blue: color('hsl(186, 51%, 69%)'),
    purple: color('hsl(250, 77%, 78%)'),
    red: color('hsl(5, 80%, 75%)'),
    orange: color('hsl(30, 96%, 70%)'),
    yellow: color('hsl(45, 75%, 70%)'),
    pink: color('hsl(313, 35%, 80%)'),
    fg: color('hsl(60, 30%, 96%)'),
    invalid: color('hsl(0, 90%, 60%)'),
    bg: color('#272822'),
    fg1: color('hsl(60, 4%, 75%)'),
    fg2: color('hsl(60, 1%, 59%)'),
    fg2_5: color('hsl(60, 1%, 53%)'),
}

export const styles = {
    abstraction: { name: 'abstraction', fg: colors.pink },
    comment: { name: 'comment', fg: colors.orange },
    declaration: { name: 'declaration', fg: colors.blue },
    deprecated: { name: 'deprecated', in: 'strikethrough' },
    dimPunctuation: { name: 'dim-punctuation', fg: colors.fg.alpha(1 / 4) },
    documentation: { name: 'documentation', fg: colors.fg2_5 },
    documentationSyntax: { name: 'documentation-syntax', fg: colors.fg2 },
    emphasis: { name: 'emphasis', in: 'italic' },
    fg: { name: 'fg', fg: colors.fg },
    illegal: { name: 'illegal', fg: colors.invalid, in: 'bold' },
    instruction: { name: 'instruction', fg: colors.red },
    langvar: { name: 'language-variable', fg: colors.red, in: 'italic' },
    leaf: { name: 'leaf', fg: colors.green },
    type: { name: 'type', fg: colors.green },
    meta: { name: 'meta', fg: colors.purple },
    operation: { name: 'operation', fg: colors.blue },
    parameter: { name: 'parameter', in: 'italic' },
    quote: { name: 'quote', fg: colors.fg1 },
    strong: { name: 'strong', in: 'bold' },
    text: { name: 'text', fg: colors.yellow },
} as const satisfies Record<string, Style>

export type StyleKey = keyof typeof styles

export const semanticTokenColors = {
    '*.deprecated': {
        fontStyle: 'strikethrough',
    },
    comment: s(styles.comment),
    decorator: s(styles.abstraction),
    enum: s(styles.type),
    interface: s(styles.type),
    keyword: s(styles.instruction),
    macro: styles.meta.fg,
    namespace: s(styles.type),
    number: s(styles.leaf),
    operator: s(styles.operation),
    parameter: {
        fontStyle: 'italic',
    },
    regexp: s(styles.text),
    string: s(styles.text),
    struct: s(styles.type),
    type: s(styles.type),
    typeParameter: {
        fontStyle: 'italic',
        foreground: styles.type.fg,
    },
    function: s(styles.abstraction),
    '*.typeHint': s(styles.type),
} satisfies TokenStyling
