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
    "import 'package:{PACKAGE_NAME}/core/entity.dart';\n" +
    "import 'package:{PACKAGE_NAME}/core/errors/validation_error.dart';\n" +
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
        const stub = this.replaceKeywords(Entity.stub, activeEditor.document.fileName)

        // Insert stub
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
      let addString = `${className}({\n` + '    @required id,\n'

      // Add properties
      for (const property of properties) {
        addString += `    @required this.${property.name},\n`
      }
      addString += '  }) : super(id);\n' + '    \n'

      // Create get props
      addString +=
        '  @override\n' +
        '  List<Object> get props {\n' +
        '    final List<Object> props = super.props;\n' +
        '    \n' +
        '    props.add([\n'

      // Add properties
      for (const property of properties) {
        addString += `      this.${property.name},\n`
      }
      addString += '    ]);\n' + '    \n' + '    return props;\n' + '  }\n' + '  \n'

      // Add validation method
      addString +=
        '  @override\n' + '  List<ValidationInfo> validate() {\n' + '    final errors = super.validate();\n' + '    \n'

      // Add validation for properties
      for (const property of properties) {
        addString += `    // ${property.name} TODO\n` + '    \n' + '    \n'
      }

      addString += '    return errors;\n' + '  }'

      textEditorEdit.insert(activeEditor.selection.start, addString)
    })
  }
}
