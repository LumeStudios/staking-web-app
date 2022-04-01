import { AxiosResponse } from "axios"
import { Contract } from 'web3-eth-contract'

export type Token = number;

export type Tokens = Array<number>

export type DataTokens = {
    data: {
        tokens: Tokens
    }
}

export type DataTokensFromDb = {
    data: {
        tokens: TokensFromDb
    }
}

export type Address = string

export type ProjectId = string

export type ApiResult<T> = Promise<AxiosResponse<T> | undefined>

export type TokensFromDb = {
    imageUrl: string,
    rank: string,
    score: string,
}

export type TokenFromContract = Array<string>

export type ToxicBalance = {
    balanceOne: number,
    balanceTwo: number,
    balanceThree: number
}
