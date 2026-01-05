/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export function createSpecialCharsDropdown(editor: any): HTMLDivElement {
    const specialCharacters = [
        { label: '©', value: '©' },
        { label: '®', value: '®' },
        { label: '™', value: '™' },
        { label: '€', value: '€' },
        { label: '£', value: '£' },
        { label: '¥', value: '¥' },
        { label: '¢', value: '¢' },
        { label: '₽', value: '₽' },
        { label: '₹', value: '₹' },
        { label: '₩', value: '₩' },
        { label: '←', value: '←' },
        { label: '↑', value: '↑' },
        { label: '→', value: '→' },
        { label: '↓', value: '↓' },
        { label: '↔', value: '↔' },
        { label: '↕', value: '↕' },
        { label: '⇐', value: '⇐' },
        { label: '⇒', value: '⇒' },
        { label: '⇑', value: '⇑' },
        { label: '⇓', value: '⇓' },
        { label: '✓', value: '✓' },
        { label: '✔', value: '✔' },
        { label: '✕', value: '✕' },
        { label: '✖', value: '✖' },
        { label: '✗', value: '✗' },
        { label: '✘', value: '✘' },
        { label: '∞', value: '∞' },
        { label: '≈', value: '≈' },
        { label: '≠', value: '≠' },
        { label: '≡', value: '≡' },
        { label: '±', value: '±' },
        { label: '§', value: '§' },
        { label: '¶', value: '¶' },
        { label: '•', value: '•' },
        { label: '†', value: '†' },
        { label: '‡', value: '‡' },
        { label: '‰', value: '‰' },
        { label: '‱', value: '‱' },
        { label: '…', value: '…' },
        { label: '¿', value: '¿' },
        { label: '¡', value: '¡' },
        { label: '¬', value: '¬' },
        { label: 'µ', value: 'µ' },
        { label: 'Ω', value: 'Ω' },
        { label: 'π', value: 'π' },
        { label: 'Σ', value: 'Σ' },
        { label: 'Π', value: 'Π' },
        { label: '∆', value: '∆' },
        { label: '√', value: '√' },
        { label: '∫', value: '∫' },
        { label: '¼', value: '¼' },
        { label: '½', value: '½' },
        { label: '¾', value: '¾' },
        { label: '⅓', value: '⅓' },
        { label: '⅔', value: '⅔' },
        { label: '⅛', value: '⅛' },
        { label: '⅜', value: '⅜' },
        { label: '⅝', value: '⅝' },
        { label: '⅞', value: '⅞' },
        { label: 'Æ', value: 'Æ' },
        { label: 'æ', value: 'æ' },
        { label: 'Œ', value: 'Œ' },
        { label: 'œ', value: 'œ' },
        { label: 'Ð', value: 'Ð' },
        { label: 'ð', value: 'ð' },
        { label: 'Þ', value: 'Þ' },
        { label: 'þ', value: 'þ' },
        { label: 'Ł', value: 'Ł' },
        { label: 'ł', value: 'ł' },
        { label: 'ß', value: 'ß' },
        { label: 'Ç', value: 'Ç' },
        { label: 'ç', value: 'ç' },
        { label: 'Ñ', value: 'Ñ' },
        { label: 'ñ', value: 'ñ' },
        { label: 'Ø', value: 'Ø' },
        { label: 'ø', value: 'ø' },
        { label: 'Å', value: 'Å' },
        { label: 'å', value: 'å' },
        { label: 'Á', value: 'Á' },
        { label: 'á', value: 'á' },
        { label: 'É', value: 'É' },
        { label: 'é', value: 'é' },
        { label: 'Í', value: 'Í' },
        { label: 'í', value: 'í' },
        { label: 'Ó', value: 'Ó' },
        { label: 'ó', value: 'ó' },
        { label: 'Ú', value: 'Ú' },
        { label: 'ú', value: 'ú' },
        { label: 'Ý', value: 'Ý' },
        { label: 'ý', value: 'ý' },
        { label: 'Ÿ', value: 'Ÿ' },
        { label: 'ÿ', value: 'ÿ' }
    ];

    const wrapper = document.createElement('div');
    wrapper.className = 'tiptap-specialchars-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const button = document.createElement('button');
    button.className = 'tiptap-specialchars-button';
    button.type = 'button';
    button.title = 'Insert Special Character';
    button.textContent = 'Ω';
    button.style.padding = '5px';
    button.style.fontSize = '20px';
    button.style.backgroundColor = '#fff';
    button.style.cursor = 'pointer';

    const menu = document.createElement('div');
    menu.className = 'tiptap-specialchars-menu';
    Object.assign(menu.style, {
        display: 'none',
        position: 'absolute',
        top: '100%',
        left: '0',
        zIndex: '1000',
        minWidth: '220px',
        maxWidth: '260px',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginTop: '2px',
        padding: '8px',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
    });

    specialCharacters.forEach(({ label, value }) => {
        const charButton = document.createElement('button');
        charButton.className = 'tiptap-specialchars-char';
        charButton.type = 'button';
        charButton.textContent = label;
        charButton.style.padding = '6px';
        charButton.style.cursor = 'pointer';
        charButton.style.background = 'none';
        charButton.style.fontSize = '16px';

        charButton.addEventListener('click', (ev: MouseEvent): void => {
            ev.preventDefault();
            ev.stopPropagation();

            editor.chain().focus().insertContent(value).run();
            menu.style.display = 'none';
        });

        menu.appendChild(charButton);
    });

    button.addEventListener('click', (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        menu.style.display = menu.style.display === 'none' ? 'grid' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target as Node)) {
            menu.style.display = 'none';
        }
    });

    wrapper.appendChild(button);
    wrapper.appendChild(menu);
    return wrapper;
}

module.exports = { createSpecialCharsDropdown };