import { any, c, r } from '../../../scripts/decleme.ts'

export default [
    r('type', { on: c('meta.type.annotation', ['storage.modifier', 'tsx:jsx:js:ts']) }),
    r('langvar', { on: [any('variable.language.super:this:arguments', 'keyword.control.import'), 'tsx:jsx:js:ts'] }),
]
