/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TextmodulePlugin } from '../../core/TextmodulePlugin';

export interface AutocompleteSetupOptions {
    quill: any;
    container: HTMLElement;
    getSuggestions: (query: string) => any[];
}

export function setupAutocomplete({
    quill,
    container,
    getSuggestions
}: AutocompleteSetupOptions): HTMLDivElement {
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'ql-mention-list-container';
    autocompleteContainer.style.display = 'none';

    const ul = document.createElement('ul');
    autocompleteContainer.appendChild(ul);

    quill.container.appendChild(autocompleteContainer);
    quill.container.style.position = 'relative';

    quill.on('selection-change', () => {
        autocompleteContainer.style.display = 'none';
    });

    quill.on('text-change', async () => {
        const range = quill.getSelection();
        if (!range) return;

        const [line, offset] = quill.getLine(range.index);
        const text = line.domNode.textContent.slice(0, offset);
        const match = text.match(/::(\w*)$/);

        if (!match) {
            autocompleteContainer.style.display = 'none';
            return;
        }

        const query = match[1];
        const suggestions = await getSuggestions(query);

        if (suggestions.length === 0) {
            autocompleteContainer.style.display = 'none';
            return;
        }

        renderList(suggestions, range, match[0].length);
    });

    function renderList(suggestions: any[], range: any, replaceLength: number): void {
        ul.innerHTML = '';

        suggestions.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'ql-mention-list-item';
            li.textContent = item.label;

            li.onclick = async (): Promise<void> => {
                const index = range.index;
                const content = await TextmodulePlugin.prepareTextContent(item);

                quill.deleteText(index - replaceLength, replaceLength);
                quill.insertText(index - replaceLength, content, {
                    background: '#fff',
                    color: '#000'
                });
                quill.setSelection(index - replaceLength + content.length);
                autocompleteContainer.style.display = 'none';
            };;

            ul.appendChild(li);
        });

        const bounds = quill.getBounds(range.index);
        Object.assign(autocompleteContainer.style, {
            top: `${bounds.top + bounds.height}px`,
            left: `${bounds.left}px`,
            position: 'absolute',
            display: 'block'
        });
    }

    return autocompleteContainer;
}