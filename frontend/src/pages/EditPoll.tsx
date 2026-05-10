import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"

const mockPoll = {
  id: "2",
  title: "Team lunch preference",
  description: "Vote for our next team lunch venue",
  status: "draft",
  options: [
    { id: "1", text: "Italian" },
    { id: "2", text: "Mexican" },
    { id: "3", text: "Thai" },
  ],
}

export default function EditPoll() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Poll</h1>
          <p className="text-muted-foreground">Update your draft poll</p>
        </div>
        <Badge variant="secondary">Draft</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>
            Update the title and description for your poll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input defaultValue={mockPoll.title} />
            </Field>
            <Field>
              <FieldLabel>Description (optional)</FieldLabel>
              <Input defaultValue={mockPoll.description} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
          <CardDescription>Edit poll options</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {mockPoll.options.map((option, index) => (
              <Field key={option.id}>
                <FieldLabel>Option {index + 1}</FieldLabel>
                <div className="flex gap-2">
                  <Input defaultValue={option.text} />
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" render={<Link to="/dashboard" />}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">Save Draft</Button>
            <Button>Publish Poll</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
