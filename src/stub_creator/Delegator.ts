import * as vscode from 'vscode'
import Entity from './entity'
import Model from './Model'
import { StubCreator } from './StubCreator'

export class Delegator {
  creators: StubCreator[] = [new Entity(), new Model()]

  createStub(): void {
    const creator = this.findCreator()
    if (creator) {
      creator.createStub(vscode.window.activeTextEditor!)
    }
  }

  updateFile(): void {
    const creator = this.findCreator()
    if (creator) {
      creator.update(vscode.window.activeTextEditor!)
    }
  }

  private findCreator(): StubCreator | undefined {
    const fileName = vscode.window.activeTextEditor?.document.fileName

    if (fileName) {
      for (const creator of this.creators) {
        if (creator.isFileOfType(fileName)) {
          return creator
        }
      }
    }
  }
}
