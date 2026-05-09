# json-schema-one-type

Converts a JSON schema to a TypeScript type.

Avoids naming new types unless strictly necessary.

Duplication is acceptable.

Implementation

- Walk schema
- Build subtypes recursively
- Do not deduplicate
- Do not try to be smart.
