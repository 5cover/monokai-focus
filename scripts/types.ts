import type { ColorInstance } from 'color'

export type TokenStyling = Partial<
    Record<SemanticScope | `*.${SemanticModifier}` | `${SemanticScope}.${SemanticModifier}`, TokenStylingStyle>
>
type SemanticScope =
    | 'string'
    | 'number'
    | 'function'
    | 'comment'
    | 'keyword'
    | 'regexp'
    | 'operator'
    | 'namespace'
    | 'type'
    | 'struct'
    | 'class'
    | 'interface'
    | 'enum'
    | 'typeParameter'
    | 'member'
    | 'method'
    | 'macro'
    | 'variable'
    | 'parameter'
    | 'property'
    | 'enumMember'
    | 'event'
    | 'decorator'
    | 'label'

type SemanticModifier =
    | 'declaration'
    | 'documentation'
    | 'static'
    | 'abstract'
    | 'deprecated'
    | 'modification'
    | 'async'
    | 'readonly'
    | 'typeHint'
/**
 * Colors and styles for the token.
 */
export type TokenStylingStyle =
    | ColorInstance
    | {
          /**
           * Foreground color for the token.
           */
          foreground?: ColorInstance
          /**
           * Sets the all font styles of the rule: 'italic', 'bold', 'underline' or 'strikethrough' or a combination. All styles that are not listed are unset. The empty string unsets all styles.
           */
          fontStyle?: string
          /**
           * Sets or unsets the font style to bold. Note, the presence of 'fontStyle' overrides this setting.
           */
          bold?: boolean
          /**
           * Sets or unsets the font style to italic. Note, the presence of 'fontStyle' overrides this setting.
           */
          italic?: boolean
          /**
           * Sets or unsets the font style to underline. Note, the presence of 'fontStyle' overrides this setting.
           */
          underline?: boolean
          /**
           * Sets or unsets the font style to strikethrough. Note, the presence of 'fontStyle' overrides this setting.
           */
          strikethrough?: boolean
      }

