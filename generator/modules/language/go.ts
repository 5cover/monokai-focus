import { any, language, r } from '../../decleme.ts'

export default language(
    'go',
    r('declaration', ['keyword', any('package', 'control.import', 'function:var:const:type:struct')]),
)
