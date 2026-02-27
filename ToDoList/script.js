// --- State Management ---
// Single source of truth
const state = {
    todos: [],
    filter: 'all' // all, active, completed
};

// --- DOM Elements ---
const elements = {
    form: {
        input: document.getElementById('todo-input'),
        addBtn: document.getElementById('add-btn'),
        group: document.querySelector('.input-group')
    },
    list: document.getElementById('todo-list'),
    stats: {
        date: document.getElementById('date'),
        count: document.getElementById('task-count'),
        clearBtn: document.getElementById('clear-btn')
    },
    filters: document.querySelectorAll('.filter-btn'),
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initDate();
    render();
    initEventListeners();
    elements.form.input.focus(); // UX: Auto focus
});

function initDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    elements.stats.date.innerText = new Date().toLocaleDateString("en-US", options);
}

// --- Event Listeners ---
function initEventListeners() {
    // Add Task
    elements.form.addBtn.addEventListener('click', handleAdd);
    elements.form.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdd();
    });

    // Clear All
    elements.stats.clearBtn.addEventListener('click', () => {
        if (state.todos.length > 0 && confirm("Delete all tasks?")) {
            state.todos = [];
            saveState();
            render();
        }
    });

    // Filters
    elements.filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update UI State
            elements.filters.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update Logic State
            state.filter = e.target.getAttribute('data-filter');
            render();
        });
    });

    // List Delegation (Check, Delete, Edit)
    elements.list.addEventListener('click', (e) => {
        const id = Number(e.target.closest('li')?.dataset.id);
        if (!id) return;

        // Delete
        if (e.target.closest('.delete-btn')) {
            deleteTodo(id);
            return;
        }

        // Toggle Complete (Check btn)
        if (e.target.closest('.check-btn')) {
            toggleTodo(id);
            return;
        }

        // Edit Mode (Edit btn or double click text)
        if (e.target.closest('.edit-btn') || (e.target.classList.contains('task-text') && e.detail === 2)) {
            enableEditMode(id);
        }
    });

    // Edit Save/Cancel Delegation (Input field)
    elements.list.addEventListener('keydown', (e) => {
        if (!e.target.classList.contains('edit-input')) return;

        const id = Number(e.target.closest('li').dataset.id);

        if (e.key === 'Enter') {
            saveEdit(id, e.target.value);
        } else if (e.key === 'Escape') {
            cancelEdit(id);
        }
    });

    // Blur event to save edits (optional UX preference, chosen to save on blur)
    elements.list.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('edit-input')) {
            // Slight delay to allow previous value check if needed, 
            // but direct save is standard behavior for "clicking away"
            const id = Number(e.target.closest('li').dataset.id);
            saveEdit(id, e.target.value);
        }
    });
}

// --- Logic Controllers ---

function handleAdd() {
    const text = elements.form.input.value.trim();
    if (!text) {
        showError("Please enter a task!");
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        isEditing: false
    };

    state.todos.push(newTodo);
    elements.form.input.value = '';
    saveState();
    render();
}

function deleteTodo(id) {
    // Animate out first (Optional refinement logic could go here)
    // For now, strict state update:
    state.todos = state.todos.filter(t => t.id !== id);
    saveState();
    render();
}

function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveState();
        render();
    }
}

function enableEditMode(id) {
    // Disable other edits first
    state.todos.forEach(t => t.isEditing = false);

    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.isEditing = true;
        render();

        // Auto-focus input
        const input = document.querySelector(`li[data-id="${id}"] .edit-input`);
        if (input) {
            input.focus();
            // Move cursor to end
            const val = input.value;
            input.value = '';
            input.value = val;
        }
    }
}

function saveEdit(id, newText) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        if (newText.trim() !== "") {
            todo.text = newText.trim();
        }
        todo.isEditing = false;
        saveState();
        render();
    }
}

function cancelEdit(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.isEditing = false;
        render();
    }
}

function showError(msg) {
    // Remove existing error logic
    let oldErr = document.getElementById('error-msg');
    if (oldErr) oldErr.remove();

    const errorMsg = document.createElement('div');
    errorMsg.id = 'error-msg';
    errorMsg.innerText = msg;
    elements.form.group.appendChild(errorMsg);

    setTimeout(() => {
        if (errorMsg) errorMsg.remove();
    }, 3000);
}

// --- Local Storage ---
function saveState() {
    localStorage.setItem('my_bright_todos', JSON.stringify(state.todos));
}

function loadState() {
    const saved = localStorage.getItem('my_bright_todos');
    if (saved) {
        state.todos = JSON.parse(saved);
        // Reset editing state on reload
        state.todos.forEach(t => t.isEditing = false);
    }
}

// --- Rendering (The "View") ---
function render() {
    elements.list.innerHTML = '';

    // 1. Filter Logic
    const filteredTodos = state.todos.filter(todo => {
        if (state.filter === 'active') return !todo.completed;
        if (state.filter === 'completed') return todo.completed;
        return true;
    });

    // 2. Empty State
    if (filteredTodos.length === 0) {
        renderEmptyState(state.filter);
    } else {
        // 3. List Rendering
        filteredTodos.forEach(todo => {
            const el = createTodoElement(todo);
            elements.list.appendChild(el);
        });
    }

    // 4. Update Stats
    updateStats();
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    if (todo.completed) li.classList.add('completed');
    if (todo.isEditing) li.classList.add('editing');

    // Inner HTML Structure based on state
    if (todo.isEditing) {
        li.innerHTML = `
            <input type="text" class="edit-input" value="${todo.text}">
            <div class="actions">
                <button class="icon-btn edit-btn" style="color:var(--accent-color)">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                </button>
            </div>
        `;
    } else {
        li.innerHTML = `
            <button class="check-btn" aria-label="Toggle Complete">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <span class="task-text">${todo.text}</span>
            <div class="actions">
                <button class="icon-btn edit-btn" aria-label="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="icon-btn delete-btn" aria-label="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
    }
    return li;
}

function renderEmptyState(filterType) {
    const msgs = {
        all: "All done! Time to relax. ☀️",
        active: "No active tasks. Great job!",
        completed: "No completed tasks yet. Let's get moving!"
    };

    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        <p>${msgs[filterType] || msgs.all}</p>
    `;
    elements.list.appendChild(div);
}

function updateStats() {
    const pending = state.todos.filter(t => !t.completed).length;
    elements.stats.count.innerText = pending === 0 ? "No pending tasks" : `${pending} task${pending === 1 ? '' : 's'} pending`;
}
