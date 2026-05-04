import { any, r, type Rule } from '../../scripts/decleme.ts'

export default [
    r('meta', { on: any('keyword.control.at-rule', 'keyword.operator.logical.and.media.css') }),
    r('text', { on: 'support.constant' }),
    r('declaration', { on: 'entity.other.attribute-name.class:pseudo-class' }),
    r('instruction', { on: 'entity.other.attribute-name.id' }),
    r('leaf', { on: 'entity.other.attribute-name.pseudo-element' }),
] satisfies Rule[]
