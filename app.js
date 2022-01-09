const got = require('got')
const { autoGame } = require('./autoGame')

const { cookie, aid, uuid, _signature, PUSH_PLUS_TOKEN, DING_TALK_TOKEN, uid } = require('./config')

const BASEURL = 'https://api.juejin.cn/growth_api/v1/check_in' // 掘金签到api
const PUSH_URL = 'http://www.pushplus.plus/send' // pushplus 推送api
const DINGTALK_PUSH_URL = "https://oapi.dingtalk.com/robot/send?access_token=" + DING_TALK_TOKEN; // 钉钉webhook

const URL = `${BASEURL}?aid=${aid}&uuid=${uuid}&_signature=${_signature}`
const DRAW_URL = `https://api.juejin.cn/growth_api/v1/lottery/draw?aid=${aid}&uuid=${uuid}&_signature=${_signature}`
const LUCKY_URL = `https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky?aid=${aid}&uuid=${uuid}`
const DRAW_CHECK_URL = `https://api.juejin.cn/growth_api/v1/lottery_config/get?aid=${aid}&uuid=${uuid}`

const HEADERS = {
  cookie,
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67'
}
const HEADERS_DINGTALK_WEB_HOOK = {
    "Content-Type": "application/json",
};

// 签到
async function signIn () {
  const res = await got.post(URL, {
    hooks: {
      beforeRequest: [
        options => {
          Object.assign(options.headers, HEADERS)
        }
      ]
    }
  })
  const drawData = await got.get(DRAW_CHECK_URL, {
    hooks: {
      beforeRequest: [
        options => {
          Object.assign(options.headers, HEADERS)
        }
      ]
    }
  })
  if (JSON.parse(drawData.body).data.free_count > 0) draw(); // 免费次数大于0时再抽
  lucky()
  if (!PUSH_PLUS_TOKEN && !DING_TALK_TOKEN) return;

  if(typeof res.body == "string") res.body = JSON.parse(res.body);
  const msg = res.body.err_no == 0 ? `成功，获得${res.body.data.incr_point}个矿石，矿石总数：${res.body.data.sum_point}个。` : "失败，" + res.body.err_msg;
  handlePush(msg);

  if (!uid) return;
  autoGame();
}

async function draw () {
  const res = await got.post(DRAW_URL, {
    hooks: {
      beforeRequest: [
        options => {
          Object.assign(options.headers, HEADERS)
        }
      ]
    }
  })
  console.log(res.body)
}

/**
 * @desc 沾喜气
 */
async function lucky () {
  const res = await got.post(LUCKY_URL, {
    hooks: {
      beforeRequest: [
        options => {
          Object.assign(options.headers, HEADERS)
        }
      ]
    }
  })
  console.log(res.body)
}

// push
async function handlePush (desp) {
  const url = DING_TALK_TOKEN == '' ? PUSH_URL : DINGTALK_PUSH_URL;
  const body = DING_TALK_TOKEN == '' ? {
    token: `${PUSH_PLUS_TOKEN}`,
    title: `签到结果`,
    content: `${desp}`
  } : {
    msgtype: "text",
    text: { content: "签到结果: " + desp },
  };
  
  let param = {
    json: body,
  };
  if (DING_TALK_TOKEN != '') {
    param.hooks = {
        beforeRequest: [
            (options) => {
                Object.assign(options.headers, HEADERS_DINGTALK_WEB_HOOK);
            },
        ],
    }
  }
  const res = await got.post(url, param);
  console.log(res.body);
}

signIn()

