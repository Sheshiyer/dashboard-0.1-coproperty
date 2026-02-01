"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTaskStore, type TaskComment } from "@/lib/stores/task-store"

interface TaskCommentsProps {
    taskId: string
    className?: string
}

function CommentItem({ comment }: { comment: TaskComment }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3 py-3"
        >
            <div className="shrink-0 h-8 w-8 rounded-full bg-property-primary/10 dark:bg-property-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-property-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                        })}
                    </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                    {comment.content}
                </p>
            </div>
        </motion.div>
    )
}

export function TaskComments({ taskId, className }: TaskCommentsProps) {
    const { comments, addComment } = useTaskStore()
    const [content, setContent] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const taskComments = comments[taskId] || []

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        // Add comment to local store (would also POST to API in production)
        addComment(taskId, "You", content.trim())
        setContent("")
        setIsSubmitting(false)

        // Scroll to bottom after adding
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            })
        })
    }

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">Comments</h4>
                {taskComments.length > 0 && (
                    <Badge variant="secondary" size="sm">
                        {taskComments.length}
                    </Badge>
                )}
            </div>

            {/* Comments list */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-border/50"
            >
                <AnimatePresence mode="popLayout">
                    {taskComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </AnimatePresence>
                {taskComments.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground/60">
                        No comments yet. Start the conversation.
                    </div>
                )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    className="min-h-[60px] resize-none text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            handleSubmit(e)
                        }
                    }}
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!content.trim() || isSubmitting}
                    className="shrink-0 self-end"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-1">
                Press Cmd+Enter to send
            </p>
        </div>
    )
}

// Badge to show comment count in the task table
export function CommentCountBadge({ taskId }: { taskId: string }) {
    const comments = useTaskStore((s) => s.comments[taskId])
    const count = comments?.length || 0

    if (count === 0) return null

    return (
        <Badge variant="secondary" size="sm" className="gap-1">
            <MessageSquare className="h-3 w-3" />
            {count}
        </Badge>
    )
}
