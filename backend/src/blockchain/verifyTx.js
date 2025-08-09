const axios = require('axios');

async function verifyTransactionOnPolygonscan(txHash, apiKey) {
    if (!txHash || !apiKey) return { ok: false, reason: 'missing_params' };
    try {
        const url = `https://api-testnet.polygonscan.com/api?module=transaction&action=getstatus&txhash=${txHash}&apikey=${apiKey}`;
        const { data } = await axios.get(url);
        const status = data?.result?.isError === '0';
        return { ok: !!status, raw: data };
    } catch (e) {
        return { ok: false, reason: 'request_failed' };
    }
}

module.exports = {
    verifyTransactionOnPolygonscan,
};


