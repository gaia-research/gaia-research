---
name: mockup-iteration
description: Interactive visual iteration loop for generating and refining mockups before finalizing an asset commission. Use when the user wants to generate, preview, and adjust concept art or mockups iteratively.
---

# Mockup Iteration

Use this skill when the user asks to iterate on a mockup, concept art, or visual composition (e.g., `/mockup-iteration`). This creates an interactive loop where you generate an image, open it for the user to review, wait for their feedback, and loop until they confirm the composition. Once confirmed, you formulate a finalized commission document.

## Workflow Loop

1. **Take the initial prompt** and constraints from the user.
2. **Generate the image** using the requested provider/model (e.g., `image_gen` with `gpt-image-2`, or `nano-banana-2` if requested for mockups).
3. **Open the file** for the user using the `preview-image` skill or by letting them know the file is ready at the output path (e.g., `assets/workbench/generated/mockup-v1.jpg`).
4. **Pause/Stop hook** to wait for the user's critique. Do not rush to finalize. Ask: *"What should we adjust?"*
5. **Iterate:** If the user gives adjustments (e.g., "move the camera left", "make it darker"), go back to step 2 with a refined prompt. Append version numbers (`mockup-v2.jpg`).
6. **Confirm & Finalize:** When the user explicitly confirms the mockup is correct, break the loop. 
7. **Write the Commission Document:** Create the final `.md` commission brief. Include:
   - The final accepted mockup image (moved out of `workbench/` and committed if necessary for the PR).
   - The *exact prompt* used to generate that final mockup, so the production generator has the exact starting point.
   - Specific instructions for garbage collection (deleting the mock file/commit after the final asset is integrated).

## Example Garbage Collection Instruction

Always include an instruction in the commission document similar to:
> **Garbage Collection:** Once the commission is finalized and the production asset is integrated, delete the mock image commit and the reference image file from the repository.

## Rule Reminder

Always enforce the core constraints of the persona/brand (e.g., Milim has NO twintails) and explicitly reinforce these negative constraints in your prompts during the iteration loop.