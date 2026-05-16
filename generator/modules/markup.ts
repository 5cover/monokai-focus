import { any, dsc, one, r } from '../decleme.ts'
import { style as s } from '../styles.ts'
export default one(
    r(s.abstraction, 'support.class.component'),
    r(s.leaf, 'entity.name.tag', 'punctuation.definition.tag'),
    r(s.text, 'markup.raw', 'markup.inline.raw'),
    dsc(
        one(null, r(s.declaration, 'markup.heading'), r(s.quote, 'markup.quote')),
        any(null, r(s.emphasis, 'markup.italic'), r(s.strong, 'markup.bold')),
    ),
    r(s.declaration, 'entity.name.section'),
    r(s.meta, 'punctuation.section.embedded'),
)
