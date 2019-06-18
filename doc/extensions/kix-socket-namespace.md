#### kix:socket:namespace

This extension can be used to add a new namespace (socket event handler) for the socket communication (see: [Socket.io](https://socket.io/docs/rooms-and-namespaces/)). 

Pseudo implementation:

```javascript
export class ExampleNamespace extends SocketNameSpace {

                    protected getNamespace(): string {
                        return 'exampleNamespace';
                    }

                    protected registerEvents(client: Socket): void {
                        this.registerEventHandler(
                            client, 'ExampleEventID', this.handleExampleEvent.bind(this)
                        );
                    }

                    private async handleExampleEvent(data: ISocketRequest): Promise<SocketResponse<ISocketResponse>> {
                        const response = ...;
                        return new SocketResponse('ExampleEventIDFinished', response);
                    }

}
```

A list of existing namespaces can be found under [Socket Namespaces](#socket_namespaces).
