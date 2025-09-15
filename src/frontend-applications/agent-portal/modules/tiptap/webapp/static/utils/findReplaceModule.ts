/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export function addFindReplace(toolbar, editor, createIconButton): any {
    let isFindReplaceVisible = false;

    const findReplaceContainer = document.createElement('div');
    Object.assign(findReplaceContainer.style, {
        display: 'none',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px',
        marginTop: '10px',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        backgroundColor: '#f9f9f9',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
    });

    const findReplaceButton = createIconButton(
        'fas fa-search',
        () => {
            isFindReplaceVisible = findReplaceContainer.style.display === 'none';
            findReplaceContainer.style.display = isFindReplaceVisible ? 'flex' : 'none';
            findReplaceButton.classList.toggle('is-active', isFindReplaceVisible);
            if (isFindReplaceVisible) {
                updateMatchCount();
                updateStats();
                requestAnimationFrame(() => findInput.focus());
            }
        },
        'Find & Replace',
        {
            checkActive: () => isFindReplaceVisible
        }
    );

    toolbar.appendChild(findReplaceButton);

    const findReplaceTopRow = document.createElement('div');
    Object.assign(findReplaceTopRow.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
    });

    const inputsGroup = document.createElement('div');
    Object.assign(inputsGroup.style, {
        display: 'flex',
        flexGrow: '1',
        flexShrink: '1',
        flexWrap: 'wrap',
        gap: '8px',
        minWidth: '0',
    });

    const findInput = document.createElement('input');
    findInput.type = 'text';
    findInput.placeholder = 'Find';
    findInput.className = 'form-control form-control-sm';
    Object.assign(findInput.style, {
        flex: '1 1 180px',
        minWidth: '120px',
        fontSize: '13px',
        padding: '4px 8px',
        height: '32px',
    });

    const replaceInput = document.createElement('input');
    replaceInput.type = 'text';
    replaceInput.placeholder = 'Replace';
    replaceInput.className = 'form-control form-control-sm';
    Object.assign(replaceInput.style, {
        flex: '1 1 180px',
        minWidth: '120px',
        fontSize: '13px',
        padding: '4px 8px',
        height: '32px',
    });

    inputsGroup.appendChild(findInput);
    inputsGroup.appendChild(replaceInput);

    const buttonGroup = document.createElement('div');
    Object.assign(buttonGroup.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        justifyContent: 'flex-end',
        flexShrink: '0',
    });

    const findNextButton = document.createElement('button');
    findNextButton.textContent = 'Find Next';
    const replaceButton = document.createElement('button');
    replaceButton.textContent = 'Replace';
    const replaceAllButton = document.createElement('button');
    replaceAllButton.textContent = 'Replace All';

    [findNextButton, replaceButton, replaceAllButton].forEach((btn) => {
        btn.className = 'btn btn-sm btn-outline-secondary';
        Object.assign(btn.style, {
            padding: '0 0.5rem',
            height: '32px',
            whiteSpace: 'nowrap',
            width: 'auto',
        });
        buttonGroup.appendChild(btn);
    });

    findReplaceTopRow.appendChild(inputsGroup);
    findReplaceTopRow.appendChild(buttonGroup);

    const optionsRow = document.createElement('div');
    Object.assign(optionsRow.style, {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        fontSize: '12px',
        color: '#444',
        marginTop: '4px',
        marginLeft: '2px',
    });

    function createCheckbox(labelText): any {
        const input = document.createElement('input');
        input.type = 'checkbox';
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '4px';
        label.appendChild(input);
        label.appendChild(document.createTextNode(labelText));
        return { input, label };
    }

    const { input: caseCheckbox, label: caseLabel } = createCheckbox('Case Sensitive');
    const { input: wordCheckbox, label: wordLabel } = createCheckbox('Whole Word');
    const { input: regexCheckbox, label: regexLabel } = createCheckbox('Regex');

    optionsRow.appendChild(caseLabel);
    optionsRow.appendChild(wordLabel);
    optionsRow.appendChild(regexLabel);

    const matchCounter = document.createElement('div');
    matchCounter.textContent = 'Matches: 0';
    Object.assign(matchCounter.style, {
        fontSize: '12px',
        color: '#555',
    });

    const statsCounter = document.createElement('div');
    Object.assign(statsCounter.style, {
        fontSize: '12px',
        color: '#888',
        wordBreak: 'break-word',
    });

    const statsRow = document.createElement('div');
    Object.assign(statsRow.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px',
        paddingLeft: '2px',
        paddingRight: '2px',
        width: '100%',
    });

    statsRow.appendChild(matchCounter);
    statsRow.appendChild(statsCounter);

    findReplaceContainer.appendChild(findReplaceTopRow);
    findReplaceContainer.appendChild(optionsRow);
    findReplaceContainer.appendChild(statsRow);
    toolbar.appendChild(findReplaceContainer);

    let lastMatchIndex = -1;
    let foundPositions = [];

    function escapeRegExp(text): any {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function buildRegex(query): any {
        if (!regexCheckbox.checked) {
            query = escapeRegExp(query);
            if (wordCheckbox.checked) query = `\\b${query}\\b`;
        }
        try {
            return new RegExp(query, caseCheckbox.checked ? 'g' : 'gi');
        } catch {
            return new RegExp('', 'g');
        }
    }

    function searchText(query): any {
        const regex = buildRegex(query);
        const matches = [];
        editor.state.doc.descendants((node, pos) => {
            if (node.isText) {
                let m;
                while ((m = regex.exec(node.text || '')) !== null) {
                    matches.push({ from: pos + m.index, to: pos + m.index + m[0].length });
                }
            }
            return true;
        });
        return matches;
    }

    function updateMatchCount(): any {
        const query = findInput.value.trim();
        if (!query) {
            matchCounter.textContent = 'Matches: 0';
            return;
        }
        foundPositions = searchText(query);
        matchCounter.textContent = `Matches: ${foundPositions.length}`;
    }

    function updateStats(): void {
        const text = editor.getText().trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        const charCount = text.length;
        statsCounter.textContent = `Words: ${wordCount} | Chars: ${charCount}`;
    }

    findInput.addEventListener('input', updateMatchCount);
    replaceInput.addEventListener('input', updateMatchCount);
    [caseCheckbox, wordCheckbox, regexCheckbox].forEach((cb) =>
        cb.addEventListener('change', updateMatchCount)
    );
    editor.on('update', updateStats);

    findNextButton.onclick = (): void => {
        const query = findInput.value.trim();
        if (!query) return;
        foundPositions = searchText(query);
        if (foundPositions.length === 0) return;
        lastMatchIndex = (lastMatchIndex + 1) % foundPositions.length;
        const pos = foundPositions[lastMatchIndex];
        editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
        matchCounter.textContent = `Matches: ${foundPositions.length} (current: ${lastMatchIndex + 1})`;
    };

    replaceButton.onclick = (): void => {
        const query = findInput.value.trim();
        const replacement = replaceInput.value;
        if (!query) return;
        if (foundPositions.length === 0) foundPositions = searchText(query);
        if (foundPositions.length === 0) return;
        const pos = foundPositions[lastMatchIndex] ?? foundPositions[0];
        editor.chain().focus().insertContentAt(pos, replacement).run();
        foundPositions = searchText(query);
        lastMatchIndex = -1;
        updateMatchCount();
    };

    replaceAllButton.onclick = (): void => {
        const query = findInput.value.trim();
        const replacement = replaceInput.value;
        if (!query) return;

        const matches = searchText(query);
        if (matches.length === 0) return;

        for (let i = matches.length - 1; i >= 0; i--) {
            const { from, to } = matches[i];
            editor.chain().focus().insertContentAt({ from, to }, replacement).run();
        }

        matchCounter.textContent = `Replaced: ${matches.length}`;
        findInput.value = '';
        replaceInput.value = '';
        foundPositions = [];
        lastMatchIndex = -1;
        updateMatchCount();
        updateStats();
    };

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        const isMac = ((): any => {
            const nav: any = navigator;
            if (nav.userAgentData?.platform) {
                return nav.userAgentData.platform.toLowerCase().includes('mac');
            }
            return navigator.userAgent.toLowerCase().includes('mac');
        })();

        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

        if (ctrlKey && e.altKey && key === 'f') {
            e.preventDefault();
            findReplaceButton.click();
        } else if (!ctrlKey && e.altKey && key === 'n') {
            e.preventDefault();
            findNextButton.click();
        } else if (ctrlKey && e.altKey && key === 'r' && !e.shiftKey) {
            e.preventDefault();
            replaceButton.click();
        } else if (ctrlKey && e.altKey && e.shiftKey && key === 'a') {
            e.preventDefault();
            replaceAllButton.click();
        }
    });

}

module.exports = { addFindReplace };