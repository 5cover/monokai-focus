# Monokai Focus

## additionnal features

### brackets inherit the style of what they are used on (best effort)

    f(args) // () use f's color
    import { x } from 'module' // {} use import's color

Like brackets are used to extend something
Those are different brackets then standalone brackets (like expression groupings, array, objects) because they cannot be nested. so they should be colored differently while we can keep our lightness scaling for nested standalone brackets
This can be partially done on VSCode assuming bracket pair colorization is disabled, but it is brittle and grammar-dependent. This is TextMate, what isn't.

## cannot do

what doesn't seem to be doable with native VSCode syntax highlighting.

- structural bracket coloring
- only increase bracket pair depth for contiguous brackets
- catch variable in italics
- color only expression-level commas as separators
- coloring break and continue, goto, and for await as instructions (keyword.control.loop everywhere for JS/TS)
