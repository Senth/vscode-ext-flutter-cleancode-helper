import { StubCreator } from './StubCreator'
import * as path from 'path'
import * as vscode from 'vscode'
import '../helpers/string'

/**
 * Entity in domain
 */
export default class Entity extends StubCreator {
  static readonly stub =
    "import 'package:meta/meta.dart';\n" +
    "import 'package:my_musical_repertoire/core/entity.dart';\n" +
    '\n' +
    'class {CLASS_NAME} extends Entity {\n' +
    '  \n' +
    '}'

  /**
   * Directory structure: features -> featureName -> domain -> entities -> fileName
   */
  isFileOfType(fileName: string): boolean {
    // Entities
    const entitiesDir = path.dirname(fileName)
    if (path.basename(entitiesDir) !== 'entities') {
      return false
    }

    // Domain
    const domainDir = path.dirname(entitiesDir)
    if (path.basename(domainDir) !== 'domain') {
      return false
    }

    // Features
    const featuresDir = path.dirname(path.dirname(domainDir))
    if (path.basename(featuresDir) !== 'features') {
      return false
    }

    return true
  }

  createStub(activeEditor: vscode.TextEditor) {
    activeEditor
      .edit((textEditorEdit) => {
        const fileName = activeEditor.document.fileName
        let className = path.basename(fileName, '.dart').snakeToCamel(true)
        const stub = Entity.stub.replace('{CLASS_NAME}', className)
        textEditorEdit.insert(activeEditor.selection.start, stub)
      })
      .then(() => {
        activeEditor.selection = new vscode.Selection(new vscode.Position(4, 2), new vscode.Position(4, 2))
      })
  }

  update(activeEditor: vscode.TextEditor) {
    activeEditor.edit((textEditorEdit) => {
      const contents = activeEditor.document.getText()
      const className = this.getClassName(contents)
      const properties = this.getProperties(contents)

      // Create constructor
      let constructorString = `${className}({\n` + '    @required id,\n'

      // Add properties
      for (const property of properties) {
        constructorString += `    @required this.${property.name},\n`
      }
      constructorString += '  }) : super(id);'

      textEditorEdit.insert(activeEditor.selection.start, constructorString)
    })
  }
}
