# Vox Grocery

**Voice-powered grocery list for hands-free shopping.**

A focused, voice-first grocery list app. Speak your items, check them off while shopping, and never forget the milk again.

---

## Why Voice for Groceries?

- **Hands-free in the kitchen** - Add items while cooking without touching your phone
- **Eyes on the road** - Safely add items while driving home
- **Quick capture** - Faster than typing, especially for multiple items
- **Natural interaction** - "Add milk" is how you'd tell someone anyway

---

## Features

### Core (Implemented)

| Feature | Description |
|---------|-------------|
| **Voice Input** | Say "Add [item]" to add items to your list |
| **Manual Input** | Type items when voice isn't convenient |
| **Check Off Items** | Tap to mark items as picked up |
| **Smart Categories** | Auto-group items by aisle with manual overrides |
| **Quantities** | Parse "2 gallons of milk" and show amounts inline |
| **Smart Suggestions** | Fuzzy match + history autocomplete while typing |
| **Quick Add** | Recent/frequent items and staples for one-tap re-add |
| **Sharing & Export** | Copy/share list in plain text, Markdown, or JSON |
| **Multi-list** | Create, rename, and switch between lists |
| **Real-time Feedback** | See what was heard, get confirmation |
| **Dark/Light Mode** | Easy on the eyes in any lighting |
| **Offline Storage** | Your list persists locally |

### Voice Commands

| Command | Example | Action |
|---------|---------|--------|
| **Add** | "Add milk" | Adds item to list |
| **Add with quantity** | "Add 2 gallons of milk" | Adds item with quantity |
| **Got/Picked up** | "Got milk" | Marks as picked up |
| **Delete/Remove** | "Delete milk" | Removes from list |
| **Edit quantity** | "Change milk to 3 gallons" | Updates quantity |
| **Clear checked** | "Clear checked" | Removes checked items |
| **Show all/need/picked up** | "Show need" | Filters the list |

---

## Roadmap

### Phase 1: Grocery Focus (Current)
- [x] Voice-first item entry
- [x] Check off items while shopping
- [x] Persistent local storage
- [x] Clean, modern UI
- [x] Rename/rebrand to Vox Grocery
- [x] Simplify UI for grocery-specific workflow
- [x] Large touch targets for in-store use

### Phase 2: Smart Organization
- [x] Auto-categorize items (Produce, Dairy, Meat, Frozen, Pantry, etc.)
- [x] Group items by store aisle/category
- [x] Quantity support ("Add 2 gallons of milk")
- [x] Unit detection (lbs, oz, count, etc.)

### Phase 3: Quick Add
- [x] Recent items list for one-tap re-add
- [x] Frequently bought items
- [x] Suggested items based on history
- [x] "Staples" list you can bulk-add

### Phase 4: Sharing
- [x] Copy list to clipboard (plain text)
- [x] Share via native share sheet
- [x] Export as formatted text/markdown
- [ ] QR code for quick transfer between devices

### Phase 5: Multi-List Support
- [x] Multiple named lists (Weekly, Party, Costco Run)
- [ ] List templates
- [ ] Archive completed lists
- [ ] List history

### Future Considerations
- Cloud sync across devices
- Collaborative lists (family shopping)
- Store-specific lists with aisle mapping
- Price tracking and budget features
- Meal planning integration

---

## Getting Started

### Prerequisites

- Node.js v14+
- A browser with Web Speech API support (Chrome/Edge recommended)

### Installation

```bash
git clone https://github.com/cotyledonlab/vox-todo.git
cd vox-todo
npm install
npm run dev
```

Opens at `http://localhost:5173`

Build and preview:

```bash
npm run build
npm run preview
```

### Browser Support

| Browser | Voice | Notes |
|---------|-------|-------|
| Chrome | Full | Recommended |
| Edge | Full | Chromium-based |
| Safari | Partial | Limited support |
| Firefox | None | Text input only |

---

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Dev server and build tooling
- **TypeScript 5.9** - Type safety
- **Material-UI v7** - Component library
- **Web Speech API** - Voice recognition
- **localStorage** - Offline persistence

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

See [AGENTS.md](AGENTS.md) for AI agent contribution guidelines.

---

## License

MIT - see [LICENSE](LICENSE)

---

<div align="center">
<sub>Built by <a href="https://github.com/cotyledonlab">Cotyledon Lab</a></sub>
</div>
