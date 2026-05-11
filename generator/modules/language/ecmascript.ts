import { any, c, language, r } from '../../decleme.ts'

export default language(
    'tsx:ts:js:jsx',
    r('type', { on: 'meta.type.annotation storage.modifier' }),
    r('langvar', { on: 'variable.language.super:this:arguments' }),
    r('abstraction', { on: 'keyword.control.require' }),
    r('declaration', {
        on: any('constant.language.import-export-all', 'meta.import:import-equals:external:export keyword.control'),
        no: 'storage.type.function.arrow',
    }),
)
