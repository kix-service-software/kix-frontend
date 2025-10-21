/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

let popupInstance: {
    destroy: () => void;
    update: (props: { clientRect: () => DOMRect }) => void;
} | null = null;

interface SuggestionItem { label: string }
interface SuggestionProps {
    clientRect: () => DOMRect;
    items: SuggestionItem[];
    command: (item: any) => void;
}

export function createMentionPopup(): {
    onStart: (props: SuggestionProps) => void;
    onUpdate: (props: SuggestionProps) => void;
    onKeyDown: (args: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
} {
    let dom: HTMLDivElement | null = null;
    let arrow: HTMLDivElement | null = null;
    let currentClientRect: (() => DOMRect) | null = null;

    let selectedIndex = 0;
    let lastItems: SuggestionItem[] = [];
    let lastCommand: ((item: any) => void) | null = null;

    const handleReposition = (): void => {
        if (dom && currentClientRect) {
            positionPopup(currentClientRect(), dom, arrow || undefined);
        }
    };

    const renderItems = (): void => {
        if (!dom) return;
        updatePopupItems(dom, lastItems, (it) => lastCommand?.(it), selectedIndex);
    };

    return {
        onStart(props: SuggestionProps): void {
            dom = document.createElement('div');
            dom.className = 'mention-popup';
            Object.assign(dom.style, {
                position: 'fixed',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                padding: '4px 0',
                zIndex: '9999',
                minWidth: '180px',
                fontSize: '14px',
                overflowY: 'auto',
            } as CSSStyleDeclaration);

            arrow = document.createElement('div');
            Object.assign(arrow.style, {
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: 'white',
                transform: 'rotate(45deg)',
                boxShadow: '-1px -1px 1px rgba(0,0,0,0.05)',
            } as CSSStyleDeclaration);
            dom.appendChild(arrow);

            document.body.appendChild(dom);

            currentClientRect = props.clientRect;
            lastItems = props.items;
            lastCommand = props.command;
            selectedIndex = 0;

            renderItems();
            positionPopup(currentClientRect(), dom, arrow);

            window.addEventListener('scroll', handleReposition, true);
            window.addEventListener('resize', handleReposition);

            popupInstance = {
                destroy: (): void => {
                    window.removeEventListener('scroll', handleReposition, true);
                    window.removeEventListener('resize', handleReposition);
                    dom?.remove();
                    dom = null;
                    popupInstance = null;
                    currentClientRect = null;
                    lastItems = [];
                    lastCommand = null;
                },
                update: ({ clientRect }: { clientRect: () => DOMRect }): void => {
                    currentClientRect = clientRect;
                    if (dom) positionPopup(clientRect(), dom, arrow || undefined);
                },
            };
        },

        onUpdate(props: SuggestionProps): void {
            if (!popupInstance || !dom) return;
            lastItems = props.items;
            lastCommand = props.command;

            if (selectedIndex >= lastItems.length) {
                selectedIndex = Math.max(0, lastItems.length - 1);
            }
            renderItems();
            popupInstance.update({ clientRect: props.clientRect });
        },

        onKeyDown({ event }: { event: KeyboardEvent }): boolean {
            if (!dom) return false;

            if (event.key === 'ArrowDown') {
                if (lastItems.length === 0) return true;
                selectedIndex = (selectedIndex + 1) % lastItems.length;
                renderItems();
                return true;
            }

            if (event.key === 'ArrowUp') {
                if (lastItems.length === 0) return true;
                selectedIndex = (selectedIndex - 1 + lastItems.length) % lastItems.length;
                renderItems();
                return true;
            }

            if (event.key === 'Enter') {
                const item = lastItems[selectedIndex];
                if (item) {
                    event.preventDefault();
                    lastCommand?.(item);
                    return true;
                }
            }

            if (event.key === 'Escape') {
                popupInstance?.destroy();
                return true;
            }

            return false;
        },

        onExit(): void {
            popupInstance?.destroy();
        },
    };
}

function updatePopupItems(
    dom: HTMLDivElement,
    items: { label: string }[],
    command: (item: any) => void,
    selectedIndex: number
): void {
    Array.from(dom.querySelectorAll('.mention-item, .no-results')).forEach((child) => child.remove());

    if (items.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'mention-item no-results';
        emptyDiv.textContent = 'No matches found';
        Object.assign(emptyDiv.style, {
            padding: '6px 12px',
            color: '#888',
        } as CSSStyleDeclaration);
        dom.appendChild(emptyDiv);
        return;
    }

    items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'mention-item';
        div.textContent = item.label;

        const isSelected = i === selectedIndex;
        Object.assign(div.style, {
            padding: '6px 12px',
            cursor: 'pointer',
            userSelect: 'none',
            background: isSelected ? '#eaf3ff' : 'transparent',
        } as CSSStyleDeclaration);

        div.onmouseenter = (): void => { div.style.background = '#f1f1f1'; };
        div.onmouseleave = (): void => { div.style.background = isSelected ? '#eaf3ff' : 'transparent'; };
        div.onclick = (): void => command(item);

        dom.appendChild(div);
    });

    const sel = dom.querySelectorAll('.mention-item')[selectedIndex] as HTMLElement | undefined;
    sel?.scrollIntoView({ block: 'nearest' });
}

function positionPopup(rect: DOMRect, popup: HTMLElement, arrow?: HTMLElement): void {
    const margin = 8;
    const sideMargin = 8;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    const maxH = Math.max(160, Math.floor(vpH * 0.5));
    popup.style.maxHeight = `${maxH}px`;
    popup.style.overflowY = 'auto';

    const bbox = popup.getBoundingClientRect();
    const popupWidth = bbox.width || 200;
    const popupHeight = Math.min(bbox.height || 180, maxH);

    const spaceBelow = vpH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const placeAbove = popupHeight > spaceBelow && spaceAbove >= spaceBelow;

    const top = placeAbove
        ? Math.max(margin, rect.top - popupHeight - margin)
        : Math.min(vpH - popupHeight - margin, rect.bottom + margin);

    let left = rect.left;
    if (left + popupWidth + sideMargin > vpW) left = vpW - popupWidth - sideMargin;
    if (left < sideMargin) left = sideMargin;

    popup.style.top = `${Math.max(margin, Math.min(top, vpH - popupHeight - margin))}px`;
    popup.style.left = `${left}px`;

    if (arrow) {
        Object.assign(arrow.style, {
            width: '8px',
            height: '8px',
            background: 'white',
            transform: 'rotate(45deg)',
            boxShadow: '-1px -1px 1px rgba(0,0,0,0.05)',
            position: 'absolute',
        } as CSSStyleDeclaration);

        arrow.style.top = '';
        arrow.style.bottom = '';
        if (placeAbove) arrow.style.bottom = '-4px';
        else arrow.style.top = '-4px';

        const caretXInside = rect.left - left;
        const arrowOffset = Math.max(8, Math.min(popupWidth - 16, caretXInside));
        arrow.style.left = `${arrowOffset}px`;
    }

    popup.setAttribute('data-placement', placeAbove ? 'top' : 'bottom');
}