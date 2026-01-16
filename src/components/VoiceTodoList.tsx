import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShareIcon from '@mui/icons-material/Share';
import type { AlertColor } from '@mui/material';
import { styles } from './VoiceTodoListStyles';
import type { Category, Todo, TodoFilter } from '../types/Todo';
import type { GroceryList } from '../types/GroceryList';
import type { VoiceCommand } from '../types/VoiceCommand';
import { parseVoiceCommand } from '../utils/voiceCommandParser';
import { CATEGORY_ORDER, inferCategoryFromName } from '../utils/categoryMapper';
import { formatQuantity, parseQuantityFromText } from '../utils/quantityParser';
import {
  getBrowserInfo,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
} from '../utils/browserDetection';
import { speakText } from '../utils/textToSpeech';
import { useLocalStorageState } from '../hooks/useLocalStorage';
import { useNotification } from '../hooks/useNotification';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useSpeechVoices } from '../hooks/useSpeechVoices';
import { useItemHistory, type ItemHistoryInput } from '../hooks/useItemHistory';
import BrowserCompatibilityBanner from './BrowserCompatibilityBanner';
import TranscriptDisplay from './TranscriptDisplay';
import FeedbackMessage from './FeedbackMessage';
import NotificationSystem from './NotificationSystem';
import GroceryItem from './GroceryItem';
import CategorySection from './CategorySection';
import QuickAddChips from './QuickAddChips';
import StaplesManager, { type StapleItem } from './StaplesManager';
import TaskFilters from './TaskFilters';
import TaskStats from './TaskStats';
import EmptyState from './EmptyState';
import EditTodoDialog from './EditTodoDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ThemeToggle from './ThemeToggle';
import VoiceSettings from './VoiceSettings';
import ShareDialog from './ShareDialog';
import {
  getBestSuggestion,
  getSuggestionMatches,
  type SuggestionCandidate,
} from '../utils/suggestionMatcher';

const LISTS_STORAGE_KEY = 'vox-todo:todos';
const FILTER_STORAGE_KEY = 'vox-todo:filter';
const TTS_STORAGE_KEY = 'vox-todo:tts';
const VOICE_STORAGE_KEY = 'vox-todo:voice';
const ACTIVE_LIST_STORAGE_KEY = 'vox-todo:active-list';
const STAPLES_STORAGE_KEY = 'vox-todo:staples';
const STORAGE_VERSION = 3;
const STAPLES_STORAGE_VERSION = 1;

const normalizeText = (text: string) => text.trim().toLowerCase();

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang?: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
};

const createTodoId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type BuildTodoInput = {
  text: string;
  quantity?: number;
  unit?: string;
  category?: Category;
  categorySource?: 'auto' | 'manual';
};

type AddItemInput = {
  name: string;
  quantity?: number;
  unit?: string;
  category?: Category;
  categorySource?: 'auto' | 'manual';
};

const buildTodo = ({ text, quantity, unit, category, categorySource }: BuildTodoInput): Todo => {
  const now = Date.now();
  return {
    id: createTodoId(),
    text,
    quantity,
    unit,
    category,
    categorySource,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
};

const buildList = (name: string, items: Todo[] = []): GroceryList => {
  const now = Date.now();
  return {
    id: createTodoId(),
    name,
    items,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };
};

const orderTodosByCompletion = (items: Todo[]) => {
  const active = items.filter(todo => !todo.completed);
  const completed = items.filter(todo => todo.completed);
  return [...active, ...completed];
};

const resolveCommandItemName = (text: string) => {
  const parsed = parseQuantityFromText(text);
  if (parsed.hasQuantity) {
    return parsed.name || text;
  }
  return text;
};

const buildItemLabel = (item: { name: string; quantity?: number; unit?: string }) => {
  const quantityLabel = formatQuantity(item.quantity, item.unit);
  return quantityLabel ? `${quantityLabel} ${item.name}` : item.name;
};

const isTodoLike = (value: unknown): value is Todo =>
  Boolean(value) && typeof value === 'object' && 'text' in (value as Todo);

const isListLike = (value: unknown): value is GroceryList =>
  Boolean(value) && typeof value === 'object' && 'items' in (value as GroceryList);

const migrateTodos = (value: Todo[], _version: number): Todo[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(todo => {
      const rawText = typeof todo.text === 'string' ? todo.text.trim() : '';
      if (!rawText) {
        return null;
      }

      const parsed = parseQuantityFromText(rawText);
      const resolvedText = parsed.hasQuantity && parsed.name ? parsed.name : rawText;
      const existingCategory = CATEGORY_ORDER.includes(todo.category as Category)
        ? (todo.category as Category)
        : undefined;
      const categorySource = todo.categorySource === 'manual' && existingCategory
        ? 'manual'
        : 'auto';
      const inferredCategory = inferCategoryFromName(resolvedText);

      return {
        id:
          typeof todo.id === 'string' && todo.id
            ? todo.id
            : createTodoId(),
        text: resolvedText,
        quantity:
          typeof todo.quantity === 'number'
            ? todo.quantity
            : parsed.hasQuantity
              ? parsed.quantity
              : undefined,
        unit:
          typeof todo.unit === 'string'
            ? todo.unit
            : parsed.hasQuantity
              ? parsed.unit
              : undefined,
        category: existingCategory ?? inferredCategory,
        categorySource,
        completed: Boolean(todo.completed),
        createdAt: typeof todo.createdAt === 'number' ? todo.createdAt : Date.now(),
        updatedAt: typeof todo.updatedAt === 'number' ? todo.updatedAt : Date.now(),
      } as Todo;
    })
    .filter((todo): todo is Todo => Boolean(todo));
};

const migrateLists = (value: GroceryList[] | Todo[], version: number): GroceryList[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length === 0) {
    return [];
  }

  const lists = value.filter(isListLike) as GroceryList[];
  if (lists.length > 0 && lists.length === value.length) {
    return lists.map(list => {
      const name =
        typeof list.name === 'string' && list.name.trim()
          ? list.name.trim()
          : 'My List';
      const items = migrateTodos(Array.isArray(list.items) ? list.items : [], version);
      return {
        id: typeof list.id === 'string' && list.id ? list.id : createTodoId(),
        name,
        items,
        createdAt: typeof list.createdAt === 'number' ? list.createdAt : Date.now(),
        updatedAt: typeof list.updatedAt === 'number' ? list.updatedAt : Date.now(),
        isArchived: Boolean(list.isArchived),
      } as GroceryList;
    });
  }

  const todos = value.filter(isTodoLike) as Todo[];
  if (todos.length > 0) {
    return [buildList('My List', migrateTodos(todos, version))];
  }

  return [];
};

