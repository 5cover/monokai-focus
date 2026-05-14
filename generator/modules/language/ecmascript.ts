import { any, language, r } from '../../decleme.ts'

export default language(
    'tsx:ts:js:jsx',
    r('type', { on: 'meta.type.annotation storage.modifier' }),
    r('langvar', { on: any('variable.language.super:this:arguments', 'keyword.control.import') }),
    r('abstraction', { on: 'keyword.control.require' }),
    r('declaration', {
        on: any(
            'constant.language.import-export-all',
            'keyword.control.as:from',
            'keyword.control.import:export',
            'keyword.type',
            'meta.export:import:import-equals keyword.control.default',
            'storage.type:modifier',
        ),
        no: 'storage.type.function.arrow',
    }),
)
