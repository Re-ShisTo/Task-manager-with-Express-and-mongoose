//create task
import {
    createTaskService,
    deleteTaskService,
    getTaskByUserIdService,
    updateTaskService
} from "../services/taskService.js";

export const createTask = async(req, res)=>{
    const {title, description, status} = req.body;
    const user_Id = req.user_Id;
    try{
        const task = await createTaskService({user_Id, title, description, status})
        res.status(201).json(task);
    }catch (e) {
        res.status(400).json({error: e.message});
    }
}

//update task
export const updateTask = async(req, res)=>{
const {title, description, status} = req.body;
const task_id = req.params["task_id"];
try{
    const task = await updateTaskService({task_id, title, description, status})
    res.status(201).json(task);
}catch (e) {
    res.status(400).json({error: e.message});
}
}

// delete task
export const deleteTask = async(req, res)=>{
const task_id = req.params["task_id"];
try{
    const task = await deleteTaskService(task_id)
    res.status(200).json(task);
}catch (e) {
    res.status(400).json({error: e.message});
}
}

//get task
export const getTask = async(req, res)=>{
    const user_Id = req.user_Id;
    try{
        const task = await getTaskByUserIdService(user_Id)
        res.status(200).json(task);
    }catch (e) {
        res.status(400).json({error: e.message});
    }
}