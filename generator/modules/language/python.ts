import { language, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'

export default language(
    'python',
    r(s.operation, 'keyword.operator.logical'),
    r(s.abstraction, 'meta.function.decorator support.type'),
)
