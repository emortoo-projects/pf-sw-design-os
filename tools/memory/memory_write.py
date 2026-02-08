#!/usr/bin/env python3
"""Write to project memory.

Usage:
    python tools/memory/memory_write.py --project <name> --type session --content "Built the dashboard"
    python tools/memory/memory_write.py --project <name> --type decision --content "Chose Prisma over Drizzle"
    python tools/memory/memory_write.py --project <name> --type pattern --content "All API routes return {data, error}"
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path


VALID_TYPES = ["session", "decision", "pattern"]


def get_project_root():
    """Find the framework root directory."""
    current = Path(__file__).resolve()
    for parent in [current] + list(current.parents):
        if (parent / "projects").is_dir() and (parent / "AGENT.md").exists():
            return parent
    return current.parent.parent.parent


def write_session_log(project_name, content, entry_type):
    """Write a timestamped session log."""
    root = get_project_root()
    logs_dir = root / "projects" / project_name / "memory" / "logs"

    if not logs_dir.exists():
        logs_dir.mkdir(parents=True, exist_ok=True)

    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d_%H-%M-%S")
    date_display = now.strftime("%Y-%m-%d %H:%M:%S")
    filename = f"{timestamp}_{entry_type}.md"

    log_path = logs_dir / filename
    log_content = f"# {entry_type.title()} Log\n\n"
    log_content += f"**Date:** {date_display}\n"
    log_content += f"**Type:** {entry_type}\n\n"
    log_content += f"## Content\n\n{content}\n"

    log_path.write_text(log_content)
    print(f"Logged {entry_type} to: {log_path.relative_to(root)}")


def update_memory(project_name, content, entry_type):
    """Append learned insights to the main memory file."""
    root = get_project_root()
    memory_path = root / "projects" / project_name / "memory" / "memory.md"

    if not memory_path.exists():
        print(f"No memory file found for project '{project_name}'.")
        print(f"Expected: {memory_path}")
        sys.exit(1)

    now = datetime.now()
    date_display = now.strftime("%Y-%m-%d")

    existing = memory_path.read_text()

    # Update the "Last Updated" line
    lines = existing.split("\n")
    for i, line in enumerate(lines):
        if line.startswith("**Last Updated:**"):
            lines[i] = f"**Last Updated:** {date_display}"
            break

    # For decisions and patterns, append to Learned Insights section
    if entry_type in ("decision", "pattern"):
        section_marker = "## Learned Insights"
        for i, line in enumerate(lines):
            if line.strip() == section_marker:
                # Insert after the section header (skip any blank line)
                insert_at = i + 1
                while insert_at < len(lines) and lines[insert_at].strip() == "":
                    insert_at += 1
                # Check if it's a placeholder comment
                if insert_at < len(lines) and lines[insert_at].startswith("<!--"):
                    insert_at += 1
                entry = f"* [{entry_type.title()} {date_display}] {content}"
                lines.insert(insert_at, entry)
                break

    memory_path.write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description="Write to project memory")
    parser.add_argument("--project", required=True, help="Project name")
    parser.add_argument("--type", required=True, choices=VALID_TYPES,
                        help="Type of memory entry")
    parser.add_argument("--content", required=True, help="Content to write")

    args = parser.parse_args()

    # Verify project exists
    root = get_project_root()
    project_dir = root / "projects" / args.project

    if not project_dir.exists():
        print(f"Project '{args.project}' not found at {project_dir}")
        sys.exit(1)

    # Always write a session log
    write_session_log(args.project, args.content, args.type)

    # For decisions and patterns, also update the main memory file
    if args.type in ("decision", "pattern"):
        update_memory(args.project, args.content, args.type)
        print(f"Updated memory.md with {args.type}.")


if __name__ == "__main__":
    main()
