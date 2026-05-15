import code from './modules/code.ts'
import core from './modules/core.ts'
import markup from './modules/markup.ts'
import styling from './modules/styling.ts'
import python from './modules/language/python.ts'
import csharp from './modules/language/csharp.ts'
import yaml from './modules/language/yaml.ts'
import powershell from './modules/language/powershell.ts'
import markdown from './modules/language/markdown.ts'
import ecmascript from './modules/language/ecmascript.ts'
import cpp from './modules/language/cpp.ts'
import go from './modules/language/go.ts'
import ini from './modules/language/ini.ts'

export default [
    ...core,
    ...code,
    ...styling,
    ...markup,
    ...python,
    ...csharp,
    ...yaml,
    ...powershell,
    ...markdown,
    ...ecmascript,
    ...cpp,
    ...go,
    ...ini,
]
