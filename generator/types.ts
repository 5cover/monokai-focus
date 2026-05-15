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
    scope?: string | readonly string[]
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
