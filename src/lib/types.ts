export type FetchState = 'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR';

export type ResultStatus = 'SUCCESS' | 'ERROR';

export type Result =
    | { status: 'SUCCESS'; data?: any }
    | { status: 'ERROR'; error: string }; 
