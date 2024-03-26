let services = {};
let processes = {};
let backjobs = {};
let runningFlags = {};

let template = function (runningFlagName, interval, cb) {
  setInterval(async () => {
    console.log("backjob: " + runningFlagName);
    if (runningFlags[runningFlagName]) {
      console.log("backjob: " + runningFlagName + "is still running!");
      return;
    }
    runningFlags[runningFlagName] = true;
    await cb();
    runningFlags[runningFlagName] = false;
  }, interval);
};

services.initialize = function () {
  for (let key in processes) {
    let process = processes[key];
    backjobs[key] = () => {
      template(key, process.interval, process.logic);
    };
  }
};

services.run = function () {
  for (let key in backjobs) {
    let job = backjobs[key];
    setTimeout(() => {
      job();
    }, 1000);
  }
};

module.exports = services;

processes.cleanCaptcha = {
  description: "10 phút xóa dữ liệu captcha đã hết hạn 1 lần",
  interval: 10 * 1000 * 60,
  logic: async () => {
    await Capt.destroy({
      expiredAt: {
        "<": moment().valueOf(),
      },
    });
  },
};

processes.changeMiddlemanToDoneAfterBuyTime = {
  description:
    "1 tiếng quét bảng middleman lấy những bản ghi đã mua hoặc chờ xác nhận mua vượt quá 3 ngày không có khiếu nại",
  interval: 60 * 60 * 1000,
  logic: async () => {
    let listMM = await Middleman.find({
      updatedAt: {
        "<": moment().subtract(3, "days").subtract(4, "hours").valueOf(),
      },
      status: [Middleman.STATUS.MATCHED, Middleman.STATUS.WAIT_BUYER_CONFIRM],
      isDelete: false,
    });
    for (let i = 0; i < listMM.length; i++) {
      const mm = listMM[i];
      await sails.getDatastore().transaction(async (db) => {
        let mm2 = await Middleman.updateOne({
          id: mm.id,
          status: [
            Middleman.STATUS.MATCHED,
            Middleman.STATUS.WAIT_BUYER_CONFIRM,
          ],
        })
          .set({
            status: Middleman.STATUS.DONE,
            payload: Object.assign(mm.payload, {
              doneBy: "system",
              doneAt: moment().valueOf(),
            }),
          })
          .usingConnection(db);
        if (mm2) {
          await ChangeStatusLog.create({
            forModel: "middleman",
            forModelId: mm.id,
            before: mm.status,
            after: Middleman.STATUS.DONE,
            description: "Hệ thống tự động xác nhận giao dịch thành công",
            createdBy: 1,
          }).usingConnection(db);

          await Notice.create({
            user: mm.customer,
            subject: "Tự động hoàn tất yêu cầu trung gian mã số:  " + mm.id,
            content: `Hệ thống đã tự động hoàn tất yêu cầu sau 3 ngày không có khiếu nại từ bạn
                              <br/> Mã trung gian : <strong>${mm.id}</strong>!
                              <br/>Vui lòng nhấn <strong>"CHI TIẾT"</strong> để xem chi tiết yêu cầu trung gian`,
            openUrl: Conf.get("MIDDLE_MAN_DETAIL_URL").replace("{{ID}}", mm.id),
            level: "info",
            payload: {},
          }).usingConnection(db);
        }
      });
    }
  },
};

processes.systemPaidMiddleman = {
  description:
    "5 phút quét bảng middleman thanh toán tiền những đơn hoàn thành cho người bán, đơn hủy cho người mua",
  interval: 5 * 60 * 1000,
  logic: async () => {
    let listMM = await Middleman.find({
      isPaidToSeller: false,
      status: Middleman.STATUS.DONE,
      updatedAt: { "<": moment().subtract(2, "minutes").valueOf() },
    });
    for (let i = 0; i < listMM.length; i++) {
      const mm = listMM[i];
      await sails.getDatastore().transaction(async (db) => {
        await MoneyTransaction.create({
          user: mm.createdBy,
          createdBy: mm.payload.doneBy === "buyer" ? mm.customer : 1,
          amount: mm.toJSON().sellerReceivedOnSuccess,
          transactionType: MoneyTransaction.TRANSACTION_TYPE.CREDIT,
          note: `Hệ thống chuyển tiền hoàn thành yêu cầu trung gian mã số: <b>${mm.id}</b>`,
          onDoneAction: {
            id: mm.id,
            redirectKey: "MIDDLE_MAN_DETAIL_URL",
            note: `Hệ thống chuyển tiền hoàn thành yêu cầu trung gian mã số: <b>${mm.id}</b>`,
          },
        })
          .fetch()
          .usingConnection(db);
        await Middleman.updateOne({ id: mm.id })
          .set({
            isPaidToSeller: true,
            payload: Object.assign(mm.payload, { payAt: moment().valueOf() }),
          })
          .usingConnection(db);
      });
    }

    let listMM2 = await Middleman.find({
      isPaidToSeller: false,
      status: Middleman.STATUS.CANCELED,
      updatedAt: { "<": moment().subtract(2, "minutes").valueOf() },
    });
    for (let i = 0; i < listMM2.length; i++) {
      const mm = listMM2[i];
      await sails.getDatastore().transaction(async (db) => {
        await MoneyTransaction.create({
          user: mm.customer,
          createdBy: mm.payload.processedBy === "admin" ? 1 : mm.createdBy,
          amount: mm.toJSON().totalMoneyForBuyer,
          transactionType: MoneyTransaction.TRANSACTION_TYPE.CREDIT,
          note: `Hoàn trả tiền tạm giữ do hủy yêu cầu trung gian mã số: <b>${mm.id}</b>`,
          onDoneAction: {
            id: mm.id,
            redirectKey: "MIDDLE_MAN_DETAIL_URL",
            note: `Hoàn trả tiền tạm giữ do hủy yêu cầu trung gian mã số: <b>${mm.id}</b>`,
          },
        })
          .fetch()
          .usingConnection(db);
        await Middleman.updateOne({ id: mm.id })
          .set({
            isPaidToSeller: true,
            payload: Object.assign(mm.payload, {
              refundAt: moment().valueOf(),
            }),
          })
          .usingConnection(db);
      });
    }
  },
};

