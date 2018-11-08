import { 
    Disposable, ExtensionContext, TextDocument, 
    languages, Position, CompletionItem, 
    CompletionItemKind, Range
} from 'vscode';

export function activate(context: ExtensionContext) {
    const COMPLETION_TRIGGER = ":";
    const SUPPORTED_CSS = [
        // "*"
        "css", "scss", 
    ];

    const cssSuggestions = require('../src/css_suggestion.json');

    let completion = new Completion(cssSuggestions);
    let completionController = new CompletionController(completion);

    context.subscriptions.push(completion);
    context.subscriptions.push(completionController);

    for (var support of SUPPORTED_CSS) {

        context.subscriptions.push(languages.registerCompletionItemProvider(support, {
            provideCompletionItems: (document, position, token) => {
                return completion.performCompletion(document, position);
            }, resolveCompletionItem: (item, token) => {
                return item;
            }
        }, COMPLETION_TRIGGER));

    }

}

class Completion {
    private cssSuggestions: any;

    public matchPropertyValue: string;

    constructor(cssSuggestions: any) {
        this.cssSuggestions = cssSuggestions;
    }

    public performCompletion(document: TextDocument, position: Position): any {

        var result = [];
        var lineText = document.lineAt(position.line).text.trim();
        this.matchPropertyValue = lineText.replace(/:/g, "");
        
        if (this.matchPropertyValue !== "") {

            for (var key in this.cssSuggestions.properties) {

                var obj = Object.keys(this.cssSuggestions.properties[key][0]);
                var targetValue = this.matchPropertyValue;

                if (obj[0] === targetValue) {

                    for (var valueIndex in this.cssSuggestions.properties[key][0][targetValue].values) {
                        
                        var newValue = this.cssSuggestions.properties[key][0][targetValue].values[valueIndex];
                        
                        var newItem = new CompletionItem(" " + newValue, CompletionItemKind.Value);
                        
                        result.push(newItem);
                    }
                }
            }

        }

        else {

            for (var key in this.cssSuggestions.properties) {

                var obj = Object.keys(this.cssSuggestions.properties[key][0]);
                var propertyName = obj[0].toString();

                var newItem = new CompletionItem(propertyName, CompletionItemKind.Field);
                var newRange = new Range(position.translate(0, -1), position);


                // Unfortunately this interferes with suggestions.
                newItem.filterText = ":";
                newItem.insertText = propertyName;
                newItem.range = newRange;

                result.push(newItem);
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