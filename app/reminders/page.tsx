"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Bell, Calendar, FileText, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Reminder {
  id: number
  title: string
  description: string
  case_subject: string
  suit_number: string
  reminder_date: string
  is_completed: boolean
  is_sent: boolean
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders")
      if (response.ok) {
        const data = await response.json()
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleReminderStatus = async (reminderId: number, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !isCompleted }),
      })

      if (response.ok) {
        toast({ title: "Reminder status updated" })
        fetchReminders()
      } else {
        toast({ title: "Error updating reminder", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error updating reminder", variant: "destructive" })
    }
  }

  const deleteReminder = async (reminderId: number) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Reminder deleted successfully" })
        fetchReminders()
      } else {
        toast({ title: "Error deleting reminder", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error deleting reminder", variant: "destructive" })
    }
  }

  const isOverdue = (reminderDate: string) => {
    return new Date(reminderDate) < new Date()
  }

  const isUpcoming = (reminderDate: string) => {
    const now = new Date()
    const reminder = new Date(reminderDate)
    const diffHours = (reminder.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 24
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reminders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600 mt-2">Manage your case reminders and deadlines</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <h3 className="text-xl font-semibold text-gray-900">{reminder.title}</h3>
                    {reminder.is_completed && <Badge variant="default">Completed</Badge>}
                    {!reminder.is_completed && isOverdue(reminder.reminder_date) && (
                      <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                    )}
                    {!reminder.is_completed && isUpcoming(reminder.reminder_date) && (
                      <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>
                    )}
                    {reminder.is_sent && <Badge variant="secondary">Email Sent</Badge>}
                  </div>
                  {reminder.description && <p className="text-gray-700 mb-3">{reminder.description}</p>}
                  <p className="text-gray-600 mb-2">Case: {reminder.case_subject}</p>
                  <p className="text-gray-600 mb-2">Suit Number: {reminder.suit_number}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleReminderStatus(reminder.id, reminder.is_completed)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {reminder.is_completed ? "Mark Pending" : "Mark Complete"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this reminder? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteReminder(reminder.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(reminder.reminder_date).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {reminders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders found</h3>
              <p className="text-gray-600 mb-4">You don't have any active reminders at the moment.</p>
              <Link href="/dashboard">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
