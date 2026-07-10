---
name: preview-image
description: Opens an exact local image file in the device browser through a private localhost server, with an optional copy to Android Downloads. Use when the user wants to inspect a generated, workbench, or repository image at full size on-device.
compatibility: Requires Python 3, curl, and either termux-open-url or Android am. Designed for Termux on Android.
---

# Preview Image

Open the exact local image in the device browser without moving it into production assets.

## Usage

From the repository root:

```bash
bash .agents/skills/preview-image/scripts/preview-image.sh <image-path>
```

Optional arguments:

```bash
# Use a specific localhost port.
bash .agents/skills/preview-image/scripts/preview-image.sh <image-path> --port 4177

# Also copy the exact file to Android Downloads before opening it.
bash .agents/skills/preview-image/scripts/preview-image.sh <image-path> --copy-downloads
```

## Rules

- Resolve the image path before opening it; do not substitute a derivative, thumbnail, or similarly named file.
- The server must bind only to `127.0.0.1`.
- Keep the source in place; workbench imagery remains a review artifact unless separately promoted.
- Report the localhost URL and the destination path when `--copy-downloads` is used.
- A later invocation replaces the previous preview server. Stop it manually with the PID printed by the script if needed.
