***Layer: Webapplication (Browser)***

With this extension its possible to modify given table configurations from the TableFactory.

### Implementation
The `ExtendedTableFactory` provides the method `modifiyTableConfiguation`.
```typescript
export class ExtendedTicketTableFactory extends ExtendedTableFactory {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
const tableFactory = TableFactoryService.getInstance().getTableFactory<TicketTableFactory>(
    KIXObjectType.TICKET
);
if (tableFactory) {
    tableFactory.addExtendedTableFactory(new ExtendedTicketTableFactory());
}
```

### Example
In this example the `modifiyTableConfiguation()` method is overwritten and adds a new column before the given columns.
```typescript
export class ExtendedTicketTableFactory extends ExtendedTableFactory {

    public async modifiyTableConfiguation(
        tableConfiguration: TableConfiguration, useDefaultColumns: boolean
    ): Promise<void> {
        if (useDefaultColumns) {
            tableConfiguration.tableColumns = [
                new DefaultColumnConfiguration(
                    null, null, null, 'MyProperty', true, false, true, false, 135, true, true
                ),
                ...tableConfiguration.tableColumns
            ];
        }
    }

}
```