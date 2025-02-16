import React, { useState, useEffect } from 'react';

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

  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputText(text);
    };

    recognition.onend = () => {
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
    <div className="voice-todo-list">
      <h1>Voice Todo List</h1>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="button" onClick={startListening}>
          {isListening ? '🎤 Listening...' : '🎤'}
        </button>
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoiceTodoList;
