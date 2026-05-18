import { dsc, language, r } from '../../decleme.ts'
import { style as s } from '../../styles.ts'
export default language(
    'source.tsx:ts:js', // jsx is source.js.jsx
    r(s.langvar, 'keyword.control.import'),
    r(s.abstraction, 'keyword.control.require'),
    r(
        s.declaration,
        'storage.type',
        'constant.language.import-export-all',
        'keyword.control.as:from:export:default',
        dsc('meta.import:import-equals', 'keyword.control.import'),
    ),
    r(null, 'storage.type.function.arrow'),
)
