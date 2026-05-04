import { any, cross, r, type Rule } from '../../scripts/decleme.ts'
import { s } from '../styles.ts'

export default [
    r(s.function, {
        on: 'support.class.component',
    }),
    r(s.leaf, {
        on: 'entity.name.tag',
    }),
    r(s.text, { on: any('markup.raw', 'markup.inline.raw') }),
    cross(
        r(s.emphasis, { on: 'markup.italic' }),
        r(s.strong, { on: 'markup.bold' }),
        r(s.quote, { on: 'markup.quote' }),
        r(s.declaration, { on: 'markup.heading' }),
    ),
    r(s.declaration, { on: 'entity.name.section' }),
    r(s.leaf, { on: 'punctuation.definition.list' }),
] satisfies Rule[]
