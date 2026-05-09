import ts from "typescript";
import type { JSONSchema7, JSONSchema7Definition, JSONSchema7TypeName } from "json-schema";

export interface CompileOptions {
  typeName?: string;
  additionalProperties?: boolean | JSONSchema7;
}

type Schema = JSONSchema7 | boolean;

interface State {
  root: Schema;
  options: CompileOptions;
  pointers: Map<Schema, string>;
  aliases: Map<string, string>;
  stack: Set<string>;
  expandingPointer?: string;
}

const factory = ts.factory;

export function compileJsonSchema(schema: Schema, options: CompileOptions = {}): string {
  const sourceFile = compileJsonSchemaToSourceFile(schema, options);
  return ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(sourceFile);
}

export function compileJsonSchemaToSourceFile(
  schema: Schema,
  options: CompileOptions = {},
): ts.SourceFile {
  const typeName = options.typeName ?? "Schema";
  const state = createState(schema, typeName, options);
  const rootType = expandSchemaAtPointer("#", schema, state);

  const statements: ts.Statement[] = [
    factory.createTypeAliasDeclaration(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      typeName,
      undefined,
      rootType,
    ),
  ];

  for (const [pointer, aliasName] of state.aliases) {
    if (pointer === "#") continue;

    statements.push(
      factory.createTypeAliasDeclaration(
        [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        aliasName,
        undefined,
        expandSchemaAtPointer(pointer, schemaAtPointer(schema, pointer), state),
      ),
    );
  }

  return factory.createSourceFile(
    statements,
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );
}

function createState(schema: Schema, rootName: string, options: CompileOptions): State {
  const pointers = new Map<Schema, string>();
  collectPointers(schema, "#", pointers);

  const recursivePointers = findRecursivePointers(schema);
  const aliases = new Map<string, string>([["#", rootName]]);
  const aliasNames = new Set<string>([rootName]);

  for (const pointer of [...recursivePointers].sort()) {
    if (pointer === "#") continue;
    aliases.set(pointer, uniqueName(aliasFromPointer(pointer), aliasNames));
  }

  return { root: schema, options, pointers, aliases, stack: new Set() };
}

function expandSchemaAtPointer(pointer: string, schema: Schema, state: State): ts.TypeNode {
  const previous = state.expandingPointer;
  state.expandingPointer = pointer;

  try {
    return typeFromSchema(schema, state);
  } finally {
    state.expandingPointer = previous;
  }
}

function typeFromSchema(schema: Schema, state: State): ts.TypeNode {
  if (schema === true) return keyword(ts.SyntaxKind.UnknownKeyword);
  if (schema === false) return keyword(ts.SyntaxKind.NeverKeyword);

  const pointer = state.pointers.get(schema);
  const alias = pointer === undefined ? undefined : state.aliases.get(pointer);

  if (
    alias !== undefined &&
    pointer !== undefined &&
    (pointer !== state.expandingPointer || state.stack.has(pointer))
  ) {
    return factory.createTypeReferenceNode(alias);
  }

  if (pointer !== undefined) state.stack.add(pointer);
  const type = typeFromObjectSchema(schema, state);
  if (pointer !== undefined) state.stack.delete(pointer);

  return type;
}

function typeFromObjectSchema(schema: JSONSchema7, state: State): ts.TypeNode {
  if (schema.$ref !== undefined) return typeFromRef(schema.$ref, state);

  const compound = typeFromCompoundSchema(schema, state);
  const primary = typeFromPrimarySchema(schema, state);

  if (compound === undefined) return primary;
  if (isUnknownType(primary)) return compound;

  return intersection([primary, compound]);
}

function typeFromPrimarySchema(schema: JSONSchema7, state: State): ts.TypeNode {
  if (schema.const !== undefined) return literalType(schema.const);
  if (schema.enum !== undefined) return union(schema.enum.map(literalType));

  const types = typeof schema.type === "string" ? [schema.type] : schema.type;
  if (types !== undefined && types.length > 0) {
    return union(types.map((type) => typeFromJsonType(type, schema, state)));
  }

  if (schema.properties !== undefined || schema.additionalProperties !== undefined) {
    return objectType(schema, state);
  }

  if (schema.items !== undefined || schema.additionalItems !== undefined) {
    return arrayType(schema, state);
  }

  return keyword(ts.SyntaxKind.UnknownKeyword);
}

function typeFromCompoundSchema(schema: JSONSchema7, state: State): ts.TypeNode | undefined {
  const anyOf = schema.anyOf?.map((subschema) => typeFromSchema(subschema, state));
  const oneOf = schema.oneOf?.map((subschema) => typeFromSchema(subschema, state));
  const allOf = schema.allOf?.map((subschema) => typeFromSchema(subschema, state));

  const unions = [...(anyOf ?? []), ...(oneOf ?? [])];
  const unionType = unions.length === 0 ? undefined : union(unions);
  const intersectionType = allOf === undefined ? undefined : intersection(allOf);

  if (unionType !== undefined && intersectionType !== undefined) {
    return intersection([unionType, intersectionType]);
  }

  return unionType ?? intersectionType;
}

function typeFromJsonType(type: JSONSchema7TypeName, schema: JSONSchema7, state: State): ts.TypeNode {
  switch (type) {
    case "null":
      return factory.createLiteralTypeNode(factory.createNull());
    case "boolean":
      return keyword(ts.SyntaxKind.BooleanKeyword);
    case "integer":
    case "number":
      return keyword(ts.SyntaxKind.NumberKeyword);
    case "string":
      return stringType(schema);
    case "array":
      return arrayType(schema, state);
    case "object":
      return objectType(schema, state);
    default:
      return keyword(ts.SyntaxKind.UnknownKeyword);
  }
}

function typeFromRef(ref: string, state: State): ts.TypeNode {
  const pointer = normalizeRef(ref);
  const alias = state.aliases.get(pointer);
  if (alias !== undefined) return factory.createTypeReferenceNode(alias);

  return typeFromSchema(schemaAtPointer(state.root, pointer), state);
}

function stringType(schema: JSONSchema7): ts.TypeNode {
  if (schema.const !== undefined) return literalType(schema.const);
  if (schema.enum !== undefined) return union(schema.enum.map(literalType));

  return keyword(ts.SyntaxKind.StringKeyword);
}

function arrayType(schema: JSONSchema7, state: State): ts.TypeNode {
  if (Array.isArray(schema.items)) {
    const elements = schema.items.map((item) => typeFromSchema(item, state));
    const additionalItems = schema.additionalItems;

    if (additionalItems !== undefined && additionalItems !== false) {
      elements.push(
        factory.createRestTypeNode(
          factory.createArrayTypeNode(typeFromSchema(additionalItems, state)),
        ),
      );
    }

    return factory.createTupleTypeNode(elements);
  }

  const itemType =
    schema.items === undefined || schema.items === true
      ? keyword(ts.SyntaxKind.UnknownKeyword)
      : typeFromSchema(schema.items, state);

  return factory.createArrayTypeNode(itemType);
}

function objectType(schema: JSONSchema7, state: State): ts.TypeNode {
  const required = new Set(schema.required ?? []);
  const members: ts.TypeElement[] = [];

  for (const [name, propertySchema] of Object.entries(schema.properties ?? {})) {
    members.push(
      factory.createPropertySignature(
        undefined,
        propertyName(name),
        required.has(name) ? undefined : factory.createToken(ts.SyntaxKind.QuestionToken),
        typeFromSchema(propertySchema, state),
      ),
    );
  }

  const indexType = additionalPropertiesType(schema, state);
  if (indexType !== undefined) {
    members.push(
      factory.createIndexSignature(
        undefined,
        [
          factory.createParameterDeclaration(
            undefined,
            undefined,
            "key",
            undefined,
            keyword(ts.SyntaxKind.StringKeyword),
          ),
        ],
        indexType,
      ),
    );
  }

  return factory.createTypeLiteralNode(members);
}

function additionalPropertiesType(schema: JSONSchema7, state: State): ts.TypeNode | undefined {
  const patternProperties = Object.values(schema.patternProperties ?? {}).map((subschema) =>
    typeFromSchema(subschema, state),
  );
  const additionalProperties = schema.additionalProperties ?? state.options.additionalProperties;

  if (additionalProperties === false) {
    return patternProperties.length === 0 ? undefined : union(patternProperties);
  }

  if (additionalProperties === undefined || additionalProperties === true) {
    if (schema.properties !== undefined || patternProperties.length > 0) {
      return patternProperties.length === 0 ? keyword(ts.SyntaxKind.UnknownKeyword) : union(patternProperties);
    }

    return undefined;
  }

  return union([...patternProperties, typeFromSchema(additionalProperties, state)]);
}

function collectPointers(schema: Schema, pointer: string, pointers: Map<Schema, string>): void {
  if (pointers.has(schema)) return;
  pointers.set(schema, pointer);

  if (typeof schema === "boolean") return;

  forEachSubschema(schema, (subschema, path) => collectPointers(subschema, joinPointer(pointer, path), pointers));
}

function findRecursivePointers(schema: Schema): Set<string> {
  const refs = new Map<string, Set<string>>();
  collectReferenceEdges(schema, "#", refs);

  const recursive = new Set<string>();
  const pointers = [...refs.keys()];

  for (const pointer of pointers) {
    for (const ref of refs.get(pointer) ?? []) {
      if (ref === pointer || reaches(ref, pointer, refs, new Set())) {
        recursive.add(ref);
        recursive.add(pointer);
      }
    }
  }

  return recursive;
}

function collectReferenceEdges(schema: Schema, pointer: string, refs: Map<string, Set<string>>): void {
  const ownRefs = refs.get(pointer) ?? new Set<string>();
  refs.set(pointer, ownRefs);

  if (typeof schema === "boolean") return;

  if (schema.$ref !== undefined) ownRefs.add(normalizeRef(schema.$ref));

  forEachSubschema(schema, (subschema, path) => {
    const childPointer = joinPointer(pointer, path);
    collectReferenceEdges(subschema, childPointer, refs);

    for (const childRef of refs.get(childPointer) ?? []) {
      ownRefs.add(childRef);
    }
  });
}

function forEachSubschema(schema: JSONSchema7, visit: (schema: Schema, path: string) => void): void {
  visitDefinitions(schema.definitions, "definitions", visit);
  visitDefinitions(schema.properties, "properties", visit);
  visitDefinitions(schema.patternProperties, "patternProperties", visit);

  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties !== "boolean") {
    visit(schema.additionalProperties, "additionalProperties");
  }

  if (Array.isArray(schema.items)) {
    schema.items.forEach((item, index) => visit(item, `items/${index}`));
  } else if (schema.items !== undefined && typeof schema.items !== "boolean") {
    visit(schema.items, "items");
  }

  if (schema.additionalItems !== undefined && typeof schema.additionalItems !== "boolean") {
    visit(schema.additionalItems, "additionalItems");
  }

  schema.allOf?.forEach((item, index) => visit(item, `allOf/${index}`));
  schema.anyOf?.forEach((item, index) => visit(item, `anyOf/${index}`));
  schema.oneOf?.forEach((item, index) => visit(item, `oneOf/${index}`));

  if (schema.not !== undefined) visit(schema.not, "not");

  visitDefinitions(schemaDependencies(schema.dependencies), "dependencies", visit);
}

