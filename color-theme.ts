import nearestColor from 'nearest-color'
import { colornames } from 'color-name-list'
import color, { type ColorInstance } from 'color'
import { writeFileSync } from 'fs'
import { any, c as ctx, compileTokenColors, cross, rule } from './decleme.ts'

// nearestColor expects an object { name => hex }
const colors = colornames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {})
const _nearest = nearestColor.from(colors)
const nearest = (c: ColorInstance) => _nearest(c.hex())

const core = {
    green: color('hsl(90, 59%, 66%)'),
    blue: color('hsl(186, 51%, 69%)'),
    purple: color('hsl(250, 77%, 78%)'),
    red: color('hsl(5, 90%, 72%)'),
    yellow: color('hsl(45, 86%, 70%)'),
}

//color('hsl(315, 53%, 80%)')

const c = {
    invalid: color('hsl(0, 90%, 60%)'),
    bg: color('#272822'),
    fg: color('hsl(60, 30%, 96%)'),
    fg1: color('hsl(60, 4%, 75%)'),
    fg2: color('hsl(60, 1%, 59%)'),
    fg2_5: color('hsl(60, 1%, 53%)'),
    comment: color('hsl(20, 96%, 70%)'),
    text: core.yellow,
    operation: core.blue,
    type: core.green,
    leaf: core.green,
    declaration: core.blue,
    function: core.purple,
    langvar: core.red,
    instruction: core.red,
}

console.table(
    Object.entries(c).map(([k, cl]) => ({
        k,
        hex: cl.hex(),
        hsl: cl.hsl().string(),
        contrast: cl.contrast(c.bg).toPrecision(3),
        name: nearest(cl)?.name,
    })),
)

