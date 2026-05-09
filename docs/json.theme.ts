import { JSONSchema7Definition } from 'json-schema'
import { compileJsonSchema } from '../json-schema-one-type'
import ts from 'typescript'
import { writeFileSync } from 'node:fs'

const sourceGrammar = {
    information_for_contributors: [
        'This file has been converted from https://github.com/microsoft/vscode-JSON.tmLanguage/blob/master/JSON.tmLanguage',
        'If you want to provide a fix or improvement, please create a pull request against the original repository.',
        'Once accepted there, we are happy to receive an update request.',
    ],
    version: 'https://github.com/microsoft/vscode-JSON.tmLanguage/commit/9bd83f1c252b375e957203f21793316203f61f70',
    name: 'JSON (Javascript Next)',
    scopeName: 'source.json',
    patterns: [
        {
            include: '#value',
        },
    ],
    repository: {
        array: {
            begin: '\\[',
            beginCaptures: {
                0: {
                    name: 'punctuation.definition.array.begin.json',
                },
            },
            end: '\\]',
            endCaptures: {
                0: {
                    name: 'punctuation.definition.array.end.json',
                },
            },
            name: 'meta.structure.array.json',
            patterns: [
                {
                    include: '#value',
                },
                {
                    match: ',',
                    name: 'punctuation.separator.array.json',
                },
                {
                    match: '[^\\s\\]]',
                    name: 'invalid.illegal.expected-array-separator.json',
                },
            ],
        },
        comments: {
            patterns: [
                {
                    begin: '/\\*\\*(?!/)',
                    captures: {
                        0: {
                            name: 'punctuation.definition.comment.json',
                        },
                    },
                    end: '\\*/',
                    name: 'comment.block.documentation.json',
                },
                {
                    begin: '/\\*',
                    captures: {
                        0: {
                            name: 'punctuation.definition.comment.json',
                        },
                    },
                    end: '\\*/',
                    name: 'comment.block.json',
                },
                {
                    captures: {
                        1: {
                            name: 'punctuation.definition.comment.json',
                        },
                    },
                    match: '(//).*$\\n?',
                    name: 'comment.line.double-slash.js',
                },
            ],
        },
        constant: {
            match: '\\b(?:true|false|null)\\b',
            name: 'constant.language.json',
        },
        number: {
            match: '(?x)        # turn on extended mode\n  -?        # an optional minus\n  (?:\n    0       # a zero\n    |       # ...or...\n    [1-9]   # a 1-9 character\n    \\d*     # followed by zero or more digits\n  )\n  (?:\n    (?:\n      \\.    # a period\n      \\d+   # followed by one or more digits\n    )?\n    (?:\n      [eE]  # an e character\n      [+-]? # followed by an option +/-\n      \\d+   # followed by one or more digits\n    )?      # make exponent optional\n  )?        # make decimal portion optional',
            name: 'constant.numeric.json',
        },
        object: {
            begin: '\\{',
            beginCaptures: {
                0: {
                    name: 'punctuation.definition.dictionary.begin.json',
                },
            },
            end: '\\}',
            endCaptures: {
                0: {
                    name: 'punctuation.definition.dictionary.end.json',
                },
            },
            name: 'meta.structure.dictionary.json',
            patterns: [
                {
                    comment: 'the JSON object key',
                    include: '#objectkey',
                },
                {
                    include: '#comments',
                },
                {
                    begin: ':',
                    beginCaptures: {
                        0: {
                            name: 'punctuation.separator.dictionary.key-value.json',
                        },
                    },
                    end: '(,)|(?=\\})',
                    endCaptures: {
                        1: {
                            name: 'punctuation.separator.dictionary.pair.json',
                        },
                    },
                    name: 'meta.structure.dictionary.value.json',
                    patterns: [
                        {
                            comment: 'the JSON object value',
                            include: '#value',
                        },
                        {
                            match: '[^\\s,]',
                            name: 'invalid.illegal.expected-dictionary-separator.json',
                        },
                    ],
                },
                {
                    match: '[^\\s\\}]',
                    name: 'invalid.illegal.expected-dictionary-separator.json',
                },
            ],
        },
        string: {
            begin: '"',
            beginCaptures: {
                0: {
                    name: 'punctuation.definition.string.begin.json',
                },
            },
            end: '"',
            endCaptures: {
                0: {
                    name: 'punctuation.definition.string.end.json',
                },
            },
            name: 'string.quoted.double.json',
            patterns: [
                {
                    include: '#stringcontent',
                },
            ],
        },
        objectkey: {
            begin: '"',
            beginCaptures: {
                0: {
                    name: 'punctuation.support.type.property-name.begin.json',
                },
            },
            end: '"',
            endCaptures: {
                0: {
                    name: 'punctuation.support.type.property-name.end.json',
                },
            },
            name: 'string.json support.type.property-name.json',
            patterns: [
                {
                    include: '#stringcontent',
                },
            ],
        },
        stringcontent: {
            patterns: [
                {
                    match: '(?x)                # turn on extended mode\n  \\\\                # a literal backslash\n  (?:               # ...followed by...\n    ["\\\\/bfnrt]     # one of these characters\n    |               # ...or...\n    u               # a u\n    [0-9a-fA-F]{4}) # and four hex digits',
                    name: 'constant.character.escape.json',
                },
                {
                    match: '\\\\.',
                    name: 'invalid.illegal.unrecognized-string-escape.json',
                },
            ],
        },
        value: {
            patterns: [
                {
                    include: '#constant',
                },
                {
                    include: '#number',
                },
                {
                    include: '#string',
                },
                {
                    include: '#array',
                },
                {
                    include: '#object',
                },
                {
                    include: '#comments',
                },
            ],
        },
    },
}

// textmate uses oniguruma regex flavor

// this IR describes what scopes exist, what they match, and titles if available, and what parents they can have

type KnownScope =
    | KnownScope[]
    | ({
          scope: string
          title?: string
          description?: string
      } & ({ on: Matcher | Matcher[]; children?: KnownScope } | { children: KnownScope }))
type Matcher = MatcherAtom | { begin: MatcherAtom; end: MatcherAtom }
type MatcherAtom = string | { pattern: string; group: number | string }

const scopes: KnownScope[] = []

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

// turn into a json schema that validates stylemap input

const stylemapSchema = {
    type: 'object',
    properties: {
        'source.json': {
            description: 'JSON (Javascript Next)',
            type: 'object',
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
                    type: 'object',
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
                    type: 'object',
                    title: 'array',
                    description: '`[`...`]`',
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

writeFileSync('docs/out.ts', compileJsonSchema(stylemapSchema, { typeName: 'Stylemap', additionalProperties: false }))
