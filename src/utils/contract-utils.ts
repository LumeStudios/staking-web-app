import { default as Web3 } from 'web3'
import { Address } from "../types/types";
import { AbiItem } from 'web3-utils'
import ABI from '../contracts/ABI.json'
import ABIunity from '../contracts/ABI55Unity.json'
import ABI_TOXIC_POWER from '../contracts/ABI_TOXIC_POWER.json'
import ABI_CLAIM_CONTRACT from '../contracts/ABI_CLAIM_CONTRACT.json'

const web3 = new Web3(Web3.givenProvider);

const CONTRACT_ADDRESS_TOKEN = process.env.CONTRACT_ADDRESS_TOKEN as string
const CONTRACT_ADDRESS_55 = process.env.CONTRACT_ADDRESS_55 as string
const CONTRACT_ADDRESS_TOXIC_POWER = process.env.CONTRACT_ADDRESS_TOXIC_POWER as string
const CONTRACT_ADDRESS_CLAIM = process.env.CONTRACT_ADDRESS_CLAIM as string;

const contractToken = new web3.eth.Contract(ABI as AbiItem[], CONTRACT_ADDRESS_TOKEN);
const contract55 = new web3.eth.Contract(ABIunity as AbiItem[], CONTRACT_ADDRESS_55);
const contractToxicPower = new web3.eth.Contract(ABI_TOXIC_POWER as AbiItem[], CONTRACT_ADDRESS_TOXIC_POWER)
const contractClaim = new web3.eth.Contract(ABI_CLAIM_CONTRACT as AbiItem[], CONTRACT_ADDRESS_CLAIM)

export const getTotalClaimable = async (address: Address) => {
    try {
        return await contractToken.methods
            .getTotalClaimable(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const getBalanceOf = async (address: Address) => {
    try {
        return await contractToken.methods
            .balanceOf(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const getLastUpdate = async (address: Address) => {
    try {
        return await contractToken.methods
            .lastUpdate(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const getStakedBalance = async (address: Address) => {
    try {
        return await contractToken.methods
            .stakedBalance(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const getWalletOfOwner = async (address: Address) => {
    try {
        return await contract55.methods
            .walletOfOwner(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const getToxicPowerBalanceFromContract = async (address: Address): Promise<Array<string>> => {

    let balanceQuantities = [];

    const array = [0, 1, 2]
    try {
        for (let item of array) {
            const balance = await contractToxicPower.methods.balanceOf(address, item).call()
            balanceQuantities.push(balance)
        }
    } catch (error) {
        console.log(error)
    }
    return balanceQuantities
}

export const claim = async (address: Address) => {
    try {
        return contractToken.methods.claim().send({
            from: address,
            to: CONTRACT_ADDRESS_TOKEN
        })
    } catch (error) {
        console.log(error)
    }
}

export const stake = async (address: Address, quantityToStake: number) => {
    try {
        return contractToken.methods.stake(quantityToStake).send({
            from: address,
            to: CONTRACT_ADDRESS_TOKEN
        })
    } catch (error) {
        console.log(error)
    }
}

export const burn = async (address: Address, arrayToBurn: number[]) => {
    try {
        return contractToxicPower.methods.burn(arrayToBurn).send({
            from: address,
            to: CONTRACT_ADDRESS_TOXIC_POWER
        })
    } catch (error) {
        console.log(error)
    }
}

export const claimRewardFromContract = async (address: Address, v: string, r: string, s: string, id: number, amountToClaim: number) => {
    try {
        console.log(address, v, r, s, id, amountToClaim)
        return contractClaim.methods.claim(id, amountToClaim, v, r, s).send({
            from: address,
            to: CONTRACT_ADDRESS_CLAIM
        })
    } catch (error) {
        console.log(error)
    }
}

export const convertBalance = async (address: Address, balance: string) => {
    try {
        console.log('balance', balance)
        return contractToken.methods.burn(balance).send({
            from: address,
            to: CONTRACT_ADDRESS_TOKEN
        })
    } catch (error) {
        console.log(error)
    }
}

