# Minecraft Pixel Art Generator

> Claude Code 專案規範：開發工作流程、程式碼風格與關鍵規則

## Quick Facts

- **Stack**: Vue 3 (Composition API), Vite, Tailwind CSS, TypeScript, Vitest
- **Test Command**: `npm run test:run`
- **Build Command**: `npm run build`
- **Deploy Command**: `/deploy` skill
- **Main Branch**: `main`
- **Specs Location**: See `docs/specs/` for feature specifications

## Key Directories

- `src/` - Vue 3 應用程式原始碼
- `tests/` - Vitest 測試檔案
- `public/` - 靜態公開檔案
- `dist/` - 生產版本輸出（部署到 GitHub Pages）
- `docs/specs/` - 功能規格文件
- `.claude/skills/` - Claude Code 自定義 skills

## Code Style

- Vue 3 Composition API with `<script setup>` syntax
- Prefer arrow functions for event handlers
- Use reactive state with `ref()` and `reactive()`
- Component should be self-contained and reusable
- Use Tailwind utility classes, avoid custom CSS unless necessary
- Early returns over nested conditionals
- Prefer composition over inheritance
- No TypeScript `any` - use proper types or `unknown`

## Git Conventions

### Branch Naming
- **Rule**: All code changes (except `CLAUDE.md` or `README.md`) MUST be on feature branches
- **Format**: `<type>/<short-description>`
- **Types**:
  - `feat/` - New features
  - `fix/` - Bug fixes
  - `refactor/` - Code refactoring
  - `style/` - UI/styling changes
  - `test/` - Test additions or updates
  - `docs/` - Documentation updates
- **Examples**:
  - `feat/add-block-palette`
  - `fix/image-processing-error`
  - `refactor/optimize-color-matching`
  - `style/update-pixel-grid`

### Commit Format
- **Style**: Conventional Commits
- **Format**: `<type>: <description>`
- **Description**: Clear, concise, in Chinese or English
- **Examples**:
  - `feat: 新增方塊調色盤選擇功能`
  - `fix: 修正顏色比對演算法`
  - `refactor: 重構像素網格元件`
  - `style: 更新 UI 排版與間距`
  - `test: 新增顏色量化測試`
  - `docs: 更新方塊資料結構說明`

### Automated Workflow

1. **Branch Creation**: Automatically create feature branch based on task
2. **Development**: Write code following project conventions
3. **Testing**: Run `npm run test:run` to verify all tests pass
4. **Building**: Run `npm run build` to ensure production build succeeds
5. **Auto Commit**: Automatically commit with conventional commit message
6. **Auto Push**: Push to GitHub after user confirmation
7. **Merge & Deploy**: Prompt user to merge to `main` and deploy

## Critical Rules

### Testing Requirements
- NEVER commit without running tests first
- All tests MUST pass before committing
- If adding new features, add corresponding tests
- Run `npm run test:run` before every commit
- Test coverage should be maintained or improved

### Build Verification
- ALWAYS run `npm run build` before committing
- Production build MUST succeed without errors
- Check console for warnings and resolve them

### Error Handling
- NEVER swallow errors silently
- Always show user feedback for errors
- Log errors for debugging
- Provide actionable error messages

### UI States
- Every async operation needs loading state
- Every operation needs error handling
- Show user feedback for all actions
- Disable buttons during async operations
- Handle loading, error, empty, success states

### Code Quality
- Keep components focused and single-responsibility
- Extract reusable logic into composables
- Avoid deep nesting (max 3 levels)
- Use meaningful variable and function names
- Comment only when logic is non-obvious

## Development Workflow

### Standard Feature Development

```
1. Create feature branch: `feat/feature-name`
2. Implement feature with tests
3. Run tests: `npm run test:run`
4. Build: `npm run build`
5. Commit: Auto-commit with conventional message
6. Push: Auto-push to GitHub
7. Merge to main (if approved by user)
8. Deploy: Use `/deploy` skill
```

### Quick Documentation Updates

```
1. For CLAUDE.md or README.md changes: Work directly on `main`
2. For docs/specs/ changes: Work directly on `main`
3. For code changes: ALWAYS use feature branch
```

## Agents

Available agents are located in `.claude/agents/`:

- **spec-designer** - Designs and maintains feature specifications
  - Use BEFORE implementing new features
  - Creates/updates specs in `docs/specs/`
  - Ensures consistency with existing spec structure
  - Provides implementation guidance to main agent

## Custom Skills

Available skills are located in `.claude/skills/`:

- `/deploy` - Deploy to GitHub Pages

Refer to individual `SKILL.md` files for detailed usage.

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once (for CI/CD)

# Deployment (via Claude skill)
/deploy                  # Deploy to GitHub Pages
```

## Automated Rules

### Pre-Commit Checks
1. Run `npm run test:run` - All tests must pass
2. Run `npm run build` - Build must succeed
3. No console errors or warnings

### Auto-Commit Triggers
- Feature implementation complete
- All tests passing
- Build successful
- User confirms implementation is ready

### Auto-Push Policy
- Only after user confirms commit content
- Ensures GitHub remote is always up-to-date
- Enables seamless collaboration

## Feature Specifications

For detailed feature specifications, see `docs/specs/`:

Always refer to specs when implementing features to ensure consistency.
