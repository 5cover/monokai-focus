import { language, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'

export default language(
    'source.c:cpp',
    r(s.dim, 'punctuation.separator.namespace.access'),
    r(s.abstraction, 'punctuation.section.arguments:parameters'),
    r(s.instruction, 'kewyord.wordlike'),
    r(s.operation, 'keyword.operator.cast'),
    r(s.declaration, 'punctuation.section.angle-brackets.begin:end.template.definition'),
    r(
        s.type,
        'storage.type.built-in',
        'storage.modifier.specifier.const',
        'storage.modifier.pointer:reference',
        'punctuation.section.angle-brackets.begin:end.template.call',
    ),
)
