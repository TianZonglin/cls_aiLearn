import type { OutcomeType } from "@/types/outcome";

export interface SampleOutcomeLead {
  id: string;
  projectNumber?: string;
  projectTitle?: string;
  principalInvestigator?: string;
  institution?: string;
  sourcePlatform: string;
  title: string;
  authors: string;
  outcomeType: OutcomeType;
  publishYear: number;
  publisherOrJournal: string;
  abstractText: string;
}

export const sampleOutcomeLeads: SampleOutcomeLead[] = [
  {
    id: "outcome-moe-24YJC880018-paper-1",
    projectNumber: "24YJC880018",
    projectTitle: "人工智能支持下高校课程评价机制研究",
    principalInvestigator: "周明",
    institution: "华中师范大学",
    sourcePlatform: "期刊官网",
    title: "人工智能支持下高校课程评价指标体系构建研究",
    authors: "周明",
    outcomeType: "paper",
    publishYear: 2025,
    publisherOrJournal: "教育研究与实验",
    abstractText:
      "围绕高校课程评价场景，讨论人工智能支持下的评价指标、实施路径与效果反馈机制。"
  },
  {
    id: "outcome-moe-24YJC880018-book-1",
    projectNumber: "24YJC880018",
    projectTitle: "人工智能支持下高校课程评价机制研究",
    principalInvestigator: "周明",
    institution: "华中师范大学",
    sourcePlatform: "图书公开页",
    title: "人工智能支持下课程评价机制研究",
    authors: "周明",
    outcomeType: "book",
    publishYear: 2026,
    publisherOrJournal: "高等教育出版社",
    abstractText:
      "系统梳理人工智能参与课程评价的理论框架、数据基础与高校应用案例。"
  },
  {
    id: "outcome-npopss-23BKS001-paper-1",
    projectNumber: "23BKS001",
    projectTitle: "新时代基础教育治理现代化研究",
    principalInvestigator: "李四",
    institution: "南京某师范大学",
    sourcePlatform: "高校科研成果页",
    title: "基础教育治理现代化的制度协同与路径优化",
    authors: "李四",
    outcomeType: "paper",
    publishYear: 2024,
    publisherOrJournal: "教育发展研究",
    abstractText:
      "从制度协同、治理结构和评价机制三个层面讨论基础教育治理现代化的实现路径。"
  },
  {
    id: "outcome-npopss-23BKS001-final-1",
    projectNumber: "23BKS001",
    projectTitle: "新时代基础教育治理现代化研究",
    principalInvestigator: "李四",
    institution: "南京某师范大学",
    sourcePlatform: "结项成果简介页",
    title: "新时代基础教育治理现代化研究结项成果摘要",
    authors: "李四",
    outcomeType: "final",
    publishYear: 2025,
    publisherOrJournal: "课题结项成果",
    abstractText:
      "梳理基础教育治理现代化研究的阶段性结论、核心发现与政策建议。"
  },
  {
    id: "outcome-npopss-21CKS099-paper-1",
    projectNumber: "21CKS099",
    projectTitle: "数字教育资源公共服务平台协同机制研究",
    principalInvestigator: "赵六",
    institution: "上海某大学",
    sourcePlatform: "期刊官网",
    title: "数字教育资源公共服务平台协同治理机制研究",
    authors: "赵六",
    outcomeType: "paper",
    publishYear: 2022,
    publisherOrJournal: "现代远程教育研究",
    abstractText:
      "从资源开放、平台治理与多主体协同角度分析数字教育资源公共服务平台的协同机制。"
  },
  {
    id: "outcome-nsfc-87654321-paper-1",
    projectNumber: "87654321",
    projectTitle: "高校科研项目知识图谱构建研究",
    principalInvestigator: "王五",
    institution: "北京某大学",
    sourcePlatform: "机构知识库",
    title: "高校科研项目知识图谱构建方法与治理应用",
    authors: "王五",
    outcomeType: "paper",
    publishYear: 2023,
    publisherOrJournal: "情报杂志",
    abstractText:
      "围绕高校科研项目数据治理，提出知识图谱构建流程及其在科研管理中的应用方法。"
  }
];
