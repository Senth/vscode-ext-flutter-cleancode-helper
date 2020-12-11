export class StringHelper {
  /**
   * Converts a snake_case into CamelCase
   * @param firstToUpper true: CamelCase, false: camelCase
   */
  static snakeToCamel(str: string, firstToUpper: boolean = true): string {
    const camelCase = str.replace(/[-_]\w/g, (fullMatch) => fullMatch[1].toUpperCase())
    if (firstToUpper) {
      return camelCase.replace(/^\w/, (fullMatch) => fullMatch[0].toUpperCase())
    } else {
      return camelCase
    }
  }
}
