#!/usr/bin/env python3
"""Scaffold a new project from the template.

Usage:
    python tools/init/init_project.py --name my-app --stack nextjs --description "My new project"
"""

import argparse
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path


VALID_STACKS = ["orbit", "nextjs", "python-fastapi", "static"]


def get_project_root():
    """Find the framework root directory."""
    current = Path(__file__).resolve()
    for parent in [current] + list(current.parents):
        if (parent / "templates").is_dir() and (parent / "AGENT.md").exists():
            return parent
    return current.parent.parent.parent


def scaffold_project(name, stack, description):
    """Copy the template and fill in placeholders."""
    root = get_project_root()
    template_dir = root / "templates" / "project"
    project_dir = root / "projects" / name

    if project_dir.exists():
        print(f"Error: Project '{name}' already exists at {project_dir}")
        sys.exit(1)

    if not template_dir.exists():
        print(f"Error: Template not found at {template_dir}")
        sys.exit(1)

    # Verify stack file exists
    stack_file = root / "stacks" / f"{stack}.yaml"
    if not stack_file.exists():
        print(f"Error: Stack '{stack}' not found. Available: {', '.join(VALID_STACKS)}")
        sys.exit(1)

    # Copy template
    shutil.copytree(template_dir, project_dir)

    # Define replacements
    today = datetime.now().strftime("%Y-%m-%d")
    replacements = {
        "{{PROJECT_NAME}}": name,
        "{{PROJECT_DESCRIPTION}}": description,
        "{{PROJECT_STACK}}": stack,
        "{{CREATED_DATE}}": today,
    }

    # Replace placeholders in all text files
    for file_path in project_dir.rglob("*"):
        if file_path.is_file() and file_path.suffix in (".md", ".yaml", ".yml", ".txt"):
            content = file_path.read_text()
            for placeholder, value in replacements.items():
                content = content.replace(placeholder, value)
            file_path.write_text(content)

    print(f"Project '{name}' created at: {project_dir.relative_to(root)}")
    print(f"  Stack: {stack}")
    print(f"  Description: {description}")
    print()
    print("Next steps:")
    print(f"  1. Edit projects/{name}/context/company.md")
    print(f"  2. Edit projects/{name}/context/product.md")
    print(f"  3. Edit projects/{name}/context/brand.md")
    print(f"  4. Create goals in projects/{name}/goals/")


def main():
    parser = argparse.ArgumentParser(description="Scaffold a new project from template")
    parser.add_argument("--name", required=True, help="Project name (kebab-case)")
    parser.add_argument("--stack", required=True, choices=VALID_STACKS,
                        help="Tech stack to use")
    parser.add_argument("--description", required=True, help="Short project description")

    args = parser.parse_args()

    # Validate name is kebab-case
    if not all(c.isalnum() or c == "-" for c in args.name):
        print("Error: Project name must be kebab-case (letters, numbers, hyphens only)")
        sys.exit(1)

    scaffold_project(args.name, args.stack, args.description)


if __name__ == "__main__":
    main()
