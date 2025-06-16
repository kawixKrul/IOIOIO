import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supervisorApi } from "@/api/requests";

export const AddTopicDialog = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    degreeLevel: "MSc",
    availableSlots: 1,
    tags: "",
  });

  const addTopicMutation = useMutation({
    mutationFn: () =>
      supervisorApi.addTopic({
        title: formData.title,
        description: formData.description,
        degreeLevel: formData.degreeLevel,
        availableSlots: formData.availableSlots,
        tags: formData.tags.split(",").map(tag => tag.trim()),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisorTopics"] });
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTopicMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Topic</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Thesis Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3"
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="degreeLevel" className="text-right">
              Degree Level
            </Label>
            <select
              id="degreeLevel"
              value={formData.degreeLevel}
              onChange={(e) =>
                setFormData({ ...formData, degreeLevel: e.target.value })
              }
              className="col-span-3 border p-2 rounded"
              required
            >
              <option value="BSc">Bachelor's (BSc)</option>
              <option value="MSc">Master's (MSc)</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="availableSlots" className="text-right">
              Available Slots
            </Label>
            <Input
              id="availableSlots"
              type="number"
              min="1"
              value={formData.availableSlots}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availableSlots: parseInt(e.target.value) || 1,
                })
              }
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags (comma separated)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="col-span-3"
              placeholder="AI, Machine Learning, Data Science"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addTopicMutation.isPending}>
              {addTopicMutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};