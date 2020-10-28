String.prototype.snakeToCamel = function (firstToUpper: boolean = true) {
  const camelCase = this.replace(/([-_])(\w)/g, (groups) => groups[2].toUpperCase())
  if (firstToUpper) {
    return camelCase.replace(/^\w/, (groups) => groups[0].toUpperCase())
  } else {
    return camelCase
  }
}
