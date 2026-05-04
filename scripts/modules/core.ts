import { any, c, r, type Rule } from '../../scripts/decleme.ts'

export default [
    r('illegal', { on: 'invalid.illegal' }),
    r('deprecated', { on: 'invalid.deprecated' }),
    r('comment', { on: 'comment' }),
    r('documentation', { on: 'comment.:block.documentation' }),
    r('documentationSyntax', {
        on: any('storage.type.class.jsdoc', 'constant.string.documentation', 'keyword.other.phpdoc'),
    }),
    r('leaf', { on: 'constant' }),
    r('text', {
        on: 'string',
        no: any(
            'variable',
            c('meta.object-literal.key', 'string'),
            c(
                'string',
                any(
                    'punctuation.definition.template-expression:subshell:variable',
                    'punctuation.section.embedded',
                    'meta.template.expression',
                    'meta.embedded:parameter-expansion',
                ),
            ),
        ),
    }),
] satisfies Rule[]
