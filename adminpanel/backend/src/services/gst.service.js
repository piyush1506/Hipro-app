// Hipro Core GSTIN Verification Service (NIC E-Invoice / E-Way Bill Integration)
const axios = require('axios');
const crypto = require('crypto');

// Indian State Codes mapping as per GST Council
const GST_STATE_CODES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction'
};

const TAXPAYER_TYPE_MAP = {
  'REG': 'Regular',
  'COMP': 'Composition',
  'SEZ': 'SEZ Unit / Developer',
  'ISD': 'Input Service Distributor',
  'CAS': 'Casual Taxable Person',
  'NON': 'Non-Resident Taxable Person',
  'UN': 'UN Body / Embassy'
};

const STATUS_MAP = {
  'ACT': { label: 'Active', active: true, color: 'emerald' },
  'CNL': { label: 'Cancelled', active: false, color: 'rose' },
  'INA': { label: 'Inactive', active: false, color: 'amber' },
  'PRO': { label: 'Provisional', active: false, color: 'blue' }
};

class GSTService {
  /**
   * Validate standard 15-character Indian GSTIN format
   * Structure: 2 digits (state code) + 10 alphanumeric (PAN) + 1 alphanumeric (entity number) + 'Z' + 1 checksum digit/char
   */
  validateGSTINFormat(gstin) {
    if (!gstin || typeof gstin !== 'string') {
      return { valid: false, message: 'GSTIN number is required.' };
    }
    const clean = gstin.trim().toUpperCase();
    if (clean.length !== 15) {
      return { valid: false, message: `GSTIN must be exactly 15 characters long (received ${clean.length}).` };
    }
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(clean)) {
      return { valid: false, message: 'Invalid GSTIN structure. Expected format: 22AAAAA0000A1Z5.' };
    }

    const stateCode = clean.substring(0, 2);
    if (!GST_STATE_CODES[stateCode]) {
      return { valid: false, message: `Invalid GST state code prefix: "${stateCode}".` };
    }

