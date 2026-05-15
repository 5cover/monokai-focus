import { any, language, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'

export default language(
    'markdown',
    r(s.declaration, 'meta.separator', 'punctuation.definition.list.begin'),
    r(null, 'keyword.operator'),
)
