import { any, language, r } from '../../decleme.ts'

export default language(
    'tsx:ts:js:jsx',
    r('type', { on: 'meta.type.annotation storage.modifier' }),
    r('langvar', { on: any('variable.language.super:this:arguments', 'keyword.control.import') }),
    r('abstraction', { on: 'keyword.control.require' }),
    r('declaration', {
        on: any(
            'keyword.control.as:from',
            'constant.language.import-export-all',
            'keyword.control.import:export',
            'meta.export:import:import-equals keyword.control.default',
        ),
        no: 'storage.type.function.arrow',
    }),
)
