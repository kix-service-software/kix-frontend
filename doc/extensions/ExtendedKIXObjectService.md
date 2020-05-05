***Layer: Webapplication (Browser)***

### Implementation
The `ExtendedKIXObjectService` implements the interface `IKIXObjectService` and has an default implementation for each method of the interface. The methods itself do not execute anything and always return **null**. You can overwrite a needed method and return a value which is required for you extension.
```typescript
export class MyObjectService extends ExtendedKIXObjectService {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
TicketService.getInstance().addExtendedService(new MyObjectService());
```

### Example
In this example the `getTreeNodes()` method is overwritten and has a specific implementation for a specific property. If its another property the method returns **null** and the default is used.
```typescript
export class MyObjectService extends ExtendedKIXObjectService {

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[];

        if (property === 'MyObjectProperty') {
            nodes = [
                new TreeNode('my-object-property', 'My Object Property')
            ];
        }

        return nodes;
    }

}
```