interface FeedbackState {
  message: string;
  severity: AlertColor;
  title?: string;
}

const VoiceTodoList: React.FC = () => {
  const browserInfo = useMemo(() => getBrowserInfo(), []);
  const voiceSupported = isSpeechRecognitionSupported();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const filterTabsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const { isMobile } = useBreakpoint();
  const voices = useSpeechVoices();
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const shareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const {
    notification,
    notifyError,
    notifyInfo,
    notifySuccess,
    notifyWarning,
    closeNotification,
  } = useNotification();

  const {
    value: lists,
    setValue: setLists,
    clear: clearLists,
    error: storageError,
  } = useLocalStorageState<GroceryList[]>({
    key: LISTS_STORAGE_KEY,
    initialValue: [],
    version: STORAGE_VERSION,
    migrate: migrateLists,
    onError: (error) => notifyWarning(error.message, 'Storage'),
  });

  const { value: filter, setValue: setFilter } = useLocalStorageState<TodoFilter>({
    key: FILTER_STORAGE_KEY,
    initialValue: 'all',
    version: STORAGE_VERSION,
  });

  const { value: ttsEnabled, setValue: setTtsEnabled } = useLocalStorageState<boolean>({
    key: TTS_STORAGE_KEY,
    initialValue: false,
    version: STORAGE_VERSION,
  });

  const { value: voicePreference, setValue: setVoicePreference } = useLocalStorageState<string>({
    key: VOICE_STORAGE_KEY,
    initialValue: 'auto',
    version: STORAGE_VERSION,
  });

  const { value: activeListId, setValue: setActiveListId } = useLocalStorageState<string>({
    key: ACTIVE_LIST_STORAGE_KEY,
    initialValue: '',
    version: STORAGE_VERSION,
  });

  const { history, recentItems, frequentItems, recordItem, clearHistory } = useItemHistory({
    maxItems: 20,
  });

  const {
    value: staples,
    setValue: setStaples,
    clear: clearStaples,
  } = useLocalStorageState<StapleItem[]>({
    key: STAPLES_STORAGE_KEY,
    initialValue: [],
    version: STAPLES_STORAGE_VERSION,
  });

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [isRenameListOpen, setIsRenameListOpen] = useState(false);
  const [isDeleteListOpen, setIsDeleteListOpen] = useState(false);
  const [listNameDraft, setListNameDraft] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<Category, boolean>>(() =>
    CATEGORY_ORDER.reduce((acc, category) => {
      acc[category] = false;
      return acc;
    }, {} as Record<Category, boolean>)
  );

  const triggerHapticFeedback = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
  }, []);

  const toggleCategoryCollapse = useCallback((category: Category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  useEffect(() => {
    if (lists.length === 0) {
      const newList = buildList('My List');
      setLists([newList]);
      setActiveListId(newList.id);
      return;
    }

    if (!activeListId || !lists.some(list => list.id === activeListId)) {
      setActiveListId(lists[0].id);
    }
  }, [activeListId, lists, setActiveListId, setLists]);

  const pushFeedback = useCallback(
    (next: FeedbackState) => {
      setFeedback(next);
      if (next.severity === 'success') {
        notifySuccess(next.message, next.title);
      } else if (next.severity === 'error') {
        notifyError(next.message, next.title);
      } else if (next.severity === 'warning') {
        notifyWarning(next.message, next.title);
      } else {
        notifyInfo(next.message, next.title);
      }

      if (ttsEnabled) {
        speakText(next.message, { voicePreference });
      }
    },
    [notifyError, notifyInfo, notifySuccess, notifyWarning, ttsEnabled, voicePreference]
  );

  const voiceSelectValue = useMemo(() => {
    if (voicePreference === 'auto') {
      return 'auto';
    }
    return voices.some(voice => voice.voiceURI === voicePreference)
      ? voicePreference
      : 'auto';
  }, [voicePreference, voices]);

  const activeList = useMemo(
    () => lists.find(list => list.id === activeListId) ?? lists[0] ?? null,
    [activeListId, lists]
  );

  const todos = activeList?.items ?? [];

  const updateTodos = useCallback(
    (
      updater: (prev: Todo[]) => {
        todos: Todo[];
        feedback?: FeedbackState;
        historyEntries?: ItemHistoryInput[];
      }
    ) => {
      let nextFeedback: FeedbackState | undefined;
      let nextHistoryEntries: ItemHistoryInput[] | undefined;
      setLists(prev => {
        const index = prev.findIndex(list => list.id === activeListId);
        if (index < 0) {
          return prev;
        }
        const list = prev[index];
        const result = updater(list.items);
        nextFeedback = result.feedback;
        nextHistoryEntries = result.historyEntries;
        const nextLists = [...prev];
        nextLists[index] = {
          ...list,
          items: result.todos,
          updatedAt: Date.now(),
        };
        return nextLists;
      });
      if (nextFeedback) {
        pushFeedback(nextFeedback);
      }
      if (nextHistoryEntries) {
        nextHistoryEntries.forEach(entry => recordItem(entry));
      }
    },
    [activeListId, pushFeedback, recordItem, setLists]
  );

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter(todo => !todo.completed);
    }
    if (filter === 'completed') {
      return todos.filter(todo => todo.completed);
    }
    return todos;
  }, [filter, todos]);

  const groupedTodos = useMemo(() => {
    const groups = CATEGORY_ORDER.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<Category, Todo[]>);

    filteredTodos.forEach(todo => {
      const category = todo.category ?? inferCategoryFromName(todo.text);
      groups[category].push(todo);
    });

    return groups;
  }, [filteredTodos]);

  const moveMetaById = useMemo(() => {
    const meta = new Map<string, { index: number; total: number }>();
    CATEGORY_ORDER.forEach(category => {
      const items = groupedTodos[category] ?? [];
      const activeItems = items.filter(item => !item.completed);
      const completedItems = items.filter(item => item.completed);
      activeItems.forEach((item, index) => meta.set(item.id, { index, total: activeItems.length }));
      completedItems.forEach((item, index) => meta.set(item.id, { index, total: completedItems.length }));
    });
    return meta;
  }, [groupedTodos]);

  const suggestionCandidates = useMemo(() => {
    const map = new Map<string, SuggestionCandidate>();
    const addCandidate = (candidate: SuggestionCandidate) => {
      const normalized = normalizeText(candidate.name);
      if (!normalized || map.has(normalized)) {
        return;
      }
      map.set(normalized, candidate);
    };

    todos.forEach(todo =>
      addCandidate({
        name: todo.text,
        quantity: todo.quantity,
        unit: todo.unit,
        source: 'list',
      })
    );
    history.forEach(entry =>
      addCandidate({
        name: entry.name,
        quantity: entry.quantity,
        unit: entry.unit,
        source: 'history',
      })
    );
    staples.forEach(staple =>
      addCandidate({
        name: staple.name,
        quantity: staple.quantity,
        unit: staple.unit,
        source: 'staple',
      })
    );

    return Array.from(map.values());
  }, [history, staples, todos]);

  const suggestionMatches = useMemo(
    () =>
      getSuggestionMatches(inputText, suggestionCandidates, { limit: 4, minScore: 0.68 })
        .filter(
          match =>
            normalizeText(match.candidate.name) !== normalizeText(inputText)
        ),
    [inputText, suggestionCandidates]
  );

  const didYouMean = useMemo(() => {
    const best = getBestSuggestion(inputText, suggestionCandidates, 0.84);
    if (!best) {
      return null;
    }
    if (normalizeText(best.candidate.name) === normalizeText(inputText)) {
      return null;
    }
    return best;
  }, [inputText, suggestionCandidates]);

  const suggestionItems = useMemo(
    () => suggestionMatches.map(match => match.candidate),
    [suggestionMatches]
  );

  const quickAddSections = useMemo(() => {
    const recent = recentItems.slice(0, 8).map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    }));
    const frequent = frequentItems
      .filter(item => item.count > 1)
      .slice(0, 8)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }));

    return [
      { title: 'Recent', items: recent },
      { title: 'Frequent', items: frequent },
    ];
  }, [frequentItems, recentItems]);

  const counts = useMemo(() => {
    const completed = todos.filter(todo => todo.completed).length;
    const total = todos.length;
    const active = total - completed;
    return { completed, total, active };
  }, [todos]);

  const addItemToList = useCallback(
    (item: AddItemInput) => {
      let didAdd = false;
      const cleanedName = item.name.trim();
      if (!cleanedName) {
        pushFeedback({
          message: 'Add an item before submitting.',
          severity: 'warning',
        });
        return false;
      }

      updateTodos(prev => {
        const alreadyExists = prev.some(
          todo => normalizeText(todo.text) === normalizeText(cleanedName)
        );
        if (alreadyExists) {
          return {
            todos: prev,
            feedback: {
              message: 'That item is already on your list.',
              severity: 'warning',
            },
          };
        }

        const resolvedCategory = item.category ?? inferCategoryFromName(cleanedName);
        const nextTodo = buildTodo({
          text: cleanedName,
          quantity: item.quantity,
          unit: item.unit,
          category: resolvedCategory,
          categorySource: item.categorySource ?? 'auto',
        });
        const displayLabel = buildItemLabel({
          name: nextTodo.text,
          quantity: nextTodo.quantity,
          unit: nextTodo.unit,
        });
        const active = prev.filter(todo => !todo.completed);
        const completed = prev.filter(todo => todo.completed);
        didAdd = true;
        return {
          todos: [...active, nextTodo, ...completed],
          feedback: {
            message: `Added to list: ${displayLabel}`,
            severity: 'success',
          },
          historyEntries: [
            {
              name: nextTodo.text,
              quantity: nextTodo.quantity,
              unit: nextTodo.unit,
              category: resolvedCategory,
            },
          ],
        };
      });

      return didAdd;
    },
    [pushFeedback, updateTodos]
  );

  const handleAddTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        pushFeedback({
          message: 'Add an item before submitting.',
          severity: 'warning',
        });
        return false;
      }

      const parsed = parseQuantityFromText(trimmed);
      const name = parsed.hasQuantity ? parsed.name : trimmed;
      const cleanedName = name.trim();
      if (!cleanedName) {
        pushFeedback({
          message: 'Add an item name with your quantity.',
          severity: 'warning',
        });
        return false;
      }

      return addItemToList({
        name: cleanedName,
        quantity: parsed.hasQuantity ? parsed.quantity : undefined,
        unit: parsed.hasQuantity ? parsed.unit : undefined,
        category: inferCategoryFromName(cleanedName),
        categorySource: 'auto',
      });
    },
    [addItemToList, pushFeedback]
  );

  const handleToggleTodo = useCallback(
    (id: string) => {
      updateTodos(prev => {
        const target = prev.find(todo => todo.id === id);
        if (!target) {
          return {
            todos: prev,
            feedback: { message: 'Item not found.', severity: 'error' },
          };
        }

        const nextCompleted = !target.completed;
        const nextTodos = prev.map(todo =>
          todo.id === id
            ? { ...todo, completed: nextCompleted, updatedAt: Date.now() }
            : todo
        );
        const orderedTodos = orderTodosByCompletion(nextTodos);
        if (nextCompleted) {
          triggerHapticFeedback();
        }
        return {
          todos: orderedTodos,
          feedback: {
            message: nextCompleted
              ? `Picked up "${target.text}".`
              : `Put "${target.text}" back on the list.`,
            severity: 'success',
          },
        };
      });
    },
    [triggerHapticFeedback, updateTodos]
  );

  const handleEditTodo = useCallback(
    (todo: Todo, text: string, categorySelection: Category | 'auto') => {
      updateTodos(prev => {
        const trimmed = text.trim();
        if (!trimmed) {
          return {
            todos: prev,
            feedback: {
              message: 'Item name cannot be empty.',
              severity: 'warning',
            },
          };
        }

        const parsed = parseQuantityFromText(trimmed);
        const resolvedName = parsed.hasQuantity
          ? parsed.name.trim() || todo.text
          : trimmed;
        const nextCategory = categorySelection === 'auto'
          ? inferCategoryFromName(resolvedName)
          : categorySelection;
        const nextCategorySource = categorySelection === 'auto' ? 'auto' : 'manual';
        const nextQuantity = parsed.hasQuantity ? parsed.quantity : todo.quantity;
        const nextUnit = parsed.hasQuantity ? parsed.unit : todo.unit;

        const nextTodos = prev.map(item =>
          item.id === todo.id
            ? {
                ...item,
                text: resolvedName,
                quantity: nextQuantity,
                unit: nextUnit,
                category: nextCategory,
                categorySource: nextCategorySource,
                updatedAt: Date.now(),
              }
            : item
        );
        return {
          todos: nextTodos,
          feedback: {
            message: `Updated item: ${resolvedName}`,
            severity: 'success',
          },
        };
      });
    },
    [updateTodos]
  );

  const handleDeleteTodo = useCallback(
    (todo: Todo) => {
      updateTodos(prev => ({
        todos: prev.filter(item => item.id !== todo.id),
        feedback: {
          message: `Removed "${todo.text}" from the list.`,
          severity: 'info',
        },
      }));
    },
    [updateTodos]
  );

  const handleMoveTodo = useCallback(
    (id: string, direction: 'up' | 'down') => {
      updateTodos(prev => {
        const index = prev.findIndex(todo => todo.id === id);
        if (index < 0) {
          return {
            todos: prev,
            feedback: { message: 'Item not found.', severity: 'error' },
          };
        }

        const target = prev[index];
        const targetCategory = target.category ?? inferCategoryFromName(target.text);
        const sameGroup = prev
          .map((todo, idx) => ({ todo, idx }))
          .filter(
            entry =>
              (entry.todo.category ?? inferCategoryFromName(entry.todo.text)) ===
                targetCategory && entry.todo.completed === target.completed
          );
        const localIndex = sameGroup.findIndex(entry => entry.todo.id === id);
        const nextLocalIndex = direction === 'up' ? localIndex - 1 : localIndex + 1;
        if (nextLocalIndex < 0 || nextLocalIndex >= sameGroup.length) {
          return {
            todos: prev,
            feedback: {
              message: `Cannot move item ${direction}.`,
              severity: 'warning',
            },
          };
        }

        const swapIndex = sameGroup[nextLocalIndex].idx;
        const nextTodos = [...prev];
        const [moved] = nextTodos.splice(index, 1);
        const insertIndex = swapIndex > index ? swapIndex - 1 : swapIndex;
        nextTodos.splice(insertIndex, 0, moved);

        return {
          todos: orderTodosByCompletion(nextTodos),
          feedback: {
            message: `Moved "${moved.text}" ${direction}.`,
            severity: 'success',
          },
        };
      });
    },
    [updateTodos]
  );

  const handleAddSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const didAdd = handleAddTodo(inputText);
    if (didAdd) {
      setInputText('');
    }
  };

  const handleSuggestionFill = useCallback((candidate: SuggestionCandidate) => {
    setInputText(
      buildItemLabel({
        name: candidate.name,
        quantity: candidate.quantity,
        unit: candidate.unit,
      })
    );
    inputRef.current?.focus();
  }, []);

  const handleQuickAdd = useCallback(
    (item: { name: string; quantity?: number; unit?: string }) => {
      addItemToList({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: inferCategoryFromName(item.name),
        categorySource: 'auto',
      });
    },
    [addItemToList]
  );

  const handleAddStaple = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        pushFeedback({
          message: 'Add a staple before submitting.',
          severity: 'warning',
        });
        return false;
      }

      const parsed = parseQuantityFromText(trimmed);
      const name = parsed.hasQuantity ? parsed.name : trimmed;
      const cleanedName = name.trim();
      if (!cleanedName) {
        pushFeedback({
          message: 'Add a staple name with your quantity.',
          severity: 'warning',
        });
        return false;
      }

      const inferredCategory = inferCategoryFromName(cleanedName);
      setStaples(prev => {
        const normalized = normalizeText(cleanedName);
        const index = prev.findIndex(staple => normalizeText(staple.name) === normalized);
        if (index >= 0) {
          const existing = prev[index];
          const next = [...prev];
          next[index] = {
            ...existing,
            name: cleanedName,
            quantity: parsed.hasQuantity ? parsed.quantity : existing.quantity,
            unit: parsed.hasQuantity ? parsed.unit : existing.unit,
            category: inferredCategory,
          };
          return next;
        }
        return [
          ...prev,
          {
            id: createTodoId(),
            name: cleanedName,
            quantity: parsed.hasQuantity ? parsed.quantity : undefined,
            unit: parsed.hasQuantity ? parsed.unit : undefined,
            category: inferredCategory,
          },
        ];
      });

      pushFeedback({
        message: `Saved staple: ${buildItemLabel({
          name: cleanedName,
          quantity: parsed.hasQuantity ? parsed.quantity : undefined,
          unit: parsed.hasQuantity ? parsed.unit : undefined,
        })}`,
        severity: 'success',
      });

      return true;
    },
    [pushFeedback, setStaples]
  );

  const handleRemoveStaple = useCallback(
    (id: string) => {
      setStaples(prev => prev.filter(staple => staple.id !== id));
    },
    [setStaples]
  );

  const handleAddAllStaples = useCallback(() => {
    if (staples.length === 0) {
      pushFeedback({
        message: 'Add staples first to use quick add.',
        severity: 'info',
      });
      return;
    }

    updateTodos(prev => {
      const existing = new Set(prev.map(todo => normalizeText(todo.text)));
      const additions: Todo[] = [];
      const historyEntries: ItemHistoryInput[] = [];

      staples.forEach(staple => {
        const cleanedName = staple.name.trim();
        if (!cleanedName) {
          return;
        }
        const normalized = normalizeText(cleanedName);
        if (existing.has(normalized)) {
          return;
        }
        const category = staple.category ?? inferCategoryFromName(cleanedName);
        const nextTodo = buildTodo({
          text: cleanedName,
          quantity: staple.quantity,
          unit: staple.unit,
          category,
          categorySource: 'auto',
        });
        additions.push(nextTodo);
        historyEntries.push({
          name: nextTodo.text,
          quantity: nextTodo.quantity,
          unit: nextTodo.unit,
          category,
        });
        existing.add(normalized);
      });

      if (additions.length === 0) {
        return {
          todos: prev,
          feedback: {
            message: 'Staples are already on your list.',
            severity: 'info',
          },
        };
      }

      const active = prev.filter(todo => !todo.completed);
      const completed = prev.filter(todo => todo.completed);

      return {
        todos: [...active, ...additions, ...completed],
        feedback: {
          message: `Added ${additions.length} staple${additions.length === 1 ? '' : 's'} to your list.`,
          severity: 'success',
        },
        historyEntries,
      };
    });
  }, [pushFeedback, staples, updateTodos]);

  const handleOpenCreateList = useCallback(() => {
    setListNameDraft('');
    setIsCreateListOpen(true);
  }, []);

  const handleOpenRenameList = useCallback(() => {
    if (!activeList) {
      return;
    }
    setListNameDraft(activeList.name);
    setIsRenameListOpen(true);
  }, [activeList]);

  const handleCreateList = useCallback(() => {
    const trimmed = listNameDraft.trim();
    if (!trimmed) {
      pushFeedback({
        message: 'Give your list a name.',
        severity: 'warning',
      });
      return;
    }

    const alreadyExists = lists.some(
      list => normalizeText(list.name) === normalizeText(trimmed)
    );
    if (alreadyExists) {
      pushFeedback({
        message: 'That list name already exists.',
        severity: 'warning',
      });
      return;
    }

    const newList = buildList(trimmed);
    setLists(prev => [newList, ...prev]);
    setActiveListId(newList.id);
    setIsCreateListOpen(false);
    pushFeedback({
      message: `Created list: ${trimmed}`,
      severity: 'success',
    });
  }, [listNameDraft, lists, pushFeedback, setActiveListId, setLists]);

  const handleRenameList = useCallback(() => {
    if (!activeList) {
      return;
    }
    const trimmed = listNameDraft.trim();
    if (!trimmed) {
      pushFeedback({
        message: 'List name cannot be empty.',
        severity: 'warning',
      });
      return;
    }

    const alreadyExists = lists.some(
      list =>
        list.id !== activeList.id &&
        normalizeText(list.name) === normalizeText(trimmed)
    );
    if (alreadyExists) {
      pushFeedback({
        message: 'That list name already exists.',
        severity: 'warning',
      });
      return;
    }

    setLists(prev =>
      prev.map(list =>
        list.id === activeList.id
          ? { ...list, name: trimmed, updatedAt: Date.now() }
          : list
      )
    );
    setIsRenameListOpen(false);
    pushFeedback({
      message: `Renamed list to ${trimmed}.`,
      severity: 'success',
    });
  }, [activeList, listNameDraft, lists, pushFeedback, setLists]);

  const handleDeleteList = useCallback(() => {
    if (!activeList) {
      return;
    }
    if (lists.length <= 1) {
      pushFeedback({
        message: 'You need at least one list.',
        severity: 'warning',
      });
      return;
    }

    const nextListId =
      lists.find(list => list.id !== activeList.id)?.id ?? '';
    setLists(prev => prev.filter(list => list.id !== activeList.id));
    setActiveListId(nextListId);
    setIsDeleteListOpen(false);
    pushFeedback({
      message: `Deleted list: ${activeList.name}`,
      severity: 'info',
    });
  }, [activeList, lists, pushFeedback, setActiveListId, setLists]);

  const handleCopyList = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        pushFeedback({
          message: 'Nothing to copy yet.',
          severity: 'warning',
        });
        return;
      }

      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        pushFeedback({
          message: 'Clipboard access is not available in this browser.',
          severity: 'warning',
        });
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        pushFeedback({
          message: 'List copied to clipboard.',
          severity: 'success',
        });
      } catch (error) {
        pushFeedback({
          message: 'Unable to copy list. Try again.',
          severity: 'error',
        });
      }
    },
    [pushFeedback]
  );

  const handleShareList = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        pushFeedback({
          message: 'Nothing to share yet.',
          severity: 'warning',
        });
        return;
      }

      if (!shareSupported) {
        pushFeedback({
          message: 'Sharing is not supported on this device.',
          severity: 'warning',
        });
        return;
      }

      try {
        await navigator.share({
          title: 'VoxShop list',
          text,
        });
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          return;
        }
        pushFeedback({
          message: 'Unable to share list.',
          severity: 'error',
        });
      }
    },
    [pushFeedback, shareSupported]
  );

  const handleClearCompleted = useCallback(() => {
    updateTodos(prev => {
      const nextTodos = prev.filter(todo => !todo.completed);
      return {
        todos: nextTodos,
        feedback: {
          message: 'Cleared checked items.',
          severity: 'info',
        },
      };
    });
  }, [updateTodos]);

  const handleMarkAllComplete = () => {
    updateTodos(prev => ({
      todos: orderTodosByCompletion(
        prev.map(todo =>
          todo.completed ? todo : { ...todo, completed: true, updatedAt: Date.now() }
        )
      ),
      feedback: { message: 'Marked everything as picked up.', severity: 'success' },
    }));
  };

  const handleDeleteAll = () => {
    updateTodos(() => ({
      todos: [],
      feedback: { message: 'Deleted all items.', severity: 'warning' },
    }));
  };

  const handleClearAllData = () => {
    clearLists();
    setActiveListId('');
    setFilter('all');
    clearHistory();
    clearStaples();
    pushFeedback({
      message: 'Local data cleared.',
      severity: 'info',
    });
  };

  const handleVoiceCommand = useCallback(
    (command: VoiceCommand, transcript: string) => {
      if (command.type === 'unknown') {
        pushFeedback({
          message: `Command not recognized: "${transcript}"`,
          severity: 'warning',
        });
        return;
      }

      if (command.type === 'help') {
        pushFeedback({
          message: 'Try: add, add 2 gallons of milk, got, delete, edit, move, clear checked, show all/active/picked up.',
          severity: 'info',
        });
        return;
      }

      if (command.type === 'count') {
        pushFeedback({
          message: `You have ${counts.active} items left out of ${counts.total}.`,
          severity: 'info',
        });
        return;
      }

      if (command.type === 'filter') {
        setFilter(command.filter);
        const filterLabel = command.filter === 'completed'
          ? 'picked up'
          : command.filter === 'active'
            ? 'needed'
            : 'all';
        pushFeedback({
          message: `Showing ${filterLabel} items.`,
          severity: 'info',
        });
        return;
      }

      if (command.type === 'clearCompleted') {
        handleClearCompleted();
        return;
      }

      if (command.type === 'add') {
        handleAddTodo(command.text);
        return;
      }

      if (command.type === 'delete') {
        updateTodos(prev => {
          const commandName = resolveCommandItemName(command.text);
          const matchText = normalizeText(commandName);
          const matches = prev.filter(
            todo => normalizeText(todo.text) === matchText
          );
          if (matches.length === 0) {
            return {
              todos: prev,
              feedback: { message: 'Item not found.', severity: 'error' },
            };
          }

          return {
            todos: prev.filter(todo => normalizeText(todo.text) !== matchText),
            feedback: {
              message: `Removed ${matches.length} item(s) named "${commandName}".`,
              severity: 'info',
            },
          };
        });
        return;
      }

      if (command.type === 'complete') {
        updateTodos(prev => {
          const commandName = resolveCommandItemName(command.text);
          const matchText = normalizeText(commandName);
          const matches = prev.filter(
            todo => normalizeText(todo.text) === matchText
          );
          if (matches.length === 0) {
            return {
              todos: prev,
              feedback: { message: 'Item not found.', severity: 'error' },
            };
          }

          const nextTodos = orderTodosByCompletion(
            prev.map(todo =>
            normalizeText(todo.text) === matchText
              ? { ...todo, completed: true, updatedAt: Date.now() }
              : todo
            )
          );
          return {
            todos: nextTodos,
            feedback: {
              message: `Picked up ${matches.length} item(s) named "${commandName}".`,
              severity: 'success',
            },
          };
        });
        return;
      }

      if (command.type === 'edit') {
        updateTodos(prev => {
          const targetName = resolveCommandItemName(command.target);
          const matchText = normalizeText(targetName);
          const match = prev.find(
            todo => normalizeText(todo.text) === matchText
          );
          if (!match) {
            return {
              todos: prev,
              feedback: { message: 'Item not found.', severity: 'error' },
            };
          }

          const trimmed = command.text.trim();
          if (!trimmed) {
            return {
              todos: prev,
              feedback: {
                message: 'Item name cannot be empty.',
                severity: 'warning',
              },
            };
          }

          const parsed = parseQuantityFromText(trimmed);
          const resolvedName = parsed.hasQuantity
            ? parsed.name.trim() || match.text
            : trimmed;
          const nextCategory = match.categorySource === 'manual' && match.category
            ? match.category
            : inferCategoryFromName(resolvedName);
          const nextCategorySource = match.categorySource === 'manual' ? 'manual' : 'auto';
          const nextQuantity = parsed.hasQuantity ? parsed.quantity : match.quantity;
          const nextUnit = parsed.hasQuantity ? parsed.unit : match.unit;

          const nextTodos = prev.map(todo =>
            todo.id === match.id
              ? {
                  ...todo,
                  text: resolvedName,
                  quantity: nextQuantity,
                  unit: nextUnit,
                  category: nextCategory,
                  categorySource: nextCategorySource,
                  updatedAt: Date.now(),
                }
              : todo
          );
          return {
            todos: nextTodos,
            feedback: {
              message: `Updated "${match.text}" to "${resolvedName}".`,
              severity: 'success',
            },
          };
        });
        return;
      }

      if (command.type === 'move') {
        updateTodos(prev => {
          const commandName = resolveCommandItemName(command.text);
          const matchText = normalizeText(commandName);
          const index = prev.findIndex(
            todo => normalizeText(todo.text) === matchText
          );
          if (index < 0) {
            return {
              todos: prev,
              feedback: { message: 'Item not found.', severity: 'error' },
            };
          }

          const target = prev[index];
          const targetCategory = target.category ?? inferCategoryFromName(target.text);
          const sameGroup = prev
            .map((todo, idx) => ({ todo, idx }))
            .filter(
              entry =>
                (entry.todo.category ?? inferCategoryFromName(entry.todo.text)) ===
                  targetCategory && entry.todo.completed === target.completed
            );
          const localIndex = sameGroup.findIndex(entry => entry.todo.id === target.id);
          const nextLocalIndex = command.direction === 'up' ? localIndex - 1 : localIndex + 1;
          if (nextLocalIndex < 0 || nextLocalIndex >= sameGroup.length) {
            return {
              todos: prev,
              feedback: {
                message: `Cannot move item ${command.direction}.`,
                severity: 'warning',
              },
            };
          }

          const swapIndex = sameGroup[nextLocalIndex].idx;
          const nextTodos = [...prev];
          const [moved] = nextTodos.splice(index, 1);
          const insertIndex = swapIndex > index ? swapIndex - 1 : swapIndex;
          nextTodos.splice(insertIndex, 0, moved);

          return {
            todos: orderTodosByCompletion(nextTodos),
            feedback: {
              message: `Moved "${moved.text}" ${command.direction}.`,
              severity: 'success',
            },
          };
        });
      }
    },
    [
      counts.active,
      counts.total,
      handleAddTodo,
      handleClearCompleted,
      pushFeedback,
      setFilter,
      updateTodos,
    ]
  );

  const startListening = () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      pushFeedback({
        message: 'Speech recognition is not supported in this browser.',
        severity: 'warning',
      });
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new Recognition() as SpeechRecognitionInstance;
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
      setFinalTranscript('');
    };

    recognition.onresult = event => {
      let interim = '';
      let finalResult = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalResult += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim.trim());
      }

      if (finalResult) {
        const cleaned = finalResult.trim();
        setFinalTranscript(cleaned);
        setInterimTranscript('');
        const command = parseVoiceCommand(cleaned);
        handleVoiceCommand(command, cleaned);
      }
    };

    recognition.onerror = event => {
      const error = event.error;
      const messageMap: Record<string, string> = {
        'no-speech': 'No speech detected. Try again.',
        'not-allowed': 'Microphone access was denied. Check permissions.',
        'service-not-allowed': 'Microphone access was blocked. Check permissions.',
        'audio-capture': 'No microphone detected. Connect one and retry.',
        network: 'Network error while using speech recognition.',
        aborted: 'Voice recognition stopped.',
      };

      pushFeedback({
        message: messageMap[error] || 'Voice recognition error occurred.',
        severity: 'error',
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const openEditDialog = (todo: Todo) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setEditingTodo(todo);
  };

  const openDeleteDialog = (todo: Todo) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setDeletingTodo(todo);
  };

  const closeDialogs = () => {
    setEditingTodo(null);
    setDeletingTodo(null);
    setTimeout(() => lastFocusRef.current?.focus(), 0);
  };

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      handler: handleVoiceToggle,
      allowInInput: true,
    },
    {
      key: 'f',
      ctrl: true,
      handler: () => filterTabsRef.current?.focus(),
      allowInInput: true,
    },
    {
      key: 'Escape',
      handler: () => {
        if (isListening) {
          stopListening();
        }
        if (editingTodo || deletingTodo) {
          closeDialogs();
        }
      },
      allowInInput: true,
    },
  ]);

  const renderCommandList = () => (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Voice examples
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary='Add [item]' secondary='Add oat milk' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Add [quantity] [item]' secondary='Add 2 gallons of milk' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Got [item]' secondary='Got spinach' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Delete [item]' secondary='Delete cereal' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Edit [item] to [new item]' secondary='Edit eggs to cage-free eggs' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Change [item] to [quantity]' secondary='Change milk to 3 gallons' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Move [item] up/down' secondary='Move apples up' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Show all/active/picked up' secondary='Show picked up' />
        </ListItem>
        <ListItem>
          <ListItemText primary='Clear checked' secondary='Clear checked' />
        </ListItem>
      </List>
      <Typography variant="caption" color="text.secondary">
        Shortcuts: Ctrl+Enter starts voice · Ctrl+F focuses filters
      </Typography>
    </Stack>
  );

  return (
    <Box sx={styles.page}>
      <Box sx={styles.shell}>
        <Paper sx={styles.headerCard} elevation={0}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ md: 'center' }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant={isMobile ? 'h4' : 'h3'}>
                    VoxShop
                  </Typography>
                  <Box sx={styles.floatingBadge}>
                    {voiceSupported ? (
                      <AutoAwesomeIcon fontSize="small" />
                    ) : (
                      <MicOffIcon fontSize="small" />
                    )}
                    {voiceSupported ? 'Voice-ready' : 'Text-only mode'}
                  </Box>
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Capture your shopping list fast with voice or tap.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`${counts.total} items`} color="primary" />
                <Chip label={`${counts.completed} picked up`} color="success" />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ mt: 3 }}
        >
          <Stack spacing={2.5} flex={2}>
            <BrowserCompatibilityBanner
              browser={browserInfo}
              supported={voiceSupported}
            />
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Add item</Typography>
                <QuickAddChips sections={quickAddSections} onSelect={handleQuickAdd} />
                <Box component="form" onSubmit={handleAddSubmit}>
                  <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }}>
                    <TextField
                      fullWidth
                      inputRef={inputRef}
                      value={inputText}
                      onChange={event => setInputText(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Tab' && suggestionItems[0]) {
                          event.preventDefault();
                          handleSuggestionFill(suggestionItems[0]);
                        }
                      }}
                      placeholder="Add item..."
                      variant="outlined"
                      size="medium"
                      inputProps={{ 'aria-label': 'Add item' }}
                      sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ minHeight: 56, px: 4 }}
                    >
                      Add item
                    </Button>
                  </Stack>
                </Box>
                {didYouMean ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Did you mean
                    </Typography>
                    <Chip
                      label={buildItemLabel(didYouMean.candidate)}
                      onClick={() => handleSuggestionFill(didYouMean.candidate)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>
                ) : null}
                <QuickAddChips
                  sections={[{ title: 'Suggestions', items: suggestionItems }]}
                  onSelect={handleSuggestionFill}
                />
                <TranscriptDisplay
                  interimTranscript={interimTranscript}
                  finalTranscript={finalTranscript}
                  isListening={isListening}
                />
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">Shopping List</Typography>
                    {activeList ? (
                      <Chip
                        label={activeList.name}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={() => setIsShareOpen(true)}
                      sx={{ minHeight: 44 }}
                    >
                      Share list
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleClearCompleted}
                      disabled={counts.completed === 0}
                      sx={{ minHeight: 44 }}
                    >
                      Clear checked
                    </Button>
                  </Stack>
                </Stack>
                <TaskFilters
                  value={filter}
                  onChange={value => setFilter(value)}
                  tabsRef={filterTabsRef}
                />
                {storageError ? (
                  <FeedbackMessage
                    message={storageError.message}
                    severity="warning"
                    title="Storage warning"
                  />
                ) : null}
                <FeedbackMessage
                  message={feedback?.message ?? null}
                  severity={feedback?.severity ?? 'info'}
                  title={feedback?.title}
                />
                <Divider />
                {filteredTodos.length === 0 ? (
                  <EmptyState filter={filter} />
                ) : (
                  <Stack spacing={1.5} aria-live="polite">
                    {CATEGORY_ORDER.map(category => {
                      const items = groupedTodos[category];
                      if (!items || items.length === 0) {
                        return null;
                      }
                      return (
                        <CategorySection
                          key={category}
                          category={category}
                          items={items}
                          collapsed={collapsedCategories[category]}
                          onToggle={toggleCategoryCollapse}
                          listSx={styles.todoList}
                        >
                          {items.map(item => {
                            const meta = moveMetaById.get(item.id) ?? {
                              index: 0,
                              total: 1,
                            };
                            return (
                              <GroceryItem
                                key={item.id}
                                item={item}
                                index={meta.index}
                                total={meta.total}
                                onToggle={handleToggleTodo}
                                onEdit={openEditDialog}
                                onDelete={openDeleteDialog}
                                onSwipeDelete={handleDeleteTodo}
                                onMove={handleMoveTodo}
                              />
                            );
                          })}
                        </CategorySection>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>

          <Stack spacing={2.5} flex={1} minWidth={{ md: 320 }}>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Lists</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel id="list-select-label">Active list</InputLabel>
                  <Select
                    labelId="list-select-label"
                    value={activeList?.id ?? ''}
                    label="Active list"
                    onChange={event => setActiveListId(event.target.value as string)}
                  >
                    {lists.map(list => (
                      <MenuItem key={list.id} value={list.id}>
                        {list.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateList}
                    sx={{ minHeight: 44, flex: 1 }}
                  >
                    New list
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleOpenRenameList}
                    disabled={!activeList}
                    sx={{ minHeight: 44, flex: 1 }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setIsDeleteListOpen(true)}
                    disabled={!activeList || lists.length <= 1}
                    sx={{ minHeight: 44, flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {activeList ? `${activeList.items.length} items in this list` : 'No list selected'}
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Voice & preferences</Typography>
                <Button
                  variant="contained"
                  startIcon={voiceSupported ? <MicIcon /> : <MicOffIcon />}
                  onClick={handleVoiceToggle}
                  disabled={!voiceSupported}
                  className={isListening ? 'listening' : ''}
                  sx={styles.voiceButton}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={isListening}
                >
                  {isListening ? 'Listening...' : 'Start voice'}
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ttsEnabled}
                      onChange={event => setTtsEnabled(event.target.checked)}
                    />
                  }
                  label="Speak confirmations"
                />
                <VoiceSettings
                  voices={voices}
                  value={voiceSelectValue}
                  onChange={value => setVoicePreference(value)}
                  disabled={!ttsSupported || voices.length === 0}
                />
                <Button variant="text" onClick={() => setIsHelpOpen(true)}>
                  Voice help
                </Button>
                {!voiceSupported ? (
                  <Chip
                    icon={<MicOffIcon />}
                    label="Voice input unavailable"
                    variant="outlined"
                  />
                ) : null}
                <Divider />
                <ThemeToggle />
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <StaplesManager
                staples={staples}
                onAdd={handleAddStaple}
                onRemove={handleRemoveStaple}
                onAddAll={handleAddAllStaples}
              />
            </Paper>

            <TaskStats
              total={counts.total}
              completed={counts.completed}
              active={counts.active}
              onClearCompleted={handleClearCompleted}
              onMarkAllComplete={handleMarkAllComplete}
              onDeleteAll={handleDeleteAll}
              onClearAllData={handleClearAllData}
            />
          </Stack>
        </Stack>
      </Box>

      <Tooltip
        title={isListening ? 'Stop voice' : 'Start voice'}
        placement="left"
      >
        <span>
          <Fab
            color="primary"
            onClick={handleVoiceToggle}
            disabled={!voiceSupported}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            className={isListening ? 'listening' : ''}
            sx={styles.floatingMic}
          >
            {voiceSupported ? <MicIcon /> : <MicOffIcon />}
          </Fab>
        </span>
      </Tooltip>

      <Dialog
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Voice help</DialogTitle>
        <DialogContent>
          <Paper sx={styles.commandList} elevation={0}>
            {renderCommandList()}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsHelpOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ShareDialog
        open={isShareOpen}
        items={todos}
        canShare={shareSupported}
        onClose={() => setIsShareOpen(false)}
        onCopy={handleCopyList}
        onShare={handleShareList}
      />

      <Dialog
        open={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>New list</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={listNameDraft}
            onChange={event => setListNameDraft(event.target.value)}
            label="List name"
            variant="outlined"
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleCreateList();
              }
              if (event.key === 'Escape') {
                setIsCreateListOpen(false);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateListOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateList}>
            Create list
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isRenameListOpen}
        onClose={() => setIsRenameListOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Rename list</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={listNameDraft}
            onChange={event => setListNameDraft(event.target.value)}
            label="List name"
            variant="outlined"
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleRenameList();
              }
              if (event.key === 'Escape') {
                setIsRenameListOpen(false);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameListOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRenameList}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteListOpen}
        onClose={() => setIsDeleteListOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete list</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This removes the list and its items. You can&apos;t undo this action.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteListOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteList}>
            Delete list
          </Button>
        </DialogActions>
      </Dialog>

      <EditTodoDialog
        todo={editingTodo}
        open={Boolean(editingTodo)}
        onCancel={closeDialogs}
        onSave={(todo, text, categorySelection) => {
          handleEditTodo(todo, text, categorySelection);
          closeDialogs();
        }}
      />

      <DeleteConfirmDialog
        todo={deletingTodo}
        open={Boolean(deletingTodo)}
        onCancel={closeDialogs}
        onConfirm={todo => {
          handleDeleteTodo(todo);
          closeDialogs();
        }}
      />

      <NotificationSystem
        notification={notification}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default VoiceTodoList;
