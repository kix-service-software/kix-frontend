export function createWrapper(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'tiptap-wrapper';
    return wrapper;
}

export function createBubbleMenuElement(): HTMLDivElement {
    const bubbleMenu = document.createElement('div');
    bubbleMenu.className = 'bubble-menu';
    return bubbleMenu;
}