# Vox Grocery - Technical Specification

## Product Vision

**Vox Grocery** is a voice-first grocery list app optimized for hands-free item capture and in-store shopping. The core insight: grocery lists are uniquely suited for voice input because users often think of items while their hands are busy (cooking, driving) and need large, simple UI while shopping.

---

## Current State

### What Works
- Voice commands: Add, Complete, Delete, Edit, Move items
- Manual text input fallback
- Real-time speech transcription with visual feedback
- Persistent localStorage
- Filter by All/Active/Completed
- Dark/Light theme with system detection
- Responsive layout
- Keyboard shortcuts (Ctrl+Enter for voice, Ctrl+F for filters)
- Accessibility: ARIA labels, screen reader announcements

### What's Clunky
1. **Generic todo framing** - UI/UX isn't optimized for grocery use case
2. **No categorization** - Items aren't grouped by type/aisle
3. **No quantities** - Can't say "Add 2 lbs ground beef"
4. **Small touch targets** - Hard to check off items in store
5. **No quick re-add** - Common items require full voice/type each time
6. **Voice commands panel** - Takes too much space, not grocery-relevant

---

## Design Principles

1. **Voice-first, touch-second** - Optimize for "Add [item]" being the primary interaction
2. **Shopping mode** - UI should work one-handed, in motion, in varying lighting
3. **Minimal friction** - Adding an item should be instant
4. **Forgiving** - Easy to undo, edit, or fix mistakes
5. **Offline-capable** - Works without network (localStorage is fine for MVP)

---

## Architecture

### Current Structure
```
src/
├── components/
│   ├── VoiceTodoList.tsx      # Main container (needs refactor)
│   ├── VoiceTodoListStyles.ts # Centralized styles
│   ├── TodoItem.tsx           # Individual item
│   ├── TaskFilters.tsx        # All/Active/Completed tabs
│   ├── TaskStats.tsx          # Progress display
│   ├── EmptyState.tsx         # No items view
│   ├── TranscriptDisplay.tsx  # Voice recognition feedback
│   ├── FeedbackMessage.tsx    # Action confirmations
│   ├── NotificationSystem.tsx # Toast notifications
│   ├── ThemeToggle.tsx        # Dark/Light/System
│   ├── VoiceSettings.tsx      # TTS voice selection
│   ├── EditTodoDialog.tsx     # Edit item modal
│   ├── DeleteConfirmDialog.tsx
│   └── BrowserCompatibilityBanner.tsx
├── context/
│   └── ThemeContext.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useNotification.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useBreakpoint.ts
│   └── useSpeechVoices.ts
├── utils/
│   ├── voiceCommandParser.ts
│   ├── textToSpeech.ts
│   ├── browserDetection.ts
│   └── announceToScreenReader.ts
├── theme/
│   ├── theme.ts
│   └── breakpoints.ts
└── types/
    ├── Todo.ts
    └── VoiceCommand.ts
```

### Data Model

Current `Todo` type:
```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}
```

Proposed `GroceryItem` type:
```typescript
interface GroceryItem {
  id: string;
  name: string;           // "Milk"
  quantity?: number;      // 2
  unit?: string;          // "gallons"
  category?: Category;    // "Dairy"
  checked: boolean;
  createdAt: number;
  checkedAt?: number;
}

type Category =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'frozen'
  | 'pantry'
  | 'bakery'
  | 'beverages'
  | 'household'
  | 'other';
```

---

## Implementation Phases

### Phase 1: Grocery Focus (Immediate)

**Goal**: Rebrand and streamline for grocery use case

#### 1.1 UI Simplification
- [x] Remove/collapse voice commands panel (show on demand or in help)
- [x] Larger item rows with bigger touch targets (min 56px height)
- [x] Prominent "Add item" input at top
- [x] Floating mic button for quick voice add
- [x] Rename "Tasks" to "Shopping List"
- [x] Update header branding to "Vox Grocery"

#### 1.2 Shopping Mode
- [x] One-tap check off (no confirmation)
- [x] Swipe to delete
- [x] Checked items move to bottom
- [x] "Clear checked" prominent button
- [x] Haptic feedback on check (if available)

#### 1.3 Copy Changes
- [x] "Add a todo..." → "Add item..."
- [x] "Task added" → "Added to list"
- [x] "Complete" → "Got it" / "Picked up"
- [x] Voice commands: "Got [item]" as alias for "Complete [item]"

