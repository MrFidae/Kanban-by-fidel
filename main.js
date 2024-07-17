/* main.js */

let isDarkMode = false;
let tasks = {};

// Charger les tâches sauvegardées et le thème au chargement de la page
window.onload = function() {
  fetch('tasks.json')
    .then(response => response.json())
    .then(data => {
      tasks = data.tasks || {};
      isDarkMode = data.isDarkMode || false;

      for (const [taskId, taskData] of Object.entries(tasks)) {
        createTaskElement(taskId, taskData);
      }

      updateTheme();
      console.log('Tasks and theme loaded successfully');
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
    });
};

// Initialiser les colonnes avec Sortable
document.querySelectorAll('.column').forEach(column => {
  new Sortable(column, {
    group: 'shared',
    animation: 150,
    onEnd: function(evt) {
      updateTaskStatus(evt.item.id, evt.to.id);
    }
  });
});

// Gestion du modal
const modal = document.getElementById('taskModal');
const btn = document.getElementById('createTaskBtn');
const span = document.getElementsByClassName('close')[0];
const modalTitle = document.getElementById('modalTitle');
const submitTaskBtn = document.getElementById('submitTaskBtn');

btn.onclick = function() {
  openModal();
}

span.onclick = function() {
  closeModal();
}

window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

function openModal(taskId = null) {
  if (taskId) {
    const task = tasks[taskId];
    document.getElementById('taskId').value = taskId;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskComment').value = task.comment;
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskColor').value = task.color;
    modalTitle.textContent = "Modifier la tâche";
    submitTaskBtn.textContent = "Modifier la tâche";
  } else {
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    modalTitle.textContent = "Créer une nouvelle tâche";
    submitTaskBtn.textContent = "Créer la tâche";
  }
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
}

// Gestion du formulaire
document.getElementById('taskForm').onsubmit = function(e) {
  e.preventDefault();
  const taskId = document.getElementById('taskId').value;
  if (taskId) {
    updateTask(taskId);
  } else {
    createTask();
  }
}

function createTask() {
  const taskId = 'task-' + Date.now();
  const taskData = getTaskDataFromForm();
  taskData.status = 'inProgress';

  tasks[taskId] = taskData;
  createTaskElement(taskId, taskData);
  saveTasksToFile();
  closeModal();
}

function updateTask(taskId) {
  const taskData = getTaskDataFromForm();
  taskData.status = tasks[taskId].status;

  tasks[taskId] = taskData;
  updateTaskElement(taskId, taskData);
  saveTasksToFile();
  closeModal();
}

function getTaskDataFromForm() {
  return {
    title: document.getElementById('taskTitle').value,
    comment: document.getElementById('taskComment').value,
    date: document.getElementById('taskDate').value,
    priority: document.getElementById('taskPriority').value,
    color: document.getElementById('taskColor').value
  };
}

function createTaskElement(taskId, taskData) {
  const task = document.createElement('div');
  task.className = 'task';
  task.id = taskId;
  updateTaskElementContent(task, taskData);
  document.getElementById(taskData.status).appendChild(task);
}

function updateTaskElement(taskId, taskData) {
  const task = document.getElementById(taskId);
  updateTaskElementContent(task, taskData);
}

function updateTaskElementContent(task, taskData) {
  task.style.borderLeft = `5px solid ${taskData.color}`;
  task.innerHTML = `
    <div class="task-title">${taskData.title}</div>
    <div class="task-meta">
      <div>Date: ${taskData.date}</div>
      <div>Priorité: ${taskData.priority}</div>
    </div>
    <div class="task-comment">${taskData.comment}</div>
    <div class="task-actions">
      <button class="task-action-btn edit-task" onclick="openModal('${task.id}')"><i class="fas fa-pen"></i></button>
      <button class="task-action-btn delete-task" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
    </div>
  `;
}

function deleteTask(taskId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    const task = document.getElementById(taskId);
    task.parentNode.removeChild(task);
    delete tasks[taskId];
    saveTasksToFile();
  }
}

function updateTaskStatus(taskId, newStatus) {
  const task = tasks[taskId];
  if (task) {
    task.status = newStatus;
    saveTasksToFile();
  }
}

// Fonction pour sauvegarder les tâches et le thème dans un fichier
function saveTasksToFile() {
  const data = {
    tasks: tasks,
    isDarkMode: isDarkMode
  };
  fetch('save-tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log('Tasks saved:', data))
  .catch((error) => console.error('Error saving tasks:', error));
}

// Gestion du thème sombre/clair
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  updateTheme();
  saveTasksToFile();
});

function updateTheme() {
  document.body.classList.toggle('dark-mode', isDarkMode);
  themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
