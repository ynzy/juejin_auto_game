const got = require('got')
const { autoGame } = require('./autoGame')
const { bugGames } = require('./collectBugGame')

const { cookie, aid, uuid, _signature, PUSH_PLUS_TOKEN, DING_TALK_TOKEN, uid } = require('./config')

const BASEURL = 'https://api.juejin.cn/growth_api/v1/check_in' // 掘金签到api
const PUSH_URL = 'http://www.pushplus.plus/send' // pushplus 推送api
const DINGTALK_PUSH_URL = "https://oapi.dingtalk.com/robot/send?access_token=" + DING_TALK_TOKEN; // 钉钉webhook

const URL = `${BASEURL}?aid=${aid}&uuid=${uuid}&_signature=${_signature}`
const DRAW_URL = `https://api.juejin.cn/growth_api/v1/lottery/draw?aid=${aid}&uuid=${uuid}&_signature=${_signature}`
const LUCKY_URL = `https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky?aid=${aid}&uuid=${uuid}`
const LUCKY_HISTORY_URL = `https://api.juejin.cn/growth_api/v1/lottery_history/global_big?aid=${aid}&uuid=${uuid}`
const DRAW_CHECK_URL = `https://api.juejin.cn/growth_api/v1/lottery_config/get?aid=${aid}&uuid=${uuid}`

const HEADERS = {
  cookie,
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67'
}
const HEADERS_DINGTALK_WEB_HOOK = {
  "Content-Type": "application/json",
};

// 签到
async function signIn() {
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
  lucky()
  if (JSON.parse(drawData.body).data.free_count > 0) draw(); // 免费次数大于0时再抽
  if (PUSH_PLUS_TOKEN || DING_TALK_TOKEN) {
    if (typeof res.body == "string") res.body = JSON.parse(res.body);
    const msg = res.body.err_no == 0 ? `成功，获得${res.body.data.incr_point}个矿石，矿石总数：${res.body.data.sum_point}个。` : "失败，" + res.body.err_msg;
    console.log(msg);
    handlePush(msg, 'sign');
  }
  if (!uid) return;
  autoGame((msg) => {
    handlePush(msg, 'autoGame');
  });
  bugGames()
}

async function draw() {
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
async function lucky() {
  const resLuckyList = await got.post(LUCKY_HISTORY_URL, {
    hooks: {
      beforeRequest: [
        options => {
          Object.assign(options.headers, HEADERS)
        }
      ]
    }
  })
  resLuckyList.body = JSON.parse(resLuckyList.body)
  const luckyHistoryList = resLuckyList.body.data.lotteries
  const lucky = luckyHistoryList[0]

  const res = await got.post(LUCKY_URL, {
    hooks: {
      beforeRequest: [
        options => {
          Object.assign(options.headers, HEADERS)
        }
      ]
    },
    json: { lottery_history_id: lucky.history_id }
  })
  // console.log('沾喜气', res.body)
  res.body = JSON.parse(res.body)
  // console.log('总幸运值: ', res.body.total_lucky_value, ',本次获取幸运值: ', res.body.draw_lucky_value);
  const msg = res.body.err_no == 0 ? `本次获取幸运值:${res.body.data.dip_value}` : "失败，" + res.body.err_msg;
  // console.log(msg);
  handlePush(msg, 'lucky')
}

const msgTitleType = {
  'sign': '签到结果',
  'lucky': '沾喜气',
  'autoGame': '自动挖矿',
  'bugGames': 'bug修复游戏'
}

// push
async function handlePush(desp, msgType = 0) {
  const title = msgTitleType[msgType]
  console.log(title, '---', desp);
  const url = DING_TALK_TOKEN == '' ? PUSH_URL : DINGTALK_PUSH_URL;
  const body = DING_TALK_TOKEN == '' ? {
    token: `${PUSH_PLUS_TOKEN}`,
    title: `${title}: ${desp}`,
    content: `${desp}`
  } : {
    msgtype: "text",
    // "签到结果: " + desp
    text: {
      content: desp
    },
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

// signIn()
lucky()

