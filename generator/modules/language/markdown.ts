import { any, dsc, language, one, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'

export default language(
    one('source.mdx', 'text.html.markdown'),
    r(s.declaration, 'meta:punctuation.separator', 'punctuation.definition.list:link:metadata:table:constant'),
    r(s.text, dsc('meta.link.inline:reference', 'markup.underline.link')),
    r(s.fg, 'string.other.link'),
    r(s.meta, 'punctuation.section.embedded'),
)
