### Structure of UI Module

<ul>
<li><b>root directory (name of the ui module)</b></li>
  <ul>
    <li>package.json</li>
    <li><i>... extension implementations</i></li>
    <li><b>model</b></li>
    <li><b>server</b></li>
    <li><b>webapp</b></li>
      <ul>
        <li><b>components</b></li>
        <li><b>core</b></li>
        <li>browser.json</li>
        <li>marko.json</li>
      </ul>
  </ul>
</ul>

#### package.json

Contains the name and the extension declaration of the ui module.
```typescript
{
    "name": "kix-module-admin",
    "extensions": {
        ...
    }
}
```

#### model
Contains the data model of the ui module.

#### server
Contains the server side code of the ui module.

#### webapp
Contains the web application code of the ui module. 
##### components
Contains the ui components of the ui module.
##### core
Contains the core implentations of the ui module, e.g. `KIXObjectService`, `TableFactory`, `LabelProvider`.
##### browser.json
The dependencies of the ui module which should be delivered to browser. *(see: `Dependencies with browser.json`)*
##### marko.json
Import dependencies for marko components.