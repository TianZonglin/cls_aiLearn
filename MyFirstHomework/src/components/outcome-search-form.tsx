import { DISCIPLINE_OPTIONS } from "@/lib/disciplines";
import { getAvailableSources, getAvailableYears } from "@/lib/project-repository";
import { SOURCE_LABELS } from "@/lib/source-labels";

interface OutcomeSearchFormProps {
  projectTitle?: string;
  projectNumber?: string;
  principalInvestigator?: string;
  institution?: string;
  discipline?: string;
  source?: string;
  year?: string;
  outcomeType?: string;
}

const outcomeTypes = [
  { value: "", label: "全部成果类型" },
  { value: "paper", label: "论文" },
  { value: "book", label: "著作" },
  { value: "final", label: "结项成果" }
];

export async function OutcomeSearchForm({
  projectTitle = "",
  projectNumber = "",
  principalInvestigator = "",
  institution = "",
  discipline = "",
  source = "",
  year = "",
  outcomeType = ""
}: OutcomeSearchFormProps) {
  const [sources, years] = await Promise.all([getAvailableSources(), getAvailableYears()]);

  return (
    <form action="/outcomes/search" className="outcome-form">
      <div className="outcome-form__grid">
        <label className="field field-wide">
          <span>项目名称</span>
          <input defaultValue={projectTitle} name="projectTitle" placeholder="输入项目名称" type="text" />
        </label>

        <label className="field">
          <span>批准号</span>
          <input defaultValue={projectNumber} name="projectNumber" placeholder="输入批准号" type="text" />
        </label>

        <label className="field">
          <span>负责人</span>
          <input
            defaultValue={principalInvestigator}
            name="principalInvestigator"
            placeholder="输入负责人"
            type="text"
          />
        </label>

        <label className="field field-wide">
          <span>所在单位</span>
          <input defaultValue={institution} name="institution" placeholder="输入所在单位" type="text" />
        </label>

        <label className="field">
          <span>来源</span>
          <select defaultValue={source} name="source">
            <option value="">全部来源</option>
            {sources.map((item) => (
              <option key={item} value={item}>
                {SOURCE_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>学科分类</span>
          <select defaultValue={discipline} name="discipline">
            <option value="">全部学科</option>
            {DISCIPLINE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>立项年份</span>
          <select defaultValue={year} name="year">
            <option value="">全部年份</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>成果类型</span>
          <select defaultValue={outcomeType} name="outcomeType">
            {outcomeTypes.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button className="primary-button" type="submit">
          检索
        </button>
      </div>
    </form>
  );
}
