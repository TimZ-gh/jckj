(function () {
  const DEPARTMENTS = [
    { id: "management", label: "管理层 / 老板", hint: "业务目标、优先级、风险边界、验收标准" },
    { id: "product", label: "产品 / 选品", hint: "产品资料、卖点、素材、合规限制" },
    { id: "listing", label: "Listing / 平台运营", hint: "上架文案、关键词、多语言、平台审核" },
    { id: "content", label: "内容 / 短视频", hint: "选题、脚本、爆款拆解、Prompt" },
    { id: "video", label: "视频制作 / AI 执行", hint: "素材、剪辑、生成任务、成片质检" },
    { id: "bd", label: "BD / 达人运营", hint: "达人库、邀约话术、寄样、合作效果" },
    { id: "review", label: "审核 / 主管", hint: "人工审核点、打回原因、风险控制" },
    { id: "data", label: "数据 / 复盘", hint: "发布数据、复盘周期、效果回流" },
  ];

  const PLATFORMS = ["TikTok Shop", "Amazon", "Shopify", "Temu", "Shopee", "独立站", "其他"];
  const TOOL_OPTIONS = ["Excel / 表格", "飞书 / 多维表", "ERP", "网盘", "聊天记录", "TikTok 后台", "第三方数据工具", "剪辑 / AI 视频工具", "暂无固定工具"];
  const AI_OPTIONS = ["资料整理", "初稿生成", "多版本改写", "翻译", "关键词提取", "竞品分析", "爆款拆解", "脚本 / Prompt 生成", "话术生成", "数据汇总", "审核检查", "任务提醒", "复盘总结"];
  const CRITICAL_HUMAN_OPTIONS = ["产品卖点确认", "价格 / 库存确认", "Listing 最终审核", "视频脚本审核", "视频成片审核", "达人合作确认", "发布前确认", "合规风险判断", "老板最终决策"];

  const COMMON_QUESTIONS = [
    { id: "main_responsibility", label: "你当前主要负责哪些工作？", type: "textarea", placeholder: "例如：TikTok Shop 上架、短视频脚本、达人邀约、数据复盘等" },
    { id: "task_source", label: "你的任务通常从哪里来？", type: "checkbox", options: ["老板安排", "主管分配", "运营计划", "产品上新", "数据反馈", "客户 / 达人反馈", "临时需求"] },
    { id: "needed_materials", label: "开始工作前通常需要哪些资料？", type: "textarea", placeholder: "例如：产品图、价格、竞品链接、关键词、历史脚本、达人资料等" },
    { id: "material_locations", label: "这些资料目前主要存在哪里？", type: "checkbox", options: TOOL_OPTIONS },
    { id: "top_repeated_work", label: "每天 / 每周重复最多的工作是什么？", type: "textarea", placeholder: "请列出 1-5 项，越具体越好" },
    { id: "output_receiver", label: "你的工作结果通常交给谁？", type: "text", placeholder: "例如：运营主管、老板、剪辑、BD、平台运营" },
    { id: "reviewer", label: "谁会审核你的工作结果？", type: "text", placeholder: "例如：老板、部门主管、平台负责人；如果没人审核，也请写“无”" },
    { id: "time_consuming", label: "哪些步骤最耗时间？", type: "textarea", placeholder: "请说明耗时原因，例如资料不全、反复沟通、手动复制、需要多轮修改" },
    { id: "rework_causes", label: "哪些情况最容易出错或返工？", type: "textarea", placeholder: "例如：信息错、表达违规、素材不匹配、审核打回、达人回复慢" },
    { id: "current_templates", label: "是否已有固定模板、表格、话术或 SOP？", type: "radio", options: ["有，且经常使用", "有，但不完整", "没有，主要靠个人经验", "不清楚"] },
    { id: "records_saved", label: "完成工作后，过程和结果是否会被记录？", type: "radio", options: ["完整记录，后续会复用", "部分记录，但查找不方便", "很少记录", "基本不记录"] },
    { id: "ideal_dashboard", label: "如果有一个工作台页面，你希望打开后首先看到什么？", type: "textarea", placeholder: "例如：待处理任务、产品资料、AI 生成草稿、审核状态、达人跟进提醒、数据表现" },
  ];

  const DEPARTMENT_QUESTIONS = {
    management: [
      { id: "priority_goal", label: "当前最想优化的目标是什么？", type: "checkbox", options: ["效率", "成本", "内容质量", "转化率", "团队管理", "数据沉淀", "风险控制"] },
      { id: "chaotic_links", label: "你认为目前最混乱或最依赖个人经验的环节是哪些？", type: "textarea", placeholder: "请按优先级列出 3-5 个环节" },
      { id: "must_review", label: "哪些内容必须由老板或主管亲自把关？", type: "checkbox", options: CRITICAL_HUMAN_OPTIONS },
      { id: "monthly_volume", label: "当前每月大概产出量是多少？", type: "textarea", placeholder: "例如：上新产品数、Listing 数、视频数、达人合作数" },
      { id: "first_chain", label: "如果第一阶段只能改造一条业务链，你最希望先改哪条？", type: "radio", options: ["产品 -> Listing", "产品 -> 视频脚本 / Prompt", "产品 -> BD 达人分发", "全链路轻量打通", "暂不确定"] },
      { id: "success_metric", label: "第一阶段如何判断项目有效？", type: "checkbox", options: ["产出数量提升", "返工减少", "人工耗时下降", "内容质量提升", "成本下降", "数据更容易复用", "团队流程更清晰"] },
    ],
    product: [
      { id: "product_source", label: "新产品通常从哪里来？", type: "textarea", placeholder: "例如：供应商、老板选品、平台趋势、竞品跟进、工厂推荐" },
      { id: "product_fields", label: "产品资料通常包含哪些字段？", type: "checkbox", options: ["名称", "规格", "成本", "售价", "库存", "卖点", "目标人群", "使用场景", "图片", "视频", "说明书", "禁用词 / 合规限制"] },
      { id: "product_owner", label: "谁负责维护产品资料和卖点？", type: "text", placeholder: "请填写岗位或负责人" },
      { id: "asset_management", label: "产品图片、视频、说明书是否统一管理？", type: "radio", options: ["统一管理且命名清晰", "统一存放但较混乱", "分散在多人手里", "基本没有沉淀"] },
      { id: "frequent_missing", label: "哪些产品信息经常缺失或被反复询问？", type: "textarea", placeholder: "例如：尺寸、材质、卖点、禁用表达、图片源文件等" },
    ],
    listing: [
      { id: "listing_platforms", label: "你主要负责哪些平台的 Listing？", type: "checkbox", options: PLATFORMS },
      { id: "listing_materials", label: "写 Listing 前需要哪些资料？", type: "textarea", placeholder: "例如：产品表、竞品链接、关键词、图片、平台规则等" },
      { id: "keyword_source", label: "关键词目前怎么找？", type: "checkbox", options: ["竞品 Listing", "平台搜索", "第三方工具", "历史关键词表", "AI 生成", "靠经验", "暂无固定方法"] },
      { id: "listing_review_failures", label: "Listing 常见打回或审核失败原因是什么？", type: "textarea", placeholder: "例如：违规词、夸大宣传、关键词不准、翻译问题、资料错误" },
      { id: "multilingual", label: "是否需要多语言版本？", type: "radio", options: ["经常需要", "偶尔需要", "暂时不需要", "不清楚"] },
    ],
    content: [
      { id: "topic_source", label: "视频选题从哪里来？", type: "checkbox", options: ["爆款视频", "竞品账号", "产品卖点", "老板想法", "平台趋势", "评论区需求", "历史数据复盘", "临时灵感"] },
      { id: "viral_selection", label: "现在怎么判断一个视频值得参考？", type: "textarea", placeholder: "例如：播放量、互动率、评论购买意图、同类产品表现、主观判断" },
      { id: "script_template", label: "是否有固定脚本模板？", type: "radio", options: ["有，且按类目复用", "有一些零散模板", "没有，主要现写", "不清楚"] },
      { id: "script_content", label: "一条脚本通常包含哪些内容？", type: "checkbox", options: ["标题", "开头钩子", "口播", "字幕", "分镜", "画面描述", "CTA", "AI 视频 Prompt", "素材需求"] },
      { id: "ai_script_problem", label: "目前 AI 生成脚本最大的问题是什么？", type: "textarea", placeholder: "例如：不懂产品、像广告、缺少真实场景、Prompt 不稳定、合规风险" },
    ],
    video: [
      { id: "production_method", label: "视频现在主要如何生产？", type: "radio", options: ["人工剪辑为主", "AI 生成为主", "人工 + AI 混合", "外包为主", "暂不固定"] },
      { id: "video_tools", label: "常用哪些剪辑或 AI 视频工具？", type: "textarea", placeholder: "例如：剪映、CapCut、Runway、HeyGen、可灵、即梦、Midjourney 等" },
      { id: "video_assets", label: "制作视频通常需要哪些素材？", type: "checkbox", options: ["产品图", "产品视频", "使用场景图", "真人素材", "口播音频", "字幕", "BGM", "品牌素材", "达人素材"] },
      { id: "quality_standard", label: "成片质量由谁判断？有没有标准？", type: "textarea", placeholder: "请写审核人、判断标准、常见不合格原因" },
      { id: "prompt_failures", label: "AI 视频 Prompt 哪些情况最容易失败？", type: "textarea", placeholder: "例如：产品变形、镜头不稳定、字幕错位、人物不自然、卖点不清晰" },
    ],
    bd: [
      { id: "creator_source", label: "达人从哪里找？", type: "checkbox", options: ["TikTok 搜索", "联盟后台", "第三方工具", "同行推荐", "历史达人表", "邮箱 / 私信积累", "暂无固定来源"] },
      { id: "creator_fields", label: "达人表目前记录哪些字段？", type: "checkbox", options: ["国家", "类目", "粉丝数", "联系方式", "报价", "寄样状态", "合作状态", "发布链接", "播放数据", "转化数据", "历史备注"] },
      { id: "match_method", label: "现在如何判断达人适合某个产品？", type: "textarea", placeholder: "例如：类目匹配、历史表现、粉丝画像、报价、内容风格" },
      { id: "message_templates", label: "邀约话术是否有模板？", type: "radio", options: ["有，按场景区分", "有一个通用模板", "没有，临时写", "不清楚"] },
      { id: "bd_bottleneck", label: "BD 合作最容易卡在哪里？", type: "textarea", placeholder: "例如：找人、回复慢、报价、寄样、素材发送、发布链接回收、数据统计" },
    ],
    review: [
      { id: "review_scope", label: "哪些内容必须审核？", type: "checkbox", options: ["产品资料", "Listing", "视频脚本", "AI 视频 Prompt", "成片", "达人话术", "发布素材", "价格 / 库存", "合规表达"] },
      { id: "review_standard", label: "目前是否有书面审核标准？", type: "radio", options: ["有完整标准", "有部分标准", "主要靠经验", "没有"] },
      { id: "reject_reasons", label: "审核不通过通常有哪些原因？", type: "textarea", placeholder: "例如：卖点不准、表达违规、信息错误、画面不合格、品牌风险" },
      { id: "review_feedback", label: "审核意见现在怎么反馈？", type: "checkbox", options: ["口头", "聊天软件", "表格备注", "文档评论", "系统流转", "没有固定方式"] },
      { id: "review_page_needs", label: "你希望审核页面展示哪些信息？", type: "textarea", placeholder: "例如：原始产品资料、AI 生成依据、历史版本、打回原因、一键通过 / 打回" },
    ],
    data: [
      { id: "data_collected", label: "发布后目前会收集哪些数据？", type: "checkbox", options: ["播放", "点赞", "评论", "收藏", "转发", "点击", "转化", "订单", "达人反馈", "平台审核结果", "不固定"] },
      { id: "data_mapping", label: "数据能否对应到具体产品、视频、达人？", type: "radio", options: ["都可以对应", "只能部分对应", "基本不能对应", "不清楚"] },
      { id: "review_rhythm", label: "多久复盘一次？", type: "radio", options: ["每天", "每周", "每月", "不固定", "基本不复盘"] },
      { id: "good_bad_marking", label: "表现好 / 差的内容是否会标记原因？", type: "radio", options: ["会详细标记", "偶尔标记", "只看数据不记录原因", "不清楚"] },
      { id: "desired_report", label: "你希望系统自动生成什么复盘结果？", type: "textarea", placeholder: "例如：高表现脚本共性、达人效果排行、产品内容建议、下一轮选题方向" },
    ],
  };

  function getDepartmentLabel(id) {
    const department = DEPARTMENTS.find((item) => item.id === id);
    return department ? department.label : "未选择";
  }

  function getQuestionsForDepartment(departmentId) {
    return {
      common: COMMON_QUESTIONS,
      department: DEPARTMENT_QUESTIONS[departmentId] || [],
    };
  }

  function buildEmptyResponse(departmentId = "") {
    return {
      meta: { name: "", department: departmentId, role: "", phone: "", platforms: [] },
      commonAnswers: {},
      departmentAnswers: {},
      flow: { topTasks: [], steps: [] },
      ai: { usefulAreas: [], humanOnly: [], extra: "" },
      attachments: { links: "", notes: "" },
    };
  }

  function serializeResponse(response) {
    const timestamp = new Date().toISOString();
    const departmentLabel = getDepartmentLabel(response.meta && response.meta.department);
    const stepCount = (response.flow && response.flow.steps && response.flow.steps.length) || 0;
    const exportText = [
      `提交时间：${timestamp}`,
      `姓名：${(response.meta && response.meta.name) || ""}`,
      `部门：${departmentLabel}`,
      `岗位：${(response.meta && response.meta.role) || ""}`,
      `负责平台：${((response.meta && response.meta.platforms) || []).join("、")}`,
      `流程步骤数：${stepCount}`,
      `AI 可辅助：${((response.ai && response.ai.usefulAreas) || []).join("、")}`,
      `人工把控：${((response.ai && response.ai.humanOnly) || []).join("、")}`,
      `资料链接：${(response.attachments && response.attachments.links) || ""}`,
    ].join("\n");

    return {
      ...response,
      submittedAt: timestamp,
      summary: {
        departmentLabel,
        stepCount,
        aiAreaCount: (response.ai && response.ai.usefulAreas && response.ai.usefulAreas.length) || 0,
        humanOnlyCount: (response.ai && response.ai.humanOnly && response.ai.humanOnly.length) || 0,
      },
      exportText,
    };
  }

  window.SurveySchema = {
    AI_OPTIONS,
    CRITICAL_HUMAN_OPTIONS,
    DEPARTMENTS,
    PLATFORMS,
    buildEmptyResponse,
    getDepartmentLabel,
    getQuestionsForDepartment,
    serializeResponse,
  };
})();
