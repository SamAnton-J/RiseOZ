// Placeholder for blockchain helpers if needed later (signatures, fee config, etc.)
module.exports = {
    getAdminWallet: () => process.env.ADMIN_WALLET_ADDRESS || '',
    getPlatformFeeEth: () => process.env.PLATFORM_FEE_ETH || '0.001',
};


