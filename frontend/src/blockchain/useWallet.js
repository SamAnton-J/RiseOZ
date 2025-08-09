import { useCallback, useEffect, useState } from 'react';

export function useWallet() {
    const [walletAddress, setWalletAddress] = useState('');
    const [chainId, setChainId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const connect = useCallback(async () => {
        if (!window.ethereum) {
            throw new Error('No wallet provider found');
        }
        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletAddress(accounts?.[0] || '');
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(currentChainId);
            return accounts?.[0] || '';
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const ensureConnected = useCallback(async () => {
        if (walletAddress) return walletAddress;
        return await connect();
    }, [walletAddress, connect]);

    const connectPhantom = useCallback(async () => {
        const provider = window.solana;
        if (!provider || !provider.isPhantom) {
            throw new Error('Phantom not found');
        }
        setIsConnecting(true);
        try {
            const resp = await provider.connect();
            const addr = resp?.publicKey?.toString?.() || '';
            setWalletAddress(addr);
            return addr;
        } finally {
            setIsConnecting(false);
        }
    }, []);

    useEffect(() => {
        if (!window.ethereum) return;
        const handler = (accounts) => setWalletAddress(accounts?.[0] || '');
        const chainHandler = (cid) => setChainId(cid);
        window.ethereum.on('accountsChanged', handler);
        window.ethereum.on('chainChanged', chainHandler);
        return () => {
            try {
                window.ethereum.removeListener('accountsChanged', handler);
                window.ethereum.removeListener('chainChanged', chainHandler);
            } catch { }
        };
    }, []);

    return { walletAddress, chainId, isConnecting, connect, connectPhantom, ensureConnected, setWalletAddress };
}


