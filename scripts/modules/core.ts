import { any, c, r, type Rule } from '../../scripts/decleme.ts'
import { s } from '../../scripts/colors.ts'

export default [
    r(s.illegal, { on: 'invalid.illegal' }),
    r(s.deprecated, { on: 'invalid.deprecated' }),
    r(s.comment, { on: 'comment' }),
    r(s.documentation, { on: 'comment.:block.documentation' }),
    r(s.documentationSyntax, { on: 'storage.type.class.jsdoc' }),
    r(s.leaf, { on: 'constant' }),
    r(s.text, {
        on: 'string',
        no: any(
            c('meta.object-literal.key', 'string'),
            c('string', any('punctuation.definition.template-expression', 'meta.template.expression')),
            'meta.embedded.interpolation',
        ),
    }),
] satisfies Rule[]
