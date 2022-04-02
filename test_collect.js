// 没有收集的bug
// https://api.juejin.cn/user_api/v1/bugfix/not_collect?aid=2608&uuid=7072972678613599755
// cookie
const response = {
    err_no: 0,
    err_msg: "success",
    data: [
        {
            bug_type: 2, // bug类型
            bug_time: 1647273600, // bug生成时间
            bug_show_type: 1,
            is_first: false
        },
    ],
};

// 收集bug
// https://api.juejin.cn/user_api/v1/bugfix/collect?aid=2608&uuid=7072972678613599755
/**
 * cookie
 * @query
 * aid=2608&uuid=7072972678613599755
 * @param
 * {"bug_type":2,"bug_time":1647273600}
 */

// bug场次信息
// https://api.juejin.cn/user_api/v1/bugfix/competition?aid=2608&uuid=7072972678613599755
// cookie
const res = {
    err_no: 0,
    err_msg: "success",
    data: {
        competition_id: "7073682315834048548",
        competition_name: "第8场",
        start_time: 1646992800, // 开始时间
        award: 7000000,
        award_req_type: 1,
        award_req_num: 10,
        end_req_type: 1,
        end_req_num: 100000,
        from_end_num: 0,
        award_status: 0, // 结束
    },
};

const res11 = {
    "err_no": 0,
    "err_msg": "success",
    "data": {
        "competition_id": "7080420862381260839",
        "competition_name": "第10场",
        "start_time": 1648807200,
        "award": 7000000,
        "award_req_type": 1,
        "award_req_num": 10,
        "end_req_type": 1,
        "end_req_num": 100000,
        "from_end_num": 39179,
        "award_status": 1 // 进行中
    }
}

// bug收集用户信息
// https://api.juejin.cn/user_api/v1/bugfix/user?aid=2608&uuid=7072972678613599755
// cookie
/**
 * @params competition_id
 */
const res1 = {
    err_no: 0,
    err_msg: "success",
    data: {
        user_info: {
            user_id: "4441682707496125",
            user_name: "张雨凡",
            company: "",
            job_title: "",
            avatar_large:
                "https://p6-passport.byteacctimg.com/img/user-avatar/cd3c00dc52add26196ab238a41cee73e~300x300.image",
            level: 3,
            description: "",
            followee_count: 99,
            follower_count: 207,
            post_article_count: 68,
            digg_article_count: 759,
            got_digg_count: 1417,
            got_view_count: 39585,
            post_shortmsg_count: 54,
            digg_shortmsg_count: 3,
            isfollowed: false,
            favorable_author: 0,
            power: 1812,
            study_point: 0,
            university: { university_id: "0", name: "", logo: "" },
            major: { major_id: "0", parent_id: "0", name: "" },
            student_status: 0,
            select_event_count: 0,
            select_online_course_count: 0,
            identity: 0,
            is_select_annual: true,
            select_annual_rank: 0,
            annual_list_type: 0,
            extraMap: {},
            is_logout: 0,
            annual_info: [],
        },
        competition_id: "7073682315834048548",
        bug_fix_num: 0, // 当前场次消除的bug
        got_assist_times: 0,
        user_rank: 0,
        user_own_bug: 16, // 拥有的bug数
        user_fix_award: 0,
    },
};

// bugfix
// https://api.juejin.cn/user_api/v1/bugfix/fix?aid=2608&uuid=7072972678613599755
/**
 * @query
 * aid=2608&uuid=7072972678613599755
 * @param
 * {"competition_id":"7080420862381260839","bug_fix_num":1,"not_self":0}
 */