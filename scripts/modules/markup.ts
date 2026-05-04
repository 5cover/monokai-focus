import { any, cross, r, type Rule } from '../../scripts/decleme.ts'

export default [
    r('function', {
        on: 'support.class.component',
    }),
    r('leaf', {
        on: 'entity.name.tag',
    }),
    r('text', { on: any('markup.raw', 'markup.inline.raw') }),
    cross(
        r('emphasis', { on: 'markup.italic' }),
        r('strong', { on: 'markup.bold' }),
        r('quote', { on: 'markup.quote' }),
        r('declaration', { on: 'markup.heading' }),
    ),
    r('declaration', { on: any('entity.name.section', 'punctuation.definition.list') }),
] satisfies Rule[]
