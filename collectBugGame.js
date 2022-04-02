const got = require('got')

const { cookie, aid, uuid, _signature, PUSH_PLUS_TOKEN, DING_TALK_TOKEN, uid } = require('./config')

// 没有收集的bug列表
const NOT_COLLECT_URL = `https://api.juejin.cn/user_api/v1/bugfix/not_collect?aid=${aid}&uuid=${uid}`
// 收集bug
const COLLECT_URL = `https://api.juejin.cn/user_api/v1/bugfix/collect?aid=${aid}&uuid=${uid}`
// bug修复场次
const BUGFIX_COMPETITION = `https://api.juejin.cn/user_api/v1/bugfix/competition?aid=${aid}&uuid=${uid}`
// bug收集-用户信息
const BUGFIX_USER = `https://api.juejin.cn/user_api/v1/bugfix/user?aid=${aid}&uuid=${uid}`
// 消除bug
const BUGFIX = `https://api.juejin.cn/user_api/v1/bugfix/fix?aid=${aid}&uuid=${uid}`


const HEADERS = {
    cookie,
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67'
}

const HEADERS_DINGTALK_WEB_HOOK = {
    "Content-Type": "application/json",
};

// 获取没有收集的bug
const get_not_collect = async () => {
    const res = await got.post(NOT_COLLECT_URL, {
        hooks: {
            beforeRequest: [
                options => {
                    Object.assign(options.headers, HEADERS)

                }
            ]
        }
    })
    if (typeof res.body == "string") res.body = JSON.parse(res.body)
    // console.log(res.body);
    return res.body.data || []
}

// 收集bug
const collect = async ({ bug_type, bug_time }) => {
    const param = {
        hooks: {
            beforeRequest: [
                options => {
                    Object.assign(options.headers, HEADERS)

                }
            ]
        },
        json: { bug_type, bug_time }
    }
    const res = await got.post(COLLECT_URL, param)
    if (typeof res.body == "string") res.body = JSON.parse(res.body)
    // console.log(res.body);
    return res.body
}

// 获取bugfix场次
const getbugfix_competition = async () => {
    const res = await got.post(BUGFIX_COMPETITION, {
        hooks: {
            beforeRequest: [
                options => {
                    Object.assign(options.headers, HEADERS)
                }
            ]
        }
    })
    if (typeof res.body == "string") res.body = JSON.parse(res.body)
    // console.log(res.body);
    return res.body.data || []
}

// 获取bugfix用户信息
const getBugfixUser = async (competition_id) => {
    const param = {
        hooks: {
            beforeRequest: [
                options => {
                    Object.assign(options.headers, HEADERS)
                }
            ]
        },
        json: { competition_id }
    }
    const res = await got.post(BUGFIX_USER, param)
    if (typeof res.body == "string") res.body = JSON.parse(res.body)
    // console.log(res.body);
    return res.body.data || []
}

// 修复bug
const handleBugfix = async ({ competition_id, bug_fix_num, not_self }) => {
    const param = {
        hooks: {
            beforeRequest: [
                options => {
                    Object.assign(options.headers, HEADERS)
                }
            ]
        },
        json: { competition_id, bug_fix_num, not_self }
    }
    const res = await got.post(BUGFIX, param)
    if (typeof res.body == "string") res.body = JSON.parse(res.body)
    // console.log(res.body);
    return res.body.data || []
}

const collectBugGame = async () => {
    const notCollectList = await get_not_collect()
    // console.log(notCollectList);
    // 防止死循环
    if (!notCollectList.length) return Promise.resolve()
    const collectRes = notCollectList.map((bug) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(collect(bug))
            }, 1000);
        })
    })
    console.log('收集完了');
    return await Promise.all(collectRes)
}

const handleBugfixGame = async () => {
    const bugfixRes = await getbugfix_competition()
    const competition_id = bugfixRes.competition_id
    // console.log(bugfixRes);
    const bugfixUser = await getBugfixUser(competition_id)
    // console.log(bugfixUser.bug_fix_num); // 当前修复的bug数量
    // console.log(bugfixUser.user_own_bug); // 当前拥有的bug
    // 是否是第一次修复bug，并且有10个bug可修复
    const isFirstBugfix = bugfixRes.award_status === 1 && bugfixUser.bug_fix_num < 10 && bugfixUser.user_own_bug >= 10
    // 是否要继续修复bug
    const isContinueBugfix = bugfixRes.award_status === 1 && bugfixUser.bug_fix_num >= 10 && bugfixUser.user_own_bug >= 0
    // 游戏开始，并且第一次参加
    if (isFirstBugfix) {
        handleBugfix({ competition_id, bug_fix_num: 10, not_self: 0 })
        // 继续修复bug
    } else if (isContinueBugfix) {
        handleBugfix({ competition_id, bug_fix_num: bugfixUser.user_own_bug, not_self: 0 })
    }
}

const bugGames = async () => {
    await collectBugGame()
    handleBugfixGame()
}
exports.collectBugGame = collectBugGame;