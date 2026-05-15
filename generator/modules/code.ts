import { any, r, type Rule } from '../decleme.ts'
import { style as s } from '../styles.ts'

export default [
    r(s.parameter, 'variable.parameter'),
    r(
        s.type,
        'entity.name.type',
        'entity.other.inherited-class',
        'punctuation.definition.typeparameters',
        'punctuation.section.angle-brackets.begin:end.template.call',
        'storage.type',
        'support:type',
    ),
    r(null, 'support.type.property-name', 'punctuation.accessor.optional'),
    r(
        s.abstraction,
        'punctuation.section.arguments:parameters.begin:end',
        'entity.name.function',
        'entity.name.type.class',
        'support.class',
        'punctuation.decorator',
        'meta.decorator variable.other.readwrite',
    ),
    r(
        s.declaration,
        ['keyword', any('declaration', 'other.typedef:import', 'type.new')],
        'punctuation.section.angle-brackets.begin:end.template.definition',
    ),
    r(s.operation, [
        'keyword',
        any(
            'control.switch:conditional:trycatch:as:satisfies:loop:if:elif:then:fi',
            [
                'operator',
                any(
                    'new',
                    'type.asserts',
                    'expression.typeof:in:instanceof:void:of:keyof:as:infer:is',
                    'expression:.new',
                ),
            ],
            'other.new',
        ),
    ]),
    r(s.instruction, [
        'keyword',
        any('', 'other.debugger', 'control.flow:with:return', 'operator.expression.delete:await'),
    ]),
    r(s.dim, 'punctuation.accessor'),
    r(s.meta, any('keyword.control.directive', 'entity.name.function.preprocessor', 'keyword.preprocessor')),
] satisfies Rule[]
