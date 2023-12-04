const inputTask = document.querySelector('.todo__add-task-input');
const taskList = document.querySelector('.todo__task-list');
const tasksNumber = document.querySelector('.todo__tasks-left-number');
const tasksFilter = document.querySelectorAll('.todo__choose-tasks > label');
let activeFilter = 'All';
const clearCompleted = document.querySelector('.todo__task-clear-completed');

// Clearing completed tasks

clearCompleted.addEventListener('click', () => {
    const completedTasksArray = document.querySelectorAll('.todo__task-checked');
    completedTasksArray.forEach(completedTask => {
        deletingTaskFromBackend(completedTask.parentElement.id);
        let taskToDelete = completedTask.parentElement;
        taskToDelete.parentElement.removeChild(taskToDelete);
        updatingNumberOfTasks();
    })
})

// Filtering tasks
tasksFilter.forEach(filter => {
    filter.addEventListener('click', () => {
        activeFilter = filter.textContent;
        gettingTasks();
    })
})


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


const updatingTaskList = (arr, filter) => {
    taskList.innerHTML = '';
    arr.forEach(task => {
        if ((filter === 'Active' && task.completed === 0) || (filter === 'Completed' && task.completed === 1) || filter === 'All') {
            const newTask = `
            <li class="todo__task" id="${task.id}" draggable="true">
                <i class="fa-solid fa-check ${task.completed ? "todo__task-checked" : "todo__task-check"}"></i>
                <span class="todo__task-text">${task.task}</span>
                <i class="fa-solid fa-xmark todo__task-cross"></i>
            </li>`
            taskList.innerHTML += newTask;
        }
        
    })
    deletingTask();
    updatingTask();
    updatingNumberOfTasks();

    // Making sure that the tasks are draggable

    const tasks = document.querySelectorAll('.todo__task');
    tasks.forEach(task => {
        task.addEventListener('dragstart', () => {
            task.classList.add('dragging')
        })

        task.addEventListener('dragend', () => {
            task.classList.remove('dragging')
        })
    })

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(draggable);
        } else {
            taskList.insertBefore(draggable, afterElement);
        }
    })

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo__task:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child}
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }
}


// Getting the data from database

const gettingTasks = async () => {
    try {
        const response = await fetch(taskApiUrl);
        if (response.ok) {
            const jsonResponse = await response.json();
            let taskListArray = jsonResponse.tasks;
            updatingTaskList(taskListArray, activeFilter)

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

