import * as vscode from 'vscode'

/**
 * Base class of all stub creators
 */
export abstract class StubCreator {
  private static readonly propertyRegex = /final (\w+) (\w+)/g
  private static readonly classNameRegex = /class (\w+)/

  /**
   * Check if this stub creator should handle the file
   * @param fileName name of the file
   */
  abstract isFileOfType(fileName: string): boolean

  /**
   * Create the stub for the file
   */
  abstract createStub(activeEditor: vscode.TextEditor): void

  /**
   * Update the current file
   */
  abstract update(activeEditor: vscode.TextEditor): void

  /**
   * Get all the properties of the class
   */
  protected getProperties(fileContents: string): Property[] {
    const properties: Property[] = []

    let match
    while ((match = StubCreator.propertyRegex.exec(fileContents))) {
      const property = new Property(match[1], match[2])
      properties.push(property)
    }

    return properties
  }

  /**
   * Get the class name
   */
  protected getClassName(fileContents: string): string | undefined {
    const match = fileContents.match(StubCreator.classNameRegex)

    if (match) {
      return match[1]
    } else {
      return undefined
    }
  }
}

class Property {
  readonly name: string
  readonly type: string

  constructor(type: string, name: string) {
    this.name = name
    this.type = type
  }
}
