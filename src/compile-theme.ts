import type { JSONSchema7Definition, JSONSchema7Type } from 'json-schema'
import { scope2schema, type KnownScope } from './theme-compiler/scope2schema.ts'
import { writeFileSync } from 'fs'
import { schema2type } from './theme-compiler/schema2type.ts'

const styles: JSONSchema7Type[] = ['leaf', 'operation', 'declaration', 'illegal']

// this IR describes what scopes exist, what they match, and titles if available, and what parents they can have

let scopes: KnownScope[] = []
{
    const r: Record<
        'array' | 'comments' | 'constant' | 'number' | 'object' | 'string' | 'objectkey' | 'stringcontent' | 'value',
        KnownScope
    > = {
        array: {
            scope: 'meta.structure.array.json',
            title: 'array',
            on: {
                begin: '[',
                end: ']',
            },
            get children() {
                return [
                    {
                        scope: 'punctuation.definition.array.begin.json',
                        title: 'begin',
                        on: '[',
                    },
                    {
                        scope: 'punctuation.definition.array.end.json',
                        title: 'end',
                        on: ']',
                    },
                    {
                        scope: 'punctuation.separator.array.json',
                        on: ',',
                    },
                    {
                        scope: 'invalid.illegal.expected-array-separator.json',
                        on: { pattern: '[^\\s\\]]', group: 0 },
                    },
                    r.value,
                ]
            },
        },
        comments: [
            {
                scope: 'comment.block.documentation.json',
                title: 'comments',
                on: {
                    begin: { pattern: '/\\*\\*(?!/)', group: 0 },
                    end: '*/',
                },
                children: [
                    {
                        scope: 'punctuation.definition.comment.json',
                        title: 'edge',
                        on: [
                            {
                                pattern: '/\\*\\*(?!/)',
                                group: 0,
                            },
                            '*/',
                        ],
                    },
                ],
            },
            {
                scope: 'comment.block.json',
                title: 'comments',
                on: {
                    begin: '/*',
                    end: '*/',
                },
                children: [
                    {
                        scope: 'punctuation.definition.comment.json',
                        title: 'edge',
                        on: ['/*', '*/'],
                    },
                ],
            },
            {
                scope: 'comment.line.double-slash.js',
                title: 'comments',
                on: {
                    pattern: '(//).*$\\n?',
                    group: 0,
                },
                children: [
                    {
                        scope: 'punctuation.definition.comment.json',
                        on: {
                            pattern: '(//).*$\\n?',
                            group: 1,
                        },
                    },
                ],
            },
        ],
        constant: {
            scope: 'constant.language.json',
            title: 'constant',
            on: {
                pattern: '\\b(?:true|false|null)\\b',
                group: 0,
            },
        },
        number: {
            scope: 'constant.numeric.json',
            title: 'number',
            on: {
                pattern:
                    '(?x)        # turn on extended mode\n  -?        # an optional minus\n  (?:\n    0       # a zero\n    |       # ...or...\n    [1-9]   # a 1-9 character\n    \\d*     # followed by zero or more digits\n  )\n  (?:\n    (?:\n      \\.    # a period\n      \\d+   # followed by one or more digits\n    )?\n    (?:\n      [eE]  # an e character\n      [+-]? # followed by an option +/-\n      \\d+   # followed by one or more digits\n    )?      # make exponent optional\n  )?        # make decimal portion optional',
                group: 0,
            },
        },
        object: {
            scope: 'meta.structure.dictionary.json',
            title: 'object',
            on: {
                begin: '{',
                end: '}',
            },
            get children() {
                return [
                    {
                        scope: 'punctuation.definition.dictionary.begin.json',
                        title: 'begin',
                        on: '{',
                    },
                    {
                        scope: 'punctuation.definition.dictionary.end.json',
                        title: 'end',
                        on: '}',
                    },
                    r.objectkey,
                    r.comments,
                    {
                        scope: 'meta.structure.dictionary.value.json',
                        on: {
                            begin: ':',
                            end: {
                                pattern: '(,)|(?=\\})',
                                group: 0,
                            },
                        },
                        children: [
                            {
                                scope: 'punctuation.separator.dictionary.key-value.json',
                                on: ':',
                                title: 'begin',
                            },
                            {
                                scope: 'punctuation.separator.dictionary.pair.json',
                                on: {
                                    pattern: '(,)|(?=\\})',
                                    group: 1,
                                },
                                title: 'end',
                            },
                            r.value,
                            {
                                on: {
                                    pattern: '[^\\s,]',
                                    group: 0,
                                },
                                scope: 'invalid.illegal.expected-dictionary-separator.json',
                            },
                        ],
                    },
                    {
                        on: { pattern: '[^\\s\\}]', group: 0 },
                        scope: 'invalid.illegal.expected-dictionary-separator.json',
                    },
                ]
            },
        },
        string: {
            scope: 'string.quoted.double.json',
            on: {
                begin: '"',
                end: '"',
            },
            get children() {
                return [
                    {
                        scope: 'punctuation.definition.string.begin.json',
                        title: 'begin',
                        on: '"',
                    },
                    {
                        scope: 'punctuation.definition.string.end.json',
                        title: 'end',
                        on: '"',
                    },
                    r.stringcontent,
                ]
            },
        },
        objectkey: {
            scope: 'string.json',
            title: 'objectkey',
            children: [
                {
                    on: {
                        begin: '"',
                        end: '"',
                    },
                    scope: 'support.type.property-name.json',
                    children: [
                        {
                            on: '"',
                            title: 'begin',
                            scope: 'punctuation.support.type.property-name.begin.json',
                        },
                        {
                            on: '"',
                            title: 'end',
                            scope: 'punctuation.support.type.property-name.end.json',
                        },
                    ],
                },
            ],
        },
        stringcontent: [
            {
                title: 'stringcontent',
                scope: 'constant.character.escape.json',
                on: {
                    pattern:
                        '(?x)                # turn on extended mode\n  \\\\                # a literal backslash\n  (?:               # ...followed by...\n    ["\\\\/bfnrt]     # one of these characters\n    |               # ...or...\n    u               # a u\n    [0-9a-fA-F]{4}) # and four hex digits',
                    group: 0,
                },
            },
            {
                title: 'stringcontent',
                on: { pattern: '\\\\.', group: 0 },
                scope: 'invalid.illegal.unrecognized-string-escape.json',
            },
        ],
        get value() {
            return [r.constant, r.number, r.string, r.array, r.object, r.comments]
        },
    } as const
    scopes.push({
        scope: 'source.json',
        description: 'JSON (Javascript Next)',
        children: r.value,
    })
}

