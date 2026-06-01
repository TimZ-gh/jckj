(function () {
  const {
    AI_OPTIONS,
    CRITICAL_HUMAN_OPTIONS,
    DEPARTMENTS,
    PLATFORMS,
    buildEmptyResponse,
    getDepartmentLabel,
    getQuestionsForDepartment,
    serializeResponse,
  } = window.SurveySchema;

  const STORAGE_KEY = "cross_border_ai_survey_submissions";

  // GitHub Pages + Supabase setup:
  // 1. Run supabase-schema.sql in Supabase SQL Editor.
  // 2. Fill these two values with Project URL and anon public key.
  // 3. Commit/push the static files to GitHub Pages.
  const SUPABASE_URL = "https://vcexrfnxbgxzfrmiywwa.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZXhyZm54Ymd4emZybWl5d3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjYwNDIsImV4cCI6MjA5NTg0MjA0Mn0._53GQkaV1Z8oK6kXmvRc8JveAsU0H4aIiYCCofAApJ0";
  const SUPABASE_TABLE = "survey_responses";

  const state = {
    step: 0,
    response: buildEmptyResponse(),
  };

  const steps = [
    { id: "profile", label: "基础信息" },
    { id: "common", label: "通用流程" },
    { id: "department", label: "部门问题" },
    { id: "ai", label: "AI 改造" },
    { id: "submit", label: "提交导出" },
  ];

  const app = document.querySelector("#app");

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value !== undefined && value !== null && value !== false) {
        node.setAttribute(key, value);
      }
    });
    children.forEach((child) => node.append(child));
    return node;
  }

  function render() {
    app.innerHTML = "";
    app.append(renderHeader(), renderShell());
  }

  function renderHeader() {
    return el("header", { class: "hero" }, [
      el("div", { class: "hero-copy" }, [
        el("p", { class: "eyebrow", text: "跨境电商 AI 工作流调研" }),
        el("h1", { text: "业务流程与 AI 改造问卷" }),
        el("p", {
          class: "hero-text",
          text: "请根据你负责的真实工作填写。系统会按部门展示对应问题，并把答案整理成可导出的结构化数据，方便后续梳理 SOP、人工节点和数据库设计。",
        }),
      ]),
      el("div", { class: "hero-panel" }, [
        metric("5", "填写步骤"),
        metric(String(DEPARTMENTS.length), "部门分流"),
        metric(isSupabaseConfigured() ? "Supabase" : "本地导出", "数据收集"),
      ]),
    ]);
  }

  function metric(value, label) {
    return el("div", { class: "metric" }, [
      el("strong", { text: value }),
      el("span", { text: label }),
    ]);
  }

  function renderShell() {
    return el("main", { class: "survey-shell" }, [
      renderStepper(),
      el("section", { class: "card" }, [renderCurrentStep(), renderActions()]),
    ]);
  }

  function renderStepper() {
    return el(
      "nav",
      { class: "stepper", "aria-label": "填写进度" },
      steps.map((step, index) =>
        el("button", {
          class: index === state.step ? "step active" : index < state.step ? "step done" : "step",
          type: "button",
          onclick: () => {
            if (canEnterStep(index)) {
              state.step = index;
              render();
            }
          },
        }, [
          el("span", { class: "step-index", text: String(index + 1) }),
          el("span", { text: step.label }),
        ])
      )
    );
  }

  function canEnterStep(index) {
    if (index <= 1) return true;
    return Boolean(state.response.meta.department);
  }

  function renderCurrentStep() {
    if (state.step === 0) return renderProfileStep();
    if (state.step === 1) return renderCommonStep();
    if (state.step === 2) return renderDepartmentStep();
    if (state.step === 3) return renderAiStep();
    return renderSubmitStep();
  }

  function renderProfileStep() {
    return el("div", { class: "section-stack" }, [
      sectionTitle("基础信息", "先选择部门，后续问题会自动切换为对应版本。"),
      el("div", { class: "grid two" }, [
        inputField("姓名", "name", state.response.meta.name, "请输入姓名"),
        inputField("岗位 / 职责", "role", state.response.meta.role, "例如：TikTok 运营、剪辑、BD 负责人"),
        inputField("联系方式", "phone", state.response.meta.phone, "手机号 / 微信 / 邮箱"),
        checkboxGroup("负责平台", "platforms", PLATFORMS, state.response.meta.platforms, (value) => {
          state.response.meta.platforms = value;
        }),
      ]),
      el("div", { class: "department-grid" }, DEPARTMENTS.map((department) =>
        el("button", {
          type: "button",
          class: state.response.meta.department === department.id ? "department-card selected" : "department-card",
          onclick: () => {
            state.response.meta.department = department.id;
            state.response.departmentAnswers = {};
            render();
          },
        }, [
          el("strong", { text: department.label }),
          el("span", { text: department.hint }),
        ])
      )),
    ]);
  }

  function renderCommonStep() {
    const questions = getQuestionsForDepartment(state.response.meta.department).common;
    return el("div", { class: "section-stack" }, [
      sectionTitle("通用流程问题", "每个部门都需要填写，用来还原真实工作方式。"),
      renderQuestions(questions, state.response.commonAnswers),
      renderFlowTable(),
    ]);
  }

  function renderDepartmentStep() {
    const questions = getQuestionsForDepartment(state.response.meta.department).department;
    const label = getDepartmentLabel(state.response.meta.department);
    return el("div", { class: "section-stack" }, [
      sectionTitle(label, "以下问题只针对你选择的部门，请尽量用当前真实做法回答。"),
      questions.length
        ? renderQuestions(questions, state.response.departmentAnswers)
        : el("p", { class: "empty", text: "请先在基础信息中选择部门。" }),
    ]);
  }

  function renderAiStep() {
    return el("div", { class: "section-stack" }, [
      sectionTitle("AI 改造与人工节点", "请勾选你认为适合 AI 辅助，以及必须人工把控的环节。"),
      el("div", { class: "grid two" }, [
        checkboxGroup("我希望 AI 帮我做", "ai-useful", AI_OPTIONS, state.response.ai.usefulAreas, (value) => {
          state.response.ai.usefulAreas = value;
        }),
        checkboxGroup("这些工作不能完全交给 AI", "human-only", CRITICAL_HUMAN_OPTIONS, state.response.ai.humanOnly, (value) => {
          state.response.ai.humanOnly = value;
        }),
      ]),
      textAreaField("补充说明", "ai-extra", state.response.ai.extra, "还有哪些适合 AI 的环节、风险或顾虑？", (value) => {
        state.response.ai.extra = value;
      }),
      textAreaField("资料链接", "attachment-links", state.response.attachments.links, "可粘贴飞书、多维表、网盘、Listing 样本、达人表等链接", (value) => {
        state.response.attachments.links = value;
      }),
      textAreaField("其他备注", "attachment-notes", state.response.attachments.notes, "请补充任何你认为会影响流程梳理的信息", (value) => {
        state.response.attachments.notes = value;
      }),
    ]);
  }

  function renderSubmitStep() {
    const serialized = serializeResponse(state.response);
    const submissions = loadSubmissions();
    return el("div", { class: "section-stack" }, [
      sectionTitle("提交与导出", isSupabaseConfigured()
        ? "提交后会保存到 Supabase，同时也会在当前浏览器保留一份备份。"
        : "当前尚未配置 Supabase，提交会先保存在当前浏览器中；你也可以导出 JSON / CSV。"),
      el("div", { class: "summary-grid" }, [
        summaryItem("姓名", state.response.meta.name || "未填写"),
        summaryItem("部门", serialized.summary.departmentLabel),
        summaryItem("流程步骤", `${serialized.summary.stepCount} 条`),
        summaryItem("本机提交", `${submissions.length} 条`),
      ]),
      el("pre", { class: "export-preview", text: serialized.exportText }),
      el("div", { class: "button-row" }, [
        el("button", { class: "primary", type: "button", onclick: submitResponse, text: "提交当前问卷" }),
        el("button", { type: "button", onclick: downloadJson, text: "导出 JSON" }),
        el("button", { type: "button", onclick: downloadCsv, text: "导出 CSV" }),
        el("button", { type: "button", onclick: copyCurrentJson, text: "复制当前答案" }),
      ]),
    ]);
  }

  function renderActions() {
    return el("div", { class: "actions" }, [
      el("button", {
        type: "button",
        disabled: state.step === 0 ? "true" : null,
        onclick: () => {
          state.step = Math.max(0, state.step - 1);
          render();
        },
        text: "上一步",
      }),
      el("button", {
        class: "primary",
        type: "button",
        onclick: () => {
          if (state.step === 0 && !state.response.meta.department) {
            alert("请先选择所属部门。");
            return;
          }
          state.step = Math.min(steps.length - 1, state.step + 1);
          render();
        },
        text: state.step === steps.length - 1 ? "检查完成" : "下一步",
      }),
    ]);
  }

  function sectionTitle(title, description) {
    return el("div", { class: "section-title" }, [
      el("h2", { text: title }),
      el("p", { text: description }),
    ]);
  }

  function renderQuestions(questions, target) {
    return el("div", { class: "question-list" }, questions.map((question) => {
      if (question.type === "checkbox") {
        return checkboxGroup(question.label, question.id, question.options, target[question.id] || [], (value) => {
          target[question.id] = value;
        });
      }
      if (question.type === "radio") {
        return radioGroup(question.label, question.id, question.options, target[question.id] || "", (value) => {
          target[question.id] = value;
        });
      }
      if (question.type === "textarea") {
        return textAreaField(question.label, question.id, target[question.id] || "", question.placeholder, (value) => {
          target[question.id] = value;
        });
      }
      return inputField(question.label, question.id, target[question.id] || "", question.placeholder, (value) => {
        target[question.id] = value;
      });
    }));
  }

  function inputField(label, id, value, placeholder = "", customChange) {
    return el("label", { class: "field" }, [
      el("span", { text: label }),
      el("input", {
        id,
        value,
        placeholder,
        oninput: (event) => {
          if (customChange) customChange(event.target.value);
          else state.response.meta[id] = event.target.value;
        },
      }),
    ]);
  }

  function textAreaField(label, id, value, placeholder, onChange) {
    return el("label", { class: "field wide" }, [
      el("span", { text: label }),
      el("textarea", {
        id,
        placeholder,
        oninput: (event) => onChange(event.target.value),
      }, [document.createTextNode(value || "")]),
    ]);
  }

  function checkboxGroup(label, id, options, selected, onChange) {
    return el("fieldset", { class: "choice-group" }, [
      el("legend", { text: label }),
      el("div", { class: "choices" }, options.map((option) =>
        el("label", { class: "choice" }, [
          el("input", {
            type: "checkbox",
            name: id,
            value: option,
            checked: selected.includes(option) ? "checked" : null,
            onchange: (event) => {
              const next = new Set(selected);
              if (event.target.checked) next.add(option);
              else next.delete(option);
              onChange([...next]);
              render();
            },
          }),
          el("span", { text: option }),
        ])
      )),
    ]);
  }

  function radioGroup(label, id, options, selected, onChange) {
    return el("fieldset", { class: "choice-group" }, [
      el("legend", { text: label }),
      el("div", { class: "choices" }, options.map((option) =>
        el("label", { class: "choice" }, [
          el("input", {
            type: "radio",
            name: id,
            value: option,
            checked: selected === option ? "checked" : null,
            onchange: () => {
              onChange(option);
              render();
            },
          }),
          el("span", { text: option }),
        ])
      )),
    ]);
  }

  function renderFlowTable() {
    return el("div", { class: "flow-block" }, [
      el("div", { class: "inline-title" }, [
        el("h3", { text: "请按顺序填写你的主要工作步骤" }),
        el("button", { type: "button", onclick: addFlowStep, text: "添加步骤" }),
      ]),
      state.response.flow.steps.length
        ? el("div", { class: "flow-list" }, state.response.flow.steps.map((step, index) => flowStepCard(step, index)))
        : el("p", { class: "empty", text: "还没有步骤。请点击“添加步骤”，按真实工作顺序填写。" }),
    ]);
  }

  function flowStepCard(step, index) {
    const update = (key, value) => {
      state.response.flow.steps[index][key] = value;
    };
    return el("div", { class: "flow-card" }, [
      el("div", { class: "flow-card-head" }, [
        el("strong", { text: `步骤 ${index + 1}` }),
        el("button", { type: "button", onclick: () => removeFlowStep(index), text: "删除" }),
      ]),
      el("div", { class: "grid four" }, [
        inputField("步骤名称", `step-name-${index}`, step.name, "例如：整理产品资料", (value) => update("name", value)),
        inputField("负责人", `step-owner-${index}`, step.owner, "岗位 / 人员", (value) => update("owner", value)),
        inputField("输入资料", `step-input-${index}`, step.input, "上一步给你的内容", (value) => update("input", value)),
        inputField("输出结果", `step-output-${index}`, step.output, "你交付的内容", (value) => update("output", value)),
        inputField("当前工具", `step-tool-${index}`, step.tool, "Excel / 飞书 / ERP 等", (value) => update("tool", value)),
        inputField("耗时", `step-time-${index}`, step.timeCost, "例如：30 分钟", (value) => update("timeCost", value)),
        selectField("AI 适用", `step-ai-${index}`, step.aiFit, ["可 AI 替代", "可 AI 辅助", "暂不适合", "不确定"], (value) => update("aiFit", value)),
        selectField("人工审核", `step-human-${index}`, step.humanCheck, ["必须人工审核", "主管抽查", "无需审核", "不确定"], (value) => update("humanCheck", value)),
      ]),
    ]);
  }

  function selectField(label, id, value, options, onChange) {
    const select = el("select", {
      id,
      onchange: (event) => onChange(event.target.value),
    }, [
      el("option", { value: "", text: "请选择" }),
      ...options.map((option) => el("option", { value: option, text: option })),
    ]);
    select.value = value || "";
    return el("label", { class: "field" }, [el("span", { text: label }), select]);
  }

  function addFlowStep() {
    state.response.flow.steps.push({
      name: "",
      owner: "",
      input: "",
      output: "",
      tool: "",
      timeCost: "",
      aiFit: "",
      humanCheck: "",
    });
    render();
  }

  function removeFlowStep(index) {
    state.response.flow.steps.splice(index, 1);
    render();
  }

  function summaryItem(label, value) {
    return el("div", { class: "summary-item" }, [
      el("span", { text: label }),
      el("strong", { text: value }),
    ]);
  }

  async function submitResponse() {
    const serialized = serializeResponse(state.response);
    const submissions = loadSubmissions();
    submissions.push(serialized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));

    if (isSupabaseConfigured()) {
      try {
        await submitToSupabase(serialized);
        alert("已提交到 Supabase，并已在当前浏览器保留备份。");
      } catch (error) {
        console.error(error);
        alert(`本地已保存，但提交 Supabase 失败：${error.message}`);
      }
    } else {
      alert("已提交到当前浏览器。本版本尚未配置 Supabase，可先导出 JSON / CSV。");
    }
    render();
  }

  async function submitToSupabase(serialized) {
    const payload = {
      submitted_at: serialized.submittedAt,
      name: serialized.meta.name || null,
      department: serialized.meta.department || null,
      role: serialized.meta.role || null,
      phone: serialized.meta.phone || null,
      platforms: serialized.meta.platforms || [],
      payload: serialized,
    };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `HTTP ${response.status}`);
    }
  }

  function isSupabaseConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  function loadSubmissions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function downloadJson() {
    const submissions = loadSubmissions();
    downloadFile("cross-border-ai-survey.json", JSON.stringify(submissions, null, 2), "application/json");
  }

  function downloadCsv() {
    const rows = loadSubmissions();
    const headers = ["提交时间", "姓名", "部门", "岗位", "平台", "流程步骤数", "AI 可辅助", "人工把控", "资料链接"];
    const lines = [
      headers.join(","),
      ...rows.map((row) => [
        row.submittedAt,
        row.meta && row.meta.name,
        row.summary && row.summary.departmentLabel,
        row.meta && row.meta.role,
        ((row.meta && row.meta.platforms) || []).join(" / "),
        row.summary && row.summary.stepCount,
        ((row.ai && row.ai.usefulAreas) || []).join(" / "),
        ((row.ai && row.ai.humanOnly) || []).join(" / "),
        row.attachments && row.attachments.links,
      ].map(csvCell).join(",")),
    ];
    downloadFile("cross-border-ai-survey.csv", lines.join("\n"), "text/csv;charset=utf-8");
  }

  function csvCell(value = "") {
    return `"${String(value || "").replaceAll('"', '""')}"`;
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyCurrentJson() {
    await navigator.clipboard.writeText(JSON.stringify(serializeResponse(state.response), null, 2));
    alert("当前答案 JSON 已复制。");
  }

  render();
})();