processes.cleanLog = {
  description: "Xóa cứng các log",
  interval: 24 * 60 * 60 * 1000,
  logic: async () => {
    try {
      await LogCallApi.destroy({
        createdAt: {
          "<": moment().subtract(3, "months").valueOf(),
        },
      });
      await AppNotiCatcherLog.destroy({
        updatedAt: {
          "<": moment().subtract(3, "months").valueOf(),
        },
      });
      let where = {
        updatedAt: {
          "<": moment().subtract(1, "months").valueOf(),
        },
        status: {
          in: [
            PayOnTransaction.STATUS.CREATED,
            PayOnTransaction.STATUS.INPROGRESS,
            PayOnTransaction.STATUS.FREEZEED,
            PayOnTransaction.STATUS.FAILED,
            PayOnTransaction.STATUS.DENIED,
          ],
        },
      };
      let payOnTransaction = await PayOnTransaction.find(where);
      let payOnIds = [];
      let paymentTransIds = [];
      for (let i = 0; i < payOnTransaction.length; i++) {
        const pot = payOnTransaction[i];
        payOnIds.push(pot.id);
        if (pot.objModel === "paymentTransaction") {
          paymentTransIds.push(pot.fromObjModelId);
        }
      }
      await PayOnTransaction.destroy({ id: { in: payOnIds } });
      await PaymentTransaction.destroy({
        id: { in: paymentTransIds.map((v) => +v) },
      });
      let temp = await PaymentTransaction.destroy({
        updatedAt: {
          "<": moment().subtract(1, "months").valueOf(),
        },
        paymentMethod: "banktransfer",
        status: {
          in: [
            PaymentTransaction.STATUS.FAILED,
            PaymentTransaction.STATUS.INPROGRESS,
            PaymentTransaction.STATUS.NEW,
          ],
        },
      }).fetch();
      for (let i = 0; i < temp.length; i++) {
        const trans = temp[i];
        paymentTransIds.push(trans.id + "");
      }
      await ChangeStatusLog.destroy({
        forModelId: { in: paymentTransIds },
        forModel: "paymentTransaction",
      });
    } catch (error) {
      log.error(error);
    }
  },
};

