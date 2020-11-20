A context is container which load and hold objects which can be used by components. There are two different types of contexts.
* MainContext (general pages in agent portal, e.g. Ticket Dashboard, Ticket Details, CMDB Dashboard)
* DialogContext (dialogs in agent portal, e.g. New Ticket Dialog, Edit Ticket Dialog)

On the otherside the context needs a configuration which pretend which components are available at this context. This configuration contains different lists:
* explorer
* sidebars
* content
* lanes
* overlays
* others
* dialogs

A context has to be registered with a `ContextDescriptor` in the application via a `UIModule` (see [Init Components](#init-components)).

```typescript
ContextService.getInstance().registerContext(new ContextDescriptor(/* ... */);
```

#### ContextDescriptor
| parameter      | description                                                                             | exmaple                |
| -------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| contextId      | The id of the context (same as the configurationId of the context configuration)        | `ticket-details`       |
| kixObjectTypes | An array of supported object types for the context                                      | `['Ticket']`           |
| contextType    | The `ContextType` of the context                                                        | `MAIN`                 |
| contextMode    | The `ContextMode` of the context                                                        | `DETAILS`              |
| componentId    | The id (tag name) of the main context component                                         | `object-details`       |
| urlPaths       | An array with relativ paths for the context. Required to join a context via browser url | `['tickets']`          |
| contextClass   | The constructor of the context class implementation                                     | `TicketDetailsContext` |

```typescript
export class ContextDescriptor {

    public constructor(
        public contextId: string,
        public kixObjectTypes: Array<KIXObjectType | string>,
        public contextType: ContextType,
        public contextMode: ContextMode,
        public componentId: string,
        public urlPaths: string[],
        public contextClass: new (
            descriptor: ContextDescriptor, objectId: string | number, configuration: ContextConfiguration
        ) => Context
    ) { }

    public isContextFor(kixObjectType: KIXObjectType | string): boolean {
        return this.kixObjectTypes.some((t) => t === kixObjectType);
    }

}
```

##### Exmaple
```typescript
const ticketDetailsContextDescriptor = new ContextDescriptor(
        TicketDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
        ContextType.MAIN, ContextMode.DETAILS,
        true, 'object-details-page', ['tickets'], TicketDetailsContext
    );
    ContextService.getInstance().registerContext(ticketDetailsContextDescriptor);
```

### Functionality

If a page should be shown in the agent portal the context is always the required base for it. The application loads the context and its configuration from the configuration cache The component which is defined in the `ContextDescriptor` is loaded and included in the web application content area. After the configuration is loaded the context get initialized and the context is now responsible to load objects or execute other needed functionality.

Components can register a listener on the context to get notified about changes to update theirself.

The main application reacts on the context changing and updates the main template. The explorer and the sidebar also reacts on this change and load the components from the context configuration.

![Context](static/ticket-details.png)
