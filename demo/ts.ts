try {
    parseInt('19')
} catch (e: unknown) {
    e;
}

function decorator(...args: unknown[]) {
    return (...args: unknown[]) => {4}
}

const d = decorator()

@d
@decorator({
    1: 2
})
class A {
    
}
