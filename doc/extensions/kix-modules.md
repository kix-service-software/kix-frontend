#### kix:modules

This extension can be used to register ui components (marko) which should be delivered with the web application to the browser.

Pseudo Code:
```javascript
class Extension implements IKIXModuleExtension {

                public initComponentId: string = 'my-module-component';

                public external: boolean = false;

                public tags: Array<[string, string]> = [
                    ['my-module-component', 'my-components/my-module-component'],
                    ['my-ui-component', 'my-components/my-ui-component']                 
                ];

}
```

| Property        | Description                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| initComponentId | This is the id of a component which is used for initialisation (e.g. services, registration of contexts and dialogs) in browser. |
| external        | set to true if the implementation is not contained in the base software (external NodeJS module)                                 |
| tags            | Map with the component id and the corresponding path to the component                                                            |