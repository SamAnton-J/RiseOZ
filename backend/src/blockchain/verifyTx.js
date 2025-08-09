const axios = require('axios');

// Verifies a transaction hash on Etherscan Sepolia. Returns { ok, raw | reason }
async function verifyTransactionOnEtherscanSepolia(txHash, apiKey) {
    if (!txHash || !apiKey) return { ok: false, reason: 'missing_params' };
    try {
        const url = `https://api-sepolia.etherscan.io/api?module=transaction&action=getstatus&txhash=${txHash}&apikey=${apiKey}`;
        const { data } = await axios.get(url);
        const status = data?.result?.isError === '0';
        return { ok: !!status, raw: data };
    } catch (e) {
        return { ok: false, reason: 'request_failed' };
    }
}

module.exports = {
    verifyTransactionOnEtherscanSepolia,
};