**Files to modify**:
- `VoiceTodoList.tsx` - Main UI restructure
- `VoiceTodoListStyles.ts` - Larger touch targets
- `TodoItem.tsx` - Rename to `GroceryItem.tsx`, bigger tap area
- `voiceCommandParser.ts` - Add "got" command alias

---

### Phase 2: Smart Organization

**Goal**: Auto-categorize items and support quantities

#### 2.1 Item Categorization
- [x] Build category keyword map (milk→dairy, apples→produce, etc.)
- [x] Auto-assign category on add
- [x] Allow manual category override
- [x] Group items by category in list view
- [x] Collapsible category sections

#### 2.2 Quantity Parsing
- [x] Parse "Add 2 gallons of milk" → { name: "milk", quantity: 2, unit: "gallons" }
- [x] Common units: lbs, oz, gallons, count, dozen, bunch, bag, box
- [x] Display quantity inline with item
- [x] Voice command: "Change milk to 3 gallons"

#### 2.3 Smart Suggestions
- [x] Fuzzy match existing items ("mil" suggests "milk")
- [x] Auto-complete from history
- [x] "Did you mean...?" for close matches

**New files**:
- `utils/categoryMapper.ts` - Item → Category mapping
- `utils/quantityParser.ts` - Parse quantities from natural language
- `components/CategorySection.tsx` - Collapsible category group

---

### Phase 3: Quick Add

**Goal**: One-tap re-add for common items

#### 3.1 Recent Items
- [x] Track last 20 unique items added
- [x] "Recent" chip row above input
- [x] Tap to instantly re-add

#### 3.2 Frequent Items
- [x] Track item add frequency
- [x] "Frequently bought" section
- [x] Smart sorting by recency + frequency

#### 3.3 Staples List
- [x] User-defined "always need" items
- [x] "Add all staples" button
- [x] Manage staples in settings

**New files**:
- `hooks/useItemHistory.ts` - Track item frequency/recency
- `components/QuickAddChips.tsx` - Recent/frequent items row
- `components/StaplesManager.tsx` - Manage staples list

---

### Phase 4: Sharing

**Goal**: Easy list sharing

#### 4.1 Copy to Clipboard
- [x] "Copy list" button
- [x] Format: plain text, one item per line
- [x] Include quantities: "2 gallons milk"
- [x] Option: include/exclude checked items

#### 4.2 Native Share
- [x] Use Web Share API where available
- [x] Fallback to copy

#### 4.3 Export Options
- [x] Plain text
- [x] Markdown checklist
- [x] JSON (for backup/restore)

**New files**:
- `utils/listExporter.ts` - Format list for export
- `components/ShareDialog.tsx` - Share options modal

---

### Phase 5: Multi-List

**Goal**: Support multiple named lists

#### 5.1 List Management
- [ ] Create new lists
- [ ] Rename lists
- [ ] Delete lists
- [ ] Switch between lists

#### 5.2 Templates
- [ ] Save current list as template
- [ ] "Weekly groceries", "Party supplies", etc.
- [ ] Create list from template

#### 5.3 History
- [ ] Archive completed lists
- [ ] View past lists
- [ ] Restore from archive

**Data model change**:
```typescript
interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
}
```

---

## Technical Considerations

### Performance
- Virtual scrolling if list exceeds 100 items
- Debounce localStorage writes
- Memoize category grouping

### Offline
- Service worker for true offline support (future)
- Currently localStorage-only is sufficient

### Accessibility
- Maintain current ARIA support
- Ensure category sections are navigable
- Screen reader announcements for category context

### Testing
- Unit tests for quantity parser
- Unit tests for category mapper
- Integration tests for voice commands
- E2E tests for shopping flow

---

## Success Metrics

1. **Time to add item**: < 2 seconds (voice) / < 3 seconds (type)
2. **Tap accuracy in store**: 95%+ successful check-offs
3. **Return usage**: Users come back for next shopping trip
4. **Voice adoption**: > 50% of items added via voice

---

## Open Questions

1. Should checked items disappear immediately or fade?
2. How to handle duplicate items (merge quantities or allow duplicates)?
3. Should category order be customizable?
4. Is cloud sync worth the complexity?

---

## References

- [README.md](README.md) - User-facing documentation
- [AGENTS.md](AGENTS.md) - AI agent contribution guide
