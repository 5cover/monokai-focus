import { any, c, r, type Rule } from '../../scripts/decleme.ts'
import { s } from '../styles.ts'

export default [
    r(s.langvar, { on: any('variable.language', 'keyword.control.import') }),
    r(s.parameter, { on: 'variable.parameter' }),
    r(s.type, {
        on: any(
            [any('support', 'keyword', 'entity.name'), 'type'],
            'punctuation.definition.typeparameters',
            'storage.modifier.pointer',
            'entity.other.inherited-class',
            'punctuation.section.angle-brackets',
        ),
        no: 'support.type.property-name',
    }),
    r(s.function, {
        on: any(
            'entity.name.function',
            'punctuation.decorator',
            'meta.function.decorator',
            c('meta.decorator', 'variable.other.readwrite'),
        ),
    }),
    r(s.declaration, {
        on: any(
            'constant.language.import-export-all',
            ['keyword', any('other.typedef', 'control.require:type:export')],
            [
                'meta',
                any(
                    c('export', 'keyword.control.as:from'),
                    c('export.default', ['keyword', 'control.default']),
                    c(
                        'import:import-equals',
                        any('keyword.control.as:default:from:import', 'punctuation.definition.block'),
                    ),
                ),
            ],
            'storage.type:modifier',
        ),
        no: 'storage.type.function.arrow',
    }),
    r(s.operation, {
        on: any(
            [
                'keyword',
                any('control.switch:conditional:trycatch:as:satisfies:loop:if', [
                    'operator',
                    any('type.asserts', 'expression.typeof:in:instanceof:void:of:keyof:as:infer:is', 'new'),
                ]),
            ],
            c('meta.type.parameters:declaration', 'storage.modifier'),
        ),
    }),
    r(s.instruction, {
        on: ['keyword', any('other.debugger', 'control.flow:with:return', 'operator.expression.delete')],
    }),
    r(s.dimPunctuation, { on: 'punctuation.accessor', no: 'punctuation.accessor.optional' }),
    r(s.meta, { on: any('keyword.control.directive', 'keyword.preprocessor') }),
] satisfies Rule[]
