# Developer Guidelines

Welcome to the development team of the **Bhagirathi Hostel & PG Management System**! This manual outlines coding conventions, design standards, and workflows.

---

## 1. Monorepo Organization & Symlinks

We use **pnpm Workspaces** to share dependencies across multiple packages.
- Shared packages live in `packages/`.
- Client and server apps live in `apps/`.
- Always import shared libraries using their scoped aliases (e.g. `@bhagirathi/types`, `@bhagirathi/ui`).

---

## 2. Design System & Styling Policies

- **Vanilla Tailwind CSS**: We use pre-defined Tailwind utility classes combined with custom CSS tokens in `index.css`.
- **Theme Support**: Avoid hardcoding plain color names. Use dynamic classes (e.g. `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-white`).
- **Icons**: Standardize on `lucide-react` for all UI icons.
- **Visual Feedback**:
  - Always provide transitions for interactive hover events (`transition-all duration-200`).
  - Use loading skeletons (`animate-pulse`) during API fetch operations.
  - Implement descriptive empty states with icons when data arrays are empty.

---

## 3. Type Checking & Code Quality

- **TypeScript Standard**: The compilation configuration is strict. Avoid the use of `any` types. Ensure all models extend their proper interface structures.
- **Reference Builds**: After changing shared types in `packages/types/src/index.ts`, rebuild references to compile changes globally:
  ```bash
  npx tsc -b packages/types
  ```
- **Linting Verification**: Ensure no syntax warnings exist prior to pushing commits:
  ```bash
  npx tsc --noEmit
  ```

---

## 4. Backend Conventions

- **SQLAlchemy ORM**: Never run raw string-formatted SQL statements. Always use parameter-bound filters or ORM model helpers to eliminate SQL Injection risks.
- **Pydantic Validation**: Input data is parsed and serialized using Pydantic schemas. 
- **Security Checklists**:
  - Ensure route endpoints have proper `@depends` role check guards (`dependencies.py`).
  - Secure file uploads using the core validator `validate_uploaded_file()` prior to writing bytes to disk.
