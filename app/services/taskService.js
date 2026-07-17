import tasks from "../models/taskModel.js";

export async function createTaskService({user_Id, title, description, status}){
 try{
     const cTask = await tasks.create({
         user_Id,
         title: title,
         description: description,
         status: status
     })
     return cTask;
 }   catch (e) {
     throw new Error("Error Creating Task:" + e.message)
 }
}

//update task
export async function updateTaskService({task_id, title, description, status}){
    try{
        const uTask = await tasks.findByIdAndUpdate(
            task_id,
            {
                title: title.trim(),
                description: description.trim(),
                status: status.trim()
            },
            {new: true}
        );
        if(!uTask){
            throw new Error("Task not found");
        }
        return uTask;
    }   catch (e) {
        throw new Error("Error Updating Task:" + e.message)
    }
}

//delete task
export async function deleteTaskService(task_id){
    try{
        const dTask = await tasks.findByIdAndDelete(task_id);
        if(!dTask){
            throw new Error("Task not found");
        }
        return {message: "Task Deleted Successfully"};
    }   catch (e) {
        throw new Error("Error Deleting Task:" + e.message)
    }
}

//get task
export async function getTaskByUserIdService(user_Id){
    try{
        const gTask = await tasks.find({user_Id});
        if(!gTask){
            throw new Error("Task not found");
        }
        return gTask;
    }catch (e) {
        throw new Error("Error Fetching Task" + e.message);
    }
}

