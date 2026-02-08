#!/usr/bin/env python3
"""Read from project memory.

Usage:
    python tools/memory/memory_read.py --project <name>
    python tools/memory/memory_read.py --project <name> --section preferences
    python tools/memory/memory_read.py --project <name> --recent 5
    python tools/memory/memory_read.py --project <name> --date 2025-01-15
"""

import argparse
import os
import sys
from pathlib import Path


def get_project_root():
    """Find the framework root directory."""
    current = Path(__file__).resolve()
    # Walk up to find the directory containing 'projects/'
    for parent in [current] + list(current.parents):
        if (parent / "projects").is_dir() and (parent / "AGENT.md").exists():
            return parent
    # Fallback: assume tools/ is two levels below root
    return current.parent.parent.parent


def read_memory(project_name, section=None):
    """Read the main memory file for a project."""
    root = get_project_root()
    memory_path = root / "projects" / project_name / "memory" / "memory.md"

    if not memory_path.exists():
        print(f"No memory file found for project '{project_name}'.")
        print(f"Expected: {memory_path}")
        sys.exit(1)

    content = memory_path.read_text()

    if section:
        # Extract a specific section
        lines = content.split("\n")
        in_section = False
        result = []
        section_lower = section.lower()

        for line in lines:
            if line.startswith("## ") and section_lower in line.lower():
                in_section = True
                result.append(line)
            elif line.startswith("## ") and in_section:
                break
            elif in_section:
                result.append(line)

        if result:
            print("\n".join(result))
        else:
            print(f"Section '{section}' not found in memory.")
    else:
        print(content)


def read_logs(project_name, recent=None, date=None):
    """Read session logs for a project."""
    root = get_project_root()
    logs_dir = root / "projects" / project_name / "memory" / "logs"

    if not logs_dir.exists():
        print(f"No logs directory found for project '{project_name}'.")
        return

    log_files = sorted(logs_dir.glob("*.md"), reverse=True)

    if not log_files:
        print("No session logs found.")
        return

    if date:
        log_files = [f for f in log_files if date in f.name]
        if not log_files:
            print(f"No logs found for date '{date}'.")
            return

    if recent:
        log_files = log_files[:recent]

    for log_file in log_files:
        print(f"--- {log_file.name} ---")
        print(log_file.read_text())
        print()


def main():
    parser = argparse.ArgumentParser(description="Read from project memory")
    parser.add_argument("--project", required=True, help="Project name")
    parser.add_argument("--section", help="Read a specific section (e.g., preferences, insights)")
    parser.add_argument("--recent", type=int, help="Show N most recent session logs")
    parser.add_argument("--date", help="Filter logs by date (YYYY-MM-DD)")

    args = parser.parse_args()

    if args.recent or args.date:
        read_logs(args.project, recent=args.recent, date=args.date)
    else:
        read_memory(args.project, section=args.section)


if __name__ == "__main__":
    main()
