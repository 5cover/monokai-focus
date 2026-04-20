import nearestColor from 'nearest-color'
import { colornames } from 'color-name-list'
import color, { type ColorInstance } from 'color'
import { writeFileSync } from 'fs'

// nearestColor expects an object { name => hex }
const colors = colornames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {})
const _nearest = nearestColor.from(colors)
const nearest = (c: ColorInstance) => _nearest(c.hex())

const c = {
    invalid: color('#f53d3d'),
    bg: color('#272822'),
    fg: color('hsl(60, 30%, 96%)'),
    fg1: color('hsl(60, 4%, 75%)'),
    fg2: color('hsl(60, 1%, 59%)'),
    fg2_5: color('hsl(60, 1%, 53%)'),
    comment: color('hsl(20, 96%, 70%)'),
    text: color('hsl(45, 65%, 70%)'),
    function: color('hsl(70, 80%, 60%)'),
    type: color('hsl(140, 60%, 70%)'),
    leaf: color('hsl(140, 60%, 70%)'),
    declaration: color('hsl(200, 60%, 66%)'),
    operation: color('hsl(250, 70%, 78%)'),
    //instruction: color('hsl(345, 80%, 75%)'),
    instruction: color('hsl(0, 90%, 70%)'),
} as const

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
        'editorBracketHighlight.foreground1': c.fg,
        'editorBracketHighlight.foreground2': c.fg1,
        'editorBracketHighlight.foreground3': c.fg2,
        'editorBracketHighlight.foreground4': c.fg1,
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
    tokenColors: [
        {
            name: 'Illegal',
            scope: 'invalid.illegal',
            settings: {
                fontStyle: 'bold',
                foreground: c.invalid,
            },
        },
        {
            name: 'Deprecated',
            scope: 'invalid.deprecated',
            settings: {
                fontStyle: 'strikethrough',
            },
        },
        {
            name: 'Comment',
            scope: 'comment',
            settings: {
                foreground: c.comment,
            },
        },
        {
            name: 'Documentation',
            scope: ['comment.block.documentation', 'comment.documentation'],
            settings: {
                foreground: c.fg2_5,
            },
        },
        {
            name: 'JSDoc',
            scope: ['storage.type.class.jsdoc'],
            settings: {
                foreground: c.fg2,
            },
        },
        {
            name: 'Constant',
            scope: ['constant'],
            settings: {
                foreground: c.leaf,
            },
        },
        {
            name: 'Text',
            scope: ['string'],
            settings: {
                foreground: c.text,
            },
        },
        {
            name: ' Language variables',
            scope: ['variable.language', 'keyword.control.import'],
            settings: {
                foreground: c.fg1,
                fontStyle: 'italic',
            },
        },
        {
            name: 'Whites',
            scope: [
                'punctuation.definition.template-expression.begin',
                'punctuation.definition.template-expression.end',
                'keyword.operator.type.annotation',
                "meta.brace"
            ],
            settings: {
                foreground: c.fg,
            },
        },
        {
            name: 'Types',
            scope: ['support.type', 'entity.name.type', 'keyword.type', 'punctuation.definition.typeparameters'],
            settings: {
                foreground: c.type,
            },
        },
        {
            name: 'Functions',
            scope: ['entity.name.function', 'meta.decorator', 'punctuation.definition.parameters'],
            settings: {
                foreground: c.function,
            },
        },
        {
            name: 'Declarations',
            scope: [
                'keyword.control.require',
                'keyword.control.type',
                'keyword.control.export',
                'meta.export keyword.control.as',
                'meta.export keyword.control.from',
                'meta.export.default keyword.control.default',
                'meta.import keyword.control.as',
                'meta.import keyword.control.default',
                'meta.import keyword.control.from',
                'meta.import keyword.control.import',
                'meta.import-equals keyword.control.as',
                'meta.import-equals keyword.control.default',
                'meta.import-equals keyword.control.from',
                'meta.import-equals keyword.control.import',
                'storage',
                'meta.import punctuation.definition.block',
                'meta.import-equals punctuation.definition.block',
                'meta.export punctuation.definition.block',
            ],
            settings: {
                foreground: c.declaration,
            },
        },
        {
            name: 'Operations',
            scope: [
                'keyword.operator.comparison',
                'keyword.operator.relational',
                'keyword.operator.arithmetic',
                'keyword.operator.bitwise',
                'keyword.operator.type',
                'keyword.operator.logical',
                'keyword.operator.ternary',
                'keyword.operator.expression.typeof',
                'keyword.operator.expression.in',
                'keyword.operator.expression.instanceof',
                'keyword.operator.new',
                'keyword.operator.expression.void',
                'punctuation.accessor.optional',
                'keyword.control.switch',
                'keyword.control.conditional',
                'keyword.control.trycatch',
                'keyword.control.loop',
                'keyword.operator.expression.of',
                'storage.type.function.arrow',
                'keyword.operator.expression.keyof',
                'keyword.control.as',
                'keyword.operator.expression.as',
                'keyword.operator.expression.infer',
                'keyword.control.satisfies',
                'keyword.operator.expression.is',
                'meta.type.parameters storage.modifier',
                'meta.type.declaration storage.modifier',
            ],
            settings: {
                foreground: c.operation,
            },
        },
        {
            name: 'Instructions',
            scope: 'keyword',
            settings: {
                foreground: c.instruction,
            },
        },
        {
            name: 'Accessor',
            scope: 'punctuation.accessor',
            settings: {
                foreground: c.fg.alpha(1 / 3),
            },
        },
    ],
    type: 'dark',
}

writeFileSync(
    'themes/monokai-focus-color-theme.json',
    JSON.stringify(theme, (_, v) => (v instanceof color ? v.hexa() : v)),
)
