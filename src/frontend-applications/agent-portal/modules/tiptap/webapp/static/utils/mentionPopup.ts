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

interface SuggestionProps {
    clientRect: () => DOMRect;
    items: { label: string }[];
    command: (item: any) => void;
}

export function createMentionPopup(): {
    onStart: (props: SuggestionProps) => void;
    onUpdate: (props: SuggestionProps) => void;
    onKeyDown: () => boolean;
    onExit: () => void;
} {
    let dom: HTMLDivElement | null = null;
    let arrow: HTMLDivElement | null = null;
    let currentClientRect: (() => DOMRect) | null = null;

    const handleReposition = (): void => {
        if (dom && currentClientRect) {
            positionPopup(currentClientRect(), dom, arrow || undefined);
        }
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

            updatePopupItems(dom, props.items, props.command);

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
                },
                update: ({ clientRect }: { clientRect: () => DOMRect }): void => {
                    currentClientRect = clientRect;
                    if (dom) {
                        positionPopup(clientRect(), dom, arrow || undefined);
                    }
                },
            };
        },

        onUpdate(props: SuggestionProps): void {
            if (!popupInstance || !dom) return;
            updatePopupItems(dom, props.items, props.command);
            popupInstance.update({ clientRect: props.clientRect });
        },

        onKeyDown(): boolean {
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
    command: (item: any) => void
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

    items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'mention-item';
        div.textContent = item.label;
        Object.assign(div.style, {
            padding: '6px 12px',
            cursor: 'pointer',
            userSelect: 'none',
        } as CSSStyleDeclaration);

        div.onmouseenter = (): string => (div.style.background = '#f1f1f1');
        div.onmouseleave = (): string => (div.style.background = 'transparent');
        div.onclick = (): void => command(item);

        dom.appendChild(div);
    });
}

function positionPopup(rect: DOMRect, popup: HTMLElement, arrow?: HTMLElement): void {
    const margin = 8;
    const sideMargin = 8;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    const maxH = Math.max(160, Math.floor(vpH * 0.5));
    popup.style.maxHeight = `${maxH}px`;
    popup.style.overflowY = 'auto';

    const popupWidth = popup.offsetWidth || 200;
    const popupHeight = Math.min(popup.offsetHeight || 180, maxH);

    const spaceBelow = vpH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    const placeAbove = popupHeight > spaceBelow && spaceAbove >= spaceBelow;

    let top: number;
    if (placeAbove) {
        top = Math.max(margin, rect.top - popupHeight - margin);
    } else {
        top = Math.min(vpH - popupHeight - margin, rect.bottom + margin);
    }

    let left = rect.left;
    if (left + popupWidth + sideMargin > vpW) {
        left = vpW - popupWidth - sideMargin;
    }
    if (left < sideMargin) {
        left = sideMargin;
    }

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
        if (placeAbove) {
            arrow.style.bottom = '-4px';
        } else {
            arrow.style.top = '-4px';
        }

        const caretXInside = rect.left - left;
        const arrowOffset = Math.max(8, Math.min(popupWidth - 16, caretXInside));
        arrow.style.left = `${arrowOffset}px`;
    }

    popup.setAttribute('data-placement', placeAbove ? 'top' : 'bottom');
}