A KIX module represents a UI module which contains all the references for the UI components and businesslogic for a specific context. To register a new module you have to register and implement the extension point. A plugin can contain multiple `kix:modules` extensions.

Exmaple:

* Object Read Module (defines components & logic to display objects in the UI, e.g. tables, detail pages, label provider, services, search)
* Object Edit Module (defines components & logic to create or edit the object via UI, e.g. edit dialog, new dialog, bulk action)

## Registration
```json
{
    "name": "My-Plugin",
    "extensions": {
        "kix:modules": {
            "my-plugin-module": {
                "module": "my-plugin-module.extension"
            }
        }
    }
}
```

## Implementation - IKIXModuleExtension

| property        | description                                                                         | exmaple          |
| --------------- | ----------------------------------------------------------------------------------- | ---------------- |
| pluginId        | The id of the plugin where the extension is implemented.                            | MyPlugin         |
| applications    | An array of application ids where extension is used.                                | agent-portal     |
| id              | The id of the extension implementation itself                                       | my-plugin-module |
| initComponents  | An array of `UIComponent`. For more details see [Init-Components](#init-components) |                  |
| uiComponents    | An array of `UIComponent`.                                                          |                  |
| webDependencies | An array with paths to folder with `browser.json` files                             |                  |

Example:

```typescript
class Extension extends KIXExtension implements IKIXModuleExtension {

    public pluginId: string = 'MyPlugin';

    public applications: string[] = ['agent-portal'];

    public id = 'my-plugin-module';

    public initComponents: UIComponent[] = [
        new UIComponent('MyPluginUIModule', '/my-plugin$0/webapp/core/MyPluginUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('my-component', '/my-plugin$0/webapp/components/my-component', [])
    ];

    public webDependencies: string[] = [
        './MyPlugin/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};

```

### UIComponent
The `UIComponent` describes the tag name, the path and the needed permissions for the component. 
* The tag name is required to load the component via name for dynamic includes. 
* The path is needed to resolve and load the component in the browser context.
* The permissions are optional. If there are permissions defined and the user has insufficient rights then this component is not available for the user.

Examples:
```typescript
    new UIComponent('faq-read-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQReadUIModule', [
        new UIComponentPermission('faq/articles', [CRUD.READ])
    ]);
    new UIComponent('faq-edit-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQEditUIModule', [
        new UIComponentPermission('faq/articles', [CRUD.CREATE]),
        new UIComponentPermission('faq/articles/*', [CRUD.UPDATE])
    ]);
    new UIComponent('faq-admin-module-component', '/kix-module-faq$0/webapp/core/ui-modules/FAQAdminUIModule', [
        new UIComponentPermission('system/faq/categories', [CRUD.CREATE], true),
        new UIComponentPermission('system/faq/categories/*', [CRUD.UPDATE], true)
    ]);
```

## Init-Components
Init-Components are loaded at the initialization process of the wep application. The Init-Component is responsible to register bussinesslogic for the module, e.g. LabelProvider, Services, TableFactories and more.

### Implementation - IUIModule

It is **required** that the **name of the class is `UIModule`** and this class has to **implement the IUIModule**.

| property/function | description                                                                                                | exmaple          |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| name              | Name of the module.                                                                                        | MyPluginUIModule |
| priority          | The priority of this module. All modules are sorted and loaded by priority ascend.                         | 1000             |
| register()        | This method is called by the initialization process to register all the needed businesslog for the module. |                  |
| unRegister()      | not needed. (There is no unregister process at the moment)                                                 |                  |

Example:

```typescript
export class UIModule implements IUIModule {

    public name: string = 'MyPluginUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 1050;

    public async register(): Promise<void> {
        // ...
        TableFactoryService.getInstance().registerFactory(new MyObjectTableFactory());
        LabelService.getInstance().registerLabelProvider(new MyObjectLabelProvider());

        ServiceRegistry.registerServiceInstance(MyObjectService.getInstance());
        FactoryService.getInstance().registerFactory('MyObject', MyObjectBrowserFactory.getInstance());

        ServiceRegistry.registerServiceInstance(MyObjectFormService.getInstance());

        ContextService.getInstance().registerContext(new ContextDescriptor(/* ... */);
        ContextService.getInstance().registerContext(new ContextDescriptor(/* ... */);

        ActionFactory.getInstance().registerAction('my-object-create-action', MyObjectCreateAction);
        // ...
    }
}
```
