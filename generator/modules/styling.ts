import { one, r } from '../decleme.ts'
import { style as s } from '../styles.ts'

export default one(
    r(s.meta, 'keyword.control.at-rule', 'keyword.operator.logical.and.media.css'),
    r(s.text, 'support.constant'),
    r(s.declaration, 'entity.other.attribute-name.class:pseudo-class'),
    r(s.instruction, 'entity.other.attribute-name.id'),
    r(s.leaf, 'entity.other.attribute-name.pseudo-element'),
)
