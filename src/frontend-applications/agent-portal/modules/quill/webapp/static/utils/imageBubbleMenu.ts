/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

function createImageBubbleMenu(quill): void {
    const bubble = document.createElement('div');
    bubble.className = 'image-bubble-menu';

    ['small', 'medium', 'large'].forEach((size) => {
        const button = document.createElement('button');
        button.innerText = size;
        button.onclick = (): void => {
            const img = quill.root.querySelector('.selected-img');
            if (img) {
                img.classList.remove('img-small', 'img-medium', 'img-large');
                img.classList.add(`img-${size}`);
                img.setAttribute('data-size', size);
                img.classList.remove('selected-img');
                bubble.style.display = 'none';
            }
        };
        bubble.appendChild(button);
    });

    document.body.appendChild(bubble);

    const updateBubblePosition = (img: any): void => {
        const rect = img.getBoundingClientRect();
        bubble.style.position = 'fixed';
        bubble.style.top = `${rect.top - 40}px`;
        bubble.style.left = `${rect.left}px`;
        bubble.style.display = 'block';
    };

    quill.root.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.tagName === 'IMG') {
            updateBubblePosition(target);

            quill.root.querySelectorAll('img').forEach((img) =>
                img.classList.remove('selected-img')
            );
            target.classList.add('selected-img');
        } else {
            bubble.style.display = 'none';
            quill.root.querySelectorAll('img').forEach((img) =>
                img.classList.remove('selected-img')
            );
        }
    });

    document.addEventListener('scroll', () => {
        const selected = quill.root.querySelector('img.selected-img');
        if (selected) {
            updateBubblePosition(selected);
        }
    }, true);
}

module.exports = {
    createImageBubbleMenu
};