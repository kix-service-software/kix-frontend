/* eslint-disable max-lines-per-function */
let kixObjectSocket;

function initKIXObjectSocket() {
    const options = {
        path: '/socket.io',
        withCredentials: true,
        closeOnBeforeunload: false,
        extraHeaders: {
            'tokenPrefix': ''
        }
    };

    kixObjectSocket = io('http://localhost:3000/kixobjects', options);

    kixObjectSocket.on('connect', () => {
        console.log('connected to kix objects namespace');
    });
}

function loadObjects(objectType, objectIds, loadingOptions, clientRequestId) {

    const requestId = Date.now();

    const requestObject = {
        requestId,
        clientRequestId,
        objectType,
        objectIds,
        loadingOptions
    };

    const start = Date.now();

    return new Promise((resolve, reject) => {
        kixObjectSocket.on('LOAD_OBJECTS_FINISHED', (result) => {
            if (result.requestId === requestId) {

                const end = Date.now();

                console.log('LOAD OBJECTS success!');

                const tableBody = document.getElementById('request-table-body');
                if (tableBody) {
                    const row = document.createElement('tr');
                    tableBody.appendChild(row);

                    const requestIdCell = document.createElement('td');
                    requestIdCell.innerText = requestId;
                    row.appendChild(requestIdCell);

                    const clientRequestIdCell = document.createElement('td');
                    clientRequestIdCell.innerText = clientRequestId;
                    row.appendChild(clientRequestIdCell);

                    const objectTypeCell = document.createElement('td');
                    objectTypeCell.innerText = objectType;
                    row.appendChild(objectTypeCell);

                    const objectIdsCell = document.createElement('td');
                    objectIdsCell.innerText = Array.isArray(objectIds) ? objectIds.join(', ') : '';
                    row.appendChild(objectIdsCell);

                    const loadingOptionsCell = document.createElement('td');
                    loadingOptionsCell.innerText = JSON.stringify(loadingOptions);
                    row.appendChild(loadingOptionsCell);

                    const startCell = document.createElement('td');
                    const startDate = new Date(start);
                    startCell.innerText = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
                    row.appendChild(startCell);

                    const endCell = document.createElement('td');
                    const endDate = new Date(end);
                    endCell.innerText = `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
                    row.appendChild(endCell);

                    const durationCell = document.createElement('td');
                    durationCell.innerText = end - start;
                    durationCell.classList.add('text-end');
                    row.appendChild(durationCell);

                    const resultCell = document.createElement('td');
                    resultCell.innerText = result.objects.length + ' Objects';
                    row.appendChild(resultCell);
                }

                resolve(result.objects);
            }
        });

        kixObjectSocket.on('ERROR', (result) => {
            if (result.requestId === requestId) {
                console.log('LOAD OBJECTS ERROR!');
                reject();
            }
        });

        kixObjectSocket.emit('LOAD_OBJECTS', requestObject);
    });

}