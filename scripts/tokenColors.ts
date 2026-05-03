import code from './modules/code.ts'
import core from './modules/core.ts'
import markup from './modules/markup.ts'
import styling from './modules/styling.ts'
import python from './modules/language/python.ts'
import csharp from './modules/language/csharp.ts'
import yaml from './modules/language/yaml.ts'

export default [...core, ...code, ...styling, ...markup, ...python, ...csharp, ...yaml]
