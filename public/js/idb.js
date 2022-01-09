//Create variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', {autoIncrement:  true});
};

//Once successful
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.online) {
        uploadTransaction();
    }
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //accesses the object store
    const budgetObjectStore = transaction.objectStore('new_transaction');

    budgetObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                //open another transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const budgetObjectStore = transaction.objectStore('new_transaction');

                budgetObjectStore.clear();

                alert('All saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

window.addEventListener('online', uploadTransaction);