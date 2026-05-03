import nearestColor from 'nearest-color'
import { colornames } from 'color-name-list'
import color, { type ColorInstance } from 'color'
import { writeFileSync } from 'fs'
import { any, c, compileTokenColors, cross, r } from './decleme.ts'
import { join } from 'path'

// nearestColor expects an object { name => hex }
const nearest = (() => {
    const colors = colornames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {})
    const n = nearestColor.from(colors)
    return (c: ColorInstance) => n(c.hex())
})()

const core = {
    green: color('hsl(90, 59%, 66%)'),
    blue: color('hsl(186, 51%, 69%)'),
    purple: color('hsl(250, 77%, 78%)'),
    red: color('hsl(5, 80%, 75%)'),
    orange: color('hsl(30, 96%, 70%)'),
    yellow: color('hsl(45, 80%, 70%)'),
    pink: color('hsl(313, 42%, 80%)'),
}

const colors = {
    invalid: color('hsl(0, 90%, 60%)'),
    bg: color('#272822'),
    fg: color('hsl(60, 30%, 96%)'),
    fg1: color('hsl(60, 4%, 75%)'),
    fg2: color('hsl(60, 1%, 59%)'),
    fg2_5: color('hsl(60, 1%, 53%)'),
    comment: core.orange,
    text: core.yellow,
    operation: core.blue,
    type: core.green,
    leaf: core.green,
    declaration: core.blue,
    function: core.purple,
    langvar: core.red,
    instruction: core.red,
    mutable: core.pink,
}

console.table(
    Object.entries(colors).map(([k, cl]) => ({
        k,
        hex: cl.hex(),
        hsl: cl.hsl().string(),
        contrast: cl.contrast(colors.bg).toPrecision(3),
        name: nearest(cl)?.name,
    })),
)

