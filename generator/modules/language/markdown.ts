import { any, language, one, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'

export default language(
    one('source.mdx', 'text.html.markdown'),
    r(s.declaration, 'meta.separator', 'punctuation.definition.list.begin'),
    r(s.meta, 'punctuation.section.embedded'),
)
