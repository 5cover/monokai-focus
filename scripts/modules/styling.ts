import { any, r, type Rule } from '../../scripts/decleme.ts'

export default [
    r('meta', { on: 'keyword.control.at-rule' }),
    r('text', { on: 'meta.property-value.css' }),
    r('function', { on: 'entity.other.attribute-name.class:pseudo-class.css' }),
    r('declaration', { on: 'entity.other.attribute-name.id.css' }),
    r('leaf', { on: 'entity.other.attribute-name.pseudo-element.css' }),
] satisfies Rule[]