function schemaDependencies(
  dependencies: JSONSchema7["dependencies"],
): Record<string, JSONSchema7Definition> | undefined {
  if (dependencies === undefined) return undefined;

  const schemas: Record<string, JSONSchema7Definition> = {};
  for (const [key, dependency] of Object.entries(dependencies)) {
    if (!Array.isArray(dependency)) schemas[key] = dependency;
  }

  return schemas;
}

function visitDefinitions(
  definitions: Record<string, JSONSchema7Definition> | undefined,
  key: string,
  visit: (schema: Schema, path: string) => void,
): void {
  for (const [name, definition] of Object.entries(definitions ?? {})) {
    visit(definition, `${key}/${escapePointer(name)}`);
  }
}

function reaches(from: string, to: string, refs: Map<string, Set<string>>, seen: Set<string>): boolean {
  if (from === to) return true;
  if (seen.has(from)) return false;
  seen.add(from);

  for (const next of refs.get(from) ?? []) {
    if (reaches(next, to, refs, seen)) return true;
  }

  return false;
}

function schemaAtPointer(schema: Schema, pointer: string): Schema {
  if (pointer === "#") return schema;
  if (!pointer.startsWith("#/")) throw new Error(`Only local JSON schema refs are supported: ${pointer}`);

  let current: unknown = schema;
  for (const segment of pointer.slice(2).split("/").map(unescapePointer)) {
    if (current === null || typeof current !== "object" || !(segment in current)) {
      throw new Error(`JSON schema ref does not exist: ${pointer}`);
    }

    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current !== "boolean" && (current === null || typeof current !== "object")) {
    throw new Error(`JSON schema ref does not point to a schema: ${pointer}`);
  }

  return current as Schema;
}

