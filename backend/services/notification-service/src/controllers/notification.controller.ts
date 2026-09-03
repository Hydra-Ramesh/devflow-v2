import { Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = await notificationService.getNotifications(userId);
  res.status(200).json(data);
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await notificationService.markAsRead(id, userId);
  res.status(200).json({ message: "Marked as read" });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await notificationService.markAllAsRead(userId);
  res.status(200).json({ message: "All marked as read" });
};