let processBankTransfer = async (textNoti = "", pkg = "com.VCB") => {
  const re = /O(?<paymentTransactionId>\d+)B(?<userId>\d+)T/gm;
  let codes = [...textNoti.matchAll(re)];
  if (codes.length !== 1) {
    return {
      status: false,
      message:
        "Giao dịch ngoài luồng ứng dụng -  Không tìm thấy thông tin mã giao dịch",
    };
  }
  let { paymentTransactionId, userId } = codes[0].groups;

  let re2 = /PS:\s?(?<amount>[-|\d|.]+)VND/gm; //TPBank
  switch (pkg) {
    case "com.VCB":
      re2 = /\s?(?<amount>[-|\d|.|,]+)\sVND\slúc/gm; //VCB
      break;
  }
  let amounts = [...textNoti.matchAll(re2)];
  if (amounts.length !== 1) {
    return false;
  }
  let { amount } = amounts[0].groups;
  amount = +amount.replaceAll(".", "").replaceAll(",", "");
  if (amount < 0) {
    return {
      status: false,
      message:
        "Giao dịch ngoài luồng ứng dụng - Không tìm thấy thông tin ghi có",
    };
  }

  let paymentTransaction = await PaymentTransaction.findOne({
    id: paymentTransactionId,
    createdBy: userId,
  });
  if (!paymentTransaction) {
    return {
      status: false,
      message: "Mã giao dịch không tồn tại trong hệ thống!",
    };
  }
  if (paymentTransaction.amount !== amount) {
    return {
      status: false,
      message: "Giao dịch chuyển khoản không khớp số lượng tiền",
    };
  }
  if (paymentTransaction.status == PaymentTransaction.STATUS.COMPLETED) {
    return {
      status: false,
      message: "Giao dịch chuyển khoản đã được xử lý trước đó",
    };
  }

  let jobData = {
    paymentTransaction,
    afterStatus: PaymentTransaction.STATUS.COMPLETED,
    description:
      "Giao dịch thanh toán thành công\nLog bank message: " + textNoti,
  };
  kue.createJob("update_payment_transaction_status", jobData);
  return { status: true, message: "Giao dịch chuyển khoản xử lý thành công" };
};
processes.BankTransactionProcessing = {
  description: "15s lấy queue xử lý 1 lần",
  interval: 15 * 1000,
  logic: async () => {
    let haveOrderProcessing =
      (await sails.helpers.cache.get("obt_order_processing")) == "1";
    console.log({ haveOrderProcessing });
    let appNoti = await AppNotiCatcherLog.find({
      processed: false,
      pkg: ["com.tpb.mb.gprsandroid", "com.VCB"],
    });
    for (let i = 0; i < appNoti.length; i++) {
      const noti = appNoti[i];
      let payload = await processBankTransfer(noti.bigtext);
      await AppNotiCatcherLog.update({ id: noti.id }).set({
        processed: true,
        payload,
      });
    }
  },
};

processes.ProcessingQueueMail = {
  description: "1 phút lấy queue xử lý 1 lần",
  interval: 60 * 1000,
  logic: async () => {
    try {
      let limitRate = Conf.get("MAIL_PER_MINUTE") || 20;
      let mailNeedSend = await LogSmsEmail.find({
        isSuccess: false,
        type: "EMAIL",
      }).limit(limitRate);
      console.log({ mailNeedSend: mailNeedSend.length });
      let count = 0;
      for (let i = 0; i < mailNeedSend.length; i++) {
        const mail = mailNeedSend[i];
        count += mail.quantity;
        if (count > limitRate) {
          break;
        }
        await mailer.sendMail(mail);
        console.log({ count });
      }
    } catch (error) {
      log.error(error);
    }
  },
};

processes.LoginFshare = {
  description: "6 tiếng login lại fshare 1 lần",
  interval: 6 * 60 * 60 * 1000 - 60 * 1000,
  logic: async () => {
    await fshare.login();
  },
};

processes.GenAirExplorerLic = {
  description: "10 phút quét gen lic",
  interval: 10 * 60 * 1000,
  logic: async () => {
    try {
      let lic = await AirexplorerLic.find({ status: 2, licType: 1 })
        .sort("updatedAt ASC")
        .limit(1);
      if (!lic.length) {
        return;
      }
      lic = lic[0];

      let { statusCode, body } = await airexplo.activate(lic.hd, lic.val);
      if (body && (body + "").includes("<License>")) {
        lic = await AirexplorerLic.updateOne({ id: lic.id }).set({
          lic: body,
          status: 3,
        });
        pushNotification.sendMailByUserId(
          lic.createdBy,
          "[OBT]--Thông báo lấy license air explorer thành công",
          `Hệ thống Ông Bán Tất đã hoàn tất thủ tục phát hành License Air Explorer của bạn.`
        );
        throw new Error("resetKey");
      } else throw new Error("resetKey");
    } catch (error) {
      airexplo.resetKey().catch(log.error);
      log.error(error);
    }
  },
};



processes.GenAirLiveDriveLic = {
  description: "6 phút quét gen lic",
  interval: 6 * 60 * 1000,
  logic: async () => {
    try {
      let lic = await AirexplorerLic.find({ status: 2, licType: 2 })
        .sort("updatedAt ASC")
        .limit(1);
      if (!lic.length) {
        return;
      }
      lic = lic[0];

      let { statusCode, body } = await airlivedrive.activate(lic.hd, lic.val);
      if (body && (body + "").includes("<License>")) {
        lic = await AirexplorerLic.updateOne({ id: lic.id }).set({
          lic: body,
          status: 3,
        });
        pushNotification.sendMailByUserId(
          lic.createdBy,
          "[OBT]--Thông báo lấy license air livedrive thành công",
          `Hệ thống Ông Bán Tất đã hoàn tất thủ tục phát hành License Air Live Drive của bạn.`
        );
        throw new Error("resetKey");
      } else throw new Error("resetKey");
    } catch (error) {
      airlivedrive.resetKey().catch(log.error);
      log.error(error);
    }
  },
};
