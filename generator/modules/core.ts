import { dsc, one, r, type Rule } from '../decleme.ts'
import { style as s } from '../styles.ts'

export default one(
    r(s.illegal, 'invalid.illegal'),
    r(s.deprecated, 'invalid.deprecated'),
    r(s.comment, 'comment'),
    r(s.documentation, 'comment.:block.documentation'),
    r(s.documentationSyntax, 'storage.type.class.jsdoc', 'constant.string.documentation', 'keyword.other.phpdoc'),
    r(s.leaf, 'constant'),
    r(s.text, 'string'),
    r(
        null,
        'meta.object-literal.key string',
        dsc(
            'string',
            one(
                'punctuation.definition.template-expression:subshell:variable',
                'punctuation.section.embedded',
                'meta.template.expression',
                'meta.embedded:parameter-expansion',
            ),
        ),
    ),
)
