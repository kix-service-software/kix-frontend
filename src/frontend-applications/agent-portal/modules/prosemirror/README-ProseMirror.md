# 📚 ProseMirror Integration Guide

This guide documents how to integrate and maintain the [ProseMirror](https://prosemirror.net) rich-text editor inside the KIX frontend using a browserified and minified JS bundle and Marko components.

---

## 📁 Folder Structure

```

project-root/
│
├── static/scripts/build-prosemirror.js       ← Entry file for bundling ProseMirror modules
├── static/scripts/prosemirror.min.js         ← Browserified & minified bundle (used in browser)
├── components/prosemirror-editor/            ← Marko components using ProseMirror
└── ...

````

---

## ✅ What’s Included in `prosemirror.min.js`

The bundled file exposes ProseMirror modules globally via `window.PM`:

```js
window.PM = {
  // Core modules
  state: require('prosemirror-state'),
  view: require('prosemirror-view'),
  model: require('prosemirror-model'),

  // Schema
  schema_basic: require('prosemirror-schema-basic'),

  // Menu and commands
  menu: require('prosemirror-menu'),
  keymap: require('prosemirror-keymap'),
  commands: require('prosemirror-commands'),
  history: require('prosemirror-history'),
  example_setup: require('prosemirror-example-setup'),

  // Optionally more plugins...
};
````

---

## 🛠️ Building `prosemirror.min.js`

### Step 1 – Install dependencies (if not already done)

```bash
npm install
```

### Step 2 – Build the bundle

You can manually run:

```bash
npx browserify src/frontend-applications/agent-portal/modules/prosemirror/webapp/static/build-prosemirror.js \
  | npx terser -c -m \
  -o src/frontend-applications/agent-portal/modules/prosemirror/webapp/static/prosemirror.min.js
```

Or just run the **predefined npm script**:

```bash
npm run build-prosemirror
```

---

## 🧠 How the Editor Works

* Editor is mounted in a Marko component using a DOM element by ID (`this.state.editorId`)
* Uses `schema_basic`, or a custom schema (e.g. with tables)
* Input HTML → parsed to a ProseMirror doc
* Edits emit `valueChanged` events with HTML output
* Plugins are configured in `onMount()`

---

## ➕ Adding New Functionality

### Example: Add input rules (e.g. `*bold*` → bold)

1. Install dependency:

```bash
npm install prosemirror-inputrules
```

2. Add to `build-prosemirror.js`:

```js
window.PM.inputrules = require('prosemirror-inputrules');
```

3. Rebuild:

```bash
npm run build-prosemirror
```

---

## 📦 Script Reference (`package.json`)

```json
"scripts": {
  "build-prosemirror": "npx browserify src/frontend-applications/agent-portal/modules/prosemirror/webapp/static/build-prosemirror.js | npx terser -c -m -o src/frontend-applications/agent-portal/modules/prosemirror/webapp/static/prosemirror.min.js"
}
```

---

## 💡 Best Practices

* ✅ Use `require()` instead of `import` (for Lasso compatibility)
* 🔁 Always run `npm run build-prosemirror` after modifying the build script
* 📝 Comment or log your additions in `build-prosemirror.js`
* 🔒 Let ProseMirror manage DOM, don't override it manually

---

## 🧪 Debugging Tips

```js
console.log('[PM modules]', Object.keys(window.PM));
console.log('[Schema]', window.PM.schema_custom || window.PM.schema_basic);
console.log('[Plugins]', view.state.plugins.map(p => p.key || '(anon)'));
```

---

## 🚧 Common Issues

| Problem                   | Likely Cause                                 |
| ------------------------- | -------------------------------------------- |
| `mount element not found` | Editor container not rendered / incorrect ID |
| Menu not visible          | Schema missing node types used in the menu   |
| Tables not working        | Table schema/plugins not registered          |
| No HTML emitted           | Missing `dispatchTransaction` implementation |

---

## 🧪 Testing

For quick sandbox tests, create a basic HTML + `prosemirror.min.js` page and try setups in isolation before integrating.

---

## 🔄 Version Control

It is recommended to **commit `prosemirror.min.js`** so other devs don't need to rebuild unless changes are made. Add a comment header if you prefer tracking minification:

```js
/*! Built with: npm run build-prosemirror */
```