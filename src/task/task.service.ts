import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskRepository)
    private readonly taskRepository: TaskRepository,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    try {
      await this.taskRepository.save(task);
    } catch (e) {
      throw new ServiceUnavailableException(
        `An error occurred while creating the "${createTaskDto.title}" task`,
      );
    }
    return task;
  }

  async getTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findOne(taskId);
    return task;
  }

  async getTaskOrFail(taskId: string): Promise<Task> {
    const task = await this.getTask(taskId);
    if (!task)
      throw new NotFoundException(`Task with id "${taskId}" wasn't found`);
    return task;
  }

  async getManyTasks(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<void> {
    const task = await this.getTaskOrFail(taskId);
    try {
      await this.taskRepository.update(taskId, updateTaskDto);
    } catch (e) {
      throw new ServiceUnavailableException(
        `An error occurred while updating the "${task.title}" task`,
      );
    }
  }

  async deleteTask(taskId: string) {
    const task = await this.getTaskOrFail(taskId);
    try {
      await this.taskRepository.softRemove(task);
    } catch (e) {
      throw new ServiceUnavailableException(
        `An error occurred while deleting the "${task.title}" task`,
      );
    }
  }
}
