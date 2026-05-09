export type Stylemap = {
    "source.json"?: SourceJson;
};
export type SourceJson = {
    ""?: string;
    "constant.language.json"?: string;
    "constant.numeric.json"?: string;
    "string.quoted.double.json"?: {
        ""?: string;
        "punctuation.definition.string.begin.json"?: string;
        "punctuation.definition.string.end.json"?: string;
        "constant.character.escape.json"?: string;
        "invalid.illegal.unrecognized-string-escape.json"?: string;
    };
    "meta.structure.array.json"?: {
        "punctuation.definition.array.begin.json"?: string;
        "punctuation.definition.array.end.json"?: string;
        "punctuation.separator.array.json"?: string;
        "invalid.illegal.expected-array-separator.json"?: string;
    } & SourceJson;
};
