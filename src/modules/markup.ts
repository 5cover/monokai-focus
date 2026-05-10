import { any, cross, r, type Rule } from '../decleme.ts'

export default [
    r('abstraction', {
        on: 'support.class.component',
    }),
    r('leaf', {
        on: any('entity.name.tag', 'punctuation.definition.tag'),
    }),
    r('text', { on: any('markup.raw', 'markup.inline.raw') }),
    cross(
        r('emphasis', { on: 'markup.italic' }),
        r('strong', { on: 'markup.bold' }),
        r('quote', { on: 'markup.quote' }),
        r('declaration', { on: 'markup.heading' }),
    ),
    r('declaration', { on: 'entity.name.section' }),
    r('meta', { on: 'punctuation.section.embedded' }),
] satisfies Rule[]
