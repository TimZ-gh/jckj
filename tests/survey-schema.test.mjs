import assert from "node:assert/strict";
import {
  AI_OPTIONS,
  CRITICAL_HUMAN_OPTIONS,
  DEPARTMENTS,
  buildEmptyResponse,
  getQuestionsForDepartment,
  serializeResponse,
} from "../survey-schema.mjs";

assert.ok(DEPARTMENTS.length >= 8, "expected at least eight department routes");
assert.ok(
  DEPARTMENTS.some((department) => department.id === "bd"),
  "expected a BD department route"
);
assert.ok(AI_OPTIONS.includes("初稿生成"), "expected AI assistance options");
assert.ok(
  CRITICAL_HUMAN_OPTIONS.includes("Listing 最终审核"),
  "expected human-control options"
);

const listingQuestions = getQuestionsForDepartment("listing");
assert.ok(
  listingQuestions.common.length >= 10,
  "expected common workflow questions"
);
assert.ok(
  listingQuestions.department.some((question) => question.id === "listing_platforms"),
  "expected listing-specific questions"
);
assert.equal(
  getQuestionsForDepartment("unknown").department.length,
  0,
  "unknown department should not return specific questions"
);

const response = buildEmptyResponse("listing");
assert.equal(response.meta.department, "listing");
assert.deepEqual(response.ai.usefulAreas, []);
assert.deepEqual(response.flow.steps, []);

const serialized = serializeResponse({
  meta: {
    name: "张三",
    department: "listing",
    role: "平台运营",
    phone: "13800000000",
    platforms: ["TikTok Shop", "Amazon"],
  },
  flow: {
    topTasks: ["写 Listing", "找关键词"],
    steps: [
      {
        name: "整理产品资料",
        owner: "运营",
        input: "产品表",
        output: "卖点清单",
        tool: "Excel",
        timeCost: "30 分钟",
        aiFit: "可 AI 辅助",
        humanCheck: "需要",
      },
    ],
  },
  ai: {
    usefulAreas: ["初稿生成", "关键词提取"],
    humanOnly: ["Listing 最终审核"],
  },
  departmentAnswers: {
    listing_platforms: ["TikTok Shop"],
  },
  attachments: {
    links: "https://example.com/sheet",
  },
});

assert.equal(serialized.meta.name, "张三");
assert.equal(serialized.summary.departmentLabel, "Listing / 平台运营");
assert.equal(serialized.summary.stepCount, 1);
assert.match(serialized.exportText, /张三/);
assert.match(serialized.exportText, /Listing 最终审核/);

console.log("survey schema tests passed");
