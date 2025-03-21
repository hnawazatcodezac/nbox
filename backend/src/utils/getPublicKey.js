const jwkToPem = require("jwk-to-pem");
const axios = require("axios");
const { configurations } = require("../config/config");

let publicKeyCache = null;

const getPublicKey = async (kid) => {
  if (publicKeyCache && publicKeyCache[kid]) return publicKeyCache[kid];

  const jwksUri = `${configurations.zitadelInstanceUrl}/oauth/v2/keys`;
  const response = await axios.get(jwksUri);

  const keys = response.data.keys;

  if (!keys || keys.length === 0) {
    throw new Error("No keys found in JWKS response");
  }

  const jwk = keys.find((key) => key?.kid === kid);
  if (!jwk) {
    throw new Error(`Key with kid ${kid} not found`);
  }
  const pem = jwkToPem(jwk);

  publicKeyCache = publicKeyCache || {};
  publicKeyCache[kid] = pem;

  return pem;
};

module.exports = getPublicKey;
