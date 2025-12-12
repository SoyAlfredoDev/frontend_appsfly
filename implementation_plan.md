# Design Correction Plan: Minimalist Green

## Goal
Achieve a "Compact, Professional, and Minimalist" look.
- **Color**: Return to **Green** as primary.
- **Sizing**: Reduce padding, font-sizes, and overall component height. "Dense" UI.
- **Consistency**: Unified border-radius (`rounded-md`).
- **Cleanliness**: Remove extra borders and decoration lines.

## 1. Updated Design Guide (Internal)

### Colors
- **Primary**: Green `#2e7d32` (Tailwind `green-700`) to `#4caf50` (Tailwind `green-500`).
- **Background**: White or very light gray `#f9fafb`.
- **Text**: Dense, dark slate.

### Components
- **Inputs**: Height ~36px-40px (`h-9` or `h-10`). `text-sm`.
- **Buttons**: `rounded-md` (standard), not pills. Compact padding.
- **Cards**: Less shadow, less padding (compact).

## 2. Refactor Components

### `InputFloatingComponent.jsx` & `SelectFloatingComponent.jsx`
- Reduce `py` and `px`.
- Adjust floating label position to fit smaller height.
- Remove "large" feel.

### `NavBarComponent.jsx`
- **Background**: Green Gradient (like original) or solid Clean White with Green text (user said "keep green main color on navbar", implies maybe the background was green or the brand was green. Original had `.custom-navbar { background: linear-gradient(...) }`. I will try to restore that feel but cleaner, OR make it white with Green brand, but user said "keep green color I had in navbar". I will stick to the Green Background for the navbar as per "keep the color I used to have") -> Actually, "mantener color principal el verde que yo tenia en el navBar" effectively means restore the Green Navbar.
- **Layout**: Remove vertical separator lines.
- **Spacing**: Reduce height `h-14` (56px) instead of 16 (64px).

### `LoginPage.jsx` & `RegisterPage.jsx`
- **Card**: Reduce padding `p-6` instead of `p-10`.
- **Background**: Simple, maybe just a clean color or subtle pattern, no giant blurry blobs if they look "dirty" or too much.
- **Buttons**: Square/Rounded consistency.

## 3. Order of Execution
1. Update `DESIGN_GUIDE` (quick).
2. Fix `InputFloatingComponent` / `SelectFloatingComponent`.
3. Fix `NavBarComponent`.
4. Fix `LoginPage` / `RegisterPage`.
