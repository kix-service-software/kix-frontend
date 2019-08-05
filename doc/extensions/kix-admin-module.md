#### kix:admin-module

This extension can be used to provide new catogories and modules for the administration in the web application.

Pseudo Code:

```javascript
class Extension implements IAdminModuleExtension {

                public getAdminModules(): AdminModuleCategory[] {
                    return [
                        new AdminModuleCategory(
                        null, 'my-admin-category', 'Translatable#My Category', null, [], [
                            new AdminModule(
                                null, 'my-module', 'Translatable#My Module', null,
                                'MyObject', 'my-admin-module-component-id'
                            )
                        ])
                    ];
                }

}
```