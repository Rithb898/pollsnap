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
import { Plus, Trash2 } from "lucide-react"

export default function CreatePoll() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Poll</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create your poll
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>
            Enter a title and description for your poll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input placeholder="What's your question?" />
            </Field>
            <Field>
              <FieldLabel>Description (optional)</FieldLabel>
              <Input placeholder="Add more context to your poll" />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
          <CardDescription>Add at least 2 options for voters</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Option 1</FieldLabel>
              <div className="flex gap-2">
                <Input placeholder="Enter option" />
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel>Option 2</FieldLabel>
              <div className="flex gap-2">
                <Input placeholder="Enter option" />
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Field>
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
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish Poll</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
