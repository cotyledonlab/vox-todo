# Agent Guide for Vox Grocery

This document provides context for AI coding agents (Claude, GPT, Copilot, etc.) working on this codebase.

---

## Quick Context

**What is this?** A voice-powered grocery list React app. Users say "Add milk" and it appears on their list.

**Tech stack:** React 18, TypeScript, Material-UI v5, Web Speech API, localStorage

**Current state:** Functional voice todo app being pivoted to grocery-focused UX

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/VoiceTodoList.tsx` | Main component, ~990 lines, handles all state and logic |
| `src/components/VoiceTodoListStyles.ts` | Centralized MUI styles |
| `src/components/TodoItem.tsx` | Individual list item component |
| `src/utils/voiceCommandParser.ts` | Parses voice input into commands |
| `src/theme/theme.ts` | MUI theme (colors, typography, component overrides) |
| `src/hooks/useLocalStorage.ts` | Persistent state hook with migration support |
| `SPEC.md` | Technical specification and roadmap |
| `README.md` | User-facing documentation |

---

## Architecture Patterns

### State Management
- All state lives in `VoiceTodoList.tsx` using React hooks
- No Redux/Zustand - keep it simple
- `useLocalStorageState` hook handles persistence with versioning

### Styling
- MUI's `sx` prop for component-specific styles
- Centralized styles in `VoiceTodoListStyles.ts` for shared patterns
- Theme customization in `src/theme/theme.ts`
- No CSS files - all styles via MUI/Emotion

### Voice Recognition
- Web Speech API (`webkitSpeechRecognition`)
- Commands parsed in `voiceCommandParser.ts`
- Supported: add, complete, delete, edit, move, filter, clear completed, help, count

### Data Model
```typescript
interface Todo {
  id: string;           // crypto.randomUUID()
  text: string;
  completed: boolean;
  createdAt: number;    // timestamp
  updatedAt: number;    // timestamp
}
```

localStorage key: `vox-todo:todos` (versioned)

---

## Common Tasks

### Adding a Voice Command
1. Edit `src/utils/voiceCommandParser.ts`
2. Add pattern to the `parseVoiceCommand` function
3. Handle the command in `VoiceTodoList.tsx` → `handleVoiceCommand`

### Adding a New Component
1. Create in `src/components/`
2. Use TypeScript with explicit props interface
3. Import MUI components, use `sx` for styling
4. Add to `VoiceTodoList.tsx` or appropriate parent

### Modifying Theme
1. Edit `src/theme/theme.ts`
2. Colors, typography, component overrides all defined there
3. Access via `useTheme()` hook in components

### Changing Storage Schema
1. Bump `STORAGE_VERSION` in `VoiceTodoList.tsx`
2. Add migration logic to `migrateTodos` function
3. Test with existing localStorage data

---

## Code Style

- **TypeScript**: Strict mode, explicit types for props/state
- **Components**: Functional with hooks, no classes
- **Imports**: MUI components from `@mui/material`, icons from `@mui/icons-material`
- **Formatting**: Prettier defaults (single quotes, trailing commas)
- **Naming**: PascalCase components, camelCase functions/variables

---

## Testing

Currently minimal test coverage. When adding tests:
- Use React Testing Library
- Mock `localStorage` and `SpeechRecognition`
- Focus on user interactions, not implementation

Run: `npm test`

---

## Current Priorities

See `SPEC.md` for full roadmap. Immediate focus:

1. **Grocery rebrand** - Update copy, simplify UI
2. **Larger touch targets** - For in-store use
3. **Quick add** - Recent items, one-tap re-add
4. **Categories** - Auto-group items by type

---

## Don'ts

- Don't add state management libraries (Redux, etc.)
- Don't add CSS files - use MUI sx prop
- Don't break localStorage compatibility without migration
- Don't remove accessibility features (ARIA labels, keyboard nav)
- Don't add external API dependencies (keep it offline-capable)

---

## Running Locally

```bash
npm install
npm start        # Dev server at localhost:3000
npm run build    # Production build
npm test         # Run tests
```

Requires Chrome/Edge for voice features. Firefox works text-only.

---

## Useful Context

### Why Voice for Groceries?
Users add items while cooking (hands messy) or driving (eyes on road). Voice is natural: "Add milk" is how you'd tell someone anyway.

### Why Not Cloud Sync?
Simplicity. localStorage is sufficient for single-device use. Cloud adds auth, conflicts, latency. Maybe later.

### Why MUI?
Accessible by default, good mobile support, consistent design system. The app needs to work one-handed in a store.

---

## Questions?

Check `SPEC.md` for detailed technical plans. The codebase is straightforward - when in doubt, read `VoiceTodoList.tsx`.
