import { any, r, type Rule } from '../../scripts/decleme.ts'
import { s } from '../../scripts/colors.ts'

export default [
    r(s.meta, { on: 'keyword.control.at-rule' }),
    r(s.text, { on: 'meta.property-value.css' }),
    r(s.function, { on: 'entity.other.attribute-name.class:pseudo-class.css' }),
    r(s.declaration, { on: 'entity.other.attribute-name.id.css' }),
    r(s.leaf, { on: 'entity.other.attribute-name.pseudo-element.css' }),
] satisfies Rule[]
