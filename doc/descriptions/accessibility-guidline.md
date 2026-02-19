# Accessibility Guidline

## Rules of Aria

### First Rule of ARIA
**Do not use ARIA if you can achieve the same semantics with a native HTML element or attribute!**

### Second Rule of ARIA
**Do not change native semantics, unless you really have to.**

For example: Developer wants to build a heading that's a tab.

Do **not** do this:  
`<h2 role=tab>heading tab</h2>`

Do this:  
`<div role=tab><h2>heading tab</h2></div>`

### Third Rule of ARIA
**All interactive ARIA controls must be usable with the keyboard.**

If you create a widget that a user can click or tap or drag or drop or slide or scroll, a user must also be able to navigate to the widget and perform an equivalent action using the keyboard.

### Fourth Rule of ARIA
**Do not use role="presentation" or aria-hidden="true" on a focusable element.**

Using either of these on a focusable element will result in some users focusing on 'nothing'.

### Fifth Rule of ARIA
**All interactive elements must have an accessible name.**

[Source](https://w3c.github.io/using-aria) 

## General

[ARIA Attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes)  
[ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles)  
[Check support of ARIA-tags](https://a11ysupport.io/)

### Labeling

Certain elements get their name from the content they contain. For example, the following link is named "Home".  
`<a href="/">Home</a>`

Elements having one of the following
roles
are, by default, named by a string calculated from their descendant content:
* button
* cell
* checkbox
* columnheader
* gridcell
* heading
* link
* menuitem (content contained in a child menu element is excluded.)
* menuitemcheckbox
* menuitemradio
* option
* radio
* row
* rowheader
* switch
* tab
* tooltip
* treeitem (content included in a child group element is excluded.)

If an element isn't named by their content, you need to label it.  
Prefer to use visual labels, either by using `<label for="id">text</label>` or `aria-labelledby="id"`.

If there isn't a visual label use `aria-label` and also set a title to provide a visual tooltip on hover. 

If there is a help text or something similar, you can use `aria-describedby` to refer to that help text.

[More Detail](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

### aria-hidden="true" vs role="presentation"
`aria-hidden="true"` will remove the element and it's descendants from the accessibility tree and hide it from assistive technology.

`role=none` or `role=presentation` will remove the implicit ARIA semantics of an element.  
For example `<h1 role="none">text</h1>` is equivalent to `<div>text</div>` for assistive technology.

[More Detail](https://www.scottohara.me/blog/2018/05/05/hidden-vs-none.html)

### Interactive controls must not be nested
Focusable elements with an interactive control ancestor (any element that accepts user input such as button or anchor elements) are not announced by screen readers and create an empty tab stop. That is, you could tab to the element but the screen reader will not announce its name, role, or state.

[Source](https://dequeuniversity.com/rules/axe/4.10/nested-interactive?application=AxeFirefox)

## Elements

### Buttons

Buttons must have a clear label that describes their purpose.  
For example: `<button>Submit</button>`

If the button changes another elemnent or component, you should use `aria-controls` and `aria-expanded`. 

If the button is a toggle button, use `aria-checked` to inform the user about the state of the button.

### Images
Use `alt` attribute instead of `aria-label`.

Decorative images can be hidden from assistive technology with `alt=""`.

### Icons
Non decorative icons should be accompanied by visible text, this increases visibility and enlarges the clickable area.

If the icon is decorative/next to a visual label, hide it with `aria-hidden`.

### Iframes
Iframes should always have a title.  
Best Practice is to give the document inside the iframe the same title.

### Lists
`<ul>` and `<ol>` must only directly contain `<li>`, `<script>` or `<template>` elements

[More Detail](https://dequeuniversity.com/rules/axe/4.10/list?application=AxeFirefox)
