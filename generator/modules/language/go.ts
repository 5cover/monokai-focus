import { language, one, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'
export default language(
    'go',
    r(s.declaration, ['keyword', one('package', 'control.import', 'function:var:const:type:struct')]),
)
