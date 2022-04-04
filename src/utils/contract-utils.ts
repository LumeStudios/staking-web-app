import web3 from 'web3'
import { Address } from "../types/types";
import { Contract } from 'web3-eth-contract'

export const getTotalClaimable = async (address: Address, contract: Contract) => {
    try {
        return await contract.methods
            .getTotalClaimable(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const balanceOf = async (address: Address, contract: Contract) => {
    try {
        return await contract.methods
            .balanceOf(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const lastUpdate = async (address: Address, contract: Contract) => {
    try {
        return await contract.methods
            .lastUpdate(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const stakedBalance = async (address: Address, contract: Contract) => {
    try {
        return await contract.methods
            .stakedBalance(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const walletOfOwner = async (address: Address, contract: Contract) => {
    try {
        return await contract.methods
            .walletOfOwner(address)
            .call()

    } catch (error) {
        console.log(error)
    }
}

export const claim = async (address: Address, contract: Contract) => {
    try {
        return await contract.methods
            .claim()
            .send({
                from: address,
                to: contract
            })

    } catch (error) {
        console.log(error)
    }
}

