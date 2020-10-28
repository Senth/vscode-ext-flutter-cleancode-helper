import * as vscode from 'vscode'
import * as path from 'path'
import '../helpers/string'

/**
 * Base class of all stub creators
 */
export abstract class StubCreator {
  private static readonly propertyRegex = /final (\w+) (\w+)/g

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
   * Get all the properties of the class from it's file contents
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
   * Replace the {KEYWORDS} in the file contents with the correct information
   * @param contents the file contents
   * @param fileName name of the file
   * @return contents replaced with the correct information
   */
  protected replaceKeywords(contents: string, fileName: string): string {
    contents = contents.replace(/{CLASS_NAME}/g, this.getClassName(fileName))
    contents = contents.replace(/{PACKAGE_NAME}/g, this.getPackageName(fileName))
    return contents
  }

  /**
   * Get the class name from its filename
   */
  protected getClassName(fileName: string): string {
    return path.basename(fileName, '.dart').snakeToCamel(true)
  }

  /**
   * Get the package name from its filename
   */
  protected getPackageName(fileName: string): string {
    const workspaceFolders = vscode.workspace.workspaceFolders?.map((element) => {
      return element.name
    })

    let lastdir = ''
    let searchDir = fileName
    let foundDir = ''

    // Search for package until it's one of the workspace folders or we went to the end
    while (searchDir !== lastdir && foundDir === '') {
      lastdir = searchDir
      searchDir = path.dirname(searchDir)
      const basename = path.basename(searchDir)

      if (workspaceFolders?.includes(basename)) {
        foundDir = basename
      }
    }

    return foundDir.replace(/-/g, '_')
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
