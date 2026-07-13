import { SOURCE_LABELS } from "@/lib/source-labels";
import type { ProjectListItem } from "@/types/project";

function fallback(value?: string | number | null) {
  return value ?? "待补充";
}

export function ProjectCard({
  index,
  project
}: {
  index: number;
  project: ProjectListItem;
}) {
  return (
    <tr>
      <td className="results-table__index">{index}</td>
      <td className="results-table__title-cell">
        <div className="results-table__title">{project.title}</div>
      </td>
      <td>{fallback(project.discipline)}</td>
      <td>{fallback(project.fundType)}</td>
      <td>{fallback(project.year)}</td>
      <td>{fallback(project.principalInvestigator)}</td>
      <td>{fallback(project.institution)}</td>
      <td>{SOURCE_LABELS[project.source]}</td>
      <td>
        {project.sourceUrl ? (
          <a className="table-link table-link--inline" href={project.sourceUrl} rel="noreferrer" target="_blank">
            查看来源
          </a>
        ) : (
          "待补充"
        )}
      </td>
    </tr>
  );
}
