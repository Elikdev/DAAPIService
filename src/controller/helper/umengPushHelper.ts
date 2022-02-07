const Umeng = require("umengtuisong");

const umengIOS = new Umeng({
  appKey: "614579ecd884567d811b5254",
  appMasterSecret: "oj41rao8e9xpxoagtmbqekhdxhtrfl5y",
});

const umengAndroid = new Umeng({
  appKey: "61455f15520cc86a1d480802",
  appMasterSecret: "tkl8jkflrezpj6syo9iz7kausreopfzq",
});

export const sendPush = async (
  title: string,
  content: string | null,
  subtitle: string | null,
  device_token: string | null,
  device_type: string | null,
): Promise<any> => {
  const umeng = device_type === "ios" ? umengIOS : umengAndroid;
  await umeng.pushSingle({
    title: title,
    content: content,
    subtitle: subtitle,
    device_token: device_token,
    success(response: any) {
      console.log(response);
    }, // 成功回调
    fail(error: any) {
      console.log(error);
    }, // 失败回调
  });
};