const theme = {
    semanticHighlighting: true,
    semanticTokenColors: {
        '*.deprecated': {
            fontStyle: 'strikethrough',
        },
        comment: colors.comment,
        decorator: colors.function,
        enum: colors.type,
        function: colors.function,
        interface: colors.type,
        keyword: colors.instruction,
        macro: colors.function,
        method: colors.function,
        namespace: colors.type,
        number: colors.leaf,
        operator: colors.operation,
        parameter: {
            fontStyle: 'italic',
            foreground: colors.fg,
        },
        regexp: colors.text,
        string: colors.text,
        struct: colors.type,
        type: colors.type,
        typeParameter: {
            fontStyle: 'italic',
            foreground: colors.type,
        },
        '*.modification': {
            fontStyle: 'italic',
        },
        '*.typeHint': {
            foreground: colors.type,
        },
    },
    tokenColors: compileTokenColors(
        [
            r({ name: 'illegal', fg: colors.invalid, in: 'bold' }, { on: 'invalid.illegal' }),
            r({ name: 'deprecated', in: 'strikethrough' }, { on: 'invalid.deprecated' }),
            r({ name: 'comment', fg: colors.comment }, { on: 'comment' }),
            r({ name: 'documentation', fg: colors.fg2_5 }, { on: 'comment.:block.documentation' }),
            r({ name: 'documentation syntax', fg: colors.fg2 }, { on: 'storage.type.class.jsdoc' }),
            r({ name: 'constant', fg: colors.leaf }, { on: 'constant' }),
            r(
                { name: 'text', fg: colors.text },
                {
                    on: 'string',
                    no: any(
                        c('meta.object-literal.key', 'string'),
                        c('string', any('punctuation.definition.template-expression', 'meta.template.expression')),
                    ),
                },
            ),
            r(
                { name: 'component', fg: colors.function },
                {
                    on: 'support.class.component',
                },
            ),
            r(
                { name: 'tag', fg: colors.leaf },
                {
                    on: 'entity.name.tag',
                },
            ),
            r(
                {
                    name: 'attribute',
                    fg: colors.operation,
                },
                {
                    on: 'entity.other.attribute-name',
                },
            ),
            r(
                { name: 'language variable', fg: colors.langvar, in: 'italic' },
                { on: any('variable.language', 'keyword.control.import') },
            ),
            r({ name: 'at-rule', fg: colors.instruction }, { on: 'keyword.control.at-rule' }),
            r(
                { name: 'type', fg: colors.type },
                {
                    on: any(
                        [any('support', 'keyword', 'entity.name'), 'type'],
                        'punctuation.definition.typeparameters',
                        'storage.modifier.pointer',
                    ),
                    no: 'support.type.property-name',
                },
            ),
            r({ name: 'function', fg: colors.function }, { on: any('entity.name.function', 'meta.decorator') }),
            r(
                { name: 'declaration', fg: colors.declaration },
                {
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
                        'punctuation.section.angle-brackets',
                    ),
                    no: 'storage.type.function.arrow',
                },
            ),
            r(
                { name: 'operation', fg: colors.operation },
                {
                    on: any(
                        [
                            'keyword',
                            any('control.switch:conditional:trycatch:as:satisfies:loop:if', [
                                'operator',
                                any(
                                    'type.asserts',
                                    'expression.typeof:in:instanceof:void:of:keyof:as:infer:is',
                                    'new',
                                    'logical',
                                ),
                            ]),
                        ],
                        c('meta.type.parameters:declaration', 'storage.modifier'),
                    ),
                },
            ),
            r(
                { name: 'instruction', fg: colors.instruction },
                {
                    on: ['keyword', any('other.debugger', 'control.flow:with:return', 'operator.expression.delete')],
                },
            ),
            r(
                { name: 'accessor', fg: colors.fg.alpha(1 / 4) },
                { on: 'punctuation.accessor', no: 'punctuation.accessor.optional' },
            ),
            r({ name: 'raw', fg: colors.text }, { on: any('markup.raw', 'markup.inline.raw') }),
            cross(
                r({ name: 'italic', in: 'italic' }, { on: 'markup.italic' }),
                r({ name: 'bold', in: 'bold' }, { on: 'markup.bold' }),
                r({ name: 'quote', in: 'italic' }, { on: 'markup.quote' }),
                r({ name: 'heading', fg: colors.declaration }, { on: 'markup.heading' }),
            ),
            r({ name: 'section', fg: colors.declaration }, { on: 'entity.name.section' }),
            r({ name: 'preprocessor', fg: colors.type }, { on: 'keyword.control.directive' }),
            r({ name: 'list', fg: colors.type }, { on: 'punctuation.definition.list' }),
        ],
        { defaultForeground: colors.fg },
    ),
    type: 'dark',
    colors: {
        'activityBar.background': colors.bg,
        'activityBar.foreground': colors.fg,
        'badge.background': '#75715E',
        'badge.foreground': colors.fg,
        'button.background': '#75715E',
        'debugToolBar.background': '#1e1f1c',
        'diffEditor.insertedTextBackground': '#4b661680', // middle of #272822 and #a6e22e
        'diffEditor.removedTextBackground': '#90274A70', // middle of #272822 and #f92672
        'dropdown.background': '#414339',
        'dropdown.listBackground': '#1e1f1c',
        'editor.background': colors.bg,
        'editor.foreground': colors.fg,
        'editor.lineHighlightBackground': '#3e3d32',
        'editor.selectionBackground': '#878b9180',
        'editor.selectionHighlightBackground': '#575b6180',
        'editor.wordHighlightBackground': '#4a4a7680',
        'editor.wordHighlightStrongBackground': '#6a6a9680',
        'editorBracketHighlight.foreground1': colors.fg,
        'editorBracketHighlight.foreground2': colors.fg1,
        'editorBracketHighlight.foreground3': colors.fg2,
        'editorBracketHighlight.foreground4': colors.fg1,
        'editorBracketHighlight.unexpectedBracket.foreground': colors.invalid,
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
        'editorSuggestWidget.background': colors.bg,
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
        'list.highlightForeground': colors.fg,
        'list.hoverBackground': '#3e3d32',
        'list.inactiveSelectionBackground': '#414339',
        'menu.background': '#1e1f1c',
        'menu.foreground': '#cccccc',
        'minimap.selectionHighlight': '#878b9180',
        'panel.border': '#414339',
        'panelTitle.activeBorder': '#75715E',
        'panelTitle.activeForeground': colors.fg,
        'panelTitle.inactiveForeground': '#75715E',
        'peekView.border': '#75715E',
        'peekViewEditor.background': colors.bg,
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
        'sideBarSectionHeader.background': colors.bg,
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
        'terminal.ansiBrightWhite': colors.fg,
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
    join(import.meta.dirname, '../themes/monokai-focus-color-theme.json'),
    JSON.stringify(theme, (_, v) =>
        v instanceof color ?
            v.alpha() === 1 ?
                v.hex()
            :   v.hexa()
        :   v,
    ),
)
