#!/usr/bin/env python3
"""Phase 1 content pipeline for validation, manifest generation, and interactive writes."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable


ROOT = Path(__file__).resolve().parents[1]
BLOG_FILES_PATH = ROOT / "blog" / "blog-files.json"
BLOG_METADATA_PATH = ROOT / "blog" / "blog-metadata.json"
CONTENT_SOURCE_PATHS = {
    "work": ROOT / "content" / "works-metadata.json",
    "tool": ROOT / "content" / "tools-metadata.json",
    "update-log": ROOT / "content" / "update-logs-metadata.json",
}
MANIFEST_PATH = ROOT / "content" / "content-manifest.json"

DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TYPE_ORDER = {
    "article": 0,
    "work": 1,
    "update-log": 2,
    "tool": 3,
}
TYPE_LABELS = {
    "article": "文章",
    "work": "作品",
    "tool": "工具",
    "update-log": "更新日志",
}
LEVEL_ORDER = {"error": 0, "warning": 1, "info": 2}

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


class PipelineError(Exception):
    """Raised when the pipeline cannot continue safely."""


@dataclass
class Issue:
    level: str
    item: str
    message: str
    suggestion: str


def repo_relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def read_json(path: Path) -> Any:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError as exc:
        raise PipelineError(f"未找到文件：{repo_relative(path)}") from exc
    except json.JSONDecodeError as exc:
        raise PipelineError(f"{repo_relative(path)} JSON 解析失败：{exc}") from exc


def ensure_json_list(path: Path) -> list[Any]:
    payload = read_json(path)
    if not isinstance(payload, list):
        raise PipelineError(f"{repo_relative(path)} 必须是 JSON 数组")
    return payload


def write_json(path: Path, payload: list[Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def normalize_file_path(value: Any) -> str:
    normalized = clean_text(value).replace("\\", "/")
    while normalized.startswith("./"):
        normalized = normalized[2:]
    return normalized


def strip_anchor(file_path: str) -> str:
    return file_path.split("#", 1)[0].strip()


def is_external_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


def resolve_repo_file(file_path: str) -> Path | None:
    normalized = normalize_file_path(file_path)
    base_path = strip_anchor(normalized)
    if not base_path or is_external_url(base_path) or base_path.startswith("/"):
        return None
    return ROOT / Path(base_path)


def is_valid_date(value: str) -> bool:
    if not DATE_PATTERN.fullmatch(value):
        return False
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        return False
    return True


def normalize_tags(value: Any) -> list[str]:
    if isinstance(value, list):
        tags = [clean_text(tag) for tag in value]
        return [tag for tag in tags if tag]
    if isinstance(value, str):
        parts = re.split(r"[,，]", value)
        return [clean_text(part) for part in parts if clean_text(part)]
    return []


def parse_bool_like(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "y", "1"}:
            return True
        if lowered in {"false", "no", "n", "0"}:
            return False
    return None


def slugify_fragment(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value or "").strip().lower()
    if not normalized:
        return "entry"

    chars: list[str] = []
    previous_dash = False
    for character in normalized:
        if character.isalnum():
            chars.append(character)
            previous_dash = False
        elif not previous_dash:
            chars.append("-")
            previous_dash = True

    slug = "".join(chars).strip("-")
    return slug or "entry"


def issue_label(item: dict[str, Any], fallback: str) -> str:
    for key in ("id", "filePath", "title"):
        label = clean_text(item.get(key))
        if label:
            return label
    return fallback


def manifest_sort_key(item: dict[str, Any]) -> tuple[int, int, str, str]:
    date_key = clean_text(item.get("date", "0000-00-00")).replace("-", "")
    date_value = int(date_key) if date_key.isdigit() else 0
    title_value = clean_text(item.get("title", ""))
    item_id = clean_text(item.get("id", ""))
    type_value = clean_text(item.get("type", ""))
    return (-date_value, TYPE_ORDER.get(type_value, 99), title_value, item_id)


def normalize_manifest_item(item: dict[str, Any], content_type: str, default_source: str) -> dict[str, Any]:
    normalized: dict[str, Any] = {
        "id": clean_text(item.get("id")),
        "type": content_type,
        "title": clean_text(item.get("title")),
        "excerpt": clean_text(item.get("excerpt")),
        "date": clean_text(item.get("date")),
        "filePath": normalize_file_path(item.get("filePath")),
        "tags": normalize_tags(item.get("tags")),
        "source": clean_text(item.get("source")) or default_source,
    }

    category = clean_text(item.get("category"))
    if category:
        normalized["category"] = category
    elif content_type == "article":
        normalized["category"] = "未分类"

    featured = parse_bool_like(item.get("featured"))
    if featured is not None:
        normalized["featured"] = featured

    external_url = clean_text(item.get("externalUrl"))
    if external_url:
        normalized["externalUrl"] = external_url

    status = clean_text(item.get("status"))
    if status:
        normalized["status"] = status

    return normalized


def validate_manifest_item(
    item: dict[str, Any],
    content_type: str,
    source_path: str,
) -> dict[str, Any]:
    normalized = normalize_manifest_item(item, content_type, source_path)
    label = issue_label(normalized, source_path)

    for field in ("id", "title", "excerpt", "date", "filePath", "source"):
        if not clean_text(normalized.get(field)):
            raise PipelineError(f"{source_path} -> {label} 缺少必填字段：{field}")

    if normalized.get("type") not in TYPE_ORDER:
        raise PipelineError(f"{source_path} -> {label} 的 type 无效：{normalized.get('type')}")

    if not normalized["tags"]:
        raise PipelineError(f"{source_path} -> {label} 的 tags 不能为空")

    if not is_valid_date(normalized["date"]):
        raise PipelineError(f"{source_path} -> {label} 的 date 格式无效，应为 YYYY-MM-DD")

    repo_file = resolve_repo_file(normalized["filePath"])
    if repo_file is None or not repo_file.exists():
        raise PipelineError(f"{source_path} -> {label} 的 filePath 指向的文件不存在：{normalized['filePath']}")

    external_url = clean_text(normalized.get("externalUrl"))
    if external_url and not is_external_url(external_url):
        raise PipelineError(f"{source_path} -> {label} 的 externalUrl 必须是 http(s) 地址")

    return normalized


def load_blog_metadata() -> list[dict[str, Any]]:
    metadata = ensure_json_list(BLOG_METADATA_PATH)
    valid_items: list[dict[str, Any]] = []
    for index, item in enumerate(metadata):
        if not isinstance(item, dict):
            raise PipelineError(f"{repo_relative(BLOG_METADATA_PATH)} 第 {index + 1} 项必须是对象")
        valid_items.append(item)
    return valid_items


def load_auxiliary_source(content_type: str) -> list[dict[str, Any]]:
    source_path = CONTENT_SOURCE_PATHS[content_type]
    items = ensure_json_list(source_path)
    valid_items: list[dict[str, Any]] = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise PipelineError(f"{repo_relative(source_path)} 第 {index + 1} 项必须是对象")
        valid_items.append(item)
    return valid_items


def print_issues(issues: list[Issue]) -> None:
    for issue in sorted(issues, key=lambda current: (LEVEL_ORDER.get(current.level, 99), current.item)):
        level = issue.level.upper()
        print(f"[{level}] {issue.item}")
        print(f"  问题：{issue.message}")
        if issue.suggestion:
            print(f"  建议：{issue.suggestion}")


def validate_blog(verbose: bool = True) -> list[Issue]:
    blog_files = ensure_json_list(BLOG_FILES_PATH)
    blog_metadata = load_blog_metadata()
    issues: list[Issue] = []

    normalized_blog_files: list[str] = []
    seen_blog_files: set[str] = set()
    for index, entry in enumerate(blog_files):
        item_key = f"blog-files.json[{index}]"
        if not isinstance(entry, str):
            issues.append(Issue("error", item_key, "条目必须是字符串路径", "改为类似 blog/20260315-文章标题.html 的相对路径"))
            continue

        path_value = normalize_file_path(entry)
        if not path_value:
            issues.append(Issue("error", item_key, "路径不能为空", "移除空条目或填写有效的文章路径"))
            continue

        if path_value in seen_blog_files:
            issues.append(Issue("error", path_value, "blog-files.json 中出现重复路径", "保留一条路径，删除重复记录"))
        else:
            seen_blog_files.add(path_value)

        repo_file = resolve_repo_file(path_value)
        if repo_file is None or not repo_file.exists():
            issues.append(Issue("error", path_value, "blog-files.json 指向的文件不存在", "确认文章 HTML 已创建，并检查路径大小写与文件名"))

        normalized_blog_files.append(path_value)

    metadata_paths: list[str] = []
    seen_ids: set[str] = set()
    seen_metadata_paths: set[str] = set()

    for index, item in enumerate(blog_metadata):
        label = issue_label(item, f"blog-metadata.json[{index}]")

        for field in ("id", "title", "excerpt", "date", "filePath"):
            if not clean_text(item.get(field)):
                issues.append(Issue("error", label, f"缺少必填字段：{field}", f"在 blog/blog-metadata.json 中为该条目补充 {field}"))

        article_id = clean_text(item.get("id"))
        if article_id:
            if article_id in seen_ids:
                issues.append(Issue("error", article_id, "id 重复", "为冲突条目改用新的唯一 id"))
            else:
                seen_ids.add(article_id)

        date_value = clean_text(item.get("date"))
        if date_value and not is_valid_date(date_value):
            issues.append(Issue("error", label, "date 格式无效", "将日期改为 YYYY-MM-DD，例如 2026-03-22"))

        file_path = normalize_file_path(item.get("filePath"))
        if file_path:
            metadata_paths.append(file_path)
            if file_path in seen_metadata_paths:
                issues.append(Issue("error", file_path, "blog-metadata.json 中存在重复 filePath", "确认每篇文章只对应一条 metadata 记录"))
            else:
                seen_metadata_paths.add(file_path)

            repo_file = resolve_repo_file(file_path)
            if repo_file is None or not repo_file.exists():
                issues.append(Issue("error", label, "metadata 中的 filePath 指向的文件不存在", "检查 filePath 是否与实际文章 HTML 路径一致"))

        tags = item.get("tags")
        normalized_tags = normalize_tags(tags)
        if not normalized_tags:
            issues.append(Issue("error", label, "tags 缺失或为空", "至少填写一个标签，并使用数组格式"))
        elif not isinstance(tags, list):
            issues.append(Issue("warning", label, "tags 建议直接使用字符串数组", "把 tags 改成 JSON 数组，例如 [\"随笔\", \"旅行\"]"))

        if not clean_text(item.get("category")):
            issues.append(Issue("warning", label, "category 为空", "补充文章分类，避免文章列表筛选体验受影响"))

        featured = item.get("featured")
        if featured is not None and parse_bool_like(featured) is None:
            issues.append(Issue("warning", label, "featured 不是布尔值", "如果需要精选标记，请使用 true 或 false"))

    metadata_path_set = set(metadata_paths)
    blog_file_set = set(normalized_blog_files)

    for missing_path in sorted(blog_file_set - metadata_path_set):
        issues.append(Issue("error", missing_path, "blog-files.json 中存在，但 blog-metadata.json 未收录", "补充对应 metadata，或移除无效路径"))

    for missing_path in sorted(metadata_path_set - blog_file_set):
        issues.append(Issue("error", missing_path, "blog-metadata.json 中存在，但 blog-files.json 未收录", "把该路径补到 blog-files.json 中"))

    issues.append(
        Issue(
            "info",
            "blog",
            f"已检查 {len(normalized_blog_files)} 条 blog-files 路径和 {len(blog_metadata)} 条文章 metadata",
            "error 需要修复，warning 建议尽快补齐",
        )
    )

    if verbose:
        print_issues(issues)

    return issues


def generate_manifest(verbose: bool = True) -> list[dict[str, Any]]:
    manifest_items: list[dict[str, Any]] = []

    for item in load_blog_metadata():
        manifest_items.append(
            validate_manifest_item(
                item,
                "article",
                repo_relative(BLOG_METADATA_PATH),
            )
        )

    for content_type in ("work", "tool", "update-log"):
        source_path = CONTENT_SOURCE_PATHS[content_type]
        for item in load_auxiliary_source(content_type):
            manifest_items.append(
                validate_manifest_item(
                    item,
                    content_type,
                    repo_relative(source_path),
                )
            )

    manifest_items.sort(key=manifest_sort_key)
    write_json(MANIFEST_PATH, manifest_items)

    if verbose:
        counts = {content_type: 0 for content_type in TYPE_ORDER}
        for item in manifest_items:
            counts[item["type"]] += 1

        print(f"[INFO] 已生成 {repo_relative(MANIFEST_PATH)}，共 {len(manifest_items)} 条内容")
        for content_type in ("article", "work", "update-log", "tool"):
            print(f"  - {TYPE_LABELS[content_type]}：{counts[content_type]} 条")

    return manifest_items


def run_check(verbose: bool = True) -> int:
    issues = validate_blog(verbose=verbose)
    error_count = sum(issue.level == "error" for issue in issues)
    warning_count = sum(issue.level == "warning" for issue in issues)

    try:
        manifest = generate_manifest(verbose=verbose)
    except PipelineError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1

    if verbose:
        print(
            f"[INFO] 校验完成：{error_count} 个 error，{warning_count} 个 warning，"
            f"{len(manifest)} 条内容已写入 manifest"
        )

    return 1 if error_count else 0


def prompt(message: str, default: str | None = None) -> str:
    prompt_text = message
    if default is not None:
        prompt_text += f" [{default}]"
    prompt_text += "："
    raw_value = input(prompt_text).strip()
    if raw_value:
        return raw_value
    return default or ""


def prompt_required(
    message: str,
    validator: Callable[[str], str | None] | None = None,
    default: str | None = None,
) -> str:
    while True:
        value = prompt(message, default=default)
        if not value:
            print("该字段不能为空，请重新输入。")
            continue
        if validator:
            validation_error = validator(value)
            if validation_error:
                print(validation_error)
                continue
        return value


def prompt_yes_no(message: str, default: bool = False) -> bool:
    suffix = "Y/n" if default else "y/N"
    while True:
        raw_value = input(f"{message} [{suffix}]：").strip().lower()
        if not raw_value:
            return default
        if raw_value in {"y", "yes"}:
            return True
        if raw_value in {"n", "no"}:
            return False
        print("请输入 y 或 n。")


def validate_add_date(value: str) -> str | None:
    return None if is_valid_date(value) else "日期格式无效，请使用 YYYY-MM-DD。"


def validate_external_url(value: str) -> str | None:
    if not value:
        return None
    if is_external_url(value):
        return None
    return "externalUrl 必须以 http:// 或 https:// 开头。"


def validate_internal_path(value: str) -> str | None:
    normalized = normalize_file_path(value)
    if not normalized:
        return "filePath 不能为空。"
    if is_external_url(normalized):
        return "filePath 应指向站内相对路径，外部地址请填写到 externalUrl。"

    repo_file = resolve_repo_file(normalized)
    if repo_file is None:
        return "filePath 必须是站点根目录相对路径，例如 Works.html#work-fingerprint-app。"
    if not repo_file.exists():
        return f"找不到目标文件：{strip_anchor(normalized)}，请先创建页面或确认路径拼写。"
    return None


def prompt_tags() -> list[str]:
    while True:
        raw_value = prompt_required("标签（用英文逗号或中文逗号分隔）")
        tags = normalize_tags(raw_value)
        if tags:
            return tags
        print("至少需要一个标签，请重新输入。")


def content_source_for_add(content_type: str, file_path: str) -> str:
    if content_type == "article":
        return repo_relative(BLOG_METADATA_PATH)
    return strip_anchor(normalize_file_path(file_path))


def suggest_id(content_type: str, title: str, file_path: str) -> str:
    normalized_path = normalize_file_path(file_path)
    if content_type == "article":
        base_name = Path(strip_anchor(normalized_path)).stem.strip()
        if base_name:
            return base_name
    return f"{content_type}-{slugify_fragment(title)}"


def load_existing_ids() -> set[str]:
    existing_ids: set[str] = set()
    for item in load_blog_metadata():
        entry_id = clean_text(item.get("id"))
        if entry_id:
            existing_ids.add(entry_id)
    for content_type in CONTENT_SOURCE_PATHS:
        for item in load_auxiliary_source(content_type):
            entry_id = clean_text(item.get("id"))
            if entry_id:
                existing_ids.add(entry_id)
    return existing_ids


def prompt_unique_id(suggested_id: str, existing_ids: set[str]) -> str:
    while True:
        entry_id = prompt_required("id", default=suggested_id)
        if entry_id in existing_ids:
            print("该 id 已存在，请换一个新的唯一 id。")
            continue
        return entry_id


def prompt_content_type() -> str:
    options = {
        "1": "article",
        "2": "work",
        "3": "tool",
        "4": "update-log",
        "article": "article",
        "work": "work",
        "tool": "tool",
        "update-log": "update-log",
    }
    print("请选择内容类型：")
    print("  1. article")
    print("  2. work")
    print("  3. tool")
    print("  4. update-log")

    while True:
        raw_value = input("输入编号或类型名：").strip().lower()
        content_type = options.get(raw_value)
        if content_type:
            return content_type
        print("请输入 1 / 2 / 3 / 4，或 article / work / tool / update-log。")


def sort_source_entries(entries: list[dict[str, Any]], content_type: str) -> list[dict[str, Any]]:
    return sorted(
        entries,
        key=lambda item: manifest_sort_key(
            normalize_manifest_item(item, content_type, clean_text(item.get("source")))
        ),
    )


def synchronize_blog_files(
    existing_paths: list[str],
    metadata_entries: list[dict[str, Any]],
) -> list[str]:
    ordered_paths: list[str] = []
    seen_paths: set[str] = set()

    for entry in metadata_entries:
        path_value = normalize_file_path(entry.get("filePath"))
        if path_value and path_value not in seen_paths:
            ordered_paths.append(path_value)
            seen_paths.add(path_value)

    for path_value in existing_paths:
        normalized = normalize_file_path(path_value)
        if normalized and normalized not in seen_paths:
            ordered_paths.append(normalized)
            seen_paths.add(normalized)

    return ordered_paths


def write_article_entry(entry: dict[str, Any]) -> None:
    metadata = load_blog_metadata()
    blog_files = ensure_json_list(BLOG_FILES_PATH)

    article_payload: dict[str, Any] = {
        "id": entry["id"],
        "title": entry["title"],
        "excerpt": entry["excerpt"],
        "category": entry["category"],
        "tags": entry["tags"],
        "date": entry["date"],
        "filePath": entry["filePath"],
    }

    if entry.get("featured") is True:
        article_payload["featured"] = True
    if clean_text(entry.get("externalUrl")):
        article_payload["externalUrl"] = entry["externalUrl"]
    if clean_text(entry.get("status")):
        article_payload["status"] = entry["status"]

    metadata.append(article_payload)
    metadata = sort_source_entries(metadata, "article")
    existing_paths = [entry for entry in blog_files if isinstance(entry, str)]
    blog_files = synchronize_blog_files(existing_paths, metadata)

    write_json(BLOG_METADATA_PATH, metadata)
    write_json(BLOG_FILES_PATH, blog_files)


def write_auxiliary_entry(content_type: str, entry: dict[str, Any]) -> None:
    source_path = CONTENT_SOURCE_PATHS[content_type]
    entries = load_auxiliary_source(content_type)

    payload = {
        "id": entry["id"],
        "type": content_type,
        "title": entry["title"],
        "excerpt": entry["excerpt"],
        "date": entry["date"],
        "filePath": entry["filePath"],
        "tags": entry["tags"],
        "source": entry["source"],
    }

    if clean_text(entry.get("category")):
        payload["category"] = entry["category"]
    if entry.get("featured") is True:
        payload["featured"] = True
    if clean_text(entry.get("externalUrl")):
        payload["externalUrl"] = entry["externalUrl"]
    if clean_text(entry.get("status")):
        payload["status"] = entry["status"]

    entries.append(payload)
    entries = sort_source_entries(entries, content_type)
    write_json(source_path, entries)


def interactive_add() -> int:
    content_type = prompt_content_type()
    existing_ids = load_existing_ids()

    title = prompt_required("标题")
    excerpt = prompt_required("摘要")
    date_value = prompt_required("日期", validator=validate_add_date, default=datetime.now().strftime("%Y-%m-%d"))
    file_path = normalize_file_path(prompt_required("filePath", validator=validate_internal_path))
    tags = prompt_tags()

    if content_type == "article":
        category = prompt_required("分类")
    else:
        category = prompt("分类（可选）")

    featured = prompt_yes_no("是否标记为 featured", default=False)
    external_url = prompt("externalUrl（可选）")
    while True:
        validation_message = validate_external_url(external_url)
        if not validation_message:
            break
        print(validation_message)
        external_url = prompt("externalUrl（可选）")

    status = prompt("status（可选，默认 active）", default="active")
    suggested_id = suggest_id(content_type, title, file_path)
    entry_id = prompt_unique_id(suggested_id, existing_ids)

    entry: dict[str, Any] = {
        "id": entry_id,
        "type": content_type,
        "title": title,
        "excerpt": excerpt,
        "date": date_value,
        "filePath": file_path,
        "tags": tags,
        "source": content_source_for_add(content_type, file_path),
    }

    if category:
        entry["category"] = category
    if featured:
        entry["featured"] = True
    if external_url:
        entry["externalUrl"] = external_url
    if status:
        entry["status"] = status

    validate_manifest_item(entry, content_type, entry["source"])

    print("\n即将写入以下内容：")
    print(json.dumps(entry, ensure_ascii=False, indent=2))
    if not prompt_yes_no("确认写入并自动执行 check", default=True):
        print("已取消，本次未写入任何文件。")
        return 0

    if content_type == "article":
        write_article_entry(entry)
    else:
        write_auxiliary_entry(content_type, entry)

    print("\n写入完成，开始执行 check...\n")
    return run_check(verbose=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Phase 1 content pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("validate-blog", help="Validate blog metadata consistency")
    subparsers.add_parser("generate-manifest", help="Generate content/content-manifest.json")
    subparsers.add_parser("check", help="Validate blog data and regenerate manifest")
    subparsers.add_parser("add", help="Interactively add content and write source JSON")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        if args.command == "validate-blog":
            issues = validate_blog(verbose=True)
            return 1 if any(issue.level == "error" for issue in issues) else 0
        if args.command == "generate-manifest":
            generate_manifest(verbose=True)
            return 0
        if args.command == "check":
            return run_check(verbose=True)
        if args.command == "add":
            return interactive_add()
    except KeyboardInterrupt:
        print("\n已取消。", file=sys.stderr)
        return 1
    except PipelineError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1

    parser.error("Unknown command")
    return 1


if __name__ == "__main__":
    sys.exit(main())
