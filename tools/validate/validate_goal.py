#!/usr/bin/env python3
"""Validate a goal file against the schema.

Usage:
    python tools/validate/validate_goal.py projects/my-app/goals/build_dashboard.md
"""

import argparse
import re
import sys
from pathlib import Path


REQUIRED_FIELDS = {
    "Status": ["draft", "active", "blocked", "done"],
    "Priority": ["high", "medium", "low"],
    "Created": None,  # Date format check
    "Updated": None,  # Date format check
}

REQUIRED_SECTIONS = [
    "Objective",
    "Context",
    "Requirements",
    "Acceptance Criteria",
]

DATE_PATTERN = re.compile(r"\d{4}-\d{2}-\d{2}")


def validate_goal(file_path):
    """Validate a goal file and return a list of issues."""
    path = Path(file_path)
    issues = []

    if not path.exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    content = path.read_text()
    lines = content.split("\n")

    # Check for title
    has_title = any(line.startswith("# Goal:") or line.startswith("# goal:") for line in lines)
    if not has_title:
        issues.append("Missing title line (expected '# Goal: <Title>')")

    # Check required fields
    for field, valid_values in REQUIRED_FIELDS.items():
        pattern = re.compile(rf"\*\*{field}:\*\*\s*(.*)")
        match = None
        for line in lines:
            match = pattern.search(line)
            if match:
                break

        if not match:
            issues.append(f"Missing required field: **{field}:**")
        else:
            value = match.group(1).strip()
            if valid_values and value not in valid_values:
                issues.append(f"Invalid {field}: '{value}' (expected one of: {', '.join(valid_values)})")
            elif valid_values is None and not DATE_PATTERN.match(value):
                issues.append(f"Invalid {field} date format: '{value}' (expected YYYY-MM-DD)")

    # Check required sections
    section_headers = [line.lstrip("#").strip() for line in lines if line.startswith("## ")]
    for section in REQUIRED_SECTIONS:
        if section not in section_headers:
            issues.append(f"Missing required section: ## {section}")

    # Check for at least one checklist item in Requirements
    has_checklist = any(line.strip().startswith("- [ ]") or line.strip().startswith("- [x]") for line in lines)
    if not has_checklist:
        issues.append("No checklist items found (expected '- [ ]' items in Requirements or Acceptance Criteria)")

    return issues


def main():
    parser = argparse.ArgumentParser(description="Validate a goal file against the schema")
    parser.add_argument("file", help="Path to the goal file")

    args = parser.parse_args()
    issues = validate_goal(args.file)

    if issues:
        print(f"Validation FAILED for: {args.file}")
        print()
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
        print()
        print(f"Found {len(issues)} issue(s). See framework/goal-schema.md for the expected format.")
        sys.exit(1)
    else:
        print(f"Validation PASSED for: {args.file}")


if __name__ == "__main__":
    main()
