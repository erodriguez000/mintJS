export interface SQL {
    stmt: string,
    tb: string,
    doc: string,
    data: Record<string, any>,
    topic: string,
    user_id?: number,
    message: string,
}
export interface SQLPatch extends SQL {
    data: KeyValue,
}

export interface KeyValue {
    key: string,
    value: any,
}
export interface Key {
    key: string,
}

export interface CompareStatement extends SQL {
    data: Compare,
}
export interface Compare {
    lhs: string,
    op: string,
    rhs: any,
}

export type ResponseArray = Record<string, any>[]
export type ResponseObject = Record<string, any>
export interface Token {
    code: number,
    status: string,
    token: string,
}

export interface WebSocketURL {
    url: string,
}

export interface AuthRequest {
    event: string,
    username: string,
    password: string,
}