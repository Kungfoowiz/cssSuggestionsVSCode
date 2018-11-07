import {
    Disposable, ExtensionContext, TextDocument,
    languages, Position, CompletionItem,
    CompletionItemKind
} from 'vscode';

export function activate(context: ExtensionContext) {

    const COMPLETION_TRIGGER = ":";
    const cssSuggestions = require('../src/css_suggestion.json');

    let completion = new Completion(cssSuggestions);
    let completionController = new CompletionController(completion);

    context.subscriptions.push(completion);
    context.subscriptions.push(completionController);

    context.subscriptions.push(languages.registerCompletionItemProvider("*", {
        provideCompletionItems: (document, position, token) => {
            return completion.performCompletion(document, position);
        }, resolveCompletionItem: (item, token) => item
    }, COMPLETION_TRIGGER));

}

class Completion {

    private cssSuggestions: any;

    constructor(cssSuggestions: any) {

        this.cssSuggestions = cssSuggestions;
    }

    public performCompletion(document: TextDocument, position: Position): any {

        var result = [];
        var lineText = document.lineAt(position.line).text.trim();
        var matchPropertyValue = lineText.replace(/:/g, "");

        if (matchPropertyValue !== "") {

            for (var key in this.cssSuggestions.properties) {

                var obj = Object.keys(this.cssSuggestions.properties[key][0]);
                var targetValue = matchPropertyValue;

                if (obj[0] === targetValue) {

                    for (var valueIndex in this.cssSuggestions.properties[key][0][targetValue].values) {
                        result.push(new CompletionItem(" " + this.cssSuggestions.properties[key][0][targetValue].values[valueIndex], CompletionItemKind.Value));
                    }
                }
            }

        }

        else {

            for (var key in this.cssSuggestions.properties) {

                var obj = Object.keys(this.cssSuggestions.properties[key][0]);
                var targetValue = matchPropertyValue;

                result.push(new CompletionItem(obj[0], CompletionItemKind.Field));
            }
        }

        return result;
    }

    dispose() {

    }


}

class CompletionController {

    private completion: Completion;

    private disposable: Disposable;

    constructor(completion: Completion) {
        this.completion = completion;

        let subscriptions: Disposable[] = [];

        this.disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this.completion.dispose();
        this.disposable.dispose();
    }

}