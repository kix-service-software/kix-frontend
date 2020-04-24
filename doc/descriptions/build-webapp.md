### Introduction
After frontend server is started the web application for the agent portal is build. In this process all components and static files are collected and bundled to a web application.

The web application is implemented with the [marko](https://markojs.com/) framework und and is bundled with the help of the framework [Lasso.js](https://github.com/lasso-js/lasso).

### Extension Implementation

To add components or other static files to the bundling process it is required to register on extension point `kix:modules` and implement a extension interface `IKIXModuleExtension`.

The extension requires to implement a property `webDependencies`. This property is an array of paths to folder where a `browser.json`-file is contained.

#### Example
``` javascript
class Extension /*...*/ {
// ...
public webDependencies: string[] = [
        './sysconfig/webapp'
];
// ...
}
```

### Dependencies with browser.json
These paths are inserted into the main `browser.json` of the application and will be loaded by `Lasso.js` while bundling the app.

![browser.json](static/module-structure-webapp.png)

The content of the `browser.json` contains the following:
```json
{
    "dependencies": [
        "./components",
        "require ./core",
        "some.js",
        "some.css"
    ]
}
```

There are different types of dependencies.
* **folder** *(this is a dependency for folder. The folder has to contains also a `browser.json`)*
* **require** *(this can require also a folder. The folder then has to contain a `index.ts` which exports the implementation)*
* **some.js** (requires a specific javascript file)
* **some.css** (requires a specific style sheet)

*For more information about dependencies see: https://github.com/lasso-js/lasso#dependencies*

After collecting all extensions the main `browser.json` contains a list with all needed depending `browser.json` files for the web application.

Example:
```json
{
    "dependencies": [
        "./style.less",
        "../../../../static/thirdparty/socket.io.js",
        "../../../../modules/admin/webapp",
        "../../../../modules/base-components/webapp",
        "../../../../modules/bulk/webapp",
        "../../../../modules/calendar/webapp",
        "../../../../modules/cmdb/webapp",
        "../../../../modules/customer/webapp",
        "../../../../modules/dynamic-fields/webapp",
        "../../../../modules/faq/webapp",
        "../../../../modules/general-catalog/webapp",
        "../../../../modules/home/webapp",
        "../../../../modules/icon/webapp",
        "../../../../modules/import/webapp",
        "../../../../modules/import-export/webapp",
        "../../../../modules/job/webapp",
        "../../../../modules/kanban/webapp",
        "../../../../modules/links/webapp",
        ...
        "../../../../modules/sysconfig/webapp",
        ...
    ]
}
```
