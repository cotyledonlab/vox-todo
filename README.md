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
| **Real-time Feedback** | See what was heard, get confirmation |
| **Dark/Light Mode** | Easy on the eyes in any lighting |
| **Offline Storage** | Your list persists locally |

### Voice Commands

| Command | Example | Action |
|---------|---------|--------|
| **Add** | "Add milk" | Adds item to list |
| **Complete/Done** | "Complete milk" | Marks as picked up |
| **Delete/Remove** | "Delete milk" | Removes from list |
| **Clear completed** | "Clear completed" | Removes checked items |
| **Show all/active/completed** | "Show active" | Filters the list |

---

## Roadmap

### Phase 1: Grocery Focus (Current)
- [x] Voice-first item entry
- [x] Check off items while shopping
- [x] Persistent local storage
- [x] Clean, modern UI
- [ ] Rename/rebrand to Vox Grocery
- [ ] Simplify UI for grocery-specific workflow
- [ ] Large touch targets for in-store use

### Phase 2: Smart Organization
- [ ] Auto-categorize items (Produce, Dairy, Meat, Frozen, Pantry, etc.)
- [ ] Group items by store aisle/category
- [ ] Quantity support ("Add 2 gallons of milk")
- [ ] Unit detection (lbs, oz, count, etc.)

### Phase 3: Quick Add
- [ ] Recent items list for one-tap re-add
- [ ] Frequently bought items
- [ ] Suggested items based on history
- [ ] "Staples" list you can bulk-add

### Phase 4: Sharing
- [ ] Copy list to clipboard (plain text)
- [ ] Share via native share sheet
- [ ] Export as formatted text/markdown
- [ ] QR code for quick transfer between devices

### Phase 5: Multi-List Support
- [ ] Multiple named lists (Weekly, Party, Costco Run)
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
npm start
```

Opens at `http://localhost:3000`

### Browser Support

| Browser | Voice | Notes |
|---------|-------|-------|
| Chrome | Full | Recommended |
| Edge | Full | Chromium-based |
| Safari | Partial | Limited support |
| Firefox | None | Text input only |

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI v5** - Component library
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
