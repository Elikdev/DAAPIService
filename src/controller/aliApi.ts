import { HandleError } from "../decorator/errorDecorator";
import { Request, Response } from "express";
import AlipaySdk from "alipay-sdk";
import AlipayFormData from "alipay-sdk/lib/form";
import { uniqueId } from "lodash";
import { Users } from "../entities/Users";
import { getRepository } from "typeorm";
import { ResourceNotFoundError } from "../error/notfoundError";

const ALI_APP_ID = "2021002193696746";
const ALI_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn8vv4pLmB86rlTS0ZzCjtoBEECGCTA3m9IhHufjGUPsLTWyllvlH4bVZpL1Zxo16yYd5WcLz/HcJwufWjyoRu7qjg55WU13o+FlNTYDlsEqY5AGCkU6PMaJVHs6xxe+a8nM+WQvNxzO6I4rnlAs/jUXjesxHgIQKZ1GWSMWaZQBeXu/qeiVRSSE32TVFkuI4n8KYPiHsyT5XufsqjeuMiY+1vHXGjD5LaloLNmlysa/pU7EH70hcC783rkLAIoA/z6EbbWZoZ76olNSPQoKfVu82pQLYaWypzazwRiSwZym9OSdE15wSvtTX0fLg629QTGQZMzhlEa86F2Z6yhI9vQIDAQAB";
const ALI_APP_PRIVATE_KEY =
  "MIIEowIBAAKCAQEAunorpY9jUeNEdCGpwfi+YjH+/UrrjBLE553WIWfCXux3fK8vZIPpy9KpwkhQ2rNpcrFbbOozzrPpJBH9d3d6jlTrG1wv/ozEjAtYsZ+As4650RiuOSr95aWVC3KFcymn2PIq+lpsaYz5cESsErrBQZmAn6OUAUw33y+YKGVr6/77LxKffaAIitDqgyIeY+DUs+3u2ngkE36jOB+Swb4+f5N+SuCJVF2FGDebigs+6G46kjHFM2oKZwWLBIGtmQAzSp7OClgPX6hj82vcGLphpu75jwUALuIfRbLU5ML9G2e6exq/QzxaITosQRkijk5/5pMkEgJDCl+HLAhTrO+fiwIDAQABAoIBAEN46wwHmtdJVT5z47mUqEZdcrbxgdL4A5kOyijiIzk3dHB/7rT+6fxe6B+tDNxlKFVgiQUapM442LW9cKnmaEjRvxPyQkdnZcKKZHg4j1fo36EhvgBfZujOBeTTdifaPapIzXYye6GhaavOnThVrJFw2lJo3KevjVPLI9ISCH+l7nsXkuTKz1xNvl68xr1lCE6sBeQBstz9V/LnHVGLOWL7l7saZuqQB5lUnsbOGuFpaogU/nbnYRL609DWBv4uQ+/OR65rNpLsn4xgr4gaxkrg08SN83TSbyA7ChWfkqGyT5IbJzYVrf0qxr+KSDD8F3j9074/11To3Eyx5VwTlWECgYEA+WV/1q2RGYVc2/XZEzc/FU/VZwKSyLmceYRWX1nGEecdOMGOUrH2HDm2FL0CQASKFG5oJWg20HzVPm4cp0m0ULX6vSSBKNotasXLXlXsEpOsWtIX39ORRCgiM+JspB34DuZVtRsQwcqnWTHk5nzZwKvJjiya/7oouxam41BgubsCgYEAv2oucBxa7ykRRK/9/IBE4rqOOFJH+kHh2bl/CBCX636ukxt2RWSAaTBr/6epVnh94Z0a0DE4xoaZSkqnOePBy5AzlGS76UBSECbP8Is3Fps4h6RIVvbRub0U116UfDw5mib6z1mNIk9J9vk2diK/cB4Lvq6C6lkeVOy1+t8crHECgYA7ZiJJhjNN6caRGP/npLvgnpAMJb/CEPskshFESoRzVSFPmEIGjh444MHuNIoppysf7J/fcO/FPkYnxWALs/E/W+hpTh15FmXEzXE/eaVtU0C0rN9EzwYFPq3Ov7nyaLThD5kQNm8KSPMMumZzQv819XRe6V7NU5BJ5v4+m7E96wKBgQCdLxuNMqu1wzqL9h2SkN6AdQO+2kqDBkDporrfK4kleDTxVlbL6xjLyFiXat3SxUVR1Mok9paR6AvPBvjFv/LvL647iHEKvKfm3YhaFmgZZ0OHl29UAoD8jnmj1eYHEwmWPbYuOXJ9HzE03zdK0YP1FKc+YV3eBWq0AGH77eVE8QKBgDKA+DuinLoAtyGf4KnDwyTCy0LLiiXYalsPq3pkqOa9e4Ua9w3OfdJSQYP6Emp+G3nus8s2k12MkK7gUZ5nh1Mw+Kaa+sf/kcMWriNH0b2PSZMQpyrPL0Jrn/x7bi1E3ZxUCTtW+2bW2dHSLW3pQvq4pVU53ypb+LQq6UFuRMBm";