const schema = scope2schema(scopes, styles)

console.log(JSON.stringify(schema, null, 2))

writeFileSync(
    '.out.ts',
    schema2type(schema, {
        additionalProperties: false,
        singleQuotes: true,
        typeName: 'Stylemap',
    }),
)

// partial return expected
const stylemapSchemaExample = {
    type: 'object',
    properties: {
        'source.json': {
            description: 'JSON (Javascript Next)',
            type: ['string', 'object'],
            properties: {
                '': { type: 'string' },
                'constant.language.json': {
                    title: 'constant',
                    description: '`\\b(?:true|false|null)\\b`',
                    type: 'string',
                },
                'constant.numeric.json': {
                    title: 'number',
                    description:
                        '`(?x)        # turn on extended mode\n  -?        # an optional minus\n  (?:\n    0       # a zero\n    |       # ...or...\n    [1-9]   # a 1-9 character\n    \\d*     # followed by zero or more digits\n  )\n  (?:\n    (?:\n      \\.    # a period\n      \\d+   # followed by one or more digits\n    )?\n    (?:\n      [eE]  # an e character\n      [+-]? # followed by an option +/-\n      \\d+   # followed by one or more digits\n    )?      # make exponent optional\n  )?        # make decimal portion optional`',
                    type: 'string',
                },
                'string.quoted.double.json': {
                    title: 'string',
                    type: ['string', 'object'],
                    properties: {
                        '': { type: 'string' },
                        'punctuation.definition.string.begin.json': {
                            title: 'string begin',
                            description: '`"`',
                            type: 'string',
                        },
                        'punctuation.definition.string.end.json': {
                            title: 'string end',
                            description: '`"`',
                            type: 'string',
                        },
                        'constant.character.escape.json': {
                            title: 'string stringcontent',
                            description:
                                '`(?x)                # turn on extended mode\n  \\\\                # a literal backslash\n  (?:               # ...followed by...\n    ["\\\\/bfnrt]     # one of these characters\n    |               # ...or...\n    u               # a u\n    [0-9a-fA-F]{4}) # and four hex digits`',
                            type: 'string',
                        },
                        'invalid.illegal.unrecognized-string-escape.json': {
                            title: 'string stringcontent',
                            description: '`\\\\.`',
                            type: 'string',
                        },
                    },
                },
                'meta.structure.array.json': {
                    title: 'array',
                    description: '`[`...`]`',
                    type: ['string', 'object'],
                    properties: {
                        'punctuation.definition.array.begin.json': {
                            title: 'array begin',
                            description: '`[`',
                            type: 'string',
                        },
                        'punctuation.definition.array.end.json': {
                            title: 'array end',
                            description: '`]`',
                            type: 'string',
                        },
                        'punctuation.separator.array.json': {
                            title: '`array ,`',
                            type: 'string',
                        },
                        'invalid.illegal.expected-array-separator.json': {
                            title: '`array [^\\s\\]]`',
                            type: 'string',
                        },
                    },
                    allOf: [
                        {
                            $ref: '#/properties/source.json',
                        },
                    ],
                },
            },
        },
    },
} as const satisfies JSONSchema7Definition

/* // style map authoring
const focus: Stylemap = {
    'source.json': {
        'constant.language.json': 'leaf',
        'constant.numeric.json': 'leaf',
        'string.quoted.double.json': {
            '': 'text',
            'invalid.illegal.unrecognized-string-escape.json': 'illegal',
            'constant.character.escape.json': 'leaf',
        },
    },
}

const partitions = {
    leaf: [
        'source.json constant.language.json',
        'source.json constant.numeric.json',
        'source.json string.quoted.double.json constant.character.escape.json',
    ],
    text: ['source.json string.quoted.double.json'],
    illegal: ['source.json string.quote d.double.json invalid.illegal.unrecognized-string-escape.json'],
} */
