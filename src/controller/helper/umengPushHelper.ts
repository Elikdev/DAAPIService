const Umeng = require("push-umeng");

const umeng = new Umeng({
  appKey: "614579ecd884567d811b5254",
  appMasterSecret: "oj41rao8e9xpxoagtmbqekhdxhtrfl5y",
});

export const sendPush = async (): Promise<any> => {
  console.log("here");
  await umeng.pushSingle({
    title: "标题",
    content: "内容",
    subtitle: "wtf",
    device_token:
      "fa9b6a368ff45078ea4569ee7eb4e037dd36a6e177c866882fc6555d84d8c55e",
    success(response: any) {
      console.log(response);
    }, // 成功回调
    fail(error: any) {
      console.log(error);
    }, // 失败回调
  });
};
