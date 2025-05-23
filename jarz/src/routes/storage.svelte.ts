// return a list of space ids
export function getSpaces(): string[] {
    const spaces = localStorage.getItem("spaces")
    return spaces ? JSON.parse(spaces) : []
}

export function storeSpaces(spaces: string[]) {
    localStorage.setItem("spaces", JSON.stringify(spaces))
}