import subprocess
import sys
from pathlib import Path

# ====== CẤU HÌNH ======
PACKAGES = [
    "google-genai",
    "python-dotenv",
    "duckduckgo-search",
    "google-search-results",
    "wolframalpha",
    "pandas",
    "numpy",
    "matplotlib",
    "seaborn",
    "plotly",
    "requests",
    "beautifulsoup4",
]

OUTPUT_PATH = Path(r"C:\Users\ADMIN\Desktop\AI Agent\requirements.txt")
# =====================


def get_installed_version(package: str) -> str | None:
    """Trả về version đang cài của package, hoặc None nếu chưa cài"""
    try:
        result = subprocess.check_output(
            [sys.executable, "-m", "pip", "show", package],
            text=True
        )
        for line in result.splitlines():
            if line.startswith("Version:"):
                return line.split(":", 1)[1].strip()
    except subprocess.CalledProcessError:
        return None
    return None


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    lines = ["# Auto-generated requirements.txt\n"]

    for pkg in PACKAGES:
        version = get_installed_version(pkg)
        if version:
            lines.append(f"{pkg}=={version}\n")
        else:
            lines.append(f"# {pkg} NOT INSTALLED\n")

    OUTPUT_PATH.write_text("".join(lines), encoding="utf-8")

    print(f"✔ requirements.txt created at:\n{OUTPUT_PATH}")


if __name__ == "__main__":
    main()
