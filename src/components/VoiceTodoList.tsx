import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { styles } from './VoiceTodoListStyles';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const VoiceTodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }
  }, []);

  const handleVoiceCommand = (text: string) => {
    const addMatch = text.match(/^add (.*)/i);
    const deleteMatch = text.match(/^delete (.*)/i);
    const completeMatch = text.match(/^complete (.*)/i);

    if (addMatch) {
      const task = addMatch[1];
      setTodos([...todos, { id: Date.now(), text: task, completed: false }]);
    } else if (deleteMatch) {
      const task = deleteMatch[1];
      setTodos(todos.filter(todo => 
        todo.text.toLowerCase() !== task.toLowerCase()
      ));
    } else if (completeMatch) {
      const task = completeMatch[1];
      setTodos(todos.map(todo => 
        todo.text.toLowerCase() === task.toLowerCase() 
          ? { ...todo, completed: true } 
          : todo
      ));
    }
  };

  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      handleVoiceCommand(text);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputText.trim(), completed: false }]);
      setInputText('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" gutterBottom>
        Voice Todo List
      </Typography>

      <Paper sx={styles.commandList}>
        <Typography variant="h6">Voice Commands:</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary='"Add [task]" - Adds a new task' />
          </ListItem>
          <ListItem>
            <ListItemText primary='"Delete [task]" - Removes a task' />
          </ListItem>
          <ListItem>
            <ListItemText primary='"Complete [task]" - Marks a task as complete' />
          </ListItem>
        </List>
      </Paper>

      <Button
        variant="contained"
        startIcon={<MicIcon />}
        onClick={startListening}
        disabled={isListening}
        className={isListening ? 'listening' : ''}
        sx={styles.voiceButton}
        color="primary"
        fullWidth
      >
        {isListening ? 'Listening...' : 'Start Voice Command'}
      </Button>

      <Box component="form" onSubmit={addTodo} sx={{ mt: 2, mb: 2 }}>
        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a todo..."
          variant="outlined"
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 1 }}
          fullWidth
        >
          Add
        </Button>
      </Box>

      <List sx={styles.todoList}>
        {todos.map(todo => (
          <ListItem
            key={todo.id}
            sx={styles.todoItem}
            onClick={() => toggleTodo(todo.id)}
            button
          >
            <IconButton edge="start" size="small">
              {todo.completed ? (
                <CheckCircleIcon color="success" />
              ) : (
                <RadioButtonUncheckedIcon />
              )}
            </IconButton>
            <ListItemText
              primary={todo.text}
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default VoiceTodoList;
