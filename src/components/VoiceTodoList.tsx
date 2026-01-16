import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { AlertColor } from '@mui/material';
import { styles } from './VoiceTodoListStyles';
import type { Category, Todo, TodoFilter } from '../types/Todo';
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
import BrowserCompatibilityBanner from './BrowserCompatibilityBanner';
import TranscriptDisplay from './TranscriptDisplay';
import FeedbackMessage from './FeedbackMessage';
import NotificationSystem from './NotificationSystem';
import GroceryItem from './GroceryItem';
import CategorySection from './CategorySection';
import TaskFilters from './TaskFilters';
import TaskStats from './TaskStats';
import EmptyState from './EmptyState';
import EditTodoDialog from './EditTodoDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ThemeToggle from './ThemeToggle';
import VoiceSettings from './VoiceSettings';

const TODOS_STORAGE_KEY = 'vox-todo:todos';
const FILTER_STORAGE_KEY = 'vox-todo:filter';
const TTS_STORAGE_KEY = 'vox-todo:tts';
const VOICE_STORAGE_KEY = 'vox-todo:voice';
const STORAGE_VERSION = 2;

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

  const {
    notification,
    notifyError,
    notifyInfo,
    notifySuccess,
    notifyWarning,
    closeNotification,
  } = useNotification();

  const {
    value: todos,
    setValue: setTodos,
    clear: clearTodos,
    error: storageError,
  } = useLocalStorageState<Todo[]>({
    key: TODOS_STORAGE_KEY,
    initialValue: [],
    version: STORAGE_VERSION,
    migrate: migrateTodos,
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

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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

  const updateTodos = useCallback(
    (updater: (prev: Todo[]) => { todos: Todo[]; feedback?: FeedbackState }) => {
      let nextFeedback: FeedbackState | undefined;
      setTodos(prev => {
        const result = updater(prev);
        nextFeedback = result.feedback;
        return result.todos;
      });
      if (nextFeedback) {
        pushFeedback(nextFeedback);
      }
    },
    [pushFeedback, setTodos]
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

  const counts = useMemo(() => {
    const completed = todos.filter(todo => todo.completed).length;
    const total = todos.length;
    const active = total - completed;
    return { completed, total, active };
  }, [todos]);

  const handleAddTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        pushFeedback({
          message: 'Add an item before submitting.',
          severity: 'warning',
        });
        return;
      }

      const parsed = parseQuantityFromText(trimmed);
      const name = parsed.hasQuantity ? parsed.name : trimmed;
      const cleanedName = name.trim();
      if (!cleanedName) {
        pushFeedback({
          message: 'Add an item name with your quantity.',
          severity: 'warning',
        });
        return;
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

        const inferredCategory = inferCategoryFromName(cleanedName);
        const nextTodo = buildTodo({
          text: cleanedName,
          quantity: parsed.hasQuantity ? parsed.quantity : undefined,
          unit: parsed.hasQuantity ? parsed.unit : undefined,
          category: inferredCategory,
          categorySource: 'auto',
        });
        const quantityLabel = formatQuantity(nextTodo.quantity, nextTodo.unit);
        const displayLabel = quantityLabel
          ? `${quantityLabel} ${nextTodo.text}`
          : nextTodo.text;
        const active = prev.filter(todo => !todo.completed);
        const completed = prev.filter(todo => todo.completed);
        return {
          todos: [...active, nextTodo, ...completed],
          feedback: {
            message: `Added to list: ${displayLabel}`,
            severity: 'success',
          },
        };
      });
    },
    [pushFeedback, updateTodos]
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
    handleAddTodo(inputText);
    setInputText('');
  };

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
    clearTodos();
    setFilter('all');
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
                    Vox Grocery
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
                <Box component="form" onSubmit={handleAddSubmit}>
                  <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }}>
                    <TextField
                      fullWidth
                      inputRef={inputRef}
                      value={inputText}
                      onChange={event => setInputText(event.target.value)}
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
                  <Typography variant="h6">Shopping List</Typography>
                  <Button
                    variant="contained"
                    onClick={handleClearCompleted}
                    disabled={counts.completed === 0}
                    sx={{ minHeight: 44 }}
                  >
                    Clear checked
                  </Button>
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
