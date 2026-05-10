import { any, language, r } from '../../decleme.ts'

export default language(
    'markdown',
    r('declaration', {
        on: any('meta.separator', 'punctuation.definition.list.begin'),
    }),
)
