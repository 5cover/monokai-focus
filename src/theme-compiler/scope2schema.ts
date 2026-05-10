import type { JSONSchema7, JSONSchema7Type } from 'json-schema'

export type KnownScope =
    | KnownScope[]
    | ({
          scope: string
          title?: string
          description?: string
      } & ({ on: Matcher | Matcher[]; children?: KnownScope } | { children: KnownScope }))
export type Matcher = MatcherAtom | { begin: MatcherAtom; end: MatcherAtom }
export type MatcherAtom = string | { pattern: string; group: number | string }

// turn into a json schema that validates stylemap input

export function scope2schema(s: KnownScope, styles: JSONSchema7Type[]): JSONSchema7 {
    const c = new SchemaCompiler({
        s,
        parentTitles: [],
        seen: new Map(),
    })
    return {
        ...c.toStylemapSchema(),
        definitions: {
            ...Object.fromEntries(Array.from(c.$.seen.values())),
            style: {
                enum: styles,
            },
        },
    }
}

const leafSchema = {
    $ref: '#/definitions/style',
} as const
type State = {
    s: KnownScope
    parentTitles: string[]
    seen: Map<KnownScope, [number, JSONSchema7 | null]>
}

class SchemaCompiler {
    constructor(readonly $: State) {}

    toStylemapSchema(): Omit<JSONSchema7, 'definitions'> {
        const c = this.$.seen.get(this.$.s)
        if (c !== undefined) {
            return {
                $ref: `#/definitions/${c[0]}`,
            }
        }

        const { entry, docs } = this.enter()
        const entries = this.generateEntries()

        return this.exit(
            entry,
            entries.length === 0 ?
                leafSchema
            :   {
                    ...docs,
                    oneOf: [
                        leafSchema,
                        {
                            type: 'object',
                            additionalProperties: false,
                            required: entries.map(([k]) => k),
                            properties: { '': leafSchema, ...Object.fromEntries(entries) },
                        },
                    ],
                },
        )
    }

    private enter() {
        const entry: [number, JSONSchema7 | null] = [this.$.seen.size, null]
        this.$.seen.set(this.$.s, entry)
        if (Array.isArray(this.$.s)) return { entry }
        if (this.$.s.title) this.$.parentTitles.push(this.$.s.title)
        const title = this.$.parentTitles.length ? this.$.parentTitles.join(' ') : ''
        return {
            entry,
            docs: {
                title: title || this.$.s.description,
                description:
                    [title && this.$.s.description, 'on' in this.$.s && this.formatOn(this.$.s.on)?.trim()]
                        .filter(x => x)
                        .join('\n') || undefined,
            },
        }
    }

    private formatOn(on: Matcher | Matcher[], parens = false): string {
        if (Array.isArray(on)) {
            const alt = on.map(on => this.formatOn(on)).join('|')
            return parens ? `(${alt})` : alt
        }
        if (typeof on === 'string') {
            if (/\r?\n/.test(on)) {
                const q = this.getQuote(on, 3)
                return `\n${q}text\n${on.trim()}\n${q}\n`
            } else {
                const q = this.getQuote(on, 1)
                return q + (on.startsWith('`') ? ' ' : '') + on + (on.endsWith('`') ? ' ' : '') + q
            }
        }
        if ('end' in on) {
            return `${this.formatOn(on.begin, true)}...${this.formatOn(on.end, true)}`
        } else {
            const regex = this.formatOn(on.pattern)
            return on.group === 0 ? regex : `${this.formatOn(on.pattern)}$${on.group}`
        }
    }

    private getQuote(s: string, backticks: number) {
        for (const match of s.matchAll(new RegExp(`\`{${backticks},}`))) {
            const l = match[0].length
            if (backticks < l) backticks = l
        }
        return '`'.repeat(1 + backticks)
    }

    private exit(entry: [number, JSONSchema7 | null], schema: JSONSchema7) {
        this.$.parentTitles.pop()
        return (entry[1] = schema)
    }

    private generateEntries(): [string, JSONSchema7 | null][] {
        const d =
            Array.isArray(this.$.s) ?
                this.$.s.flatMap(s => new SchemaCompiler({ ...this.$, s }).generateEntries())
            :   [[this.$.s.scope, this.toStylemapSchema()] as [string, JSONSchema7]]
        return d
    }
}
