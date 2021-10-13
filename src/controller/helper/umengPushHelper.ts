const Umeng = require("umengtuisong");

const umeng = new Umeng({
  appKey: "614579ecd884567d811b5254",
  appMasterSecret: "oj41rao8e9xpxoagtmbqekhdxhtrfl5y",
});

export const sendPush = async (
  title: string,
  content: string | "",
  subtitle: string | "",
  device_token: string | null,
): Promise<any> => {
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
