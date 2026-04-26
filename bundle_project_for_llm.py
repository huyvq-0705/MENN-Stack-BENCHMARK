from pathlib import Path
import fnmatch

OUTPUT_FILE = "project_bundle.md"


DEFAULT_IGNORES = {
    # Git / system
    ".git",
    ".DS_Store",

    # Node ecosystem
    "node_modules",
    ".next",
    ".nuxt",
    ".expo",
    ".vercel",
    ".parcel-cache",
    ".turbo",

    # Python ecosystem
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".tox",
    "venv",
    ".venv",
    "env",

    # Build outputs
    "dist",
    "build",
    "out",
    "target",
    "coverage",
    ".coverage",

    # IDE / editors
    ".idea",
    ".vscode",
    ".history",

    # Cache
    ".cache",
    ".sass-cache",

    # Logs / temp
    "logs",
    "tmp",
    "temp",

    # Environment secrets
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",

    # Lockfiles (huge + useless for LLM)
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",

    # TypeScript incremental cache
    "tsconfig.tsbuildinfo",

    # Python dependency metadata
    "poetry.lock",
    "Pipfile.lock",

    # Docker build cache
    ".dockerignore",

    # GitHub automation noise
    ".github",

    # Swagger auto-generated docs
    "swagger.json",
    "openapi.json",

    # Test snapshots
    "__snapshots__",
}


TEXT_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".py",
    ".md",
    ".yml",
    ".yaml",
    ".html",
    ".css",
    ".scss",
    ".env",
    ".example",
    ".config",
}


def load_gitignore():
    ignore_patterns = set(DEFAULT_IGNORES)

    gitignore_path = Path(".gitignore")

    if gitignore_path.exists():
        with gitignore_path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()

                if not line or line.startswith("#"):
                    continue

                ignore_patterns.add(line.rstrip("/"))

    return ignore_patterns


def should_ignore(path, ignore_patterns):
    for part in path.parts:

        if part in ignore_patterns:
            return True

        for pattern in ignore_patterns:
            if fnmatch.fnmatch(part, pattern):
                return True

    return False


def is_text_file(path):
    return path.suffix.lower() in TEXT_EXTENSIONS


def detect_language(path):
    ext = path.suffix.replace(".", "")

    if ext == "":
        return "text"

    return ext


def bundle_project():
    root = Path(".").resolve()

    ignore_patterns = load_gitignore()

    files = sorted(
        [
            f for f in root.rglob("*")
            if f.is_file()
            and not should_ignore(f.relative_to(root), ignore_patterns)
            and is_text_file(f)
        ]
    )

    output = "# Project Source Bundle\n\n"

    for file in files:

        relative_path = file.relative_to(root)
        language = detect_language(file)

        try:
            content = file.read_text(encoding="utf-8")
        except Exception:
            continue

        output += f"\n// {relative_path}\n"
        output += f"```{language}\n"
        output += content
        output += "\n```\n"

    Path(OUTPUT_FILE).write_text(output, encoding="utf-8")

    print(f"Bundle created successfully: {OUTPUT_FILE}")


if __name__ == "__main__":
    bundle_project()