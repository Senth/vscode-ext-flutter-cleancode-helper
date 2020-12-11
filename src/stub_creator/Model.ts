import { TextEditor } from 'vscode'
import { Property, StubCreator } from './StubCreator'
import * as path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'

export default class Model extends StubCreator {
  /**
   * Directory structure: features -> featureName -> data -> models -> fileName
   */
  isFileOfType(fileName: string): boolean {
    // Models
    const entitiesDir = path.dirname(fileName)
    if (path.basename(entitiesDir) !== 'models') {
      return false
    }

    // Data
    const domainDir = path.dirname(entitiesDir)
    if (path.basename(domainDir) !== 'data') {
      return false
    }

    // Features
    const featuresDir = path.dirname(path.dirname(domainDir))
    if (path.basename(featuresDir) !== 'features') {
      return false
    }

    return true
  }
  createStub(activeEditor: TextEditor): void {
    activeEditor
      .edit((textEditorEdit) => {
        const className = this.getClassName(activeEditor.document.fileName)
        const entityClassName = className.replace('Model', 'Entity')
        const entityFileName = path.basename(activeEditor.document.fileName).replace('model', 'entity')
        let stub =
          "import 'package:meta/meta.dart';\n" +
          '\n' +
          `import '../../domain/entities/${entityFileName}';\n` +
          '\n' +
          `class ${className} extends ${entityClassName} {\n` +
          '  \n' +
          '}'
        textEditorEdit.insert(activeEditor.selection.start, stub)
      })
      .then(() => {
        const position = new vscode.Position(5, 2)
        activeEditor.selection = new vscode.Selection(position, position)
        this.update(activeEditor)
      })
  }

  update(activeEditor: TextEditor): void {
    activeEditor.edit((textEditorEdit) => {
      const className = this.getClassName(activeEditor.document.fileName)
      const entityName = className.replace('Model', 'Entity')
      const properties = this.getEntityConstructorProperties(activeEditor.document.fileName)
      let stub = ''

      // Constructor
      stub += `${className}({\n`
      for (const property of properties) {
        stub += '    '
        if (property.required) {
          stub += '@required '
        }
        stub += `${property.type} ${property.name},\n`
      }
      // super()
      stub += '  }) : super(\n'
      for (const property of properties) {
        stub += `    ${property.name}: ${property.name},`
      }
      stub += '  );'

      // fromEntity()
      stub +=
        `\n\n  factory ${className}.fromEntity(${entityName} entity) {\n` +
        `    return ${className}(\n`
      for (const property of properties) {
        stub += `      ${property.name}: entity.${property.name},\n`
      }
      stub += '    );\n  }'

      // fromJson()
      stub +=
        `\n\n  factory ${className}.fromJson(Map<String, dynamic> json) {\n` +
        `    return ${className}(\n`
      for (const property of properties) {
        stub += `      ${property.name}: json["${property.name}"],\n`
      }
      stub += '    );\n  }'

      // toJson()
      stub +=
        '\n\n  Map<String, dynamic> toJson() {\n' +
        '    final Map<String, dynamic> map = {\n'
      for (const property of properties) {
        stub += `      "${property.name}": ${property.name},\n`
      }
      stub +=
      `    };\n` +
      '    return map;\n' +
      '  }'

      textEditorEdit.insert(activeEditor.selection.start, stub)
    })
  }

  getEntityConstructorProperties(fileName: string): Property[] {
    const entityBasename = path.basename(fileName).replace('model', 'entity')

    // Get filename of the model
    const modelsDir = path.dirname(fileName)
    const dataDir = path.dirname(modelsDir)
    const featureDir = path.dirname(dataDir)
    const entityFileName = path.join(featureDir, 'domain', 'entities', entityBasename)

    // Throw an exception when the file doesn't exist
    if (!fs.existsSync(entityFileName)) {
      throw vscode.FileSystemError.FileNotFound(entityFileName)
    }

    // Get properties
    const entityContents: string = fs.readFileSync(entityFileName, 'utf-8')
    const properties: Property[] = this.getProperties(entityContents)
    properties.unshift(new Property('String', 'id'))

    // Check if the property is required or not
    for (const property of properties) {
      const superProperty = `@required ${property.type} ${property.name}`
      const thisProperty = `@required this.${property.name}`
      if (entityContents.includes(thisProperty) || entityContents.includes(superProperty)) {
        property.required = true
      }
    }

    return properties
  }
}
