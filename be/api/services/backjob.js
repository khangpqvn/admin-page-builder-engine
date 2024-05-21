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
    } catch (error) {
      log.error(error);
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
