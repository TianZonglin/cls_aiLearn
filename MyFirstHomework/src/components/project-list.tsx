import { ProjectCard } from "@/components/project-card";
import type { ProjectListResponse } from "@/types/project";

export function ProjectList({ response }: { response: ProjectListResponse }) {
  if (response.items.length === 0) {
    return (
      <section className="empty-state">
        <h2>暂无匹配结果</h2>
        <p>可以尝试调整课题名称、学科分类、工作单位、来源或立项年份。</p>
      </section>
    );
  }

  return (
    <section className="results-panel results-panel--list">
      <div className="results-panel__summary results-panel__summary--list">
        <div>
          <h2>检索结果</h2>
          <p>
            当前展示 {response.items.length} 条，本次条件共匹配 {response.pagination.total} 条。
          </p>
        </div>
        <div className="results-summary-meta">
          <span>当前页 {response.pagination.page}</span>
          <span>每页 {response.pagination.pageSize} 条</span>
        </div>
      </div>

      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>课题名称</th>
              <th>学科分类</th>
              <th>基金类别</th>
              <th>立项年份</th>
              <th>负责人</th>
              <th>工作单位</th>
              <th>来源</th>
              <th>原始来源</th>
            </tr>
          </thead>
          <tbody>
            {response.items.map((project, index) => (
              <ProjectCard
                key={project.id}
                index={(response.pagination.page - 1) * response.pagination.pageSize + index + 1}
                project={project}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
