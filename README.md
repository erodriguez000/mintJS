<p align="center">
    <img width="400" src="img/logo-light.svg#gh-light-mode-only" alt="mintDB Logo">
    <img width="400" src="img/logo.svg#gh-dark-mode-only" alt="mintDB Logo">
</p>
<h2 align="center">A TypeScript SDK for mintDB</h2>
<p align="center">
    <img src="https://img.shields.io/badge/version-0.1.0beta-10d99d">
    <img src="https://img.shields.io/badge/built_with-TS-1079d9">
    <img src="https://img.shields.io/badge/license-MIT-critical">
    <a href="https://www.linkedin.com/in/eric-rodriguez-3a402811b/"><img src="https://img.shields.io/badge/linkedIn-connect-4777AF"></a>
</p>

mintDB JS is a typescript SDK for the [mintDB](https://github.com/erodriguez000/mintdb) database

# Get Started
```sh
npm install mintdb-js
```
# Create

```ts
import MintDB from "mintdb-js";

const mint = new MintDB("http://127.0.0.1:8000");

// returns document or error if document exists
const createDocument = async () => {
    const table = "person";
    const document = "person:1";
    const data = {
        name: "Lucy",
        city: "Miami",
        state: "FL"
    };
    const res: Record<string, any> = await mint.addDoc(table, document, data);
};

// returns error or string confirmation
const createTable = async () => {
    const table = "car";
    const res: string = await mint.addTable(table);
};

```

# Read
```ts
import MintDB from "mintdb-js";

const mint = new MintDB("http://127.0.0.1:8000");

// Returns error or document
const fetchDocument = async () => {
    const table = "person";
    const document = "person:1";
    const res: Record<string, any> = await mint.getOne(table, document);
};
// returns Array of documents or error
const fetchAllTableDocuments = async () => {
    const table = "person";
    const res: Record<string, any>[] = await mint.getAll(table);
};
// Results match year OR state
const findTableDocuments =  async () => {
    const table = "car";
    const search = {
        year: 2024,
        state: "FL"
    };
    let res: Record<string, any>[] = await mint.find(table, search);
};
// Results match year AND state
const matchTableDocuments =  async () => {
    const table = "car";
    const search = {
        year: 2024,
        state: "FL"
    };
    let res: Record<string, any>[] = await mint.match(table, search);
};

// Compare with "==", "!=", ">=", ">", "<=" "<", "contains" (case sensitive), "icontains"
const compareDocuments = async () => {
    const table = "car";
    const search: CompareStatement = {
        lhs: "model",
        op: "icontains",
        rhs: "amg"
    };
    let res: Record<string, any>[] = await mint.where(table, "model", "icontains", "amg");
}
```
# Update

Returns modified document or error.
```ts
import MintDB from "mintdb-js";

const mint = new MintDB("http://127.0.0.1:8000");

// Merges all key value pairs
const mergeDocument = async () => {
    const table = "car";
    const document = "car:1";
    const data: Record<string, any> =  {
        city: "Tampa",
        state: "FL",
    };
    let res: Record<string, any> = await mint.merge(table, document, data);
}

// Puts a kv pair in specified document. Will create table and document if they do not exist.
const putKVPair = async () => {
    const table = "car";
    const document = "car:1";

    let res: Record<string, any> = await mint.put(table, document, "owner", "person:1");
}

// Pushes a value to a key that is an array. If the key value is not an array, an error will be thrown.
const pushValue = async () => {
    const table = "car";
    const document = "car:1";

    let res: Record<string, any> = await mint.push(table, document, "parts", "Engine");
}
```

# Delete

Returns the deleted document or error

```ts
import MintDB from "mintdb-js";

const mint = new MintDB("http://127.0.0.1:8000");

// Returns deleted document or error if document does not exist
const deleteDocument = async () => {
    const table = "car";
    const document = "car:4";

    let res: Record<string, any> = await mint.deleteDocument(table, document);
}
// Returns modified document or error if document does not exist
const deleteKeyFromDocument = async () => {
    const table = "car";
    const document = "car:4";
    const key = "owner"

    let res: Record<string, any> = await mint.deleteKey(table, document, key);
}

// Returns string confirmation of delete or error
const deleteKeyFromTable = async () => {
    const table = "car";
    const document = "*";
    const key = "owner"
    let res: string = await mint.deleteKeyFromTable(table, key);
}
```

# Websocket Connection

Connect the websocket to listen to real time mutations on a table, document, or key in a document.

```ts
import MintDB from "mintdb-js";

const mint = new MintDB("http://127.0.0.1:8000");

// Listens for mutations to:
// "person" - any mutations to documents in the person table
// "car:1" - any mutations to the document with id "car:1"
// "car:2:parts": - any mutations to the parts key in document with id "car:2"
const listenOn = async () => {
    const sub = ["person", "car:1", "car:2:parts"]
    const callback = (ev: MessageEvent<any>) => {
        console.log(ev);
    }
    await mint.on(sub, callback);
}

// Close Websocket connection
mint.closeWS();

// Add a subscription for real time events
const addSub = (sub: string) => {
    mint.addSubscription(sub);
}
// remove a subscription
const removeSub = (sub: string) => {
    mint.removeSubscription(sub);
}
```

# Graph

Add edges and search with BFS and DFS
```ts
import MintDB from "mintdb-js";

const mint = new MintDB("http://127.0.0.1:8000");

// Adds an edge to a document, returns string confirmation or error
const addEdge = async () => {
    const table = "person";
    const document = "person:1";
    const ref_tb = "person";
    const ref_doc: "person:2";
    const rel = "like";
    let res: string = await mint.addEdge(table, document, ref_tb, ref_doc, rel);
}

// Returns the first record containing the target doc
const dfs = async () => {
    const table = "person";
    const document = "person:1";
    const target_doc: "person:2";
    const rel = "like";
    let res: Record<string,any> = await mint.dfs(table, document, rel, target_doc);
}
// Returns the first record containing the target doc
const bfs = async () => {
    const table = "person";
    const document = "person:1";
    const target_doc: "person:2";
    const rel = "like";
    let res: Record<string,any> = await mint.bfs(table, document, rel, target_doc);
}
```
