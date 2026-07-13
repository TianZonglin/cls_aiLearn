import { normalizeProjectInput } from "@/lib/normalize";
import type { ProjectRecord } from "@/types/project";

const SAMPLE_CREATED_AT = "2026-07-02T09:00:00.000Z";
const SAMPLE_UPDATED_AT = "2026-07-02T09:30:00.000Z";

export const sampleProjects: ProjectRecord[] = [
  {
    id: "proj-moe-001",
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
    ...normalizeProjectInput({
      source: "moe",
      sourceProjectId: "MOE-2024-001",
      title: "人工智能支持下高校课程评价机制研究",
      principalInvestigator: "周明",
      institution: "华中师范大学",
      discipline: "教育学",
      fundType: "青年基金项目",
      year: 2024,
      projectNumber: "24YJC880018",
      status: "已立项",
      keywords: ["人工智能", "课程评价", "高等教育"],
      summary: "面向高校教学改革场景，研究人工智能支持下的课程评价机制与应用路径。",
      sourceUrl: "https://example.com/moe/24YJC880018",
      raw: {
        sample: true
      }
    })
  },
  {
    id: "proj-nsfc-001",
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
    ...normalizeProjectInput({
      source: "国家自然科学基金",
      sourceProjectId: "NSFC-001",
      title: "人工智能支持下的教育评价研究",
      principalInvestigator: "张三",
      institution: "华东某大学",
      discipline: "教育学",
      fundType: "面上项目",
      year: "2024年",
      projectNumber: "12345678",
      status: "已立项",
      keywords: ["人工智能", "教育评价"],
      summary: "研究人工智能支持下的教育评价机制与应用路径。",
      sourceUrl: "https://example.com/nsfc/12345678",
      raw: {
        sample: true
      }
    })
  },
  {
    id: "proj-nsfc-002",
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
    ...normalizeProjectInput({
      source: "nsfc",
      sourceProjectId: "NSFC-002",
      title: "高校科研项目知识图谱构建研究",
      principalInvestigator: "王五",
      institution: "北京某大学",
      discipline: "管理学",
      fundType: "青年项目",
      year: "2022",
      projectNumber: "87654321",
      status: "在研",
      keywords: "知识图谱, 科研管理",
      summary: "围绕高校科研项目数据治理和知识图谱构建展开研究。",
      sourceUrl: "https://example.com/nsfc/87654321",
      raw: {
        sample: true
      }
    })
  },
  {
    id: "proj-npopss-001",
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
    ...normalizeProjectInput({
      source: "国家社科基金",
      sourceProjectId: "NPOPSS-001",
      title: "新时代基础教育治理现代化研究",
      principalInvestigator: "李四",
      institution: "南京某师范大学",
      discipline: "教育学",
      fundType: "一般项目",
      year: 2023,
      projectNumber: "23BKS001",
      status: "已立项",
      keywords: "基础教育；教育治理；现代化",
      summary: "聚焦基础教育治理体系与治理能力现代化。",
      sourceUrl: "https://example.com/npopss/23BKS001",
      raw: {
        sample: true
      }
    })
  },
  {
    id: "proj-npopss-002",
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
    ...normalizeProjectInput({
      source: "npopss",
      sourceProjectId: "NPOPSS-002",
      title: "数字教育资源公共服务平台协同机制研究",
      principalInvestigator: "赵六",
      institution: "上海某大学",
      discipline: "图书馆/情报/文献学",
      fundType: "青年项目",
      year: 2021,
      projectNumber: "21CKS099",
      status: "结项",
      keywords: ["数字教育", "公共服务", "协同机制"],
      summary: "研究数字教育资源平台的公共服务协同模式。",
      sourceUrl: "https://example.com/npopss/21CKS099",
      raw: {
        sample: true
      }
    })
  }
];
