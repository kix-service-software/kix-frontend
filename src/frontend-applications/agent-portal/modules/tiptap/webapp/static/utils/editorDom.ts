/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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