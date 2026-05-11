import { language, r } from '../../decleme.ts'

export default language(
    'python',
    r('operation', {
        on: 'keyword.operator.logical',
    }),
    r('abstraction', {
        on: 'meta.function.decorator support.type',
    }),
)
