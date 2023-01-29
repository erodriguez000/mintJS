import { AuthRequest, Compare, CompareStatement, Key, SQL, SQLPatch, Token, WebSocketURL } from "../types";
import WebSocket = require("ws");
export default class MintDB {
    url: string;
    subscriptions: string[];
    ws: WebSocket | null;
    constructor(url: string = "", subscriptions: string[] = []) {
        this.url = url;
        this.subscriptions = subscriptions;
        this.ws = null;
    }
    async signup(username: string, password: string): Promise<Token> {
        const endpoint = "/auth";
        const data: AuthRequest = {
            event: "signup",
            username,
            password
        };
        return await this.httpRequest(data, endpoint);
    }
    async signin(username: string, password: string): Promise<Token> {
        const endpoint = "/auth";
        const data: AuthRequest = {
            event: "signin",
            username,
            password
        };
        return await this.httpRequest(data, endpoint);
    }
    async signout(username: string): Promise<string|undefined> {
        const endpoint = "/auth";
        const data: AuthRequest = {
            event: "signout",
            username,
            password: "",
        };
        return await this.httpRequest(data, endpoint);
    }
    async registerWebSocket(): Promise<WebSocketURL> {
        const data = {
            user_id: 1,
        }
        const res = await fetch(this.url + "/register", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
    async listen() {
        const { url } = await this.registerWebSocket();
        this.ws = new WebSocket(url);
    }
    async on(subscriptions: string[] = [], callback: (ev: MessageEvent<any>) => void) {
        const { url } = await this.registerWebSocket();
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
            if (this.ws) {
                subscriptions.forEach((s) => this.addSubscription(s));
                this.ws.onmessage = () => callback;
            }
        }
    }
    addSubscription(sub: string) {
        this.subscriptions.push(sub);
        this.updateSubcriptionList();
    }
    removeSubscription(subscription: string) {
        this.subscriptions = this.subscriptions.filter(sub => sub !== subscription);
        this.updateSubcriptionList();
    }

    private updateSubcriptionList() {
        const data = {
          "topics": this.subscriptions
        }
        this.ws?.send(JSON.stringify(data));
    }
    closeWS() {
        this.ws?.close(1000, "User Disconnect");
    }
    async publish(topic: string, userId: number, msg: string) {
        const data = { topic, user_id: userId, msg };
        const res = await fetch(this.url + "/publish", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
    async getTableList(): Promise<string[]> {
        const data = {
            stmt: "INFO",
            tb: "",
            doc: "",
            data: {},
            topic: "",
            user_id: 1,
            message: "" 
        }
        return await this.httpRequest(data); 
    }
    async addTable(table: string) {
        const data = {
            stmt: "ADD",
            tb: table,
            doc: "",
            data: {},
            topic: "",
            user_id: 1,
            message: ""    
        };
        return await this.httpRequest(data); 
    }

    async addDoc(table: string, document: string, docData: Record<string, any>): Promise<Record<string, any>> {
        const data = {
            stmt: "CREATE",
            tb: table,
            doc: document,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async merge(table: string, document: string, docData: Record<string, any>): Promise<Record<string, any>> {
        const data = {
            stmt: "MERGE",
            tb: table,
            doc: document,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async push(table: string, document: string, docData: SQLPatch): Promise<Record<string, any>> {
        const data = {
            stmt: "PUSH",
            tb: table,
            doc: document,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async put(table: string, document: string, docData: SQLPatch): Promise<Record<string, any>> {
        const data = {
            stmt: "PUT",
            tb: table,
            doc: document,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async getOne(table: string, document: string): Promise<Record<string, any>> {
        const data = {
            stmt: "SELECT",
            tb: table,
            doc: document,
            data: {},
            topic: "",
            user_id: 1,
            message: ""    
        };
        return await this.httpRequest(data);
    }
    async getAll(table: string): Promise<Record<string, any>[]> {
        const data = {
            opts: "",
            sql: "",
            data: {},
            stmt: "SELECT",
            tb: table,
            doc: "*",
            topic: "",
            user_id: 1,
            message: ""    
        };
        return await this.httpRequest(data);
    }

    async find(table: string, search: Record<string, any>): Promise<Record<string, any>[]> {
        // filters = {"city": "Clearwater"}
        const data: SQL = {
            stmt: "FIND",
            tb: table,
            doc: "",
            data: search,
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async match(table: string, search: Record<string, any>): Promise<Record<string, any>[]> {
        // filters = {"city": "Clearwater"}
        const data: SQL = {
            stmt: "MATCH",
            tb: table,
            doc: "",
            data: search,
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async where(table: string, search: Compare): Promise<Record<string, any>[]> {
        const data: CompareStatement = {
            stmt: "COMPARE",
            tb: table,
            doc: "",
            data: search,
            topic: "",
            user_id: 1,
            message: ""
        }
        return await this.httpRequest(data);
    }
    async deleteKey(table: string, document: string, key: Key): Promise<Record<string, any>> {
        const data = {
            stmt: "DELETE",
            tb: table,
            doc: document,
            data: key,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async deleteDocument(table: string, document: string): Promise<Record<string, any>> {
        const data = {
            stmt: "DELETE",
            tb: table,
            doc: document,
            data: {},
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async deleteKeyFromTable(table: string, key: string): Promise<string> {
        const data = {
            stmt: "DELETE",
            tb: table,
            doc: "*",
            data: { key },
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async addEdge(table: string, document: string, relationTb: string, relationDocument: string, relationship: string): Promise<Record<string, any>> {
        const data: SQL = {
            stmt: "REL",
            tb: table,
            doc: document,
            data: {
                rel_tb: relationTb,
                rel_doc: relationDocument,
                rel: relationship
            },
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async bfs(table: string, document: string, relation: string, targetDocument: string): Promise<Record<string,any>> {
        const data: SQL = {
            stmt: "BFS",
            tb: table,
            data: {
                target_doc: targetDocument,
                rel: relation
            },
            doc: "",
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async dfs(table: string, document: string, relationship: string, targetDocument: string): Promise<Record<string,any>> {
        const data: SQL = {
            stmt: "DFS",
            tb: table,
            doc: document,
            data: {
                target_doc: targetDocument,
                rel: relationship
            },
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async customSql(data: SQL) {
        const res = await this.httpRequest(data);
        return JSON.stringify(res);
    }
    private async httpRequest(data = {}, endpoint = "/sql"): Promise<any> {
        const res = await fetch(this.url + endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${""}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
}