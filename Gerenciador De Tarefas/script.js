const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const taskList = document.getElementById('task-list');

// Variável global para armazenar a instância do gráfico
let monthlyProgressChart; 

// ----------------------------------------------------
// FUNÇÕES DE UTILIDADE E ARMAZENAMENTO
// ----------------------------------------------------

function formatDate(dateString) {
    if (!dateString) return 'Sem Prazo';
    const [year, month, day] = dateString.split('-');
    return `Prazo: ${day}/${month}/${year}`;
}

function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(listItem => {
        tasks.push({
            text: listItem.querySelector('.task-text').textContent,
            date: listItem.dataset.date || '',
            completed: listItem.classList.contains('completed')
        });
    });
    localStorage.setItem('tasksData', JSON.stringify(tasks)); 
    
    updateDashboard();
}

// ----------------------------------------------------
// FUNÇÃO PARA CRIAR E ADICIONAR O ELEMENTO <li> NA LISTA
// ----------------------------------------------------

function createTaskElement(taskText, taskDate, isCompleted) {
    const listItem = document.createElement('li');
    
    if (isCompleted) {
        listItem.classList.add('completed');
    }

    // 🔑 NOVO: Inclui o botão "Concluir" dentro de um div de ações
    listItem.innerHTML = `
        <div>
            <span class="task-text">${taskText}</span>
            <span class="task-date">${formatDate(taskDate)}</span>
        </div>
        <div class="actions">
            <button class="complete-btn">${isCompleted ? 'Reabrir' : 'Concluir'}</button>
            <button class="delete-btn">Excluir</button>
        </div>
    `;
    
    listItem.dataset.date = taskDate; 

    // 🔑 NOVO: Listener exclusivo para o botão Concluir
    const completeButton = listItem.querySelector('.complete-btn');
    completeButton.addEventListener('click', function() {
        listItem.classList.toggle('completed');
        
        // Atualiza o texto do botão
        completeButton.textContent = listItem.classList.contains('completed') ? 'Reabrir' : 'Concluir';
        
        saveTasks(); // Salva e atualiza dashboard
    });

    // Listener para Excluir
    const deleteButton = listItem.querySelector('.delete-btn');
    deleteButton.addEventListener('click', function() {
        taskList.removeChild(listItem);
        saveTasks(); // Salva e atualiza dashboard
    });
    
    // ⚠️ Removido: O listener de clique no item inteiro (listItem.addEventListener('click', ...)) 
    // não é mais necessário e foi substituído pelo botão de Concluir.

    return listItem;
}


// ----------------------------------------------------
// FUNÇÃO PRINCIPAL PARA ADICIONAR UMA NOVA TAREFA
// ----------------------------------------------------

function addTask() {
    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value; 

    if (taskText === "") {
        alert("Por favor, digite a descrição da tarefa.");
        return; 
    }

    const newListItem = createTaskElement(taskText, taskDate, false);
    taskList.appendChild(newListItem);

    saveTasks(); 

    taskInput.value = "";
    dateInput.value = "";
}


// ----------------------------------------------------
// FUNÇÃO PARA CARREGAR AS TAREFAS (Usa JSON)
// ----------------------------------------------------

function loadTasks() {
    const savedTasksData = localStorage.getItem('tasksData');
    
    if (savedTasksData) {
        const tasks = JSON.parse(savedTasksData);
        
        taskList.innerHTML = ''; 

        tasks.forEach(task => {
            const listItem = createTaskElement(task.text, task.date, task.completed);
            taskList.appendChild(listItem);
        });
    }
    updateDashboard(); 
}

// ----------------------------------------------------
// FUNÇÕES DO DASHBOARD E GRÁFICOS (Sem alterações)
// ----------------------------------------------------

function getTaskDataForDashboard() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(listItem => {
        tasks.push({
            completed: listItem.classList.contains('completed'),
            date: listItem.dataset.date
        });
    });
    return tasks;
}

function updateDashboard() {
    const allTasks = getTaskDataForDashboard();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalTasks = allTasks.length;
    let completedMonthly = 0;
    let pendingMonthly = 0;

    allTasks.forEach(task => {
        if (task.date) {
            const taskDate = new Date(task.date + 'T00:00:00');
            if (taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear) {
                if (task.completed) {
                    completedMonthly++;
                } else {
                    pendingMonthly++;
                }
            }
        }
    });

    document.getElementById('total-tasks-stat').textContent = totalTasks;
    document.getElementById('completed-tasks-stat').textContent = completedMonthly;

    renderChart(completedMonthly, pendingMonthly);
}

function renderChart(completed, pending) {
    const ctx = document.getElementById('monthly-progress-chart');

    if (monthlyProgressChart) {
        monthlyProgressChart.destroy();
    }

    monthlyProgressChart = new Chart(ctx, {
        type: 'doughnut', 
        data: {
            labels: ['Concluídas (Mês)', 'Pendentes (Mês)'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: [
                    '#5cb85c', 
                    '#f0ad4e'  
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Conclusão de Tarefas por Data',
                    font: {
                        family: 'Poppins'
                    }
                }
            }
        }
    });
}


taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

loadTasks();