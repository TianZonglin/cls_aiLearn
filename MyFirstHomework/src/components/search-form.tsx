import { DISCIPLINE_OPTIONS } from "@/lib/disciplines";
import { getAvailableSources, getAvailableYears } from "@/lib/project-repository";
import { SOURCE_LABELS } from "@/lib/source-labels";

interface SearchFormProps {
  title?: string;
  discipline?: string;
  institution?: string;
  source?: string;
  year?: string;
}

export async function SearchForm({
  title = "",
  discipline = "",
  institution = "",
  source = "",
  year = ""
}: SearchFormProps) {
  const [sources, years] = await Promise.all([getAvailableSources(), getAvailableYears()]);

  return (
    <form action="/projects" className="search-form search-form--dashboard">
      <div className="search-form__row">
        <label className="field field-wide">
          <span>课题名称</span>
          <input
            defaultValue={title}
            name="title"
            placeholder="输入课题名称进行检索"
            type="text"
          />
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

        <label className="field field-wide">
          <span>工作单位</span>
          <input
            defaultValue={institution}
            name="institution"
            placeholder="输入高校或科研机构名称"
            type="text"
          />
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

        <button className="primary-button" type="submit">
          检索
        </button>
      </div>
    </form>
  );
}
