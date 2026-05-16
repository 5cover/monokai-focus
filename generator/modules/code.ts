import { one, r } from '../decleme.ts'
import { style as s } from '../styles.ts'

export default one(
    r(s.parameter, 'variable.parameter'),
    r(
        s.type,
        'entity.name.type',
        'entity.other.inherited-class',
        'punctuation.definition.typeparameters',
        'support.type',
    ),
    r(s.langvar, 'variable.language', 'variable.parameter.function.language.special'),
    r(
        null,
        'variable',
        'support.type.property-name',
        'punctuation.accessor.optional',
        'keyword.operator',
        'keyword.generator.asterisk.ts',
    ),
    r(
        s.abstraction,
        'entity.name.function',
        'support.function',
        'entity.name.type.class',
        'support.class',
        'punctuation.decorator',
        'meta.decorator variable.other.readwrite',
    ),
    r(s.declaration, ['keyword', one('declaration', 'other.typedef:import', 'type.new')], 'storage.type:modifier'),
    r(s.operation, [
        'keyword',
        one(
            'control.switch:conditional:trycatch:as:satisfies:loop:if:elif:then:fi',
            [
                'operator',
                one(
                    'new',
                    'type.asserts',
                    'expression.typeof:in:instanceof:void:of:keyof:as:infer:is',
                    'expression.new',
                ),
            ],
            'other.new',
        ),
    ]),
    r(s.instruction, [
        'keyword',
        one('', 'other.debugger', 'control.flow:with:return', 'operator.expression.delete:await'),
    ]),
    r(s.dim, 'punctuation.accessor'),
    r(s.meta, 'keyword.control.directive', 'keyword.preprocessor'),
)
