// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Delegator } from './stub_creator/Delegator'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const delegator = new Delegator()

  const createStubCommand = vscode.commands.registerCommand('flutter-cleancode-helper.createStub', () => {
    delegator.createStub()
  })
  context.subscriptions.push(createStubCommand)

  const updateCommand = vscode.commands.registerCommand('flutter-cleancode-helper.updateFile', () => {
    delegator.updateFile()
  })
  context.subscriptions.push(updateCommand)
}

// this method is called when your extension is deactivated
export function deactivate() {}

// vscode.workspace.onDidCreateFiles((event) => delegator.onDidCreateFiles(event))
