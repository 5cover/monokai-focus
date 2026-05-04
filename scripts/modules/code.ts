import { any, c, r, type Rule } from '../../scripts/decleme.ts'

export default [
    r('langvar', { on: any('variable.language', 'keyword.control.import') }),
    r('parameter', { on: 'variable.parameter' }),
    r('type', {
        on: any(
            'support:keyword.type',
            'entity.name.type',
            'storage.type.primitive:struct',
            'punctuation.definition.typeparameters',
            'entity.other.inherited-class',
            'punctuation.section.angle-brackets.begin:end.template.call',
        ),
        no: 'support.type.property-name',
    }),
    r('abstraction', {
        on: any(
            'punctuation.section.arguments:parameters.begin:end',
            'entity.name.function',
            'punctuation.decorator',
            c('meta.decorator', any('variable.other.readwrite')),
        ),
    }),
    r('declaration', {
        on: any(
            'constant.language.import-export-all',
            ['keyword', any('declaration', 'other.typedef:import', 'control.require:type:export', 'new')],
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
            'storage.modifier',
            'storage.type.:modifier',
            'punctuation.section.angle-brackets.begin:end.template.definition'
        ),
        no: any('storage.type.function.arrow', 'storage.modifier.pointer:reference'),
    }),
    r('operation', {
        on: any(
            [
                'keyword',
                any(
                    'control.switch:conditional:trycatch:as:satisfies:loop:if',
                    [
                        'operator',
                        any('type.asserts', 'expression.typeof:in:instanceof:void:of:keyof:as:infer:is', 'new'),
                    ],
                    'other.new',
                ),
            ]
        ),
    }),
    r('instruction', {
        on: ['keyword', any('other.debugger', 'control.:flow:with:return', 'operator.expression.delete')],
    }),
    r('dimPunctuation', { on: 'punctuation.accessor', no: 'punctuation.accessor.optional' }),
    r('meta', { on: any('keyword.control.directive', 'entity.name.function.preprocessor', 'keyword.preprocessor') }),
] satisfies Rule[]
