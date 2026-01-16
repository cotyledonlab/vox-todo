import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { AlertColor } from '@mui/material';
import { styles } from './VoiceTodoListStyles';
import type { Todo, TodoFilter } from '../types/Todo';
import type { VoiceCommand } from '../types/VoiceCommand';
import { parseVoiceCommand } from '../utils/voiceCommandParser';
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
import TodoItem from './TodoItem';
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
const STORAGE_VERSION = 1;

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

const buildTodo = (text: string): Todo => {
  const now = Date.now();
  return {
    id: createTodoId(),
    text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
};

const migrateTodos = (value: Todo[], _version: number): Todo[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(todo => {
      const text = typeof todo.text === 'string' ? todo.text.trim() : '';
      if (!text) {
        return null;
      }

      return {
        id:
          typeof todo.id === 'string' && todo.id
            ? todo.id
            : createTodoId(),
        text,
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
          message: 'Add a task before submitting.',
          severity: 'warning',
        });
        return;
      }

      updateTodos(prev => {
        const alreadyExists = prev.some(
          todo => normalizeText(todo.text) === normalizeText(trimmed)
        );
        if (alreadyExists) {
          return {
            todos: prev,
            feedback: {
              message: 'That task already exists.',
              severity: 'warning',
            },
          };
        }

        const nextTodo = buildTodo(trimmed);
        return {
          todos: [...prev, nextTodo],
          feedback: {
            message: `Task added: ${nextTodo.text}`,
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
            feedback: { message: 'Task not found.', severity: 'error' },
          };
        }

        const nextTodos = prev.map(todo =>
          todo.id === id
            ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
            : todo
        );
        return {
          todos: nextTodos,
          feedback: {
            message: target.completed
              ? `Marked "${target.text}" active.`
              : `Completed "${target.text}".`,
            severity: 'success',
          },
        };
      });
    },
    [updateTodos]
  );

  const handleEditTodo = useCallback(
    (todo: Todo, text: string) => {
      updateTodos(prev => {
        const trimmed = text.trim();
        if (!trimmed) {
          return {
            todos: prev,
            feedback: {
              message: 'Task text cannot be empty.',
              severity: 'warning',
            },
          };
        }

        const nextTodos = prev.map(item =>
          item.id === todo.id
            ? { ...item, text: trimmed, updatedAt: Date.now() }
            : item
        );
        return {
          todos: nextTodos,
          feedback: {
            message: `Updated task: ${trimmed}`,
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
          message: `Deleted "${todo.text}".`,
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
            feedback: { message: 'Task not found.', severity: 'error' },
          };
        }

        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= prev.length) {
          return {
            todos: prev,
            feedback: {
              message: `Cannot move task ${direction}.`,
              severity: 'warning',
            },
          };
        }

        const nextTodos = [...prev];
        const [moved] = nextTodos.splice(index, 1);
        nextTodos.splice(nextIndex, 0, moved);

        return {
          todos: nextTodos,
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

  const handleClearCompleted = () => {
    updateTodos(prev => {
      const nextTodos = prev.filter(todo => !todo.completed);
      return {
        todos: nextTodos,
        feedback: {
          message: 'Cleared completed tasks.',
          severity: 'info',
        },
      };
    });
  };

  const handleMarkAllComplete = () => {
    updateTodos(prev => ({
      todos: prev.map(todo =>
        todo.completed ? todo : { ...todo, completed: true, updatedAt: Date.now() }
      ),
      feedback: { message: 'Marked all tasks complete.', severity: 'success' },
    }));
  };

  const handleDeleteAll = () => {
    updateTodos(() => ({
      todos: [],
      feedback: { message: 'Deleted all tasks.', severity: 'warning' },
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
          message: 'Try: add, complete, delete, edit, move, clear completed, show all/active/completed.',
          severity: 'info',
        });
        return;
      }

      if (command.type === 'count') {
        pushFeedback({
          message: `You have ${counts.active} active tasks out of ${counts.total}.`,
          severity: 'info',
        });
        return;
      }

      if (command.type === 'filter') {
        setFilter(command.filter);
        pushFeedback({
          message: `Showing ${command.filter} tasks.`,
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
          const matchText = normalizeText(command.text);
          const matches = prev.filter(
            todo => normalizeText(todo.text) === matchText
          );
          if (matches.length === 0) {
            return {
              todos: prev,
              feedback: { message: 'Task not found.', severity: 'error' },
            };
          }

          return {
            todos: prev.filter(todo => normalizeText(todo.text) !== matchText),
            feedback: {
              message: `Deleted ${matches.length} task(s) named "${command.text}".`,
              severity: 'info',
            },
          };
        });
        return;
      }

      if (command.type === 'complete') {
        updateTodos(prev => {
          const matchText = normalizeText(command.text);
          const matches = prev.filter(
            todo => normalizeText(todo.text) === matchText
          );
          if (matches.length === 0) {
            return {
              todos: prev,
              feedback: { message: 'Task not found.', severity: 'error' },
            };
          }

          const nextTodos = prev.map(todo =>
            normalizeText(todo.text) === matchText
              ? { ...todo, completed: true, updatedAt: Date.now() }
              : todo
          );
          return {
            todos: nextTodos,
            feedback: {
              message: `Completed ${matches.length} task(s) named "${command.text}".`,
              severity: 'success',
            },
          };
        });
        return;
      }

      if (command.type === 'edit') {
        updateTodos(prev => {
          const matchText = normalizeText(command.target);
          const match = prev.find(
            todo => normalizeText(todo.text) === matchText
          );
          if (!match) {
            return {
              todos: prev,
              feedback: { message: 'Task not found.', severity: 'error' },
            };
          }

          const nextTodos = prev.map(todo =>
            todo.id === match.id
              ? { ...todo, text: command.text, updatedAt: Date.now() }
              : todo
          );
          return {
            todos: nextTodos,
            feedback: {
              message: `Updated "${match.text}" to "${command.text}".`,
              severity: 'success',
            },
          };
        });
        return;
      }

      if (command.type === 'move') {
        updateTodos(prev => {
          const matchText = normalizeText(command.text);
          const index = prev.findIndex(
            todo => normalizeText(todo.text) === matchText
          );
          if (index < 0) {
            return {
              todos: prev,
              feedback: { message: 'Task not found.', severity: 'error' },
            };
          }

          const nextIndex = command.direction === 'up' ? index - 1 : index + 1;
          if (nextIndex < 0 || nextIndex >= prev.length) {
            return {
              todos: prev,
              feedback: {
                message: `Cannot move task ${command.direction}.`,
                severity: 'warning',
              },
            };
          }

          const nextTodos = [...prev];
          const [moved] = nextTodos.splice(index, 1);
          nextTodos.splice(nextIndex, 0, moved);

          return {
            todos: nextTodos,
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
    <Paper sx={styles.commandList} elevation={0}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Voice commands
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary='Add [task]' secondary='Add buy groceries' />
          </ListItem>
          <ListItem>
            <ListItemText primary='Complete [task]' secondary='Complete buy groceries' />
          </ListItem>
          <ListItem>
            <ListItemText primary='Delete [task]' secondary='Delete buy groceries' />
          </ListItem>
          <ListItem>
            <ListItemText primary='Edit [task] to [new task]' secondary='Edit buy milk to buy oat milk' />
          </ListItem>
          <ListItem>
            <ListItemText primary='Move [task] up/down' secondary='Move buy groceries up' />
          </ListItem>
          <ListItem>
            <ListItemText primary='Show all/active/completed' secondary='Show completed' />
          </ListItem>
          <ListItem>
            <ListItemText primary='Clear completed' secondary='Clear completed' />
          </ListItem>
        </List>
        <Typography variant="caption" color="text.secondary">
          Shortcuts: Ctrl+Enter starts voice · Ctrl+F focuses filters
        </Typography>
      </Stack>
    </Paper>
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
                    Vox Todo
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
                  Speak, edit, and organize tasks in real time.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`${counts.total} tasks`} color="primary" />
                <Chip label={`${counts.completed} done`} color="success" />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ mt: 3 }}
        >
          <Stack spacing={2.5} flex={1} minWidth={{ md: 320 }}>
            <BrowserCompatibilityBanner
              browser={browserInfo}
              supported={voiceSupported}
            />
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Voice capture</Typography>
                <Button
                  variant="contained"
                  startIcon={voiceSupported ? <MicIcon /> : <MicOffIcon />}
                  onClick={handleVoiceToggle}
                  disabled={!voiceSupported}
                  className={isListening ? 'listening' : ''}
                  sx={styles.voiceButton}
                  fullWidth
                  aria-label="Start voice command"
                  aria-pressed={isListening}
                >
                  {isListening ? 'Listening...' : 'Start voice command'}
                </Button>
                <TranscriptDisplay
                  interimTranscript={interimTranscript}
                  finalTranscript={finalTranscript}
                  isListening={isListening}
                />
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
                {!voiceSupported ? (
                  <Chip
                    icon={<MicOffIcon />}
                    label="Voice input unavailable"
                    variant="outlined"
                  />
                ) : null}
              </Stack>
            </Paper>

            {renderCommandList()}

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Personalize</Typography>
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

          <Stack spacing={2.5} flex={2}>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Add a task</Typography>
                <Box component="form" onSubmit={handleAddSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      inputRef={inputRef}
                      value={inputText}
                      onChange={event => setInputText(event.target.value)}
                      placeholder="Add a todo..."
                      variant="outlined"
                      size="small"
                      inputProps={{ 'aria-label': 'Add a todo' }}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                      Add task
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="h6">Tasks</Typography>
                  <TaskFilters
                    value={filter}
                    onChange={value => setFilter(value)}
                    tabsRef={filterTabsRef}
                  />
                </Stack>
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
                  <List sx={styles.todoList} aria-live="polite">
                    {filteredTodos.map((todo, index) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        index={index}
                        total={filteredTodos.length}
                        onToggle={handleToggleTodo}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        onMove={handleMoveTodo}
                      />
                    ))}
                  </List>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Box>

      <EditTodoDialog
        todo={editingTodo}
        open={Boolean(editingTodo)}
        onCancel={closeDialogs}
        onSave={(todo, text) => {
          handleEditTodo(todo, text);
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
