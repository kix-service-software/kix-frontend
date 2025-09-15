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
            positionPopup(currentClientRect(), dom);
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
            });

            updatePopupItems(dom, props.items, props.command);

            arrow = document.createElement('div');
            Object.assign(arrow.style, {
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: 'white',
                transform: 'rotate(45deg)',
                boxShadow: '-1px -1px 1px rgba(0,0,0,0.05)',
                top: '-4px',
                left: '8px',
            });
            dom.appendChild(arrow);

            document.body.appendChild(dom);
            currentClientRect = props.clientRect;
            positionPopup(currentClientRect(), dom);

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
                        positionPopup(clientRect(), dom);
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
        });
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
        });

        div.onmouseenter = (): string => (div.style.background = '#f1f1f1');
        div.onmouseleave = (): string => (div.style.background = 'transparent');
        div.onclick = (): void => command(item);

        dom.appendChild(div);
    });
}

function positionPopup(rect: DOMRect, popup: HTMLElement): void {
    popup.style.top = `${rect.bottom}px`;
    popup.style.left = `${rect.left}px`;
}