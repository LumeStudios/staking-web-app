import { Address } from "../types/types";

const CHAIN_ID = process.env.CHAIN_ID as string

export function handleChainChanged(chainIdUsed: string, connectedTo: HTMLDivElement, connectButton: HTMLButtonElement) {
    if (chainIdUsed !== CHAIN_ID) {
        connectButton.classList.add('is-hidden');
        connectedTo.classList.remove('is-hidden');
        connectedTo.innerText = 'PLEASE CHANGE YOUR CHAIN TO THE MAINNET';
    } else {
        window.location.reload();
    }
}


export function handleAccountChanged(_account: Address) {
    if (_account !== '') {
        window.location.reload();
    }
}

export const checkEthereumInstalled = (): boolean => {
    if (!(window as any).ethereum) {
        return false;
    }

    return true
}
