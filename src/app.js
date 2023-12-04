const inputTask = document.querySelector('.todo__add-task-input');
const taskList = document.querySelector('.todo__task-list');
const tasksNumber = document.querySelector('.todo__tasks-left-number');

const taskApiUrl = 'http://localhost:3000/tasks';


// Updating a number of tasks left

const updatingNumberOfTasks = () => {
    tasksNumber.innerText = taskList.childElementCount;
}

//Handling deleting a task

const deletingTaskFromBackend = async (taskId) => {
    await fetch(`${taskApiUrl}/${taskId}`, {
        method: 'DELETE'
    });
}

const deletingTask = () => {
    const crosses = document.querySelectorAll('.todo__task-cross');
    crosses.forEach(cross => {
        cross.addEventListener('click', () => {
            deletingTaskFromBackend(cross.parentElement.id);
            let taskToDelete = cross.parentElement;
            taskToDelete.parentElement.removeChild(taskToDelete);
            updatingNumberOfTasks();
        })
    })
}

// Handling updating a task

const updatingTaskInBackend = async (task) => {
    await fetch(`${taskApiUrl}/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify(task),
        headers: {
            "Content-type": "application/json"
        }
    })
}

const updatingTask = () => {
    const checks = document.querySelectorAll('.fa-check');
    checks.forEach(check => {
        check.addEventListener('click', () => {
            let updatedInfo;
            if (check.classList.contains('todo__task-checked')) {
                updatedInfo = {
                    id: check.parentElement.id,
                    completed: 0
                }
                check.classList.remove('todo__task-checked')
                check.classList.add('todo__task-check')
            } else {
                updatedInfo = {
                    id: check.parentElement.id,
                    completed: 1
                }  
                check.classList.add('todo__task-checked')
                check.classList.remove('todo__task-check')
            }
            updatingTaskInBackend(updatedInfo);
        })
    })
}


const updatingTaskList = (arr) => {
    taskList.innerHTML = '';
    arr.forEach(task => {
        const newTask = `
        <li class="todo__task" id="${task.id}">
            <i class="fa-solid fa-check ${task.completed ? "todo__task-checked" : "todo__task-check"}"></i>
            <span class="todo__task-text">${task.task}</span>
            <i class="fa-solid fa-xmark todo__task-cross"></i>
        </li>`
        taskList.innerHTML += newTask;
    })
    deletingTask();
    updatingTask();
    updatingNumberOfTasks();
}

// Getting the data from database

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

inputTask.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && inputTask.value.length !== 0) {
        e.preventDefault();
        const newTask = {
            task: inputTask.value,
            completed: 0
        }
        
        await fetch(taskApiUrl, {
            method: 'POST',
            body: JSON.stringify(newTask),
            headers: {
                "Content-type": "application/json"
            }
        })
            .then(response => {
                if (response.ok) {
                    gettingTasks();
                }
            })

        inputTask.value = '';
    }
})