const ALI_AES_ENC = "LDUHldvnI8JxQBRKbmTqOw==";

export class AliApiController {
  @HandleError("verify")
  static async verify(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.body.userId);
    const certName = req.body.certName;
    const certNo = req.body.certNo;
    const certType = req.body.certType;
    const alipaySdk = new AlipaySdk({
      appId: ALI_APP_ID,
      privateKey: ALI_APP_PRIVATE_KEY,
      encryptKey: ALI_AES_ENC,
      alipayPublicKey: ALI_PUBLIC_KEY,
    });
    const userRepo = getRepository(Users);
    const user = await userRepo.findOne({ id: userId });

    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    // 查询该用户是否验证过 获取用户certifyId
    const certifyId = user.aliVerifyCertId;
    if (certifyId) {
      const queryRes = await alipaySdk.exec("alipay.user.certify.open.query", {
        bizContent: {
          certify_id: certifyId,
        },
        // 自动AES加解密
        needEncrypt: true,
      });
      if (queryRes.code === "10000" && queryRes.passed === "T")
        res.send({ status: "PASSED" });
    }

    //未验证过用户
    const verifyParams = {
      outer_order_no: Date.now().toString(),
      biz_code: "SMART_FACE",
      identity_param: {
        identity_type: "CERT_INFO",
        cert_name: certName,
        cert_no: certNo,
        cert_type: certType,
      },
      merchant_config: {
        return_url: "com.retopia.vintage",
      },
    };
    const initRes = await alipaySdk.exec(
      "alipay.user.certify.open.initialize",
      {
        bizContent: verifyParams,
        // 自动AES加解密
        needEncrypt: true,
      },
    );
    console.log("initRes:", initRes);
    if (initRes.code === "10000") {
      console.log("init success");
      // 保存此ID到用户表 以便认证完成后直接检查认证结果
      const certifyId = initRes.certifyId;
      user.aliVerifyCertId = certifyId;
      await userRepo.save(user);

      const formData = new AlipayFormData();
      // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
      formData.setMethod("get");
      formData.addField("bizContent", {
        certify_id: certifyId,
      });

      const certifyRes = await alipaySdk.exec(
        "alipay.user.certify.open.certify",
        {},
        { formData: formData },
      );

      console.log("certifyRes:", certifyRes);
      if (typeof certifyRes === "string") {
        const certifyUrl = certifyRes;
        res.send({
          status: "SUCCESS",
          certifyId: certifyId,
          certifyUrl: certifyUrl,
        });
      } else {
        res.send({ ...certifyRes, status: "ERROR" });
      }
    } else {
      res.send({ ...initRes, status: "ERROR" });
    }
  }

  // 根据用户id查询用户认证结果
  @HandleError("queryVerify")
  static async queryVerify(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);
    const userRepo = getRepository(Users);
    const user = await userRepo.findOne({ id: userId });

    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    const certifyId = user.aliVerifyCertId;

    const alipaySdk = new AlipaySdk({
      appId: ALI_APP_ID,
      privateKey: ALI_APP_PRIVATE_KEY,
      encryptKey: ALI_AES_ENC,
      alipayPublicKey: ALI_PUBLIC_KEY,
    });

    /**
     * 返回释例
     * {
        "code": "10000",
        "msg": "Success",
        "passed": [
            "T"
        ],
        "identity_info": "{}",
        "material_info": "{}",
        "fail_reason": "Z1147"
    },
     */
    const queryRes = await alipaySdk.exec("alipay.user.certify.open.query", {
      bizContent: {
        certify_id: certifyId,
      },
      // 自动AES加解密
      needEncrypt: true,
    });
    if (queryRes && queryRes.passed === "T") {
      res.send({ passed: "T" });
    } else {
      res.send({ passed: "F" });
    }
  }
}