function normalizeRef(ref: string): string {
  if (ref === "#") return ref;
  if (!ref.startsWith("#/")) throw new Error(`Only local JSON schema refs are supported: ${ref}`);

  return ref;
}

function literalType(value: JSONSchema7["const"]): ts.TypeNode {
  if (value === null) return factory.createLiteralTypeNode(factory.createNull());

  switch (typeof value) {
    case "string":
      return factory.createLiteralTypeNode(factory.createStringLiteral(value));
    case "number":
      return factory.createLiteralTypeNode(factory.createNumericLiteral(value));
    case "boolean":
      return value
        ? factory.createLiteralTypeNode(factory.createTrue())
        : factory.createLiteralTypeNode(factory.createFalse());
    default:
      return keyword(ts.SyntaxKind.UnknownKeyword);
  }
}

function union(types: ts.TypeNode[]): ts.TypeNode {
  if (types.length === 0) return keyword(ts.SyntaxKind.NeverKeyword);
  if (types.length === 1) return types[0]!;

  return factory.createUnionTypeNode(types);
}

function intersection(types: ts.TypeNode[]): ts.TypeNode {
  if (types.length === 0) return keyword(ts.SyntaxKind.UnknownKeyword);
  if (types.length === 1) return types[0]!;

  return factory.createIntersectionTypeNode(types);
}

function keyword(kind: ts.KeywordTypeSyntaxKind): ts.KeywordTypeNode {
  return factory.createKeywordTypeNode(kind);
}

function isUnknownType(type: ts.TypeNode): boolean {
  return type.kind === ts.SyntaxKind.UnknownKeyword;
}

function propertyName(name: string): ts.PropertyName {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? factory.createIdentifier(name) : factory.createStringLiteral(name);
}

function aliasFromPointer(pointer: string): string {
  const part = pointer.split("/").at(-1) ?? "Schema";
  const name = unescapePointer(part)
    .replace(/[^A-Za-z0-9_$]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return /^[A-Za-z_$]/.test(name) && name !== "" ? name : `Type${name}`;
}

function uniqueName(name: string, names: Set<string>): string {
  let candidate = name;
  let suffix = 2;

  while (names.has(candidate)) {
    candidate = `${name}${suffix}`;
    suffix += 1;
  }

  names.add(candidate);
  return candidate;
}

function joinPointer(pointer: string, path: string): string {
  return pointer === "#" ? `#/${path}` : `${pointer}/${path}`;
}

function escapePointer(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function unescapePointer(value: string): string {
  return value.replace(/~1/g, "/").replace(/~0/g, "~");
}
