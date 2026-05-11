import { any, desc, r, type Rule } from '../decleme.ts'

export default [
    r('parameter', { on: 'variable.parameter' }),
    r('type', {
        on: any(
            'entity.name.type',
            'entity.other.inherited-class',
            'punctuation.definition.typeparameters',
            'punctuation.section.angle-brackets.begin:end.template.call',
            'storage.type.primitive:struct',
            'support:keyword.type',
        ),
        no: 'support.type.property-name',
    }),
    r('abstraction', {
        on: any(
            'punctuation.section.arguments:parameters.begin:end',
            'entity.name.function',
            'entity.name.type.class',
            'support.class',
            'punctuation.decorator',
            'meta.decorator variable.other.readwrite',
        ),
    }),
    r('declaration', {
        on: any(
            ['keyword', any('declaration', 'other.typedef:import', 'type.new')],
            'punctuation.section.angle-brackets.begin:end.template.definition',
            'storage.type:modifier',
        ),
    }),
    r('operation', {
        on: any([
            'keyword',
            any(
                'control.switch:conditional:trycatch:as:satisfies:loop:if:elif:then:fi',
                [
                    'operator',
                    any('type.asserts', 'expression.typeof:in:instanceof:void:of:keyof:as:infer:is', 'expression:.new'),
                ],
                'other.new',
            ),
        ]),
    }),
    r('instruction', {
        on: ['keyword', any('other.debugger', 'control.:flow:with:return', 'operator.expression.delete:await')],
    }),
    r('dim', { on: 'punctuation.accessor', no: 'punctuation.accessor.optional' }),
    r('meta', { on: any('keyword.control.directive', 'entity.name.function.preprocessor', 'keyword.preprocessor') }),
] satisfies Rule[]