const theme = {
    semanticHighlighting: true,
    semanticTokenColors: {
        '*.deprecated': {
            fontStyle: 'strikethrough',
        },
        comment: c.comment,
        decorator: c.function,
        enum: c.type,
        //enumMember: c.fg,
        //event: c.fg,
        function: c.function,
        interface: c.type,
        keyword: c.instruction,
        label: c.fg,
        macro: c.function,
        method: c.function,
        namespace: c.type,
        number: c.leaf,
        operator: c.operation,
        parameter: {
            fontStyle: 'italic',
            foreground: c.fg,
        },
        regexp: c.text,
        string: c.text,
        struct: c.type,
        type: c.type,
        typeParameter: {
            fontStyle: 'italic',
            foreground: c.type,
        },
        variable: c.fg,
    },
    tokenColors: compileTokenColors(
        [
            rule({ name: 'Illegal', fg: c.invalid, in: 'bold' }, { on: 'invalid.illegal' }),
            rule({ name: 'Deprecated', in: 'strikethrough' }, { on: 'invalid.deprecated' }),
            rule({ name: 'Comment', fg: c.comment }, { on: 'comment' }),
            rule(
                { name: 'Documentation', fg: c.fg2_5 },
                { on: any('comment.block.documentation', 'comment.documentation') },
            ),
            rule({ name: 'Documentation syntax', fg: c.fg2 }, { on: 'storage.type.class.jsdoc' }),
            rule({ name: 'Constant', fg: c.leaf }, { on: 'constant' }),
            rule({ name: 'Text', fg: c.text }, { on: 'string' }),
            rule(
                { name: 'Language variables', fg: c.langvar, in: 'italic' },
                { on: any('variable.language', 'keyword.control.import') },
            ),
            rule(
                { name: 'Whites', fg: c.fg },
                {
                    on: any(
                        'punctuation.definition.template-expression',
                        'punctuation.accessor.optional',
                        'keyword.operator.type.annotation',
                        'meta.brace',
                        'meta.object-literal.key',
                    ),
                },
            ),
            rule(
                { name: 'Types', fg: c.type },
                {
                    on: any(
                        'support.type',
                        'entity.name.type',
                        'keyword.type',
                        'punctuation.definition.typeparameters',
                    ),
                },
            ),
            rule({ name: 'Functions', fg: c.function }, { on: any('entity.name.function', 'meta.decorator') }),
            rule(
                { name: 'Declarations', fg: c.declaration },
                {
                    on: any(
                        'keyword.control.require:type:export',
                        ctx('meta.export', 'keyword.control.as:from'),
                        ctx('meta.export.default', 'keyword.control.default'),
                        ctx('meta.import:import-equals', 'keyword.control.as:default:from:import'),
                        'storage',
                        ctx('meta.import:import-equals:export', 'punctuation.definition.block'),
                    ),
                },
            ),
            rule(
                { name: 'Operations', fg: c.operation },
                {
                    on: any(
                        'keyword.operator.type.asserts',
                        'keyword.operator.expression.typeof:in:instanceof:void:of:keyof:as:infer:is',
                        'keyword.operator.new',
                        'keyword.control.switch:conditional:trycatch:as:satisfies:loop',
                        'storage.type.function.arrow',
                        ctx('meta.type.parameters:declaration', 'storage.modifier'),
                    ),
                },
            ),
            rule(
                { name: 'Instructions', fg: c.instruction },
                {
                    on: any(
                        'keyword.other.debugger',
                        'keyword.control.flow:with',
                        'keyword.operator.expression.delete',
                    ),
                },
            ),
            rule({ name: 'Accessor', fg: c.fg.alpha(1 / 3) }, { on: 'punctuation.accessor' }),
            rule({ name: 'Headings', fg: c.declaration }, { on: 'markup.heading' }),
            rule({ name: 'Raw', fg: c.text }, { on: any('markup.raw', 'markup.inline.raw') }),
            rule({ name: 'Quote', in: 'italic' }, { on: 'markup.quote' }),
            rule({ name: 'Punctuations', in: [] }, { on: 'punctuation' }),
            cross(
                rule({ name: 'Italic', in: 'italic' }, { on: 'markup.italic' }),
                rule({ name: 'Bold', in: 'bold' }, { on: 'markup.bold' }),
            ),
        ],
        { defaultForeground: c.fg },
    ),
    type: 'dark',
    colors: {
        'activityBar.background': c.bg,
        'activityBar.foreground': c.fg,
        'badge.background': '#75715E',
        'badge.foreground': c.fg,
        'button.background': '#75715E',
        'debugToolBar.background': '#1e1f1c',
        'diffEditor.insertedTextBackground': '#4b661680', // middle of #272822 and #a6e22e
        'diffEditor.removedTextBackground': '#90274A70', // middle of #272822 and #f92672
        'dropdown.background': '#414339',
        'dropdown.listBackground': '#1e1f1c',
        'editor.background': c.bg,
        'editor.foreground': c.fg,
        'editor.lineHighlightBackground': '#3e3d32',
        'editor.selectionBackground': '#878b9180',
        'editor.selectionHighlightBackground': '#575b6180',
        'editor.wordHighlightBackground': '#4a4a7680',
        'editor.wordHighlightStrongBackground': '#6a6a9680',
        //'editorBracketHighlight.foreground1': c.fg,
        //'editorBracketHighlight.foreground2': c.fg1,
        //'editorBracketHighlight.foreground3': c.fg2,
        //'editorBracketHighlight.foreground4': c.fg1,
        'editorBracketHighlight.unexpectedBracket.foreground': c.invalid,
        'editorCursor.foreground': '#f8f8f0',
        'editorGroup.border': '#34352f',
        'editorGroup.dropBackground': '#41433980',
        'editorGroupHeader.tabsBackground': '#1e1f1c',
        'editorHoverWidget.background': '#414339',
        'editorHoverWidget.border': '#75715E',
        'editorIndentGuide.activeBackground1': '#767771',
        'editorIndentGuide.background1': '#464741',
        'editorLineNumber.activeForeground': '#c2c2bf',
        'editorLineNumber.foreground': '#90908a',
        'editorSuggestWidget.background': c.bg,
        'editorSuggestWidget.border': '#75715E',
        'editorWhitespace.foreground': '#464741',
        'editorWidget.background': '#1e1f1c',
        focusBorder: '#99947c',
        'input.background': '#414339',
        'inputOption.activeBorder': '#75715E',
        'inputValidation.errorBackground': '#90274A', // middle of #272822 and #f92672
        'inputValidation.errorBorder': '#f92672',
        'inputValidation.infoBackground': '#546190', // middle of #272822 and #819aff
        'inputValidation.infoBorder': '#819aff',
        'inputValidation.warningBackground': '#848528', // middle of #272822 and #e2e22e
        'inputValidation.warningBorder': '#e2e22e',
        'list.activeSelectionBackground': '#75715E',
        'list.dropBackground': '#414339',
        'list.highlightForeground': c.fg,
        'list.hoverBackground': '#3e3d32',
        'list.inactiveSelectionBackground': '#414339',
        'menu.background': '#1e1f1c',
        'menu.foreground': '#cccccc',
        'minimap.selectionHighlight': '#878b9180',
        'panel.border': '#414339',
        'panelTitle.activeBorder': '#75715E',
        'panelTitle.activeForeground': c.fg,
        'panelTitle.inactiveForeground': '#75715E',
        'peekView.border': '#75715E',
        'peekViewEditor.background': c.bg,
        'peekViewEditor.matchHighlightBackground': '#75715E',
        'peekViewResult.background': '#1e1f1c',
        'peekViewResult.matchHighlightBackground': '#75715E',
        'peekViewResult.selectionBackground': '#414339',
        'peekViewTitle.background': '#1e1f1c',
        'pickerGroup.foreground': '#75715E',
        'ports.iconRunningProcessForeground': '#ccccc7',
        'progressBar.background': '#75715E',
        'quickInputList.focusBackground': '#414339',
        'selection.background': '#878b9180',
        'settings.focusedRowBackground': '#4143395A',
        'sideBar.background': '#1e1f1c',
        'sideBarSectionHeader.background': c.bg,
        'statusBar.background': '#414339',
        'statusBar.debuggingBackground': '#75715E',
        'statusBar.noFolderBackground': '#414339',
        'statusBarItem.remoteBackground': '#AC6218',
        'tab.border': '#1e1f1c',
        'tab.inactiveBackground': '#34352f',
        'tab.inactiveForeground': '#ccccc7', // needs to be bright so it's readable when another editor group is focused
        'tab.lastPinnedBorder': '#414339',
        'terminal.ansiBlack': '#333333',
        'terminal.ansiBlue': '#6A7EC8',
        'terminal.ansiBrightBlack': '#666666',
        'terminal.ansiBrightBlue': '#819aff', // hue shifted #AE81FF
        'terminal.ansiBrightCyan': '#66D9EF',
        'terminal.ansiBrightGreen': '#A6E22E',
        'terminal.ansiBrightMagenta': '#AE81FF',
        'terminal.ansiBrightRed': '#f92672',
        'terminal.ansiBrightWhite': c.fg,
        'terminal.ansiBrightYellow': '#e2e22e', // hue shifted #A6E22E
        'terminal.ansiCyan': '#56ADBC',
        'terminal.ansiGreen': '#86B42B',
        'terminal.ansiMagenta': '#8C6BC8',
        'terminal.ansiRed': '#C4265E', // the bright color with ~75% transparent on the background
        'terminal.ansiWhite': '#e3e3dd',
        'terminal.ansiYellow': '#B3B42B',
        'titleBar.activeBackground': '#1e1f1c',
        'widget.shadow': '#00000098',
    },
}

writeFileSync(
    'themes/monokai-focus-color-theme.json',
    JSON.stringify(theme, (_, v) => (v instanceof color ? (v.alpha() === 1 ? v.hex() : v.hexa()) : v)),
)
