
const SERVICE_URL = process.env.SERVICE_URL;

export const PaymentConstants = {
  prod: {
    IP: "47.102.124.11",
    PAY_URL : "https://api.mch.weixin.qq.com/pay/unifiedorder",
    MERCHANT_ID : "1610299103",
    STORE_ID : "301868",
    API_TOKEN : "pandabrick140114011401pandabrick",
    CALL_BACK_URL: SERVICE_URL + "/v1/orders/confirmpayment",
  },
  test: {
    IP: "139.196.93.148",
    PAY_URL : "https://api.mch.weixin.qq.com/sandboxnew/pay/unifiedorder",
    SB_KEY_URL: "https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey",
    MERCHANT_ID : "1610299103",
    STORE_ID : "301941",
    API_TOKEN : "pandabrick140114011401pandabrick",
    CALL_BACK_URL: SERVICE_URL + "/v1/orders/confirmpayment"
  }
};
