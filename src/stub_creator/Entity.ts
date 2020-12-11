import { StubCreator } from './StubCreator'
import * as path from 'path'
import * as vscode from 'vscode'

/**
 * Entity in domain
 */
export default class Entity extends StubCreator {
  static readonly position = new vscode.Position(6, 2)

  static readonly stub =
    "import 'package:meta/meta.dart';\n" +
    '\n' +
    "import '../../../../core/entity.dart';\n" +
    "import '../../../../core/errors/validation_error.dart';\n" +
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
        activeEditor.selection = new vscode.Selection(Entity.position, Entity.position)
      })
  }

  update(activeEditor: vscode.TextEditor) {
    activeEditor.edit((textEditorEdit) => {
      const contents = activeEditor.document.getText()
      const className = this.getClassName(activeEditor.document.fileName)
      const properties = this.getProperties(contents)

      // Create constructor
      let addString = `${className}({\n` + '    String id,\n'

      // Add properties
      for (const property of properties) {
        addString += `    @required this.${property.name},\n`
      }
      addString += '  }) : super(id);'

      // Create get props
      addString +=
        '\n\n  @override\n' +
        '  List<Object> get props {\n' +
        '    final List<Object> props = super.props;\n' +
        '    \n' +
        '    props.add([\n'

      // Add properties
      for (const property of properties) {
        addString += `      this.${property.name},\n`
      }
      addString += '    ]);\n' + '    \n' + '    return props;\n' + '  }'

      // Add validation method
      addString +=
        '\n\n  @override\n' +
        '  List<ValidationInfo> validate() {\n' +
        '    final errors = super.validate();\n' +
        '    \n'

      // Add validation for properties
      for (const property of properties) {
        addString +=
          `    // ${property.name} TODO\n` +
          '    \n' +
          '    \n'
      }

      addString +=
        '    return errors;\n' +
        '  }'

      // Add copy function
      addString +=
        `\n\n  ${className} copy({\n` +
        '    String id,\n'

      for (const property of properties) {
        addString += `    ${property.type} ${property.name},\n`
      }

      addString +=
        '  }) {\n' +
        `    return new ${className}(\n` +
        '      id: id != null ? id : this.id,\n'

      for (const property of properties) {
        addString += `      ${property.name}: ${property.name} != null ? ${property.name} : this.${property.name},\n`
      }
      addString +=
        '    );\n' +
        '  }'

      textEditorEdit.insert(activeEditor.selection.start, addString)
    })
  }
}
