import { c, r } from '../../decleme.ts'

export default [
    r('operation', {
        on: 'keyword.operator.logical.python',
    }),
    r('abstraction', {
        on: c('meta.function.decorator.python', 'support.type.python'),
    }),
]
