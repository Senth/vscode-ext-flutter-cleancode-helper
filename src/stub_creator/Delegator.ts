import * as vscode from 'vscode'
import Entity from './entity'
import { StubCreator } from './StubCreator'

export class Delegator {
  creators: StubCreator[] = [new Entity()]

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
