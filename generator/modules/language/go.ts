import { any, language, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'
export default language(
    'go',
    r(s.declaration, ['keyword', any('package', 'control.import', 'function:var:const:type:struct')]),
)
