// Define all possible features
export const ADDON_FEATURES = ["evals", "experiments", "prompts"] as const;
export const NON_FREE_FEATURES = [
  "sessions",
  "properties",
  "users",
  "datasets",
  "alerts",
] as const;

// Create a combined type of all features
export type FeatureId =
  | (typeof ADDON_FEATURES)[number]
  | (typeof NON_FREE_FEATURES)[number];

// Define all possible subfeatures for each feature
export const SUBFEATURES = {
  prompts: ["versions", "runs", "playground_runs"],
  experiments: ["test_cases", "variants"],
  evals: ["runs"],
  datasets: ["requests"],
} as const;

// Create a type for all possible subfeature IDs
export type SubfeatureId =
  | (typeof SUBFEATURES.prompts)[number]
  | (typeof SUBFEATURES.experiments)[number]
  | (typeof SUBFEATURES.evals)[number]
  | (typeof SUBFEATURES.datasets)[number];

// Helper functions to type check features and subfeatures
export function isFeature(feature: string): feature is FeatureId {
  return [...ADDON_FEATURES, ...NON_FREE_FEATURES].includes(feature as any);
}

export function isSubfeature(subfeature: string): subfeature is SubfeatureId {
  return Object.values(SUBFEATURES)
    .flat()
    .includes(subfeature as any);
}

// Get subfeatures for a specific feature
export function getSubfeaturesForFeature(
  feature: FeatureId,
): readonly string[] {
  return (SUBFEATURES as any)[feature] || [];
}

// Create lookup table for feature display names (useful for UI)
export const FEATURE_DISPLAY_NAMES: Record<FeatureId, string> = {
  prompts: "提示词",
  experiments: "实验",
  evals: "评估器",
  sessions: "会话",
  properties: "属性",
  users: "用户",
  datasets: "数据集",
  alerts: "警报",
};

// Create lookup table for subfeature display names
export const SUBFEATURE_DISPLAY_NAMES: Record<SubfeatureId, string> = {
  versions: "版本",
  test_cases: "测试用例",
  variants: "变体",
  runs: "提示词运行",
  playground_runs: "游乐场运行",
  requests: "请求",
};
