export type FetchState = 'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR';

export type ResultStatus = 'SUCCESS' | 'ERROR';

export interface Result<T = null> {
    status: ResultStatus;
    data?: T;
    error?: string;
};
