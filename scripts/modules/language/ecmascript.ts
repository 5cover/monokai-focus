import { any, c, r, type Scope } from '../../../scripts/decleme.ts'

const s = (s: Scope) => [s, 'tsx:jsx:js:ts']

export default [
    r('type', { on: c(s('meta.type.annotation'), 'storage.modifier') }),
    r('langvar', { on: s('variable.language.super:this:arguments') }),
    r('abstraction', { on: s('keyword.control.require') }),
    r('declaration', {
        on: any(
            s('constant.language.import-export-all'),
            c(s('source'), 'meta.import:import-equals:external:export', 'keyword.control'),
        ),
        no: s('storage.type.function.arrow'),
    }),
]
