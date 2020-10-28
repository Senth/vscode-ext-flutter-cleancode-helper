interface String {
  /**
   * Converts a snake_case into CamelCase
   * @param firstToUpper true: CamelCase, false: camelCase
   */
  snakeToCamel(firstToUpper: boolean): string
}
