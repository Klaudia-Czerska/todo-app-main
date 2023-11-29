const inputTask = document.querySelector('.todo__add-task-input');
const taskList = document.querySelector('.todo__task-list');
let checks = document.querySelectorAll('#todo__task-check');
let crosses = document.querySelectorAll('#todo__task-cross');

const taskApiUrl = 'http://localhost:3000/tasks';

const deletingTaskFromBackend = (taskId) => {
    fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'DELETE'
    });
}

const updatingTaskList = (arr) => {
    taskList.innerHTML = '';
    arr.forEach(task => {
        const newTask = `
        <li class="todo__task" id="${task.id}">
            <i class="fa-solid fa-check" id="todo__task-check${task.completed ? "ed" : ""}"></i>
            <span class="todo__task-text">${task.task}</span>
            <i class="fa-solid fa-xmark" id="todo__task-cross"></i>
        </li>`
        taskList.innerHTML += newTask;
    })
    checks = document.querySelectorAll('#todo__task-check');
    crosses = document.querySelectorAll('#todo__task-cross');
    
    //Handling deleting a task

    crosses.forEach(cross => {
        cross.addEventListener('click', () => {
            console.log(cross.parentElement.id)
            deletingTaskFromBackend(cross.parentElement.id);
            gettingTasks();
        })
    })
}

const gettingTasks = async () => {
    try {
        const response = await fetch(taskApiUrl);
        if (response.ok) {
            const jsonResponse = await response.json();
            let taskListArray = jsonResponse.tasks;
            updatingTaskList(taskListArray)
        }
    } catch (error) {
        console.log(error);
    }
}

gettingTasks();

// Handling adding a task

const sendingTaskToBackend = (task) => {
    fetch('http://localhost:3000/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
        headers: {
            "Content-type": "application/json"
        }
    });
}

inputTask.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && inputTask.value.length !== 0) {
        e.preventDefault();
        const newTask = {
            task: inputTask.value,
            completed: 0
        }
        sendingTaskToBackend(newTask);
        inputTask.value = '';
        gettingTasks();
    }
})
