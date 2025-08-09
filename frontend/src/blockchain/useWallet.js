import { useCallback, useEffect, useState } from 'react';

export function useWallet() {
    const [walletAddress, setWalletAddress] = useState('');
    const [chainId, setChainId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const connect = useCallback(async () => {
        if (!window.ethereum) {
            throw new Error('No wallet provider found. Please install MetaMask.');
        }

        setIsConnecting(true);
        try {
            // Request account access - this will prompt user to select account if multiple exist
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please connect your wallet.');
            }

            const address = accounts[0];
            setWalletAddress(address);

            // Get current chain ID
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId'
            });
            setChainId(currentChainId);

            console.log('Wallet connected:', { address, chainId: currentChainId });
            return address;

        } catch (error) {
            console.error('Wallet connection error:', error);
            if (error.code === 4001) {
                throw new Error('User rejected wallet connection');
            } else if (error.code === -32002) {
                throw new Error('Wallet connection already in progress');
            } else {
                throw new Error(`Wallet connection failed: ${error.message}`);
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const ensureConnected = useCallback(async () => {
        // Always get the current active account, don't rely on cached state
        if (!window.ethereum) {
            throw new Error('No wallet provider found. Please install MetaMask.');
        }

        try {
            // Get current accounts without requesting access (won't prompt if already connected)
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts && accounts.length > 0) {
                const currentAddress = accounts[0];
                setWalletAddress(currentAddress);

                // Get current chain ID
                const currentChainId = await window.ethereum.request({
                    method: 'eth_chainId'
                });
                setChainId(currentChainId);

                return currentAddress;
            } else {
                // No accounts connected, need to request access
                return await connect();
            }
        } catch (error) {
            console.warn('Failed to check wallet status:', error);
            // If checking fails, try to connect fresh
            return await connect();
        }
    }, [connect]);

    // Solana/Phantom support removed — project uses MetaMask on Ethereum Sepolia only.

    // Function to force refresh wallet connection
    const refreshConnection = useCallback(async () => {
        setWalletAddress('');
        setChainId('');
        try {
            const address = await connect();
            return address;
        } catch (error) {
            console.error('Failed to refresh connection:', error);
            throw error;
        }
    }, [connect]);

    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            const address = accounts?.[0] || '';
            setWalletAddress(address);
            console.log('Accounts changed:', address);
        };

        const handleChainChanged = (chainId) => {
            setChainId(chainId);
            console.log('Chain changed:', chainId);
            // Reload page on chain change to ensure proper state
            window.location.reload();
        };

        const handleDisconnect = () => {
            setWalletAddress('');
            setChainId('');
            console.log('Wallet disconnected');
        };

        // Add event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);

        // Check if already connected
        const checkConnection = async () => {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    const currentChainId = await window.ethereum.request({
                        method: 'eth_chainId'
                    });
                    setChainId(currentChainId);
                }
            } catch (error) {
                console.warn('Failed to check initial wallet state:', error);
            }
        };

        checkConnection();

        // Cleanup
        return () => {
            try {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
                window.ethereum.removeListener('disconnect', handleDisconnect);
            } catch (error) {
                console.warn('Failed to remove wallet listeners:', error);
            }
        };
    }, []);

    return {
        walletAddress,
        chainId,
        isConnecting,
        connect,
        ensureConnected,
        refreshConnection,
        setWalletAddress
    };
}