export type TextMateTokenColor = {
    /**
     * Description of the rule.
     */
    name?: string
    /**
     * Scope selector against which this rule matches.
     */
    scope?:
        | (
              | 'comment'
              | 'comment.block'
              | 'comment.block.documentation'
              | 'comment.line'
              | 'constant'
              | 'constant.character'
              | 'constant.character.escape'
              | 'constant.numeric'
              | 'constant.numeric.integer'
              | 'constant.numeric.float'
              | 'constant.numeric.hex'
              | 'constant.numeric.octal'
              | 'constant.other'
              | 'constant.regexp'
              | 'constant.rgb-value'
              | 'emphasis'
              | 'entity'
              | 'entity.name'
              | 'entity.name.class'
              | 'entity.name.function'
              | 'entity.name.method'
              | 'entity.name.section'
              | 'entity.name.selector'
              | 'entity.name.tag'
              | 'entity.name.type'
              | 'entity.other'
              | 'entity.other.attribute-name'
              | 'entity.other.inherited-class'
              | 'invalid'
              | 'invalid.deprecated'
              | 'invalid.illegal'
              | 'keyword'
              | 'keyword.control'
              | 'keyword.operator'
              | 'keyword.operator.new'
              | 'keyword.operator.assignment'
              | 'keyword.operator.arithmetic'
              | 'keyword.operator.logical'
              | 'keyword.other'
              | 'markup'
              | 'markup.bold'
              | 'markup.changed'
              | 'markup.deleted'
              | 'markup.heading'
              | 'markup.inline.raw'
              | 'markup.inserted'
              | 'markup.italic'
              | 'markup.list'
              | 'markup.list.numbered'
              | 'markup.list.unnumbered'
              | 'markup.other'
              | 'markup.quote'
              | 'markup.raw'
              | 'markup.underline'
              | 'markup.underline.link'
              | 'meta'
              | 'meta.block'
              | 'meta.cast'
              | 'meta.class'
              | 'meta.function'
              | 'meta.function-call'
              | 'meta.preprocessor'
              | 'meta.return-type'
              | 'meta.selector'
              | 'meta.tag'
              | 'meta.type.annotation'
              | 'meta.type'
              | 'punctuation.definition.string.begin'
              | 'punctuation.definition.string.end'
              | 'punctuation.separator'
              | 'punctuation.separator.continuation'
              | 'punctuation.terminator'
              | 'storage'
              | 'storage.modifier'
              | 'storage.type'
              | 'string'
              | 'string.interpolated'
              | 'string.other'
              | 'string.quoted'
              | 'string.quoted.double'
              | 'string.quoted.other'
              | 'string.quoted.single'
              | 'string.quoted.triple'
              | 'string.regexp'
              | 'string.unquoted'
              | 'strong'
              | 'support'
              | 'support.class'
              | 'support.constant'
              | 'support.function'
              | 'support.other'
              | 'support.type'
              | 'support.type.property-name'
              | 'support.variable'
              | 'variable'
              | 'variable.language'
              | 'variable.name'
              | 'variable.other'
              | 'variable.other.readwrite'
              | 'variable.parameter'
          )
        | string
        | (
              | 'comment'
              | 'comment.block'
              | 'comment.block.documentation'
              | 'comment.line'
              | 'constant'
              | 'constant.character'
              | 'constant.character.escape'
              | 'constant.numeric'
              | 'constant.numeric.integer'
              | 'constant.numeric.float'
              | 'constant.numeric.hex'
              | 'constant.numeric.octal'
              | 'constant.other'
              | 'constant.regexp'
              | 'constant.rgb-value'
              | 'emphasis'
              | 'entity'
              | 'entity.name'
              | 'entity.name.class'
              | 'entity.name.function'
              | 'entity.name.method'
              | 'entity.name.section'
              | 'entity.name.selector'
              | 'entity.name.tag'
              | 'entity.name.type'
              | 'entity.other'
              | 'entity.other.attribute-name'
              | 'entity.other.inherited-class'
              | 'invalid'
              | 'invalid.deprecated'
              | 'invalid.illegal'
              | 'keyword'
              | 'keyword.control'
              | 'keyword.operator'
              | 'keyword.operator.new'
              | 'keyword.operator.assignment'
              | 'keyword.operator.arithmetic'
              | 'keyword.operator.logical'
              | 'keyword.other'
              | 'markup'
              | 'markup.bold'
              | 'markup.changed'
              | 'markup.deleted'
              | 'markup.heading'
              | 'markup.inline.raw'
              | 'markup.inserted'
              | 'markup.italic'
              | 'markup.list'
              | 'markup.list.numbered'
              | 'markup.list.unnumbered'
              | 'markup.other'
              | 'markup.quote'
              | 'markup.raw'
              | 'markup.underline'
              | 'markup.underline.link'
              | 'meta'
              | 'meta.block'
              | 'meta.cast'
              | 'meta.class'
              | 'meta.function'
              | 'meta.function-call'
              | 'meta.preprocessor'
              | 'meta.return-type'
              | 'meta.selector'
              | 'meta.tag'
              | 'meta.type.annotation'
              | 'meta.type'
              | 'punctuation.definition.string.begin'
              | 'punctuation.definition.string.end'
              | 'punctuation.separator'
              | 'punctuation.separator.continuation'
              | 'punctuation.terminator'
              | 'storage'
              | 'storage.modifier'
              | 'storage.type'
              | 'string'
              | 'string.interpolated'
              | 'string.other'
              | 'string.quoted'
              | 'string.quoted.double'
              | 'string.quoted.other'
              | 'string.quoted.single'
              | 'string.quoted.triple'
              | 'string.regexp'
              | 'string.unquoted'
              | 'strong'
              | 'support'
              | 'support.class'
              | 'support.constant'
              | 'support.function'
              | 'support.other'
              | 'support.type'
              | 'support.type.property-name'
              | 'support.variable'
              | 'variable'
              | 'variable.language'
              | 'variable.name'
              | 'variable.other'
              | 'variable.other.readwrite'
              | 'variable.parameter'
          )[]
        | string[]
    settings: TextMateSettings
}

/**
 * Colors and styles for the token.
 */
export type TextMateSettings = {
    /**
     * Foreground color for the token.
     */
    foreground?: string | ColorInstance
    /**
     * Font style of the rule: 'italic', 'bold', 'underline', 'strikethrough' or a combination. The empty string unsets inherited settings.
     */
    fontStyle?: string
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
}
