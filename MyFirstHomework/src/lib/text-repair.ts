import type { ProjectRecord } from "@/types/project";

function trimBrokenEdges(value: string) {
  return value
    .replace(/�+/g, "")
    .replace(/[?？]+$/g, "")
    .replace(/([一-龥])\?([一-龥])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDiscipline(value: string) {
  if (value.includes("马克思主") && value.includes("思想政治教育")) {
    return "马克思主义/思想政治教育";
  }

  if (value.includes("图书") && value.includes("文献")) {
    return "图书馆/情报/文献学";
  }

  if (value.includes("民族学") && value.includes("文化")) {
    return "民族学与文化学";
  }

  if (value.includes("新闻学") && value.includes("传播")) {
    return "新闻学与传播学";
  }

  if (value.includes("港澳台")) {
    return "港澳台问题研究";
  }

  if (value.includes("国际问题")) {
    return "国际问题研究";
  }

  return value;
}

function normalizeStatus(value: string) {
  if (value === "已立" || value === "已立项项") {
    return "已立项";
  }

  return value;
}

export function repairText(value?: string | null) {
  if (!value) {
    return value ?? null;
  }

  const cleaned = normalizeStatus(normalizeDiscipline(trimBrokenEdges(value)));
  return cleaned || null;
}

export function repairProjectRecord(project: ProjectRecord): ProjectRecord {
  return {
    ...project,
    title: repairText(project.title) ?? project.title,
    principalInvestigator: repairText(project.principalInvestigator),
    institution: repairText(project.institution),
    discipline: repairText(project.discipline),
    fundType: repairText(project.fundType),
    projectNumber: repairText(project.projectNumber),
    status: repairText(project.status),
    keywords: repairText(project.keywords),
    summary: repairText(project.summary)
  };
}
