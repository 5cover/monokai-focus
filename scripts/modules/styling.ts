import { r, type Rule } from '../../scripts/decleme.ts'

export default [
    r('meta', { on: 'keyword.control.at-rule' }),
    r('text', { on: 'meta.property-value.css' }),
    r('declaration', { on: 'entity.other.attribute-name.class:pseudo-class' }),
    r('instruction', { on: 'entity.other.attribute-name.id' }),
    r('leaf', { on: 'entity.other.attribute-name.pseudo-element' }),
] satisfies Rule[]