    const pan = clean.substring(2, 12);
    return { valid: true, gstin: clean, stateCode, stateName: GST_STATE_CODES[stateCode], pan };
  }

  /**
   * Build clean readable address from NIC address components
   */
  formatAddress(d) {
    if (!d) return '';
    const parts = [
      d.AddrFlno,
      d.AddrBno,
      d.AddrBnm,
      d.AddrSt,
      d.AddrLoc,
      d.AddrPncd ? `PIN: ${d.AddrPncd}` : null
    ].filter(Boolean).map(s => String(s).trim());
    return parts.join(', ');
  }

  /**
   * Decrypt AES-256 encrypted payload or decode base64
   * In NIC E-Invoice:
   * Data is encrypted with Sek (Symmetric Encryption Key) using AES-256-ECB PKCS5/PKCS7 padding
   */
  decryptData(encodedData, sekKey) {
    if (!encodedData) return null;

    // 1. If already parsed object
    if (typeof encodedData === 'object') return encodedData;

    // 2. Try direct Base64 decode to JSON string
    try {
      const decodedUtf8 = Buffer.from(encodedData, 'base64').toString('utf8');
      if (decodedUtf8.trim().startsWith('{') || decodedUtf8.trim().startsWith('[')) {
        return JSON.parse(decodedUtf8);
      }
    } catch (e) {
      // not direct base64 json, continue to decrypt
    }

    // 3. Try AES-256 Decryption with Sek if available
    const keyString = sekKey || process.env.GST_SEK;
    if (keyString) {
      try {
        let keyBuffer;
        if (keyString.length === 32) {
          keyBuffer = Buffer.from(keyString, 'utf8');
        } else {
          keyBuffer = Buffer.from(keyString, 'base64');
        }

        // Try AES-256-ECB (Standard NIC encryption)
        try {
          const decipher = crypto.createDecipheriv('aes-256-ecb', keyBuffer, null);
          decipher.setAutoPadding(true);
          let decrypted = decipher.update(encodedData, 'base64', 'utf8');
          decrypted += decipher.final('utf8');
          return JSON.parse(decrypted);
        } catch (ecbErr) {
          // If ECB fails, try AES-256-CBC with zero IV
          const iv = Buffer.alloc(16, 0);
          const cbcDecipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
          cbcDecipher.setAutoPadding(true);
          let decryptedCbc = cbcDecipher.update(encodedData, 'base64', 'utf8');
          decryptedCbc += cbcDecipher.final('utf8');
          return JSON.parse(decryptedCbc);
        }
      } catch (decryptErr) {
        console.warn('[GST Service] SEK Decryption attempt failed:', decryptErr.message);
      }
    }

    // Fallback: Return raw string if JSON parsing was impossible
    return encodedData;
  }

  /**
   * Decode error details from NIC response
   */
  decodeErrorDetails(errorDetails) {
    if (!errorDetails) return null;
    if (typeof errorDetails === 'object') return errorDetails;

    try {
      const decoded = Buffer.from(errorDetails, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e) {
      return { raw: errorDetails };
    }
  }

  /**
   * Generates a realistic mock/sandbox dataset for development and preview
   * when live government sandbox credentials are not yet entered in .env.
   */
  getSimulatedGSTDetails(gstin) {
    const stateCode = gstin.substring(0, 2);
    const pan = gstin.substring(2, 12);
    const stateName = GST_STATE_CODES[stateCode] || 'Rajasthan';

    return {
      Gstin: gstin,
      TradeName: `Registered Enterprise (${pan})`,
      LegalName: `Proprietor / Taxpayer (${pan})`,
      AddrBnm: 'Official Registered Address',
      AddrBno: 'Plot/Premises',
      AddrFlno: 'Main Floor',
      AddrSt: 'Commercial Road',
      AddrLoc: stateName,
      StateCode: parseInt(stateCode, 10),
      AddrPncd: 311001,
      TxpType: 'REG',
      Status: 'ACT',
      BlkStatus: null
    };
  }

  /**
   * Main verification method
   * Connects to NIC E-Invoice sandbox / production endpoint:
   * GET <URL>/eivital/v1.03/Master/gstin/<GSTIN>
   */
  async verifyGSTIN(rawGstin) {
    // 1. Format validation
    const formatCheck = this.validateGSTINFormat(rawGstin);
    if (!formatCheck.valid) {
      return {
        success: false,
        verified: false,
        message: formatCheck.message
      };
    }

    const gstin = formatCheck.gstin;

    // 2. Read configuration
    const baseUrl = (process.env.GST_API_BASE_URL || 'https://einv-apisandbox.nic.in').replace(/\/+$/, '');
    const clientId = process.env.GST_CLIENT_ID;
    const clientSecret = process.env.GST_CLIENT_SECRET;
    const authGstin = process.env.GST_AUTH_GSTIN || process.env.GST_USER_GSTIN;
    const userName = process.env.GST_USER_NAME;
    const authToken = process.env.GST_AUTH_TOKEN;
    const sek = process.env.GST_SEK;
    const directApiKey = process.env.GST_API_KEY;

    // Check if third-party direct GST API key is configured
    if (directApiKey) {
      try {
        const directResp = await axios.get(`https://sheet.gstincheck.co.in/check/${directApiKey}/${gstin}`, { timeout: 9000 });
        if (directResp.data && (directResp.data.flag || directResp.data.status) && directResp.data.data) {
          const d = directResp.data.data;
          const isAct = (d.sts || d.status || 'Active').toUpperCase().includes('ACT');
          const isBlk = Boolean(d.blkStatus === 'B');
          const fullAddr = typeof d.pradr === 'object' 
            ? [d.pradr?.addr?.bno, d.pradr?.addr?.bnm, d.pradr?.addr?.st, d.pradr?.addr?.loc, d.pradr?.addr?.pncd].filter(Boolean).join(', ')
            : (d.pradr || d.address || '');

          return {
            success: true,
            verified: true,
            isSimulated: false,
            gstin,
            tradeName: (d.tradeNam || d.tradeName || d.lgnm || '').trim(),
            legalName: (d.lgnm || d.legalName || d.tradeNam || '').trim(),
            status: isAct ? 'ACT' : 'INA',
            statusDetails: { label: isAct ? 'Active' : 'Inactive', active: isAct, color: isAct ? 'emerald' : 'rose' },
            isActive: isAct,
            isBlocked: isBlk,
            isCompliant: isAct && !isBlk,
            taxpayerType: d.dty || d.txpType || 'REG',
            taxpayerTypeLabel: d.dty || 'Regular',
            stateCode: parseInt(gstin.substring(0, 2), 10),
            stateName: formatCheck.stateName,
            pincode: d.pradr?.addr?.pncd || null,
            address: fullAddr,
            blkStatus: isBlk ? 'B' : null,
            raw: d
          };
        }
      } catch (directErr) {
        console.warn('[GST Service] Direct API check failed, falling back:', directErr.message);
      }
    }

    const hasLiveCredentials = Boolean(clientId && authToken);

    // 3. Fallback to simulation mode if no live sandbox credentials configured
    if (!hasLiveCredentials) {
      const simulatedData = this.getSimulatedGSTDetails(gstin);
      const isAct = simulatedData.Status === 'ACT';
      const isBlk = simulatedData.BlkStatus === 'B';

      return {
        success: true,
        verified: true,
        isSimulated: true,
        simulationNotice: 'NIC Live credentials not configured in backend/.env. Returning verified sandbox simulation based on Indian GSTIN format.',
        gstin: simulatedData.Gstin,
        tradeName: simulatedData.TradeName,
        legalName: simulatedData.LegalName,
        status: simulatedData.Status,
        statusDetails: STATUS_MAP[simulatedData.Status] || { label: 'Active', active: true, color: 'emerald' },
        isActive: isAct,
        isBlocked: isBlk,
        isCompliant: isAct && !isBlk,
        taxpayerType: simulatedData.TxpType,
        taxpayerTypeLabel: TAXPAYER_TYPE_MAP[simulatedData.TxpType] || 'Regular',
        stateCode: simulatedData.StateCode,
        stateName: formatCheck.stateName,
        pincode: simulatedData.AddrPncd,
        address: this.formatAddress(simulatedData),
        blkStatus: simulatedData.BlkStatus,
        raw: simulatedData
      };
    }

    // 4. Live NIC E-Invoice System Call
    const endpointUrl = `${baseUrl}/eivital/v1.03/Master/gstin/${encodeURIComponent(gstin)}`;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'client_id': clientId,
        'client_secret': clientSecret || '',
        'Gstin': authGstin || gstin,
        'user_name': userName || '',
        'AuthToken': authToken
      };

      const response = await axios.get(endpointUrl, {
        headers,
        timeout: 12000,
        validateStatus: () => true // Allow non-200 to be processed cleanly
      });

      const body = response.data;

      if (!body) {
        return {
          success: false,
          verified: false,
          message: `Empty response received from NIC GST portal (HTTP ${response.status}).`
        };
      }

      // Check Status attribute: "1" = Success, "0" = Failure
      const statusFlag = String(body.Status || body.status || '');

      if (statusFlag === '1') {
        const decrypted = this.decryptData(body.Data || body.data, sek);

        if (!decrypted || typeof decrypted !== 'object') {
          return {
            success: false,
            verified: false,
            message: 'Unable to decrypt or parse GSTIN data payload returned by NIC portal.'
          };
        }

        const normGstin = decrypted.Gstin || decrypted.gstin || gstin;
        const normStatus = (decrypted.Status || decrypted.status || 'INA').toUpperCase();
        const normBlkStatus = decrypted.BlkStatus || decrypted.blkStatus || null;
        const isAct = normStatus === 'ACT';
        const isBlk = normBlkStatus === 'B';

        const stateCodeStr = String(decrypted.StateCode || decrypted.stateCode || gstin.substring(0, 2)).padStart(2, '0');
        const stateName = GST_STATE_CODES[stateCodeStr] || formatCheck.stateName;

        return {
          success: true,
          verified: true,
          isSimulated: false,
          gstin: normGstin,
          tradeName: (decrypted.TradeName || decrypted.tradeName || '').trim(),
          legalName: (decrypted.LegalName || decrypted.legalName || '').trim(),
          status: normStatus,
          statusDetails: STATUS_MAP[normStatus] || { label: normStatus, active: isAct, color: isAct ? 'emerald' : 'rose' },
          isActive: isAct,
          isBlocked: isBlk,
          isCompliant: isAct && !isBlk,
          taxpayerType: decrypted.TxpType || decrypted.txpType || 'REG',
          taxpayerTypeLabel: TAXPAYER_TYPE_MAP[decrypted.TxpType || decrypted.txpType] || 'Regular',
          stateCode: parseInt(stateCodeStr, 10),
          stateName: stateName,
          pincode: decrypted.AddrPncd || decrypted.addrPncd || null,
          address: this.formatAddress(decrypted),
          blkStatus: normBlkStatus,
          infoDtls: body.InfoDtls || body.infoDtls || null,
          raw: decrypted
        };
      }

      // Failure handling (Status === "0")
      const decodedErrors = this.decodeErrorDetails(body.ErrorDetails || body.errorDetails);
      let errorMsg = 'GST verification failed on NIC Portal.';

      if (Array.isArray(decodedErrors) && decodedErrors.length > 0) {
        errorMsg = decodedErrors.map(e => `${e.ErrorMessage || e.error_message || 'Error'} (${e.ErrorCode || e.error_code || 'CODE'})`).join(', ');
      } else if (decodedErrors && (decodedErrors.ErrorMessage || decodedErrors.errorMessage)) {
        errorMsg = decodedErrors.ErrorMessage || decodedErrors.errorMessage;
      } else if (body.InfoDtls || body.infoDtls) {
        errorMsg = body.InfoDtls || body.infoDtls;
      }

      return {
        success: false,
        verified: false,
        isSimulated: false,
        gstin,
        message: errorMsg,
        errors: decodedErrors,
        infoDtls: body.InfoDtls || body.infoDtls || null
      };

    } catch (err) {
      console.error('[GST Service] Live verification error:', err.message);
      return {
        success: false,
        verified: false,
        message: `Network error connecting to NIC GST service: ${err.message}`
      };
    }
  }
}

module.exports = new GSTService();

