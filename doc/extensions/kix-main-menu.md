#### kix:menu:main

This extension point can be used to add a new main menu entry in the web application.

Pseudo Implementation

```javascript
                    export class Extension implements IMainMenuExtension {

                        public mainContextId: string = 'ExampleContextID';

                        public contextIds: string[] = ['ExampleContextID', 'ExampleContext2ID'];

                        public primaryMenu: boolean = true;

                        public icon: string = "kix-icon-example";

                        public text: string = "Translatable#Example Menu";

                    }
```

| Property      | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| mainContextId | the id of the context which should be loaded if the menus is clicked  |
| contextIds    | A list of context IDs where the menu item appears as active.          |
| primaryMenu   | show the entry in primare menu (`true`) or in secondary menu(`false`) |
| icon          | the name of the css class for the icon                                |
| text          | the display text for the menu entry                                   |